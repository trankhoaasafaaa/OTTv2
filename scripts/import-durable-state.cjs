'use strict';
const fs=require('node:fs/promises'),path=require('node:path');
const {createClient}=require('../server/online-pg/client');
const {unit,transaction,flush}=require('../server/durable/postgres');
async function read(root,name){return JSON.parse(await fs.readFile(path.join(root,name),'utf8'));}
async function main(args=process.argv.slice(2),databaseUrl=process.env.DATABASE_URL){
 const dir=args.find(a=>!a.startsWith('--'));if(!dir)throw Error('Usage: import-durable-state.cjs SNAPSHOT [--write] [--allow-missing-replays]');
 const root=path.resolve(dir),tournaments=await read(root,'tournaments.json'),raw=await read(root,'ratings.json');
 if(!Array.isArray(tournaments)||tournaments.length>1000)throw Error('Invalid tournament list');
 if(raw.accounts)throw Error('Account-format ratings require manual mapping to submission IDs; no guessed conversion');
 const ratings=Array.isArray(raw)?raw:Object.entries(raw).map(([id,r])=>({id,...r}));
 const inputReplays={};
 for(const t of tournaments){
   if(!/^[a-zA-Z0-9_-]{1,64}$/.test(t.id))throw Error('Invalid tournament ID');
   for(const m of t.matches||[]){
     if(!/^[a-zA-Z0-9_-]{1,64}$/.test(m.id))throw Error('Invalid match ID');
     if(m.replayAvailable){try{inputReplays[m.id]=await read(root,path.join('replays',m.id+'.json'));}catch{if(!args.includes('--allow-missing-replays'))throw Error('Missing replay '+m.id);inputReplays[m.id]=null;}}
   }
 }
 const db=createClient(databaseUrl);
 try{
 const report=await transaction(db,tx=>unit(tx,true,async s=>{
   const marker=await tx.jsonImportReceipt.findUnique({where:{key:'durable-state-import-v1'}});
   const digest=require('node:crypto').createHash('sha256').update(JSON.stringify({tournaments,raw,inputReplays})).digest('hex');
   if(marker){if(marker.digest!==digest)throw Error('A different snapshot was already imported; nothing overwritten');return {alreadyImported:true};}
   const ids=new Set(),ratingIds=new Set();let replayCount=0;const missing=[];
   for(const r of ratings){
     if(!r.id||ratingIds.has(r.id))throw Error('Missing or duplicate rating ID: '+r.id);ratingIds.add(r.id);
     const sub=await tx.submission.findUnique({where:{id:r.id},include:{user:true}});if(!sub)throw Error('Unknown submission in ratings: '+r.id);
     if(s.ratings[r.id])throw Error('Rating already exists: '+r.id+'; import before opening the new backend');
     for(const k of ['elo','wins','losses','draws','games'])if(!Number.isInteger(r[k])||r[k]<0)throw Error('Invalid rating '+r.id+' field '+k);
     if(r.games!==r.wins+r.losses+r.draws)throw Error('Rating counters inconsistent: '+r.id);
     s.ratings[r.id]={id:r.id,name:sub.filename,owner:sub.user?.username||'Người chơi',lang:sub.language,elo:r.elo,wins:r.wins,losses:r.losses,draws:r.draws,games:r.games,lastChange:Number(r.lastChange||0),updatedAt:r.updatedAt||new Date().toISOString()};
   }
   for(const t of tournaments){
     if(!t.id||ids.has(t.id))throw Error('Missing or duplicate tournament ID');ids.add(t.id);
     if(s.tournaments.some(x=>x.id===t.id))throw Error('Tournament already exists: '+t.id);
     for(const e of t.entries||[]){if(typeof e.userId!=='string'||typeof e.submissionId!=='string')throw Error('Participant IDs are required');const sub=await tx.submission.findFirst({where:{id:e.submissionId,userId:e.userId}});if(!sub)throw Error('Invalid participant ownership: '+t.id+' / '+e.userId);}
     for(const m of t.matches||[]){
       for(const side of [m.playerA,m.playerB].filter(Boolean)){if(typeof side.userId!=='string'||typeof side.submissionId!=='string')throw Error('Match participant IDs are required');const sub=await tx.submission.findFirst({where:{id:side.submissionId,userId:side.userId}});if(!sub)throw Error('Invalid match ownership: '+m.id);}
       if(m.status==='RUNNING'){m.status='QUEUED';m.pausedReason='Interrupted during JSON migration';}
       if(m.replayAvailable){if(inputReplays[m.id]){s.replays[m.id]=inputReplays[m.id];replayCount++;}else{missing.push(m.id);m.replayAvailable=false;m.replayPath=null;}}
       if(m.status==='COMPLETED')s.receipts[m.id]={id:m.id,result:null};
     }
     s.tournaments.push(t);
   }
   const result={dryRun:!args.includes('--write'),ratings:ratings.length,tournaments:tournaments.length,replays:replayCount,missingReplays:missing};
   if(!args.includes('--write')){await flush(tx,s);const err=Error('DRY_RUN');err.report=result;throw err;}
   await tx.jsonImportReceipt.create({data:{key:'durable-state-import-v1',digest}});return result;
 }));console.log(JSON.stringify(report,null,2));return report;
 }catch(e){if(e.report){console.log(JSON.stringify(e.report,null,2));return e.report;}else throw e;}finally{await db.$disconnect();}
}
if(require.main===module)main().catch(e=>{console.error('[Import]',e.code||e.message);process.exitCode=1});
module.exports={main};
