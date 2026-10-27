'use strict';
const {context}=require('./context');
const {canonical,sha,replayPayload}=require('../online-pg/common');
const elo=require('../elo-service');
const {TournamentService}=require('../tournaments/tournament-service');
const fail=(status,message)=>Object.assign(Error(message),{status});
const json=x=>JSON.parse(JSON.stringify(x));
const without=(x,keys)=>Object.fromEntries(Object.entries(x).filter(([k])=>!keys.includes(k)));
const equal=(a,b)=>canonical(a)===canonical(b);
async function lock(tx){await tx.$executeRaw`SELECT pg_advisory_xact_lock(740019)`;}

async function loadScope(tx,withTournaments){
  const [subs,receipts,botNameRow]=await Promise.all([
    tx.submission.findMany({include:{user:{select:{username:true}},practiceRating:true}}),
    tx.durableRatingReceipt.findMany(),
    tx.appSetting.findUnique({where:{key:'botNames'}}).catch(()=>null)
  ]);
  const botNames=(botNameRow&&typeof botNameRow.value==='object'&&botNameRow.value!==null&&!Array.isArray(botNameRow.value))?botNameRow.value:{};
  const ratings={};
  for(const s of subs){if(!s.practiceRating)continue;const r=s.practiceRating;const dName=botNames[s.id]||s.filename;ratings[s.id]={id:s.id,name:dName,owner:s.user?.username||'Người chơi',lang:s.language,elo:r.elo,lastChange:r.lastChange,wins:r.wins,losses:r.losses,draws:r.draws,games:r.games,updatedAt:r.updatedAt.toISOString()};}
  const scope={ratings,receipts:Object.fromEntries(receipts.map(r=>[r.id,{id:r.id,result:r.result}])),tournaments:[],replays:{},tournamentDirty:false};
  if(withTournaments){
    const rows=await tx.tournament.findMany({include:{entries:true,rounds:true,games:{include:{replay:true}},standings:true,logs:true}});
    scope.tournaments=rows.map(r=>{
      for(const g of r.games){if(g.replay){if(sha(canonical(g.replay.payload))!==g.replay.sha256)throw fail(503,'Tournament replay integrity error');scope.replays[g.id]=g.replay.payload;}}
      return {...r.details,id:r.id,name:r.name,description:r.description,format:r.format,status:r.status,createdAt:r.createdAt.toISOString(),updatedAt:r.updatedAt.toISOString(),
        config:r.details?.config||{maxMoves:200,pieces:6,first:'Random'},
        entries:r.entries.map(e=>({...e.details,userId:e.userId,submissionId:e.lockedSubmissionId,status:e.status,joinedAt:e.joinedAt.toISOString()})),
        rounds:r.rounds.sort((a,b)=>a.number-b.number).map(x=>x.details),
        matches:r.games.sort((a,b)=>(a.details.bracketIndex||0)-(b.details.bracketIndex||0)).map(g=>({...g.details,id:g.id,status:g.status})),
        standings:r.standings.map(x=>x.details).sort((a,b)=>(a.rank||0)-(b.rank||0)),
        refereeLogs:r.logs.sort((a,b)=>a.sequence-b.sequence).map(x=>x.details)};
    });
  }
  scope.before=json({ratings:scope.ratings,receipts:scope.receipts,tournaments:scope.tournaments,replays:scope.replays});
  return scope;
}

async function saveTournament(tx,t){
  const details=without(t,['id','name','description','format','status','createdAt','updatedAt','entries','rounds','matches','standings','refereeLogs']);
  const fields={name:t.name,description:t.description||'',format:t.format,status:t.status,details:json(details),updatedAt:new Date(t.updatedAt)};
  await tx.tournament.upsert({where:{id:t.id},create:{id:t.id,...fields,createdAt:new Date(t.createdAt)},update:fields});
  // Replace only the changed tournament's child rows under the transaction lock.
  await tx.tournamentEntry.deleteMany({where:{tournamentId:t.id}});
  for(const e of t.entries||[])await tx.tournamentEntry.create({data:{tournamentId:t.id,userId:e.userId,lockedSubmissionId:e.submissionId||null,status:e.status,joinedAt:new Date(e.joinedAt),details:json(without(e,['userId','submissionId','status','joinedAt']))}});
  await tx.tournamentRound.deleteMany({where:{tournamentId:t.id}});
  for(const [i,r] of (t.rounds||[]).entries())await tx.tournamentRound.create({data:{tournamentId:t.id,number:r.roundNumber||i+1,details:json(r)}});
  const ids=(t.matches||[]).map(g=>g.id);
  await tx.tournamentGame.deleteMany({where:{tournamentId:t.id,id:{notIn:ids}}});
  for(const g of t.matches||[]){const data={tournamentId:t.id,roundNumber:g.roundNumber||1,status:g.status,playerASubmissionId:g.playerA?.submissionId||null,playerBSubmissionId:g.playerB?.submissionId||null,details:json(without(g,['id','status']))};await tx.tournamentGame.upsert({where:{id:g.id},create:{id:g.id,...data},update:data});}
  await tx.tournamentStanding.deleteMany({where:{tournamentId:t.id}});
  for(const r of t.standings||[])await tx.tournamentStanding.create({data:{tournamentId:t.id,userId:r.userId,details:json(r)}});
  await tx.tournamentLog.deleteMany({where:{tournamentId:t.id}});
  for(const [i,r] of (t.refereeLogs||[]).entries())await tx.tournamentLog.create({data:{id:r.id,tournamentId:t.id,sequence:i,details:json(r)}});
}

