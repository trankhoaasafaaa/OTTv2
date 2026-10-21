'use strict';
// Local Docker smoke test only. Does not connect to Render or create online matches.
const {fork,spawnSync}=require('node:child_process');
const fs=require('node:fs'),os=require('node:os'),path=require('node:path'),crypto=require('node:crypto');
const root=fs.mkdtempSync(path.join(os.tmpdir(),'ott-smoke-'));fs.chmodSync(root,0o755);
const prefix='ottw-'+crypto.randomBytes(8).toString('hex')+'-';
const content=fs.readFileSync(path.join(__dirname,'../examples/bots/worker_demo.py'),'utf8');
const submissions=['SUB-00000001','SUB-00000002'].map(id=>({id,name:'worker_demo.py',lang:'Python',content,sha256:crypto.createHash('sha256').update(content).digest('hex')}));
const env=Object.fromEntries(['PATH','HOME','DOCKER_HOST','DOCKER_CONTEXT','DOCKER_CONFIG','DOCKER_TLS_VERIFY','DOCKER_CERT_PATH','XDG_RUNTIME_DIR'].filter(k=>process.env[k]).map(k=>[k,process.env[k]]));
const child=fork(path.join(__dirname,'execute-job.cjs'),[],{env:{...env,OTT_DATA_DIR:root,OTT_MODE:'offline',OTT_RUN_PREFIX:prefix},stdio:['ignore','ignore','ignore','ipc']});
let received=false;
child.on('message',result=>{received=true;if(result.replay){console.log('Docker smoke PASS:',result.replay.turns,'turns;',result.replay.reason);}else{console.error('Docker smoke FAIL:',result.error);process.exitCode=1;}});
child.on('error',()=>{console.error('Cannot start executor');process.exitCode=1;});
const timer=setTimeout(()=>{child.kill('SIGKILL');console.error('Smoke timeout');process.exitCode=1;},120000);
child.on('exit',()=>{clearTimeout(timer);if(!received)process.exitCode=1;const list=spawnSync('docker',['ps','-aq','--filter','name=^'+prefix],{encoding:'utf8',timeout:10000});const ids=(list.stdout||'').split(/\s+/).filter(x=>/^[a-f0-9]{12,64}$/.test(x));if(ids.length)spawnSync('docker',['rm','-f',...ids],{timeout:10000,stdio:'ignore'});fs.rmSync(root,{recursive:true,force:true});});
child.send({submissions,options:{seed:123,maxMoves:20,pieces:6,first:'Player A'}});
