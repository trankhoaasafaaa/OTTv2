'use strict';
const fs=require('node:fs');
const path=require('node:path');
const {TextDecoder}=require('node:util');
const {sha,canonical,sourcePayload,replayPayload}=require('./common');
const {validateUsername,validateEmail}=require('../auth/service');
function loadSnapshot(directory){
  const root=fs.realpathSync(directory),file=path.join(root,'arena.json');
  if(fs.statSync(file).size>50*1024*1024)throw Error('Snapshot metadata exceeds 50 MiB');
  const data=JSON.parse(fs.readFileSync(file,'utf8'));
  if(data.version!==1||!['users','sessions','submissions','matches','audit'].every(k=>Array.isArray(data[k]))||typeof data.settings?.submissionsOpen!=='boolean')throw Error('Expected arena.json version 1 from index-json.js');
  const records=[],ids={},usernames=new Set(),emails=new Set();let total=0;
  const identifier=v=>{if(typeof v!=='string'||!/^[a-zA-Z0-9-]{1,64}$/.test(v))throw Error('Invalid record ID');return v;};
  const date=v=>{const d=new Date(v);if(!v||!Number.isFinite(d.getTime()))throw Error('Invalid timestamp');return d;};
  function unique(kind,id){identifier(id);ids[kind]??=new Set();if(ids[kind].has(id))throw Error('Duplicate '+kind+' ID: '+id);ids[kind].add(id);}
  function add(model,where,data){records.push({model,where,data,key:model+':'+Object.values(where)[0],digest:sha(canonical(data))});}
  function payload(relative,max){const actual=fs.realpathSync(path.join(root,relative));if(!actual.startsWith(root+path.sep))throw Error('Payload resolves outside snapshot');const size=fs.statSync(actual).size;total+=size;if(size>max||total>64*1024*1024)throw Error('Snapshot payload size exceeded');return fs.readFileSync(actual);}
  for(const u of data.users){
    unique('user',u.id);const name=validateUsername(u.username);if(name!==u.username||usernames.has(name))throw Error('Duplicate or noncanonical username: '+name);usernames.add(name);
    const email=u.email==null?null:validateEmail(u.email);if(email&&emails.has(email))throw Error('Duplicate email');if(email)emails.add(email);
    if(!/^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/.test(u.passwordHash)||!['STUDENT','JUDGE','ADMIN'].includes(u.role)||typeof u.isActive!=='boolean')throw Error('Invalid account/hash/role: '+u.id);
    add('user',{id:u.id},{id:u.id,username:name,email,passwordHash:u.passwordHash,role:u.role,isActive:u.isActive,createdAt:date(u.createdAt)});
  }
  for(const s of data.submissions){
    unique('submission',s.id);if(!/^SUB-[A-F0-9]{8}$/.test(s.id)||!ids.user?.has(s.userId)||!/^[A-Za-z][A-Za-z0-9_]{0,60}\.(py|java|c)$/.test(s.name)||({py:'Python',java:'Java',c:'C'})[s.name.split('.').pop()]!==s.lang)throw Error('Invalid submission/owner: '+s.id);
    const bytes=payload(path.join('bots',s.id,s.name),500000);if(sha(bytes)!==s.sha256)throw Error('Source checksum mismatch: '+s.id);
    const content=new TextDecoder('utf-8',{fatal:true}).decode(bytes),stored=sourcePayload(content);
    add('submission',{id:s.id},{id:s.id,userId:s.userId,filename:s.name,language:s.lang,version:String(s.version||'v1.0').slice(0,24),sourcePath:'postgres:'+s.id,sha256:s.sha256,status:s.status==='Ready'?'READY':s.status==='Rejected'?'REJECTED':'STORED',createdAt:date(s.date)});
    add('submissionSource',{submissionId:s.id},{submissionId:s.id,...stored});
  }
  for(const m of data.matches){
    unique('match',m.id);if(!/^M-[A-F0-9]{8}$/.test(m.id)||!['demo','submitted'].includes(m.mode))throw Error('Invalid match: '+m.id);
    const interrupted=['queued','running'].includes(m.status),status=interrupted?'FAILED':({completed:'COMPLETED',failed:'FAILED',cancelled:'CANCELLED'})[m.status];if(!status)throw Error('Invalid match status');
    if(m.createdById&&!ids.user?.has(m.createdById))throw Error('Match creator missing: '+m.id);
    if(m.mode==='submitted'&&![m.submissionA,m.submissionB].every(id=>ids.submission?.has(id)))throw Error('Match submission relation missing: '+m.id);
    if(!Number.isInteger(m.maxMoves)||m.maxMoves<1||m.maxMoves>1000||!Number.isInteger(m.pieces)||m.pieces<1||m.pieces>28||!['Random','Player A','Player B'].includes(m.first)||!Number.isInteger(m.seed)||m.seed<0||m.seed>4294967295)throw Error('Invalid match configuration');
    let replay=null;
    if(status==='COMPLETED'){
      const bytes=payload(path.join('replays',m.id+'.json'),8*1024*1024);if(sha(bytes)!==m.replayHash)throw Error('Replay checksum mismatch: '+m.id);
      const value=JSON.parse(bytes.toString('utf8'));if(!Array.isArray(value.events)||!Array.isArray(value.snapshots)||value.snapshots.length!==value.events.length+1)throw Error('Invalid replay: '+m.id);replay=replayPayload(value);
    }
    add('match',{id:m.id},{id:m.id,kind:m.mode==='demo'?'DEMO':'PRACTICE',status,createdById:m.createdById||null,submissionAId:m.mode==='submitted'?m.submissionA:null,submissionBId:m.mode==='submitted'?m.submissionB:null,gameId:'ott-rps',rulesetVersion:'1.0.0',seed:String(m.seed),maxMoves:m.maxMoves,pieces:m.pieces,firstPlayerSetting:m.first,turnCount:m.turns||0,winner:m.winner==='p1'?'PLAYER_A':m.winner==='p2'?'PLAYER_B':status==='COMPLETED'?'DRAW':null,reason:interrupted?'json-migration-interrupted':m.reason||null,replayPath:replay?'postgres:'+m.id:null,replayHash:replay?.sha256||null,createdAt:date(m.createdAt),startedAt:m.startedAt?date(m.startedAt):null,finishedAt:interrupted?date(m.createdAt):m.finishedAt?date(m.finishedAt):null,legacyMetadata:{a:m.a||'Greedy Bot',b:m.b||'Random Bot'}});
    if(replay)add('matchReplay',{matchId:m.id},{matchId:m.id,...replay});
  }
  for(const a of data.audit){
    unique('audit',a.id);if(a.actorId&&!ids.user?.has(a.actorId))throw Error('Audit actor missing: '+a.id);
    add('auditLog',{id:a.id},{id:a.id,actorId:a.actorId||null,action:String(a.action),entityType:'ImportedJSON',entityId:a.entityId||null,metadata:a.metadata||{},createdAt:date(a.createdAt)});
  }
  add('appSetting',{key:'submissionsOpen'},{key:'submissionsOpen',value:data.settings.submissionsOpen});
  add('appSetting',{key:'legacySettings'},{key:'legacySettings',value:data.settings});
  return {records,summary:{users:data.users.length,submissions:data.submissions.length,matches:data.matches.length,auditLogs:data.audit.length,skippedSessions:data.sessions.length,payloadBytes:total}};
}
async function importSnapshot(prisma,snapshot,{write=false}={}){
  return prisma.$transaction(async tx=>{
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(740019)`;
    const result={...snapshot.summary,created:0,unchanged:0,mode:write?'import':'dry-run'};
    for(const r of snapshot.records){
      const old=await tx[r.model].findUnique({where:r.where}),receipt=await tx.jsonImportReceipt.findUnique({where:{key:r.key}});
      if(receipt&&receipt.digest!==r.digest)throw Error('Source changed since import: '+r.key);
      if(old){
        const selected=Object.fromEntries(Object.keys(r.data).map(k=>[k,old[k]]));
        if(canonical(selected)!==canonical(r.data))throw Error('Existing database data differs; nothing overwritten: '+r.key);
        result.unchanged++;
      }else{
        if(receipt)throw Error('Imported record was removed from database: '+r.key);
        if(r.model==='user'){
          if(await tx.user.findUnique({where:{username:r.data.username}}))throw Error('Username belongs to another ID: '+r.data.username);
          if(r.data.email&&await tx.user.findUnique({where:{email:r.data.email}}))throw Error('Email belongs to another ID');
        }
        if(write)await tx[r.model].create({data:r.data});result.created++;
      }
      if(write&&!receipt)await tx.jsonImportReceipt.create({data:{key:r.key,digest:r.digest}});
    }
    return result;
  },{maxWait:10000,timeout:120000});
}
module.exports={loadSnapshot,importSnapshot};
