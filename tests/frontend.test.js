'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const vm=require('node:vm'),fs=require('node:fs'),path=require('node:path');
const scripts=path.resolve(__dirname,'../public');
function makeContext(){
 const app={innerHTML:''};
 const ctx={console,location:{hash:''},setTimeout,clearTimeout,setInterval,clearInterval,
  localStorage:{getItem:()=>null,setItem:()=>{},removeItem:()=>{}},
  window:{scrollTo:()=>{},addEventListener:()=>{}},
  document:{readyState:'loading',addEventListener:()=>{},documentElement:{className:''},getElementById:id=>id==='app'?app:null,querySelector:()=>null,createElement:()=>({textContent:''}),body:{append:()=>{}}},
  fetch:async url=>({ok:true,json:async()=>url.includes('/submissions')?[{id:'SUB-A1B2C3D4',name:'bot.c',lang:'C',date:new Date().toISOString(),status:'Stored',version:'v1'}]:url.includes('/matches')?[]:url.includes('/leaderboard')?[]:{dockerReady:false}})
 };
 vm.createContext(ctx);
 vm.runInContext(fs.readFileSync(path.join(scripts,'app.js'),'utf8'),ctx);
 vm.runInContext(fs.readFileSync(path.join(scripts,'api.js'),'utf8'),ctx);
 return {app,ctx};
}
test('all major frontend views render without a browser runtime error',()=>{
 const {app,ctx}=makeContext();
 for(const page of ['overview','play','arena','submit','leaderboard','tournaments','admin']){
  vm.runInContext(`go('${page}')`,ctx);
  assert.ok(app.innerHTML.includes('OTT'));
 }
 assert.ok(app.innerHTML.includes('Cần đăng nhập'));
 assert.ok(!app.innerHTML.includes('Run built-in demo match'));
 assert.ok(!app.innerHTML.includes('Docker'));
});
test('server data replaces mock matches with empty state and avoids fake replay',async()=>{
 const {app,ctx}=makeContext();
 await vm.runInContext('loadBackend()',ctx);
 vm.runInContext("go('arena')",ctx);
 assert.ok(app.innerHTML.includes('Chưa có replay'));
});
test('registration form follows server setting and uses accessible account fields',()=>{
 const {app,ctx}=makeContext();
 vm.runInContext("registrationOpen=true;switchAuthMode('register')",ctx);
 assert.ok(app.innerHTML.includes('id="registerEmail"'));
 assert.ok(app.innerHTML.includes('autocomplete="new-password"'));
 assert.ok(app.innerHTML.includes('role="alert"'));
 vm.runInContext("registrationOpen=false;renderLoginPage()",ctx);
 assert.ok(!app.innerHTML.includes('id="registerEmail"'));
});
test('API uses same-origin cookies and CSRF header without a JavaScript bearer token',async()=>{
 const {ctx}=makeContext();
 let captured;
 ctx.fetch=async (url,options)=>{
  captured={url,options};return {ok:true,status:200,json:async()=>({ok:true})};
 };
 await vm.runInContext("saveAuth({username:'student',role:'STUDENT'});api.post('/auth/logout',{})",ctx);
 assert.equal(captured.options.credentials,'same-origin');
 assert.equal(captured.options.headers['X-OTT-Request'],'1');
 assert.ok(!Object.hasOwn(captured.options.headers,'Authorization'));
});

test('legacy localStorage submissions are never loaded as account data',()=>{
 const {ctx}=makeContext();
 assert.equal(vm.runInContext('state.submissions.length',ctx),0);
});