async function flush(tx,s){
  for(const [id,r] of Object.entries(s.ratings)){
    if(equal(r,s.before.ratings[id]))continue;
    const data={elo:r.elo,lastChange:r.lastChange||0,wins:r.wins,losses:r.losses,draws:r.draws,games:r.games,updatedAt:new Date(r.updatedAt)};
    await tx.practiceRating.upsert({where:{submissionId:id},create:{submissionId:id,...data},update:data});
  }
  for(const id of Object.keys(s.before.ratings)){
    if(!s.ratings[id]){
      await tx.practiceRating.deleteMany({where:{submissionId:id}});
    }
  }
  for(const [id,r] of Object.entries(s.receipts))if(!s.before.receipts[id])await tx.durableRatingReceipt.create({data:{id,result:r.result===null?{imported:true}:json(r.result)}});
  for(const t of s.tournaments){const old=s.before.tournaments.find(x=>x.id===t.id);if(!equal(t,old))await saveTournament(tx,t);}
  const removed=s.before.tournaments.filter(t=>!s.tournaments.some(x=>x.id===t.id));
  for(const t of removed){await tx.tournamentStaff.deleteMany({where:{tournamentId:t.id}});await tx.tournamentEntry.deleteMany({where:{tournamentId:t.id}});await tx.tournament.delete({where:{id:t.id}});}
  for(const [id,r] of Object.entries(s.replays))if(!equal(r,s.before.replays[id])){const stored=replayPayload(r);await tx.tournamentGameReplay.upsert({where:{gameId:id},create:{gameId:id,...stored},update:stored});}
}

async function unit(tx,withTournaments,fn){
  if(context.getStore())return fn(context.getStore());
  await lock(tx);const scope=await loadScope(tx,withTournaments);
  return context.run(scope,async()=>{const result=await fn(scope);await flush(tx,scope);return json(result??null);});
}
function transaction(db,fn){return db.$transaction(fn,{maxWait:10000,timeout:120000});}
function withRatings(tx,fn){return unit(tx,false,fn);}
function createDurableServices(db){
  const original=new TournamentService();
  const services=new Proxy({}, {get:(_,name)=>async(...args)=>transaction(db,tx=>unit(tx,true,async()=>{
    if(typeof original[name]!=='function')throw Error('Unknown tournament operation');
    // Judge scope is checked per tournament; Admin retains global access.
    const userIndex={createTournament:1,updateTournament:2,deleteTournament:1,openRegistration:1,registerParticipant:2,unregisterParticipant:1,approveParticipant:2,rejectParticipant:3,approveAllParticipants:1,lockSubmissions:1,generateBracket:1,startMatch:2,rematchMatch:2,pauseMatch:3,resumeMatch:2,cancelMatch:3,adjudicateMatch:3,runAllPendingMatches:1,publishResults:1}[name];
    const user=args[userIndex];
    if(user?.role==='JUDGE'){
      if(name==='createTournament')throw fail(403,'Admin tạo giải và phân công Judge');
      const assigned=await tx.tournamentStaff.findUnique({where:{tournamentId_userId:{tournamentId:String(args[0]),userId:user.id}}});
      if(!assigned)throw fail(403,'Judge chưa được phân công vào giải này');
    }
    if(name==='registerParticipant'){
      const sub=await tx.submission.findFirst({where:{id:String(args[1]?.submissionId||''),userId:user?.id||'',status:{not:'REJECTED'}}});
      if(!sub)throw fail(404,'Submission not found');
      args[1]={submissionId:sub.id,submissionName:sub.filename,submissionLang:sub.language,submissionVersion:sub.version};
    }
    return original[name](...args);
  }))});
  return {tournaments:services,
    leaderboard:()=>transaction(db,tx=>withRatings(tx,async()=>{
      const [subs,botNameRow]=await Promise.all([
        tx.submission.findMany({where:{status:{not:'REJECTED'}},include:{user:{select:{username:true}}}}),
        tx.appSetting.findUnique({where:{key:'botNames'}}).catch(()=>null)
      ]);
      const botNames=(botNameRow&&typeof botNameRow.value==='object'&&botNameRow.value!==null&&!Array.isArray(botNameRow.value))?botNameRow.value:{};
      return elo.getLeaderboard(subs.map(s=>({...s,botName:botNames[s.id]||s.filename})));
    })),
    registerBot:data=>transaction(db,tx=>withRatings(tx,()=>elo.registerBot(data))),
    renameBot:(id,newName)=>transaction(db,tx=>withRatings(tx,()=>elo.renameBot(id,newName))),
    removeBot:id=>transaction(db,tx=>withRatings(tx,()=>elo.removeBot(id)))};
}
module.exports={createDurableServices,withRatings,transaction,unit,saveTournament,flush};
