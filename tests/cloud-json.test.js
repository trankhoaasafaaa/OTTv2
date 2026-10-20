'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const os=require('node:os');
const path=require('node:path');
const vm=require('node:vm');
const {spawnSync}=require('node:child_process');
const {createJsonStore}=require('../server/cloud-json-store');
const {createJsonApp}=require('../server/index-json');
const origin='https://arena-test.vercel.app';
const password='CloudTestPassword123!';

function temporary(t){const dir=fs.mkdtempSync(path.join(os.tmpdir(),'ott-cloud-json-'));t.after(()=>fs.rmSync(dir,{recursive:true,force:true}));return dir;}
async function launch(t,dir,extra={}) {
  const app=await createJsonApp({dataDir:dir,frontendOrigin:origin,...extra});
  await new Promise(resolve=>app.server.listen(0,'127.0.0.1',resolve));
  t.after(async()=>{app.stop();app.server.closeAllConnections();await new Promise(resolve=>app.server.close(resolve));});
  const base='http://127.0.0.1:'+app.server.address().port;
  async function request(method,p,body,cookie,headers={}){const response=await fetch(base+'/api'+p,{method,headers:{Origin:origin,'X-OTT-Request':'1','Content-Type':'application/json',...(cookie?{Cookie:cookie}:{}),...headers},...(body===undefined?{}:{body:JSON.stringify(body)})});return {status:response.status,body:await response.json(),cookie:response.headers.get('set-cookie'),cache:response.headers.get('cache-control')};}
  return {...app,request};
}

test('JSON writes persist, return immutable snapshots, and refuse corruption',t=>{
  const dir=temporary(t),store=createJsonStore(dir);
  store.mutate(db=>{db.settings.submissionsOpen=false;});
  const snapshot=store.read();snapshot.settings.submissionsOpen=true;
  assert.equal(store.read().settings.submissionsOpen,false);
  assert.equal(createJsonStore(dir).read().settings.submissionsOpen,false);
  assert.throws(()=>store.mutate(db=>{db.settings.submissionsOpen=true;throw Error('rollback');}),/rollback/);
  assert.equal(store.read().settings.submissionsOpen,false);
  fs.writeFileSync(store.filename,'{broken-json');
  assert.throws(()=>createJsonStore(dir),/Refusing/);
  assert.equal(fs.readFileSync(store.filename,'utf8'),'{broken-json');
});

test('stale JSON writers are rejected instead of overwriting newer data',t=>{
  const dir=temporary(t),one=createJsonStore(dir),two=createJsonStore(dir);
  one.mutate(db=>{db.settings.submissionsOpen=false;});
  assert.throws(()=>two.mutate(db=>{db.settings.submissionsOpen=true;}),/Another process/);
});