test('logout and account switching clear bot metadata and selected file immediately',()=>{
 const {ctx}=makeContext();
 vm.runInContext(`saveAuth({id:'user-a',username:'alice',role:'STUDENT'});
 state.submissions=[{id:'SUB-A',userId:'user-a'}];state.selectedFile={name:'private.py'};state.modal='upload';
 clearAuth();`,ctx);
 assert.equal(vm.runInContext('state.submissions.length',ctx),0);
 assert.equal(vm.runInContext('state.selectedFile',ctx),null);
 assert.equal(vm.runInContext('state.modal',ctx),null);
 vm.runInContext(`state.submissions=[{id:'SUB-A'}];saveAuth({id:'user-b',username:'bob',role:'STUDENT'})`,ctx);
 assert.equal(vm.runInContext('state.submissions.length',ctx),0);
});

test('late account A response cannot repopulate account B submissions',async()=>{
 const {ctx}=makeContext();
 let resolveOld;
 const oldResponse=new Promise(resolve=>{resolveOld=resolve;});
 ctx.fetch=async url=>({ok:true,status:200,json:async()=>url.endsWith('/submissions')?oldResponse:[]});
 vm.runInContext("saveAuth({id:'user-a',username:'alice',role:'STUDENT'})",ctx);
 const pending=vm.runInContext('loadBackend()',ctx);
 vm.runInContext("clearAuth();saveAuth({id:'user-b',username:'bob',role:'STUDENT'})",ctx);
 resolveOld([{id:'SUB-A',userId:'user-a',date:new Date().toISOString()}]);
 await pending;
 assert.equal(vm.runInContext('state.submissions.length',ctx),0);
 assert.equal(vm.runInContext('authState.id',ctx),'user-b');
});

test('backend lists for the wrong owner fail closed; a valid current list is displayed',async()=>{
 const {ctx}=makeContext();
 vm.runInContext("saveAuth({id:'user-b',username:'bob',role:'STUDENT'})",ctx);
 let owner='user-a';
 ctx.fetch=async url=>({ok:true,status:200,json:async()=>url.endsWith('/submissions')?[{id:'SUB-X',userId:owner,date:new Date().toISOString()}]:[]});
 await vm.runInContext('loadBackend()',ctx);
 assert.equal(vm.runInContext('state.submissions.length',ctx),0);
 owner='user-b';
 await vm.runInContext('loadBackend()',ctx);
 assert.equal(vm.runInContext('state.submissions[0].userId',ctx),'user-b');
});

test('old request returning 401 does not clear a newer login',async()=>{
 const {ctx}=makeContext();
 let finish;
 ctx.fetch=()=>new Promise(resolve=>{finish=resolve;});
 vm.runInContext("saveAuth({id:'user-a',username:'alice',role:'STUDENT'})",ctx);
 const request=vm.runInContext("api.get('/submissions')",ctx);
 vm.runInContext("clearAuth();saveAuth({id:'user-b',username:'bob',role:'STUDENT'})",ctx);
 finish({ok:false,status:401,json:async()=>({error:'Cần đăng nhập'})});
 await assert.rejects(request);
 assert.equal(vm.runInContext('authState.id',ctx),'user-b');
});


test('online pages never promote demo content or local setup, including staff views',()=>{
 const {ctx,app}=makeContext();
 for(const role of ['STUDENT','JUDGE','ADMIN']) {
  vm.runInContext(`saveAuth({id:'user',username:'student',role:'${role}'})`,ctx);
  for(const page of ['overview','play','arena','submit','leaderboard','tournaments','admin']) {
   vm.runInContext(`go('${page}')`,ctx);
   assert.doesNotMatch(app.innerHTML,/SERVER CONNECTED|OFFLINE \/ PREVIEW|FRONTEND PREVIEW|DEMO HOST|ILLUSTRATIVE|SAMPLE LEADERBOARD|Docker|Alex Morgan|Week 06|Season 2026/i);
   assert.ok(!app.innerHTML.includes('createServerMatch()'));
  }
 }
});

