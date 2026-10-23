'use strict';
const crypto=require('node:crypto');
const {runMatch}=require('../engine');
const {fail,sha,canonical,replayPayload,includeMatch,queueLock,audit}=require('./common');
function createWorker({prisma,token,now=Date.now}){
  if(token&&!/^[a-f0-9]{64}$/.test(token))throw Error('WORKER_TOKEN must be 64 lowercase hexadecimal characters');
  let seen=null,stopped=false;
  async function sweep(tx){
    const expired=await tx.workerLease.findMany({where:{completedAt:null,OR:[{expiresAt:{lte:new Date(now())}},{deadlineAt:{lte:new Date(now())}}]}});
    for(const lease of expired){
      await tx.match.updateMany({where:{id:lease.matchId,status:'RUNNING'},data:{status:'FAILED',reason:'worker-disconnected',finishedAt:new Date(now())}});
      await tx.workerLease.update({where:{matchId:lease.matchId},data:{completedAt:new Date(now())}});
    }
  }
  async function status(){
    return prisma.$transaction(async tx=>{await queueLock(tx);await sweep(tx);const [activeJobs,pendingJobs]=await Promise.all([tx.match.count({where:{kind:'PRACTICE',status:'RUNNING'}}),tx.match.count({where:{kind:'PRACTICE',status:'QUEUED'}})]);return {challengeReady:!stopped&&!!token&&seen!==null&&now()-seen<60000,dockerReady:false,botExecution:'external-worker',activeJobs,pendingJobs,maxConcurrent:1};});
  }
  function authorize(req){const supplied=req.headers.authorization;if(!token||typeof supplied!=='string'||Buffer.byteLength(supplied)!==71||!crypto.timingSafeEqual(Buffer.from(supplied),Buffer.from('Bearer '+token)))throw fail(401,'Worker authentication required');if(stopped)throw fail(503,'Server stopping');}
  async function activeLease(tx,id,secret){
    if(typeof id!=='string'||typeof secret!=='string'||!/^[a-f0-9]{64}$/.test(secret))throw fail(409,'Worker lease expired or invalid');
    const lease=await tx.workerLease.findUnique({where:{matchId:id},include:{match:true}});
    if(!lease||lease.tokenHash!==sha(secret)||lease.completedAt||lease.expiresAt<=new Date(now())||lease.deadlineAt<=new Date(now())||lease.match.status!=='RUNNING')throw fail(409,'Worker lease expired or invalid');
    return lease;
  }
  function payload(s){
    if(!s||!s.source||!s.user?.isActive)throw fail(409,'Participant or source unavailable');
    if(sha(s.source.content)!==s.sha256||Buffer.byteLength(s.source.content)!==s.source.byteLength)throw fail(409,'Source integrity mismatch');
    return {id:s.id,name:s.filename,lang:s.language,sha256:s.sha256,content:s.source.content};
  }
  async function validateReplay(m,r){
    if(!r||!Array.isArray(r.events)||r.events.length>m.maxMoves||!Array.isArray(r.snapshots)||r.snapshots.length!==r.events.length+1)throw fail(400,'Invalid replay');
    let i=0;
    const replay=await runMatch({seed:Number(m.seed),maxMoves:m.maxMoves,pieces:m.pieces,first:m.firstPlayerSetting,decide:async()=>{
      if(i<r.events.length)return r.events[i++];
      if(r.fault&&['invalid-action','bot-timeout','bot-crash','bot-output-limit','bot-protocol-error','bot-error','sandbox-unavailable'].includes(r.reason))throw Object.assign(Error('Bot execution failed'),{kind:r.reason});
      throw Error('Unexpected end of replay');
    }});
    for(const key of ['seed','maxMoves','pieces','firstPlayer','snapshots','events','winner','reason','turns'])if(canonical(replay[key])!==canonical(r[key]))throw fail(400,'Replay validation failed: '+key);
    return replay;
  }
  async function handle(req,res,p,readBody,send){
    authorize(req);if(req.method!=='POST')throw fail(405,'Method not allowed');
    const b=await readBody(req,p==='/api/worker/result'?9*1024*1024:4096);
    if(p==='/api/worker/poll'){
      if(b.protocol!==1||b.ready!==true)throw fail(400,'Worker not ready');
      const job=await prisma.$transaction(async tx=>{
        await queueLock(tx);await sweep(tx);
        if(await tx.match.count({where:{kind:'PRACTICE',status:'RUNNING'}}))return null;
        const m=await tx.match.findFirst({where:{kind:'PRACTICE',status:'QUEUED'},orderBy:[{createdAt:'asc'},{id:'asc'}]});
        if(!m)return null;
        const rows=await Promise.all([m.submissionAId,m.submissionBId].map(id=>tx.submission.findUnique({where:{id},include:{source:true,user:{select:{isActive:true}}}})));
        let submissions;try{submissions=rows.map(payload);}catch{await tx.match.update({where:{id:m.id},data:{status:'FAILED',reason:'participant-or-source-unavailable',finishedAt:new Date(now())}});return null;}
        const secret=crypto.randomBytes(32).toString('hex');
        await tx.match.update({where:{id:m.id},data:{status:'RUNNING',startedAt:new Date(now())}});
        await tx.workerLease.create({data:{matchId:m.id,tokenHash:sha(secret),expiresAt:new Date(now()+90000),deadlineAt:new Date(now()+20*60000)}});
        return {id:m.id,lease:secret,options:{seed:Number(m.seed),maxMoves:m.maxMoves,pieces:m.pieces,first:m.firstPlayerSetting},submissions};
      });
      seen=now();return send(res,200,{job});
    }
    if(p==='/api/worker/heartbeat'){
      await prisma.$transaction(async tx=>{await queueLock(tx);await sweep(tx);await activeLease(tx,b.id,b.lease);await tx.workerLease.update({where:{matchId:b.id},data:{expiresAt:new Date(now()+90000)}});});
      seen=now();return send(res,200,{ok:true});
    }
    if(p==='/api/worker/result'){
      if(typeof b.id!=='string'||typeof b.lease!=='string')throw fail(400,'Invalid worker result');
      const digest=sha(canonical({replay:b.replay,error:b.error}));
      const result=await prisma.$transaction(async tx=>{
        await queueLock(tx);await sweep(tx);
        const receipt=await tx.workerLease.findUnique({where:{matchId:b.id}});
        if(receipt?.completedAt&&receipt.tokenHash===sha(b.lease)&&receipt.resultDigest===digest)return {ok:true,duplicate:true};
        const lease=await activeLease(tx,b.id,b.lease),m=lease.match;
        if(b.error!==undefined){
          if(typeof b.error!=='string'||b.error.length>500)throw fail(400,'Invalid worker failure');
          await tx.match.update({where:{id:m.id},data:{status:'FAILED',reason:'worker-error',finishedAt:new Date(now())}});
        }else{
          const replay=await validateReplay(m,b.replay),stored=replayPayload(replay);
          // Validation and metadata/payload commit happen in the same transaction.
          await activeLease(tx,b.id,b.lease);
          await tx.matchReplay.create({data:{matchId:m.id,...stored}});
          await tx.match.update({where:{id:m.id},data:{status:'COMPLETED',winner:replay.winner==='p1'?'PLAYER_A':replay.winner==='p2'?'PLAYER_B':'DRAW',reason:replay.reason,turnCount:replay.turns,replayPath:'postgres:'+m.id,replayHash:stored.sha256,finishedAt:new Date(now())}});
          try {
            const eloService = require('../elo-service');
            const [subA, subB] = await Promise.all([
              tx.submission.findUnique({ where: { id: m.submissionAId }, include: { user: true } }),
              tx.submission.findUnique({ where: { id: m.submissionBId }, include: { user: true } })
            ]);
            if (subA && subB) {
              eloService.recordMatchResult({
                idA: subA.id,
                nameA: subA.filename,
                ownerA: subA.user?.username,
                langA: subA.language,
                idB: subB.id,
                nameB: subB.filename,
                ownerB: subB.user?.username,
                langB: subB.language,
                winner: replay.winner === 'p1' ? 'PLAYER_A' : replay.winner === 'p2' ? 'PLAYER_B' : 'DRAW',
                matchId: m.id,
                reason: replay.reason
              });
            }
          } catch (_) {}
        }
        await tx.workerLease.update({where:{matchId:m.id},data:{completedAt:new Date(now()),resultDigest:digest}});
        await audit(tx,null,'WORKER_RESULT_ACCEPTED',m.id);
        return {ok:true};
      },{maxWait:10000,timeout:20000});
      return send(res,200,result);
    }
    throw fail(404,'Worker route not found');
  }
  return {status,handle,stop(){stopped=true;}};
}
module.exports={createWorker};
