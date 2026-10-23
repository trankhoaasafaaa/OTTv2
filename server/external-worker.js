'use strict';
// Trusted worker protocol for the single-process JSON backend. No public source endpoint.
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const {runMatch} = require('./engine');
const hash = value => crypto.createHash('sha256').update(value).digest('hex');
const fail = (status, message) => Object.assign(new Error(message), {status});
function createExternalWorker({store, dataDir, token, now = Date.now}) {
  if (token && !/^[a-f0-9]{64}$/.test(token)) throw Error('WORKER_TOKEN must be 64 lowercase hexadecimal characters');
  let seen = 0, stopped = false;
  const leases = new Map(), receipts = new Map();
  function sweep() {
    for (const [id, lease] of leases) if (now() > lease.until || now() > lease.deadline) {
      store.mutate(db => {const m=db.matches.find(m=>m.id===id);if(m?.status==='running')Object.assign(m,{status:'failed',reason:'worker-disconnected',finishedAt:new Date(now()).toISOString()});});
      leases.delete(id);
    }
  }
  function status() {sweep();return {challengeReady:!stopped&&!!token&&seen>0&&now()-seen<60000,dockerReady:false,botExecution:'external-worker',activeJobs:leases.size,pendingJobs:store.read().matches.filter(m=>m.mode==='submitted'&&m.status==='queued').length,maxConcurrent:1};}
  function authorize(req) {
    const supplied = req.headers.authorization;
    if (!token || typeof supplied !== 'string' || Buffer.byteLength(supplied) !== 71 || !crypto.timingSafeEqual(Buffer.from(supplied),Buffer.from('Bearer '+token))) throw fail(401,'Worker authentication required');
    if(stopped)throw fail(503,'Server stopping');
  }
  function leaseFor(id, secret) {
    sweep();const l=leases.get(id);
    if(!l||typeof secret!=='string'||hash(secret)!==l.hash)throw fail(409,'Worker lease expired or invalid');
    return l;
  }
  function payload(sub) {
    if(!sub||!/^SUB-[A-F0-9]{8}$/.test(sub.id)||!/^[A-Za-z][A-Za-z0-9_]{0,60}\.(py|java|c)$/.test(sub.name))throw fail(409,'Submission source unavailable');
    const bytes=fs.readFileSync(path.join(dataDir,'bots',sub.id,sub.name));
    if(bytes.length>500000||hash(bytes)!==sub.sha256)throw fail(409,'Submission source integrity mismatch');
    return {id:sub.id,name:sub.name,lang:sub.lang,sha256:sub.sha256,content:bytes.toString('utf8')};
  }
  async function handle(req, res, p, readBody, send) {
    authorize(req);
    if(req.method!=='POST')throw fail(405,'Method not allowed');
    const b=await readBody(req,9*1024*1024);sweep();
    if(p==='/api/worker/poll') {
      if(b.protocol!==1||b.ready!==true)throw fail(400,'Worker not ready');
      seen=now();if(leases.size)return send(res,200,{job:null});
      const db=store.read(),m=db.matches.find(m=>m.mode==='submitted'&&m.status==='queued');
      if(!m)return send(res,200,{job:null});
      const a=db.submissions.find(s=>s.id===m.submissionA),c=db.submissions.find(s=>s.id===m.submissionB);
      if(![a,c].every(s=>s&&db.users.some(u=>u.id===s.userId&&u.isActive))) {
        store.mutate(x=>Object.assign(x.matches.find(x=>x.id===m.id),{status:'failed',reason:'participant-unavailable',finishedAt:new Date().toISOString()}));
        return send(res,200,{job:null});
      }
      let submissions;
      try{submissions=[payload(a),payload(c)];}catch(e){store.mutate(x=>Object.assign(x.matches.find(x=>x.id===m.id),{status:'failed',reason:'source-unavailable',finishedAt:new Date().toISOString()}));throw e;}
      const secret=crypto.randomBytes(32).toString('hex');
      store.mutate(x=>Object.assign(x.matches.find(x=>x.id===m.id),{status:'running',startedAt:new Date().toISOString()}));
      leases.set(m.id,{hash:hash(secret),until:now()+90000,deadline:now()+20*60000,match:m});
      return send(res,200,{job:{id:m.id,lease:secret,options:{seed:m.seed,maxMoves:m.maxMoves,pieces:m.pieces,first:m.first},submissions}});
    }
    if(p==='/api/worker/heartbeat') {
      const l=leaseFor(b.id,b.lease);l.until=now()+90000;seen=now();return send(res,200,{ok:true});
    }
    if(p==='/api/worker/result') {
      const digest=hash(JSON.stringify({replay:b.replay,error:b.error}));
      const receipt=receipts.get(b.id);
      if(receipt&&receipt.secret===hash(String(b.lease))&&receipt.digest===digest)return send(res,200,{ok:true,duplicate:true});
      const l=leaseFor(b.id,b.lease),m=l.match;
      let replay,bytes;
      if(b.error!==undefined) {
        if(typeof b.error!=='string'||b.error.length>500)throw fail(400,'Invalid worker failure');
      } else {
        const r=b.replay;
        if(!r||!Array.isArray(r.events)||r.events.length>m.maxMoves||!Array.isArray(r.snapshots)||r.snapshots.length!==r.events.length+1)throw fail(400,'Invalid replay');
        let i=0;
        replay=await runMatch({seed:m.seed,maxMoves:m.maxMoves,pieces:m.pieces,first:m.first,decide:async()=>{
          if(i<r.events.length)return r.events[i++];
          if(r.fault&&['invalid-action','bot-timeout','bot-crash','bot-output-limit','bot-protocol-error','bot-error','sandbox-unavailable'].includes(r.reason))throw Object.assign(Error('Bot execution failed'),{kind:r.reason});
          throw fail(400,'Replay ended unexpectedly');
        }});
        for(const key of ['seed','maxMoves','pieces','firstPlayer','snapshots','events','winner','reason','turns'])if(JSON.stringify(replay[key])!==JSON.stringify(r[key]))throw fail(400,'Replay validation failed: '+key);
        // Persist reconstructed data. Never persist arbitrary worker fields or bot stderr.
        bytes=Buffer.from(JSON.stringify(replay));if(bytes.length>8*1024*1024)throw fail(413,'Replay exceeds 8 MiB');
        const final=path.join(dataDir,'replays',m.id+'.json'),temp=final+'.tmp';
        fs.writeFileSync(temp,bytes,{mode:0o600});fs.renameSync(temp,final);
      }
      // Recheck after async validation: a timed-out worker cannot submit late results.
      leaseFor(b.id,b.lease);
      store.mutate(db=>{const row=db.matches.find(x=>x.id===m.id);if(row?.status!=='running')throw fail(409,'Match no longer running');Object.assign(row,b.error!==undefined?{status:'failed',reason:'worker-error',finishedAt:new Date().toISOString()}:{status:'completed',winner:replay.winner,reason:replay.reason,turns:replay.turns,replayHash:hash(bytes),finishedAt:new Date().toISOString()});});
      if(b.error===undefined&&replay){
        try{
          const eloService=require('./elo-service');
          const db=store.read(),subA=db.submissions.find(s=>s.id===m.submissionA),subB=db.submissions.find(s=>s.id===m.submissionB);
          if(subA&&subB){
            eloService.recordMatchResult({
              idA:subA.id,nameA:subA.name,ownerA:subA.ownedBy,langA:subA.lang,
              idB:subB.id,nameB:subB.name,ownerB:subB.ownedBy,langB:subB.lang,
              winner:replay.winner==='p1'?'PLAYER_A':replay.winner==='p2'?'PLAYER_B':'DRAW',
              matchId:m.id,reason:replay.reason
            });
          }
        }catch(_){}
      }
      leases.delete(m.id);receipts.set(m.id,{secret:hash(b.lease),digest});if(receipts.size>500)receipts.delete(receipts.keys().next().value);
      return send(res,200,{ok:true});
    }
    throw fail(404,'Worker route not found');
  }
  return {status,handle,stop(){stopped=true;}};
}
module.exports={createExternalWorker};