test('demo API matches are excluded and missing replays are never synthesized',async()=>{
 const {ctx}=makeContext();
 ctx.fetch=async url=>({ok:true,status:200,json:async()=>url.endsWith('/matches')?[
  {id:'M-11111111',mode:'demo',a:'Greedy',b:'Random',status:'completed',createdAt:new Date().toISOString()},
  {id:'M-22222222',mode:'submitted',a:'alice',b:'bob',status:'queued',createdAt:new Date().toISOString()}
 ]:[]});
 await vm.runInContext('loadBackend()',ctx);
 assert.equal(vm.runInContext('matches.length',ctx),1);
 assert.equal(vm.runInContext('matches[0].id',ctx),'M-22222222');
 assert.equal(vm.runInContext("buildReplay('M-22222222')",ctx),null);
});


test('Student can reach Challenge without Judge access and sees only their own bot options',()=>{
 const {ctx,app}=makeContext();
 vm.runInContext("saveAuth({id:'a',username:'alice',role:'STUDENT'});state.dataStatus='ready';state.submissions=[{id:'SUB-A',userId:'a',name:'alice.py',lang:'Python',version:'v1'},{id:'SUB-B',userId:'b',name:'bob.py',lang:'Python',version:'v1'}];go('play')",ctx);
 assert.ok(app.innerHTML.includes('Challenge Arena'));
 assert.ok(app.innerHTML.includes('alice.py'));
 assert.ok(!app.innerHTML.includes('bob.py'));
 assert.ok(app.innerHTML.includes('Thi đấu chưa mở'));
 assert.ok(app.innerHTML.includes(`onclick="go('play')"`));
 assert.ok(!app.innerHTML.includes(`onclick="go('admin')"`));
 vm.runInContext("clearAuth();go('play')",ctx);
 assert.ok(app.innerHTML.includes('Đăng nhập để đấu bot'));
});

test('Docker status alone never enables Challenge; the server must explicitly enable it',async()=>{
 const {ctx}=makeContext();
 let enabled=false;
 ctx.fetch=async url=>({ok:true,status:200,json:async()=>url.endsWith('/judge/status')?{dockerReady:true,...(enabled?{challengeReady:true}:{})}:[]});
 await vm.runInContext('loadBackend()',ctx);
 assert.equal(vm.runInContext('state.challengeReady',ctx),false);
 enabled=true;
 await vm.runInContext('loadBackend()',ctx);
 assert.equal(vm.runInContext('state.challengeReady',ctx),true);
});

test('Student sends their chosen bot through the existing match API and cannot double-submit',async()=>{
 const {ctx}=makeContext();
 const originalGet=ctx.document.getElementById;
 ctx.document.getElementById=id=>id==='challengeBot'?{value:'SUB-A'}:id==='challengeMaxMoves'?{value:'200'}:originalGet(id);
 ctx.document.createElement=()=>({remove:()=>{}});
 ctx.setTimeout=()=>0;
 vm.runInContext("saveAuth({id:'a',username:'alice',role:'STUDENT'});state.submissions=[{id:'SUB-A',userId:'a',name:'alice.py',lang:'Python',version:'v1'}];state.challengeReady=true;state.dataStatus='ready';waitForMatch=async function(){}",ctx);
 let requests=0,finish;
 ctx.fetch=async (url,options)=>{
  if(options.method==='POST'){
   requests++;
   assert.equal(url,'/api/matches');
   assert.equal(JSON.parse(options.body).submissionA,'SUB-A');
   assert.equal(options.credentials,'same-origin');
   await new Promise(resolve=>{finish=resolve;});
   return {ok:true,status:202,json:async()=>({id:'M-11111111'})};
  }
  return {ok:true,status:200,json:async()=>url.endsWith('/submissions')?[{id:'SUB-A',userId:'a',name:'alice.py',lang:'Python',date:new Date().toISOString()}]:url.endsWith('/judge/status')?{challengeReady:true}:[]};
 };
 const pending=vm.runInContext('challengeMatch()',ctx);
 await vm.runInContext('challengeMatch()',ctx);
 assert.equal(requests,1);
 finish();await pending;
 assert.equal(vm.runInContext('state.challengePending',ctx),false);
});
