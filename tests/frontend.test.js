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
 for(const page of ['overview','arena','submit','leaderboard','tournaments','admin']){
  vm.runInContext(`go('${page}')`,ctx);
  assert.ok(app.innerHTML.includes('OTT'));
 }
 assert.ok(app.innerHTML.includes('Run built-in demo match'));
 assert.ok(app.innerHTML.includes('id="challengeBot"'));
});
test('server data replaces mock matches with empty state and avoids fake replay',async()=>{
 const {app,ctx}=makeContext();
 await vm.runInContext('loadBackend()',ctx);
 vm.runInContext("go('arena')",ctx);
 assert.ok(app.innerHTML.includes('No match replays yet'));
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
