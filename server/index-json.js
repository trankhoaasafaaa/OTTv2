'use strict';
const http=require('node:http');
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const bcrypt=require('bcryptjs');
const {createJsonStore}=require('./cloud-json-store');
const {runMatch}=require('./engine');
const {createExternalWorker}=require('./external-worker');

const fail=(status,message)=>Object.assign(new Error(message),{status});
const sha=value=>crypto.createHash('sha256').update(value).digest('hex');
const publicUser=({id,username,email,role,isActive,createdAt})=>({id,username,email,role,isActive,createdAt});
const roles=['STUDENT','JUDGE','ADMIN'];
function username(value){if(typeof value!=='string'||!/^[a-z0-9_]{2,32}$/.test(value.trim().toLowerCase()))throw fail(400,'Username cần 2–32 ký tự: chữ, số, dấu _');return value.trim().toLowerCase();}
function password(value){if(typeof value!=='string'||value.length<12||Buffer.byteLength(value)>72||!/[A-Za-z]/.test(value)||!/[0-9]/.test(value))throw fail(400,'Mật khẩu cần ít nhất 12 ký tự, có chữ và số, tối đa 72 byte UTF-8');return value;}
function email(value){if(value===null||value==='')return null;if(typeof value!=='string'||value.length>254||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()))throw fail(400,'Email không hợp lệ');return value.trim().toLowerCase();}
function limiter(limit,windowMs){const buckets=new Map();return key=>{const now=Date.now();if(buckets.size>=10000)for(const [k,v]of buckets)if(v.until<=now)buckets.delete(k);let b=buckets.get(key);if(!b||b.until<=now){if(!b&&buckets.size>=10000)throw fail(429,'Quá nhiều yêu cầu');b={count:0,until:now+windowMs};buckets.set(key,b);}if(++b.count>limit)throw Object.assign(fail(429,'Quá nhiều yêu cầu, thử lại sau'),{retryAfter:Math.ceil((b.until-now)/1000)});};}
function readBody(req,maxBytes=760000){return new Promise((resolve,reject)=>{let size=0,stopped=false;const chunks=[];req.on('data',b=>{if(stopped)return;size+=b.length;if(size>maxBytes){stopped=true;reject(fail(413,'Payload too large'));req.resume();return;}chunks.push(b);});req.on('end',()=>{if(stopped)return;try{const b=JSON.parse(Buffer.concat(chunks).toString('utf8')||'{}');if(!b||typeof b!=='object'||Array.isArray(b))throw Error();resolve(b);}catch{reject(fail(400,'Invalid JSON object'));}});req.on('error',reject);});}

