'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),os=require('node:os'),path=require('node:path'),crypto=require('node:crypto');
const {spawn}=require('node:child_process');
const {createClient}=require('../server/online-pg/client');
const {createRenderPgApp}=require('../server/index-render-pg');
const {bootstrap,check}=require('../scripts/render-pg-tools.cjs');
const {loadSnapshot,importSnapshot}=require('../server/online-pg/import-json');
const {sha}=require('../server/online-pg/common');
const {runMatch}=require('../server/engine');
const testUrl=process.env.TEST_DATABASE_URL;
test('PostgreSQL migration/import, auth, private source, external-worker and restart persistence',{skip:!testUrl,timeout:180000},async t=>{
  const baseUrl=new URL(testUrl);if(!['localhost','127.0.0.1'].includes(baseUrl.hostname))throw Error('Integration tests only accept a local disposable PostgreSQL host');
  const schema='ott_render_test_'+crypto.randomBytes(6).toString('hex');
  const admin=createClient(testUrl,{production:false});await admin.$executeRawUnsafe('CREATE SCHEMA "'+schema+'"');await admin.$disconnect();
  baseUrl.searchParams.set('schema',schema);baseUrl.searchParams.set('connection_limit','1');const url=baseUrl.toString();
  let db=createClient(url,{production:false}),app=null;
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),'ott-pg-fixture-'));
  t.after(async()=>{if(app){app.stop();app.server.closeAllConnections();await new Promise(r=>app.server.close(r));}await db.$disconnect();const cleanup=createClient(testUrl,{production:false});await cleanup.$executeRawUnsafe('DROP SCHEMA "'+schema+'" CASCADE');await cleanup.$disconnect();fs.rmSync(dir,{recursive:true,force:true});});
  if(process.env.OTT_TEST_APPLY_SQL==='1'){
    await db.$executeRawUnsafe('SET search_path TO "'+schema+'"');
    // Embedded-PostgreSQL harness only. Production always uses migrate deploy.
    for(const name of fs.readdirSync(path.resolve(__dirname,'../prisma/migrations')).sort()){
      const file=path.resolve(__dirname,'../prisma/migrations',name,'migration.sql');if(!fs.existsSync(file))continue;
      for(const sql of fs.readFileSync(file,'utf8').split(';').map(x=>x.trim()).filter(Boolean))await db.$executeRawUnsafe(sql);
    }
  }else{
    await db.$disconnect();
    await new Promise((resolve,reject)=>{const child=spawn(process.execPath,[path.resolve(__dirname,'../scripts/render-pg-tools.cjs'),'deploy'],{env:{...process.env,DATABASE_URL:url,NODE_ENV:'test'},stdio:'inherit'});child.on('error',reject);child.on('exit',code=>code===0?resolve():reject(Error('migrate deploy failed')));});
  }
  const password='PostgresTestPassword123!',uid=crypto.randomUUID(),id='SUB-11111111',mid='M-11111111';
  const hash=await require('bcryptjs').hash(password,4),content='import json,sys\nfor line in sys.stdin:\n print(json.dumps(json.loads(line)["moves"][0]),flush=True)\n';
  fs.mkdirSync(path.join(dir,'bots',id),{recursive:true});fs.mkdirSync(path.join(dir,'replays'));
  fs.writeFileSync(path.join(dir,'bots',id,'old.py'),content);
  const replay=await runMatch({seed:123,maxMoves:20,pieces:6,first:'Random'}),bytes=JSON.stringify(replay);fs.writeFileSync(path.join(dir,'replays',mid+'.json'),bytes);
  const snapshot={version:1,revision:1,users:[{id:uid,username:'old_student',email:null,passwordHash:hash,role:'STUDENT',isActive:true,createdAt:'2026-10-01T00:00:00Z'}],sessions:[{old:true}],submissions:[{id,userId:uid,name:'old.py',lang:'Python',version:'v1',sha256:sha(content),status:'Ready',date:'2026-10-01T00:00:00Z'}],matches:[{id:mid,createdById:uid,mode:'demo',status:'completed',a:'Greedy Bot',b:'Random Bot',seed:123,maxMoves:20,pieces:6,first:'Random',turns:replay.turns,winner:replay.winner,reason:replay.reason,replayHash:sha(bytes),createdAt:'2026-10-01T00:00:00Z',finishedAt:'2026-10-01T00:01:00Z'}],audit:[],settings:{submissionsOpen:true}};
  fs.writeFileSync(path.join(dir,'arena.json'),JSON.stringify(snapshot));
  const loaded=loadSnapshot(dir);const dry=await importSnapshot(db,loaded);assert.ok(dry.created>0);assert.equal(await db.user.count(),0);
  const imported=await importSnapshot(db,loaded,{write:true});assert.ok(imported.created>0);assert.equal(imported.skippedSessions,1);assert.equal((await db.user.findUnique({where:{id:uid}})).passwordHash,hash);
  assert.equal((await importSnapshot(db,loaded,{write:true})).created,0);
  await db.user.update({where:{id:uid},data:{email:'changed@school.edu'}});await assert.rejects(()=>importSnapshot(db,loaded,{write:true}),/differs/);await db.user.update({where:{id:uid},data:{email:null}});
  assert.equal((await check(db)).missingSources,0);assert.equal((await check(db)).missingReplays,0);
  assert.equal((await bootstrap(db,'organizer',password)).created,true);const adminBefore=await db.user.findUnique({where:{username:'organizer'}});
  assert.equal((await bootstrap(db,'organizer','DifferentPassword123!')).created,false);assert.equal((await db.user.findUnique({where:{username:'organizer'}})).passwordHash,adminBefore.passwordHash);
  await assert.rejects(()=>bootstrap(db,'old_student',password));
  const origin='https://arena-test.vercel.app',token='a'.repeat(64);let clock=Date.now(),unavailable=false;
  const proxy=new Proxy(db,{get(target,key){if(key==='$queryRaw'&&unavailable)return ()=>Promise.reject(Object.assign(Error('Unavailable'),{code:'P1001'}));const value=Reflect.get(target,key);return typeof value==='function'?value.bind(target):value;}});
  async function launch(client){app=await createRenderPgApp({prisma:client,frontendOrigin:origin,workerToken:token,workerNow:()=>clock});await new Promise(r=>app.server.listen(0,'127.0.0.1',r));}
  await launch(proxy);
  async function call(method,p,body,cookie,worker=false,headers={}){const res=await fetch('http://127.0.0.1:'+app.server.address().port+'/api'+p,{method,headers:{'Content-Type':'application/json',...(worker?{Authorization:'Bearer '+token}:{Origin:origin,'X-OTT-Request':'1'}),...(cookie?{Cookie:cookie}:{}),...headers},...(body===undefined?{}:{body:JSON.stringify(body)})});return {status:res.status,body:await res.json(),cookie:res.headers.get('set-cookie')?.split(';')[0]};}
  const a=await call('POST','/auth/login',{username:'old_student',password});assert.equal(a.status,200);
  const b=await call('POST','/auth/register',{username:'second_student',password,role:'ADMIN'});assert.equal(b.status,201);assert.equal(b.body.role,'STUDENT');
  assert.equal((await call('GET','/submissions',undefined,a.cookie)).body[0].userId,uid);assert.equal((await call('GET','/submissions',undefined,b.cookie)).body.length,0);
  assert.equal((await call('GET','/submissions/'+id+'/source',undefined,b.cookie)).status,404);
  assert.equal((await call('GET','/submissions/'+id+'/source',undefined,a.cookie)).body.content,content);
  const sub=await call('POST','/submissions',{name:'new.py',lang:'Python',content,userId:uid,ownedBy:'old_student'},b.cookie);assert.equal(sub.status,201);assert.equal(sub.body.userId,b.body.id);
  assert.equal((await call('POST','/matches',{submissionA:id},b.cookie)).status,404);
  assert.equal((await call('POST','/auth/logout',{},b.cookie,false,{Origin:'https://evil.example'})).status,403);
  assert.equal((await call('POST','/worker/poll',{protocol:1,ready:true})).status,401);
  assert.equal((await call('POST','/worker/poll',{protocol:1,ready:true},null,true)).status,200);
  const created=await call('POST','/matches',{submissionA:id,maxMoves:20},a.cookie);assert.equal(created.status,202);
  const job=(await call('POST','/worker/poll',{protocol:1,ready:true},null,true)).body.job;assert.ok(job);assert.equal(job.submissions.length,2);
  assert.equal((await call('POST','/worker/poll',{protocol:1,ready:true},null,true)).body.job,null);
  const r=await runMatch(job.options),result={id:job.id,lease:job.lease,replay:r};
  const bad=structuredClone(result);bad.replay.turns=999;assert.equal((await call('POST','/worker/result',bad,null,true)).status,400);
  // Close API/client, then create a new Prisma client and API while a worker lease exists.
  app.stop();app.server.closeAllConnections();await new Promise(resolve=>app.server.close(resolve));app=null;await db.$disconnect();db=createClient(url,{production:false});await launch(db);
  assert.equal((await call('POST','/worker/heartbeat',{id:job.id,lease:job.lease},null,true)).status,200);
  assert.equal((await call('POST','/worker/result',result,null,true)).status,200);
  assert.equal((await call('POST','/worker/result',result,null,true)).body.duplicate,true);
  assert.equal((await call('GET','/matches/'+job.id+'/replay')).body.turns,r.turns);
  assert.equal((await call('GET','/matches/'+mid+'/replay')).status,200);
  const publicMatches=JSON.stringify((await call('GET','/matches')).body);assert.ok(!publicMatches.includes(job.lease));assert.ok(!publicMatches.includes(content));
  const expiringMatch=await call('POST','/matches',{submissionA:id,maxMoves:20},a.cookie);assert.equal(expiringMatch.status,202);
  const expiringJob=(await call('POST','/worker/poll',{protocol:1,ready:true},null,true)).body.job;assert.ok(expiringJob);
  clock+=91000;assert.equal((await call('GET','/judge/status')).body.challengeReady,false);
  assert.equal((await call('GET','/matches/'+expiringJob.id)).body.status,'failed');
  assert.equal((await call('POST','/worker/result',{id:expiringJob.id,lease:expiringJob.lease,error:'late'},null,true)).status,409);
  const adminLogin=await call('POST','/auth/login',{username:'organizer',password});
  const s2=await call('POST','/auth/login',{username:'second_student',password});
  const sessions=(await call('GET','/auth/sessions',undefined,b.cookie)).body;const other=sessions.find(s=>!s.current);assert.ok(other);
  assert.equal((await call('DELETE','/auth/sessions/'+other.id,undefined,b.cookie)).status,200);assert.equal((await call('GET','/auth/me',undefined,s2.cookie)).status,401);
  assert.equal((await call('PATCH','/admin/users/'+b.body.id+'/role',{role:'JUDGE'},adminLogin.cookie)).status,200);assert.equal((await call('GET','/auth/me',undefined,b.cookie)).status,401);
  const judge=await call('POST','/auth/login',{username:'second_student',password});assert.equal((await call('GET','/submissions/'+id+'/source',undefined,judge.cookie)).status,404);
  assert.equal((await call('PATCH','/admin/users/'+b.body.id+'/status',{isActive:false},adminLogin.cookie)).status,200);assert.equal((await call('GET','/auth/me',undefined,judge.cookie)).status,401);
  const row=await db.submission.findUnique({where:{id:sub.body.id},include:{source:true}});assert.equal(row.source.content,content);
  const renameRes=await call('PATCH','/submissions/'+id,{botName:'RenamedBot'},a.cookie);assert.equal(renameRes.status,200);assert.equal(renameRes.body.botName,'RenamedBot');
  assert.equal((await call('GET','/submissions',undefined,a.cookie)).body.find(x=>x.id===id).botName,'RenamedBot');
  const deleteRes=await call('DELETE','/submissions/'+id,undefined,a.cookie);assert.equal(deleteRes.status,200);
  assert.equal((await call('GET','/submissions',undefined,a.cookie)).body.some(x=>x.id===id),false);
  assert.equal((await call('POST','/auth/logout',{},a.cookie)).status,200);assert.equal((await call('GET','/auth/me',undefined,a.cookie)).status,401);
  // Inject a DB outage in a new API, then restore it without touching data.
  app.stop();app.server.closeAllConnections();await new Promise(resolve=>app.server.close(resolve));app=null;
  const outage=new Proxy(db,{get(target,key){if(key==='$queryRaw'&&unavailable)return ()=>Promise.reject(Object.assign(Error('Unavailable'),{code:'P1001'}));const v=Reflect.get(target,key);return typeof v==='function'?v.bind(target):v;}});
  await launch(outage);unavailable=true;assert.equal((await call('GET','/health')).status,503);unavailable=false;assert.equal((await call('GET','/health')).status,200);assert.equal(await db.user.count(),3);
});
