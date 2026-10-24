'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),crypto=require('node:crypto');
const {createClient}=require('../server/online-pg/client');
const {createDurableServices,withRatings}=require('../server/durable/postgres');
const elo=require('../server/elo-service');
const env=process.env.TEST_DATABASE_URL;
test('durable tournament/Elo, rollback, restart, import and failure handling',{skip:!env,timeout:180000},async t=>{
 const u=new URL(env);assert(['localhost','127.0.0.1'].includes(u.hostname),'Disposable local DB only');
 const schema='durable_'+crypto.randomBytes(6).toString('hex'),adminDb=createClient(env,{production:false});
 await adminDb.$executeRawUnsafe('CREATE SCHEMA "'+schema+'"');await adminDb.$disconnect();u.searchParams.set('schema',schema);u.searchParams.set('connection_limit','1');
 let db=createClient(u.toString(),{production:false});const temp=fs.mkdtempSync(path.join(os.tmpdir(),'ott-durable-test-'));
 t.after(async()=>{await db.$disconnect();const c=createClient(env,{production:false});await c.$executeRawUnsafe('DROP SCHEMA "'+schema+'" CASCADE');await c.$disconnect();fs.rmSync(temp,{recursive:true,force:true});});
 await db.$executeRawUnsafe('SET search_path TO "'+schema+'"');
 for(const n of fs.readdirSync(path.resolve(__dirname,'../prisma/migrations')).sort()){
  const f=path.resolve(__dirname,'../prisma/migrations',n,'migration.sql');if(!fs.existsSync(f))continue;
  for(const sql of fs.readFileSync(f,'utf8').split(';').map(x=>x.trim()).filter(Boolean))await db.$executeRawUnsafe(sql);
 }
 const admin={id:'admin-test',username:'admin-test',role:'ADMIN'};
 for(const user of [admin,{id:'student-a',username:'student-a',role:'STUDENT'},{id:'student-b',username:'student-b',role:'STUDENT'},{id:'judge',username:'judge',role:'JUDGE'}])await db.user.create({data:{...user,passwordHash:'test-hash'}});
 for(const [i,id] of ['SUB-11111111','SUB-22222222','SUB-33333333'].entries())await db.submission.create({data:{id,userId:i===1?'student-b':'student-a',filename:'bot'+i+'.py',language:'Python',version:'v1',sourcePath:'postgres:'+id,sha256:'0'.repeat(64)}});
 let svc=createDurableServices(db),a={id:'student-a',username:'student-a',role:'STUDENT'},b={id:'student-b',username:'student-b',role:'STUDENT'};
 const tr=await svc.tournaments.createTournament({name:'Persistent Cup',format:'ROUND_ROBIN',maxMoves:2,pieces:6},admin);
 await svc.tournaments.openRegistration(tr.id,admin);
 await assert.rejects(svc.tournaments.registerParticipant(tr.id,{submissionId:'SUB-22222222'},a),/Submission not found/);
 await assert.rejects(svc.tournaments.openRegistration(tr.id,{id:'judge',role:'JUDGE'}),/phân công/);
 await svc.tournaments.registerParticipant(tr.id,{submissionId:'SUB-11111111',submissionName:'forged'},a);
 await svc.tournaments.registerParticipant(tr.id,{submissionId:'SUB-22222222'},b);
 await svc.tournaments.approveAllParticipants(tr.id,admin);await svc.tournaments.lockSubmissions(tr.id,admin);
 const bracket=await svc.tournaments.generateBracket(tr.id,admin);assert.equal(bracket.matches.length,1);
 assert.equal(bracket.entries[0].submissionName,'bot0.py');
 const result=await svc.tournaments.startMatch(tr.id,bracket.matches[0].id,admin);
 assert.equal(result.match.status,'COMPLETED');assert(await svc.tournaments.getMatchReplay(result.match.id));
 assert.equal(await db.tournamentGameReplay.count(),1);assert.equal(await db.tournamentGame.count(),1);
 const before=await db.practiceRating.findUnique({where:{submissionId:'SUB-11111111'}});assert.equal(before.games,1);
 await db.$transaction(tx=>withRatings(tx,()=>elo.recordMatchResult({idA:'SUB-11111111',idB:'SUB-22222222',winner:'p1',matchId:result.match.id})));
 assert.equal((await db.practiceRating.findUnique({where:{submissionId:'SUB-11111111'}})).games,1);
 await assert.rejects(db.$transaction(tx=>withRatings(tx,()=>{elo.recordMatchResult({idA:'SUB-11111111',idB:'SUB-22222222',winner:'p1',matchId:'ROLLBACK'});throw Error('rollback');})),/rollback/);
 assert.equal(await db.durableRatingReceipt.count({where:{id:'ROLLBACK'}}),0);
 await db.$disconnect();db=createClient(u.toString(),{production:false});svc=createDurableServices(db);
 assert.equal((await svc.tournaments.getTournament(tr.id)).matches.length,1);assert.equal((await svc.leaderboard()).find(x=>x.id==='SUB-11111111').games,1);
 assert(await svc.tournaments.getMatchReplay(result.match.id));
 // Exercise the CLI's main function against the disposable schema.
 await db.submission.create({data:{id:'SUB-44444444',userId:a.id,filename:'import.py',language:'Python',version:'v1',sourcePath:'postgres:SUB-44444444',sha256:'0'.repeat(64)}});
 const importT={id:'TOUR-IMPORT',name:'Imported Cup',description:'',format:'ROUND_ROBIN',status:'DRAFT',config:{maxMoves:2,pieces:6,first:'Random'},entries:[],rounds:[],matches:[],standings:[],refereeLogs:[],createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()};
 fs.writeFileSync(path.join(temp,'tournaments.json'),JSON.stringify([importT]));fs.writeFileSync(path.join(temp,'ratings.json'),JSON.stringify([{id:'SUB-44444444',elo:1232,wins:1,losses:0,draws:0,games:1,lastChange:32}]));fs.mkdirSync(path.join(temp,'replays'));
 async function cli(extra){return JSON.stringify(await require('../scripts/import-durable-state.cjs').main([temp,...extra],u.toString()));}
 assert.match(await cli([]),/dryRun/);assert.equal(await db.tournament.count({where:{id:'TOUR-IMPORT'}}),0);
 await cli(['--write']);assert.equal(await db.tournament.count({where:{id:'TOUR-IMPORT'}}),1);assert.equal((await db.practiceRating.findUnique({where:{submissionId:'SUB-44444444'}})).elo,1232);assert.match(await cli(['--write']),/alreadyImported/);
 const counts=await db.tournament.count();const broken=createDurableServices({$transaction:async()=>{throw Object.assign(Error('unavailable'),{code:'P1001'})}});
 await assert.rejects(broken.tournaments.listTournaments(),/unavailable/);assert.equal(await db.tournament.count(),counts);
});