test('account lifecycle, roles, cookies, CSRF and session ownership over real HTTP',async t=>{
  const app=await launch(t,temporary(t),{bootstrapUsername:'organizer',bootstrapPassword:password});
  const call=app.request;
  const registered=await call('POST','/auth/register',{username:'student_one',password,role:'ADMIN'});
  assert.equal(registered.status,201);assert.equal(registered.body.role,'STUDENT');
  assert.ok(!('passwordHash'in registered.body));assert.ok(!('token'in registered.body));
  assert.match(registered.cookie,/HttpOnly/);assert.match(registered.cookie,/Secure/);assert.match(registered.cookie,/SameSite=Lax/);
  const studentCookie=registered.cookie.split(';')[0],userId=registered.body.id;
  assert.equal((await call('GET','/auth/me',undefined,studentCookie)).body.username,'student_one');
  assert.equal((await call('GET','/admin/users',undefined,studentCookie)).status,403);
  assert.equal((await call('PATCH','/users/me',{role:'ADMIN'},studentCookie)).status,400);
  assert.equal((await call('PATCH','/users/me',{email:'one@school.edu'},studentCookie)).status,200);
  assert.equal((await call('POST','/auth/logout',{},studentCookie,{'X-OTT-Request':''})).status,403);
  assert.equal((await call('POST','/auth/logout',{},studentCookie,{Origin:'https://evil.example'})).status,403);
  const second=await call('POST','/auth/login',{username:'student_one',password});
  const secondCookie=second.cookie.split(';')[0];
  const sessions=(await call('GET','/auth/sessions',undefined,studentCookie)).body;
  assert.equal(sessions.length,2);assert.ok(sessions.every(s=>!('tokenHash'in s)));
  const other=sessions.find(s=>!s.current);
  assert.equal((await call('DELETE','/auth/sessions/'+other.id,undefined,studentCookie)).status,200);
  assert.equal((await call('GET','/auth/me',undefined,secondCookie)).status,401);
  const adminLogin=await call('POST','/auth/login',{username:'organizer',password});
  const adminCookie=adminLogin.cookie.split(';')[0];
  const adminSession=app.store.read().sessions.find(s=>s.userId===adminLogin.body.id);
  assert.equal((await call('DELETE','/auth/sessions/'+adminSession.id,undefined,studentCookie)).status,404);
  assert.equal((await call('PATCH','/admin/users/'+userId+'/role',{role:'JUDGE'},adminCookie)).status,200);
  assert.equal((await call('GET','/auth/me',undefined,studentCookie)).status,401);
  const judgeLogin=await call('POST','/auth/login',{username:'student_one',password});
  assert.equal(judgeLogin.body.role,'JUDGE');
  const judgeCookie=judgeLogin.cookie.split(';')[0];
  assert.equal((await call('GET','/admin/users',undefined,judgeCookie)).status,403);
  assert.equal((await call('PATCH','/admin/users/'+userId+'/status',{isActive:false},adminCookie)).status,200);
  assert.equal((await call('GET','/auth/me',undefined,judgeCookie)).status,401);
  assert.equal((await call('POST','/auth/login',{username:'student_one',password})).status,401);
  assert.equal((await call('PATCH','/admin/users/'+adminLogin.body.id+'/status',{isActive:false},adminCookie)).status,409);
  assert.equal((await call('POST','/auth/logout',{},adminCookie)).status,200);
  assert.equal((await call('GET','/auth/me',undefined,adminCookie)).status,401);
  const state=app.store.read();
  assert.ok(state.sessions.every(s=>s.tokenHash.length===64&&!s.tokenHash.includes('ott_session=')));
  assert.ok(state.audit.some(a=>a.action==='USER_ROLE_CHANGED'));
  assert.ok(!JSON.stringify(state).includes(password));
});

test('registration races cannot create duplicate usernames; login errors are generic and limited',async t=>{
  const {request:call,store}=await launch(t,temporary(t));
  const attempts=await Promise.all([1,2].map(()=>call('POST','/auth/register',{username:'same_name',password})));
  assert.deepEqual(attempts.map(x=>x.status).sort(),[201,409]);
  assert.equal(store.read().users.length,1);
  const known=await call('POST','/auth/login',{username:'same_name',password:'WrongPassword123!'});
  const missing=await call('POST','/auth/login',{username:'not_found',password});
  assert.equal(known.status,401);assert.deepEqual(known.body,missing.body);
  for(let i=0;i<9;i++)await call('POST','/auth/login',{username:'not_found',password});
  assert.equal((await call('POST','/auth/login',{username:'not_found',password})).status,429);
});

test('upload stores source privately and refuses execution without a sandbox worker',async t=>{
  const dir=temporary(t),{request:call}=await launch(t,dir);
  const user=await call('POST','/auth/register',{username:'upload_user',password});
  const cookie=user.cookie.split(';')[0];
  const upload=await call('POST','/submissions',{name:'bot.py',lang:'Python',content:'print("hello")',version:'v1'},cookie);
  assert.equal(upload.status,201);
  assert.ok(fs.existsSync(path.join(dir,'bots',upload.body.id,'bot.py')));
  assert.equal((await call('GET','/submissions')).body.length,0);
  assert.equal((await call('GET','/submissions',undefined,cookie)).body.length,1);
  assert.equal((await call('POST','/submissions',{name:'../bad.py',lang:'Python',content:'x'},cookie)).status,400);
  assert.equal((await call('POST','/matches',{submissionA:upload.body.id},cookie)).status,503);
  assert.equal((await call('GET','/judge/status')).body.dockerReady,false);
});