async function createJsonApp({dataDir,frontendOrigin,secureCookies=true,allowRegister=true,bootstrapUsername,bootstrapPassword,workerToken,workerNow}) {
  const parsed=new URL(frontendOrigin);
  if(!['https:','http:'].includes(parsed.protocol)||parsed.origin!==frontendOrigin)throw Error('FRONTEND_ORIGIN must be an HTTP(S) origin without a trailing slash');
  if(secureCookies&&parsed.protocol!=='https:')throw Error('Secure cookies require an HTTPS FRONTEND_ORIGIN');
  if(!dataDir)throw Error('CLOUD_DATA_DIR is required');
  dataDir=path.resolve(dataDir);
  const store=createJsonStore(dataDir);
  fs.mkdirSync(path.join(dataDir,'bots'),{recursive:true});
  fs.mkdirSync(path.join(dataDir,'replays'),{recursive:true});
  const audit=(db,actorId,action,entityId,metadata={})=>db.audit.push({id:crypto.randomUUID(),actorId,action,entityId,metadata,createdAt:new Date().toISOString()});
  if(!store.read().users.some(u=>u.role==='ADMIN')&&(bootstrapUsername||bootstrapPassword)) {
    const name=username(bootstrapUsername),hash=await bcrypt.hash(password(bootstrapPassword),12);
    store.mutate(db=>{if(db.users.some(u=>u.username===name))throw Error('Bootstrap username already exists');const u={id:crypto.randomUUID(),username:name,passwordHash:hash,email:null,role:'ADMIN',isActive:true,createdAt:new Date().toISOString()};db.users.push(u);audit(db,u.id,'ADMIN_BOOTSTRAPPED',u.id);});
    console.log('[Bootstrap] Initial Admin created. Remove BOOTSTRAP_ADMIN_PASSWORD from Render environment.');
  }
  const interrupted=store.read().matches.filter(m=>['running','queued'].includes(m.status));
  if(interrupted.length)store.mutate(db=>{for(const m of db.matches)if(['running','queued'].includes(m.status))Object.assign(m,{status:'failed',reason:'server-restarted',finishedAt:new Date().toISOString()});});
  const dummyHash=await bcrypt.hash(crypto.randomBytes(32).toString('hex'),12);
  const loginLimit=limiter(10,600000),registerLimit=limiter(500,3600000),demoLimit=limiter(10,600000);
  const external=createExternalWorker({store,dataDir,token:workerToken,now:workerNow});
  const queue=[];let active=0,closing=false;
  const queueInfo=()=>({activeJobs:active,pendingJobs:queue.length,maxConcurrent:1});
  const cookie=(value,age)=>`ott_session=${value}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${age}${secureCookies?'; Secure':''}`;
  const send=(res,status,value)=>{res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'private, no-store','CDN-Cache-Control':'no-store','Vercel-CDN-Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});res.end(JSON.stringify(value));};
  function identify(req){const raw=(req.headers.cookie||'').split(';').map(s=>s.trim()).find(s=>s.startsWith('ott_session='))?.slice(12);if(!raw||!/^[a-f0-9]{64}$/.test(raw))return null;const db=store.read();const s=db.sessions.find(s=>s.tokenHash===sha(raw)&&!s.revokedAt&&Date.parse(s.expiresAt)>Date.now());const u=s&&db.users.find(u=>u.id===s.userId&&u.isActive);return u?{user:u,session:s}:null;}
  function requireUser(req){const identity=identify(req);if(!identity)throw fail(401,'Cần đăng nhập');return identity;}
  function ownedSubmission(user, id) {
    const submission = typeof id === 'string' && store.read().submissions.find(s => s.id === id && s.userId === user.id);
    if (!submission) throw fail(404, 'Submission not found');
    return submission;
  }
  function requireAdmin(req){const identity=requireUser(req);if(identity.user.role!=='ADMIN')throw fail(403,'Chỉ Admin được thực hiện');return identity;}
  function issue(db,userId){const token=crypto.randomBytes(32).toString('hex');db.sessions=db.sessions.filter(s=>!s.revokedAt&&Date.parse(s.expiresAt)>Date.now());const own=db.sessions.filter(s=>s.userId===userId).sort((a,b)=>b.createdAt.localeCompare(a.createdAt));const removed=new Set(own.slice(19).map(s=>s.id));db.sessions=db.sessions.filter(s=>!removed.has(s.id));db.sessions.push({id:crypto.randomUUID(),userId,tokenHash:sha(token),createdAt:new Date().toISOString(),expiresAt:new Date(Date.now()+7*86400000).toISOString(),revokedAt:null});return token;}
  function uniqueId(db,key,prefix){let id;do{id=prefix+crypto.randomBytes(4).toString('hex').toUpperCase();}while(db[key].some(x=>x.id===id));return id;}
  async function drain(){if(closing||active||!queue.length)return;active=1;const id=queue.shift();try{const rec=store.mutate(db=>{const m=db.matches.find(m=>m.id===id);m.status='running';return m;});const replay=await runMatch({seed:rec.seed,maxMoves:rec.maxMoves,pieces:rec.pieces,first:rec.first,bots:['greedy','random']});const bytes=Buffer.from(JSON.stringify(replay));const final=path.join(dataDir,'replays',id+'.json'),temp=final+'.tmp';fs.writeFileSync(temp,bytes,{mode:0o600});fs.renameSync(temp,final);store.mutate(db=>Object.assign(db.matches.find(m=>m.id===id),{status:'completed',winner:replay.winner,reason:replay.reason,turns:replay.turns,replayHash:sha(bytes),finishedAt:new Date().toISOString()}));}catch(error){console.error('[Demo]',error.message);try{store.mutate(db=>{const m=db.matches.find(m=>m.id===id);if(m)Object.assign(m,{status:'failed',reason:'demo-error',finishedAt:new Date().toISOString()});});}catch{console.error('[Storage] Could not persist demo failure');}}finally{active=0;if(!closing)setImmediate(()=>void drain());}}

  const server=http.createServer(async(req,res)=>{
    try {
      const url=new URL(req.url,'http://localhost'),p=url.pathname,method=req.method;
      if(!['GET','POST','PATCH','DELETE'].includes(method))throw fail(405,'Method not allowed');
      if(p.startsWith('/api/worker/'))return await external.handle(req,res,p,readBody,send);
      if(['POST','PATCH','DELETE'].includes(method)&&(req.headers.origin!==frontendOrigin||req.headers['x-ott-request']!=='1'))throw fail(403,'Origin hoặc header CSRF không hợp lệ');
      if(p==='/api/health'&&method==='GET')return send(res,200,{ok:true,persistence:'JSON file',mode:'online',...external.status()});
      if(p==='/api/deployment'&&method==='GET')return send(res,200,{mode:'online',registrationOpen:allowRegister,syncImplemented:false});
      if(p==='/api/auth/config'&&method==='GET')return send(res,200,{registrationOpen:allowRegister});
      if(p==='/api/auth/register'&&method==='POST'){
        if(!allowRegister)throw fail(403,'Đăng ký đang đóng');registerLimit(req.socket.remoteAddress||'proxy');const b=await readBody(req),name=username(b.username),mail=b.email===undefined?null:email(b.email),hash=await bcrypt.hash(password(b.password),12);
        const result=store.mutate(db=>{if(db.users.some(u=>u.username===name||(mail&&u.email===mail)))throw fail(409,'Username hoặc email đã được sử dụng');const u={id:crypto.randomUUID(),username:name,passwordHash:hash,email:mail,role:'STUDENT',isActive:true,createdAt:new Date().toISOString()};db.users.push(u);const token=issue(db,u.id);audit(db,u.id,'ACCOUNT_REGISTERED',u.id);return {user:publicUser(u),token};});res.setHeader('Set-Cookie',cookie(result.token,604800));return send(res,201,result.user);
      }
      if(p==='/api/auth/login'&&method==='POST'){
        const b=await readBody(req);loginLimit(String(b.username||'').trim().toLowerCase().slice(0,64));if(typeof b.username!=='string'||typeof b.password!=='string'||b.username.length>64||b.password.length>128)throw fail(401,'Username hoặc mật khẩu không đúng');const u=store.read().users.find(u=>u.username===b.username.trim().toLowerCase());const ok=await bcrypt.compare(b.password,u?.passwordHash||dummyHash);if(!ok||!u?.isActive)throw fail(401,'Username hoặc mật khẩu không đúng');const result=store.mutate(db=>{const current=db.users.find(x=>x.id===u.id);if(!current?.isActive)throw fail(401,'Username hoặc mật khẩu không đúng');const token=issue(db,u.id);audit(db,u.id,'ACCOUNT_LOGIN',u.id);return {user:publicUser(current),token};});res.setHeader('Set-Cookie',cookie(result.token,604800));return send(res,200,result.user);
      }
      if(p==='/api/auth/logout'&&method==='POST'){const identity=identify(req);if(identity)store.mutate(db=>{const s=db.sessions.find(s=>s.id===identity.session.id);if(s)s.revokedAt=new Date().toISOString();audit(db,identity.user.id,'ACCOUNT_LOGOUT',identity.user.id);});res.setHeader('Set-Cookie',cookie('',0));return send(res,200,{ok:true});}
      if(p==='/api/auth/me'&&method==='GET'){const {user}=requireUser(req),db=store.read();return send(res,200,{...publicUser(user),bots:db.submissions.filter(s=>s.userId===user.id),recentMatches:db.matches.filter(m=>m.createdById===user.id).slice(0,20)});}
      if(p==='/api/auth/sessions'&&method==='GET'){const identity=requireUser(req);return send(res,200,store.read().sessions.filter(s=>s.userId===identity.user.id&&!s.revokedAt&&Date.parse(s.expiresAt)>Date.now()).map(s=>({id:s.id,createdAt:s.createdAt,expiresAt:s.expiresAt,current:s.id===identity.session.id})));}
      const sm=p.match(/^\/api\/auth\/sessions\/([a-zA-Z0-9-]{1,64})$/);
      if(sm&&method==='DELETE'){const identity=requireUser(req);store.mutate(db=>{const s=db.sessions.find(s=>s.id===sm[1]&&s.userId===identity.user.id&&!s.revokedAt);if(!s)throw fail(404,'Không tìm thấy phiên');s.revokedAt=new Date().toISOString();audit(db,identity.user.id,'SESSION_REVOKED',identity.user.id,{sessionId:s.id});});if(sm[1]===identity.session.id)res.setHeader('Set-Cookie',cookie('',0));return send(res,200,{ok:true});}
      if(p==='/api/users/me'&&method==='PATCH'){const identity=requireUser(req),b=await readBody(req);if(Object.keys(b).length!==1||!Object.hasOwn(b,'email'))throw fail(400,'Chỉ được cập nhật email');const mail=email(b.email);return send(res,200,store.mutate(db=>{if(mail&&db.users.some(u=>u.id!==identity.user.id&&u.email===mail))throw fail(409,'Email đã được sử dụng');const u=db.users.find(u=>u.id===identity.user.id);u.email=mail;audit(db,u.id,'PROFILE_UPDATED',u.id);return publicUser(u);}));}
      if(p==='/api/admin/users'&&method==='GET'){requireAdmin(req);const page=Number(url.searchParams.get('page')||1),q=(url.searchParams.get('q')||'').toLowerCase().slice(0,32);if(!Number.isSafeInteger(page)||page<1||page>100000)throw fail(400,'Trang không hợp lệ');const users=store.read().users.filter(u=>u.username.includes(q)).reverse();return send(res,200,{users:users.slice((page-1)*50,page*50).map(publicUser),total:users.length,page,pageSize:50});}
      const um=p.match(/^\/api\/admin\/users\/([a-zA-Z0-9-]{1,64})\/(role|status)$/);
      if(um&&method==='PATCH'){const identity=requireAdmin(req),b=await readBody(req),field=um[2]==='role'?'role':'isActive';if(Object.keys(b).length!==1||!Object.hasOwn(b,field)||(field==='role'?!roles.includes(b.role):typeof b.isActive!=='boolean'))throw fail(400,'Cập nhật không hợp lệ');const result=store.mutate(db=>{const actor=db.users.find(u=>u.id===identity.user.id);if(!actor?.isActive||actor.role!=='ADMIN')throw fail(403,'Chỉ Admin được thực hiện');const u=db.users.find(u=>u.id===um[1]);if(!u)throw fail(404,'Không tìm thấy tài khoản');if(u[field]===b[field])return publicUser(u);if(u.id===actor.id)throw fail(409,'Không được tự hạ quyền hoặc khóa tài khoản');if(u.role==='ADMIN'&&u.isActive&&(field==='role'&&b.role!=='ADMIN'||field==='isActive'&&!b.isActive)&&db.users.filter(u=>u.role==='ADMIN'&&u.isActive).length<=1)throw fail(409,'Phải giữ một Admin hoạt động');const before=u[field];u[field]=b[field];for(const s of db.sessions)if(s.userId===u.id&&!s.revokedAt)s.revokedAt=new Date().toISOString();audit(db,actor.id,field==='role'?'USER_ROLE_CHANGED':'USER_STATUS_CHANGED',u.id,{before,after:b[field]});return publicUser(u);});return send(res,200,result);}
      if(p.startsWith('/api/admin/tournaments/')){requireAdmin(req);throw fail(501,'Quản lý giải/TournamentStaff chưa được triển khai trong backend JSON này');}
      if(p==='/api/judge/status'&&method==='GET')return send(res,200,{images:{},...external.status()});
      if(p==='/api/game'&&method==='GET')return send(res,200,{id:'ott-rps',version:'1.0.0',rows:8,columns:8,pieceTypes:['rock','paper','scissors'],capture:{rock:'scissors',scissors:'paper',paper:'rock'},maxMoves:200,goals:{p1:'h8',p2:'a1'}});
      if(p==='/api/overview'&&method==='GET'){const db=store.read();return send(res,200,{registeredUsers:db.users.length,submissions:db.submissions.length,matches:db.matches.length,registeredBotProfiles:0,latest:db.matches.slice(0,5),...queueInfo()});}
      if(p==='/api/settings'&&method==='GET')return send(res,200,store.read().settings);
      if(p==='/api/leaderboard'&&method==='GET')return send(res,200,[]);
      if(p==='/api/submissions'&&method==='GET'){
        const {user}=requireUser(req);
        return send(res,200,store.read().submissions.filter(s=>s.userId===user.id));
      }
      const submissionDetail=p.match(/^\/api\/submissions\/([^/]+)$/);
      if(submissionDetail&&method==='GET'){
        const {user}=requireUser(req);
        return send(res,200,ownedSubmission(user,submissionDetail[1]));
      }
      if(submissionDetail&&(method==='PATCH'||method==='PUT')){
        const {user}=requireUser(req),b=await readBody(req);
        const sub=ownedSubmission(user,submissionDetail[1]);
        const newName=String(b.botName||b.name||'').trim().slice(0,50);
        if(!newName)throw fail(400,'Tên bot không được để trống');
        const updated=store.mutate(db=>{
          const s=db.submissions.find(x=>x.id===sub.id);
          if(s) s.botName=newName;
          audit(db,user.id,'BOT_RENAMED',sub.id);
          return s;
        });
        return send(res,200,updated);
      }
      if(submissionDetail&&method==='DELETE'){
        const {user}=requireUser(req);
        const sub=ownedSubmission(user,submissionDetail[1]);
        store.mutate(db=>{
          const i=db.submissions.findIndex(x=>x.id===sub.id);
          if(i!==-1) db.submissions.splice(i,1);
          audit(db,user.id,'BOT_DELETED',sub.id);
        });
        try{ fs.rmSync(path.join(dataDir,'bots',sub.id),{recursive:true,force:true}); }catch(e){}
        return send(res,200,{success:true,id:sub.id});
      }
      if(p==='/api/submissions'&&method==='POST'){
        const {user}=requireUser(req),b=await readBody(req),name=b.name,lang=b.lang,source=b.content,botName=String(b.botName||b.name||'').trim().slice(0,50);
        if(typeof name!=='string'||!/^[A-Za-z][A-Za-z0-9_]{0,60}\.(py|java|c)$/.test(name)||({py:'Python',java:'Java',c:'C'})[name.split('.').pop()]!==lang)throw fail(400,'Tên file hoặc ngôn ngữ không hợp lệ');
        if(typeof source!=='string'||!source.length||Buffer.byteLength(source)>500000)throw fail(400,'Source must be 1-500 KB');const snapshot=store.read();if(!snapshot.settings.submissionsOpen)throw fail(403,'Submissions are closed');if(snapshot.submissions.filter(s=>s.userId===user.id).length>=50)throw fail(429,'Tối đa 50 bài nộp/tài khoản cho bản thử nghiệm');const id=uniqueId(snapshot,'submissions','SUB-'),dir=path.join(dataDir,'bots',id);fs.mkdirSync(dir,{mode:0o700});try{fs.writeFileSync(path.join(dir,name),source,{flag:'wx',mode:0o600});const record=store.mutate(db=>{const s={id,userId:user.id,ownedBy:user.username,name,botName:botName||name,lang,version:String(b.version||'v1.0').slice(0,24),sha256:sha(source),status:'Stored — awaiting external worker',date:new Date().toISOString()};db.submissions.unshift(s);audit(db,user.id,'BOT_UPLOADED',id);return s;});return send(res,201,record);}catch(error){fs.rmSync(dir,{recursive:true,force:true});throw error;}
      }
      if(p==='/api/matches'&&method==='GET')return send(res,200,store.read().matches.slice(0,150));
      const mm=p.match(/^\/api\/matches\/(M-[A-F0-9]{8})(?:\/(replay))?$/);
      if(mm&&method==='GET'){const rec=store.read().matches.find(m=>m.id===mm[1]);if(!rec)throw fail(404,'Match not found');if(!mm[2])return send(res,200,rec);if(rec.status!=='completed')throw fail(409,'Replay chưa sẵn sàng');let bytes;try{bytes=fs.readFileSync(path.join(dataDir,'replays',rec.id+'.json'));}catch{throw fail(404,'Replay missing');}if(sha(bytes)!==rec.replayHash)throw fail(409,'Replay integrity mismatch');return send(res,200,JSON.parse(bytes));}
      if(p==='/api/matches'&&method==='POST'){const {user}=requireUser(req),b=await readBody(req);if(Object.hasOwn(b,'submissionA')||Object.hasOwn(b,'submissionB')){
        ownedSubmission(user,b.submissionA);
        if(Object.hasOwn(b,'submissionB'))throw fail(403,'Gửi submissionA của bạn; hệ thống tự ghép đối thủ.');
        if(!external.status().challengeReady)throw fail(503,'Worker chưa sẵn sàng.');
        if(closing)throw fail(503,'Server stopping');
        demoLimit(user.id);
        const db=store.read(),waiting=db.matches.filter(m=>m.mode==='submitted'&&['queued','running'].includes(m.status));
        if(waiting.length>=20||waiting.filter(m=>m.createdById===user.id).length>=2)throw fail(429,'Hàng đợi đang đầy, hãy chờ trận hiện tại.');
        const maxMoves=Number(b.maxMoves??200);
        if(!Number.isInteger(maxMoves)||maxMoves<1||maxMoves>200)throw fail(400,'Bản thử nghiệm hỗ trợ 1–200 lượt/trận.');
        const opponents=db.submissions.filter(s=>s.userId!==user.id&&db.users.some(u=>u.id===s.userId&&u.isActive));
        if(!opponents.length)throw fail(409,'Cần bot của một tài khoản khác để ghép trận.');
        const opponent=opponents[crypto.randomInt(opponents.length)],mine=ownedSubmission(user,b.submissionA);
        const swap=crypto.randomInt(2),left=swap?opponent:mine,right=swap?mine:opponent;
        const rec=store.mutate(db=>{const m={id:uniqueId(db,'matches','M-'),createdById:user.id,ownedBy:user.username,status:'queued',mode:'submitted',submissionA:left.id,submissionB:right.id,a:left.name,b:right.name,seed:crypto.randomBytes(4).readUInt32LE(0),maxMoves,pieces:6,first:'Random',turns:0,winner:null,reason:null,createdAt:new Date().toISOString()};db.matches.unshift(m);audit(db,user.id,'CHALLENGE_CREATED',m.id);return m;});
        return send(res,202,rec);
      }const maxMoves=Number(b.maxMoves??200),pieces=Number(b.pieces??6),first=b.first||'Random';if(!Number.isInteger(maxMoves)||maxMoves<1||maxMoves>1000||!Number.isInteger(pieces)||pieces<1||pieces>28||!['Random','Player A','Player B'].includes(first))throw fail(400,'Invalid match configuration');demoLimit(user.id);if(closing||queue.length+active>=20)throw fail(429,'Demo queue is full');const rec=store.mutate(db=>{const m={id:uniqueId(db,'matches','M-'),createdById:user.id,ownedBy:user.username,status:'queued',mode:'demo',a:'Greedy Bot',b:'Random Bot',seed:crypto.randomBytes(4).readUInt32LE(0),maxMoves,pieces,first,turns:0,winner:null,reason:null,createdAt:new Date().toISOString()};db.matches.unshift(m);return m;});queue.push(rec.id);setImmediate(()=>void drain());return send(res,202,rec);}
      throw fail(404,'API route not found');
    } catch(error) {
      if(!error.status)console.error('[API]',error.code||error.name);
      if(error.status===429)res.setHeader('Retry-After',String(error.retryAfter||600));
      const status=error.status||(['ENOSPC','EDQUOT'].includes(error.code)?507:500);
      if(!res.headersSent)send(res,status,{error:error.status?error.message:status===507?'Storage is full':'Internal server error'});
    }
  });
  return {server,store,stop:()=>{closing=true;external.stop();}};
}

async function main(){
  const production=process.env.NODE_ENV==='production';
  if(production&&process.env.DATABASE_URL)throw Error('DATABASE_URL is set: use node server/index-render-pg.js; refusing JSON storage in this configuration');
  const dataDir=process.env.CLOUD_DATA_DIR||(production?null:path.resolve(__dirname,'../data-json'));
  const frontendOrigin=process.env.FRONTEND_ORIGIN||(production?null:'http://127.0.0.1:3000');
  const port=Number(process.env.PORT||3000);
  if(!Number.isInteger(port)||port<1||port>65535)throw Error('Invalid PORT');
  if(!frontendOrigin)throw Error('Set FRONTEND_ORIGIN to the exact Vercel production URL');
  const app=await createJsonApp({dataDir,frontendOrigin,secureCookies:production,allowRegister:process.env.ALLOW_SELF_REGISTER!=='false',bootstrapUsername:process.env.BOOTSTRAP_ADMIN_USERNAME,bootstrapPassword:process.env.BOOTSTRAP_ADMIN_PASSWORD,workerToken:process.env.WORKER_TOKEN});
  app.server.listen(port,'0.0.0.0',()=>console.log(`OTT JSON API listening on PORT=${port}; one process/instance only`));
  let stopping=false;
  for(const signal of ['SIGINT','SIGTERM'])process.on(signal,()=>{if(stopping)return;stopping=true;app.stop();app.server.close(()=>process.exit(0));setTimeout(()=>process.exit(0),10000).unref();});
}
if(require.main===module)main().catch(error=>{console.error(error.message);process.exitCode=1;});
module.exports={createJsonApp};
