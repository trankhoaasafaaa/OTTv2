'use strict';
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const {fork,spawnSync}=require('node:child_process');
const {setTimeout:delay}=require('node:timers/promises');
const endpoint=new URL(process.env.WORKER_API_URL||'https://ottv2-api.onrender.com');
if(endpoint.protocol!=='https:'&&!['localhost','127.0.0.1'].includes(endpoint.hostname))throw Error('Worker API requires HTTPS');
if(endpoint.username||endpoint.password||endpoint.pathname!=='/'||endpoint.search||endpoint.hash)throw Error('WORKER_API_URL must be an origin only');
const token=process.env.WORKER_TOKEN;
if(!/^[a-f0-9]{64}$/.test(token||''))throw Error('WORKER_TOKEN must be 64 lowercase hexadecimal characters');
const root=path.resolve(process.env.WORKER_DATA_DIR||path.join(__dirname,'../data-worker'));
fs.mkdirSync(root,{recursive:true,mode:0o700});
const lock=path.join(root,'worker.lock');
try{fs.writeFileSync(lock,String(process.pid),{flag:'wx',mode:0o600});}catch{throw Error('Worker directory locked. Stop the other worker; remove worker.lock only after confirming it is stopped.');}
let stopped=false,child=null;
for(const signal of ['SIGINT','SIGTERM'])process.on(signal,()=>{stopped=true;child?.kill('SIGKILL');});
function ready(){
  if(spawnSync('docker',['info','--format','{{.ServerVersion}}'],{timeout:5000,stdio:'ignore'}).status!==0)return false;
  for(const image of ['python:3.12-alpine','eclipse-temurin:21-jdk','eclipse-temurin:21-jre','gcc:13-bookworm','debian:bookworm-slim'])if(spawnSync('docker',['image','inspect',image],{timeout:5000,stdio:'ignore'}).status!==0)return false;
  return true;
}
async function api(route,body){
  const res=await fetch(endpoint.origin+'/api/worker/'+route,{method:'POST',redirect:'error',signal:AbortSignal.timeout(20000),headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'},body:JSON.stringify(body)});
  if(!res.ok)throw Object.assign(Error('Worker API HTTP '+res.status),{status:res.status});
  const reader=res.body.getReader();let size=0;const chunks=[];
  for(;;){const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>2*1024*1024){await reader.cancel();throw Error('Worker response too large');}chunks.push(Buffer.from(value));}
  return JSON.parse(Buffer.concat(chunks).toString('utf8'));
}
function cleanup(prefix){
  const list=spawnSync('docker',['ps','-aq','--filter','name=^'+prefix],{timeout:10000,encoding:'utf8'});
  const ids=(list.stdout||'').split(/\s+/).filter(x=>/^[a-f0-9]{12,64}$/.test(x));
  if(ids.length)spawnSync('docker',['rm','-f',...ids],{timeout:15000,stdio:'ignore'});
}
async function execute(job){
  if(!/^M-[A-F0-9]{8}$/.test(job.id)||!/^[a-f0-9]{64}$/.test(job.lease))throw Error('Invalid worker job');
  const prefix='ottw-'+crypto.randomBytes(8).toString('hex')+'-';
  const dir=fs.mkdtempSync(path.join(root,'job-'));fs.chmodSync(dir,0o755);
  let timer,hb,busy=false,lost=false;
  try {
    const result=await new Promise(resolve=>{
      let done=false;
      function finish(result){if(done)return;done=true;resolve(result);}
      child=fork(path.join(__dirname,'execute-job.cjs'),[],{env:{PATH:process.env.PATH,HOME:process.env.HOME,...Object.fromEntries(['DOCKER_HOST','DOCKER_CONTEXT','DOCKER_CONFIG','DOCKER_TLS_VERIFY','DOCKER_CERT_PATH','XDG_RUNTIME_DIR'].filter(k=>process.env[k]).map(k=>[k,process.env[k]])),OTT_DATA_DIR:dir,OTT_MODE:'offline',OTT_RUN_PREFIX:prefix},stdio:['ignore','ignore','ignore','ipc']});
      child.once('message',r=>finish(r));
      child.once('error',()=>finish({error:'Executor could not start'}));
      child.once('exit',()=>finish({error:'Executor stopped'}));
      child.send({submissions:job.submissions,options:job.options});
      timer=setTimeout(()=>{child?.kill('SIGKILL');finish({error:'Match exceeded 15 minutes'});},15*60000);
      hb=setInterval(async()=>{if(busy)return;busy=true;try{await api('heartbeat',{id:job.id,lease:job.lease});}catch(e){if([401,403,409].includes(e.status)){lost=true;child?.kill('SIGKILL');finish({error:'Lease lost'});}}finally{busy=false;}},20000);
    });
    if(!lost&&!stopped){
      for(let i=0;i<4;i++)try{await api('result',{id:job.id,lease:job.lease,...result});console.log('[worker]',job.id,result.replay?'completed':'failed');break;}catch(e){if([400,401,403,409,413].includes(e.status)||i===3)throw e;await delay(3000);}
    }
  } finally {clearTimeout(timer);clearInterval(hb);child?.kill('SIGKILL');child=null;cleanup(prefix);fs.rmSync(dir,{recursive:true,force:true});}
}
async function main(){
  console.log('[worker] Starting; one match at a time. API credentials are never sent to bot containers.');
  try {
    while(!stopped){
      try {
        if(!ready()){console.log('[worker] Docker/images not ready; retrying.');await delay(5000);continue;}
        const {job}=await api('poll',{protocol:1,ready:true});
        if(job){console.log('[worker] Running',job.id);await execute(job);}else await delay(5000);
      }catch(e){console.error('[worker]',e.status?'API HTTP '+e.status:'Connection or executor failure');if([401,403].includes(e.status))break;if(!stopped)await delay(5000);}
    }
  }finally{fs.rmSync(lock,{force:true});}
}
main().catch(()=>{fs.rmSync(lock,{force:true});console.error('[worker] Stopped unexpectedly');process.exitCode=1;});