test('built-in demo executes, saves replay and validates its hash',async t=>{
  const dir=temporary(t),{request:call}=await launch(t,dir);
  const user=await call('POST','/auth/register',{username:'demo_user',password});
  const cookie=user.cookie.split(';')[0];
  const match=await call('POST','/matches',{maxMoves:20,pieces:6,first:'Random'},cookie);
  assert.equal(match.status,202);
  let rec;
  for(let i=0;i<100;i++){rec=await call('GET','/matches/'+match.body.id);if(rec.body.status==='completed')break;await new Promise(r=>setTimeout(r,20));}
  assert.equal(rec.body.status,'completed');
  assert.ok((await call('GET','/matches/'+match.body.id+'/replay')).body.snapshots.length>0);
  fs.writeFileSync(path.join(dir,'replays',match.body.id+'.json'),'{}');
  assert.equal((await call('GET','/matches/'+match.body.id+'/replay')).status,409);
});

test('users and sessions survive a backend restart on the same directory',async t=>{
  const dir=temporary(t),first=await launch(t,dir);
  const user=await first.request('POST','/auth/register',{username:'persistent_user',password});
  const cookie=user.cookie.split(';')[0];
  first.stop();first.server.closeAllConnections();await new Promise(resolve=>first.server.close(resolve));
  const second=await launch(t,dir,{bootstrapUsername:'organizer',bootstrapPassword:password});
  assert.equal((await second.request('GET','/auth/me',undefined,cookie)).body.username,'persistent_user');
  assert.equal(second.store.read().users.filter(u=>u.role==='ADMIN').length,1);
});

test('proxy configuration helper updates only the API destination and rejects HTTP',t=>{
  const dir=temporary(t);
  fs.mkdirSync(path.join(dir,'scripts'));fs.mkdirSync(path.join(dir,'public'));
  fs.copyFileSync(path.resolve(__dirname,'../scripts/configure-vercel.cjs'),path.join(dir,'scripts/configure-vercel.cjs'));
  const filename=path.join(dir,'public/vercel.json');
  fs.writeFileSync(filename,JSON.stringify({rewrites:[{source:'/api/:path*',destination:'https://old.example/api/:path*'}],headers:[{source:'/api/:path*',headers:[]}]}));
  const script=path.join(dir,'scripts/configure-vercel.cjs');
  const result=spawnSync(process.execPath,[script,'https://backend-test.onrender.com'],{encoding:'utf8'});
  assert.equal(result.status,0,result.stderr);
  const value=JSON.parse(fs.readFileSync(filename,'utf8'));
  assert.equal(value.rewrites[0].destination,'https://backend-test.onrender.com/api/:path*');
  assert.equal(value.headers.length,1);
  assert.equal(spawnSync(process.execPath,[script,'http://insecure.example']).status,1);
});

test('cloud bridge stops the old socket and keeps match tracking in HTTP polling mode',()=>{
  const context={document:{getElementById:()=>null},clearTimeout:()=>{},closed:false};
  vm.createContext(context);
  vm.runInContext('let wsReconnectTimer=1;let wsConn={onclose(){},close(){closed=true;}};function connectWebSocket(){throw Error("old socket used");}',context);
  vm.runInContext(fs.readFileSync(path.resolve(__dirname,'../public/cloud-bridge.js'),'utf8'),context);
  vm.runInContext('connectWebSocket()',context);
  assert.equal(context.closed,true);
  assert.equal(vm.runInContext('wsConn',context),null);
});
