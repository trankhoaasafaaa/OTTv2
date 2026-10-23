'use strict';
// Online API: PostgreSQL owns accounts, source, jobs and replays. No local data fallback.
const http=require('node:http');
const crypto=require('node:crypto');
const {createClient}=require('./online-pg/client');
const {createWorker}=require('./online-pg/worker');
const {createAuthRoutes}=require('./auth/routes');
const {publicUser}=require('./auth/service');
const {runMatch}=require('./engine');
const {fail,sha,canonical,sourcePayload,replayPayload,includeMatch,submission,match,limiter,queueLock,userLock,audit,readBody}=require('./online-pg/common');
const {createTournamentRoutes}=require('./tournaments/tournament-routes');
const eloService=require('./elo-service');

async function createRenderPgApp({prisma,frontendOrigin,secureCookies=true,allowRegister=true,workerToken,workerNow}={}){
  let origin;try{origin=new URL(frontendOrigin);}catch{throw Error('FRONTEND_ORIGIN is required');}
  if(!['http:','https:'].includes(origin.protocol)||origin.origin!==frontendOrigin||secureCookies&&origin.protocol!=='https:')throw Error('FRONTEND_ORIGIN must be an exact origin; production requires HTTPS');
  if(workerToken&&!/^[a-f0-9]{64}$/.test(workerToken))throw Error('Invalid WORKER_TOKEN format');
  const db=prisma||createClient(process.env.DATABASE_URL);
  try{await db.$connect();await Promise.all([db.user.count(),db.session.count(),db.submissionSource.count(),db.matchReplay.count(),db.workerLease.count(),db.jsonImportReceipt.count()]);}catch(e){if(!prisma)await db.$disconnect();throw e;}
  const send=(res,status,value)=>{res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'private, no-store','CDN-Cache-Control':'no-store','Vercel-CDN-Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});res.end(JSON.stringify(value));};
  const accounts=createAuthRoutes(db,{json:send,parseBody:readBody,allowRegister,secure:secureCookies,registerLimit:500,loginIpLimit:5000});
  const tournamentRoutes=createTournamentRoutes({
    authenticateUser:async req=>{try{const who=await accounts.auth.authenticate(req);return who?who.user:null;}catch{return null;}},
    parseBody:readBody,
    json:send,
    fail
  });
  const worker=createWorker({prisma:db,token:workerToken,now:workerNow});
  const matchLimit=limiter(10,600000);
  let closing=false,demoActive=false;
  async function identity(req){const who=await accounts.auth.authenticate(req);if(!who)throw fail(401,'Cần đăng nhập');return who;}
  async function owned(user,id,client=db){if(typeof id!=='string')throw fail(404,'Submission not found');const s=await client.submission.findFirst({where:{id,userId:user.id},include:{user:{select:{username:true}}}});if(!s)throw fail(404,'Submission not found');return s;}
  async function settings(client=db){const row=await client.appSetting.findUnique({where:{key:'submissionsOpen'}});return {submissionsOpen:row?.value===undefined?true:row.value===true};}
  async function makeMatch(tx,user,{kind,left,right,maxMoves,pieces=6,first='Random'}){
    const id='M-'+crypto.randomBytes(4).toString('hex').toUpperCase();
    const m=await tx.match.create({data:{id,kind,status:'QUEUED',createdById:user.id,submissionAId:left?.id||null,submissionBId:right?.id||null,gameId:'ott-rps',rulesetVersion:'1.0.0',seed:String(crypto.randomBytes(4).readUInt32LE(0)),maxMoves,pieces,firstPlayerSetting:first,legacyMetadata:{a:left?.filename||'Greedy Bot',b:right?.filename||'Random Bot'}},include:includeMatch});
    await tx.matchHistory.create({data:{matchId:id,sequence:1,toStatus:'QUEUED'}});
    await audit(tx,user.id,kind==='PRACTICE'?'CHALLENGE_CREATED':'DEMO_CREATED',id);
    return match(m);
  }
  async function drainDemo(){
    if(closing||demoActive)return;demoActive=true;
    try{
      const m=await db.$transaction(async tx=>{await queueLock(tx);const row=await tx.match.findFirst({where:{kind:'DEMO',status:'QUEUED'},orderBy:[{createdAt:'asc'},{id:'asc'}]});if(!row)return null;await tx.match.update({where:{id:row.id},data:{status:'RUNNING',startedAt:new Date()}});return row;});
      if(!m)return;
      try{
        const replay=await runMatch({seed:Number(m.seed),maxMoves:m.maxMoves,pieces:m.pieces,first:m.firstPlayerSetting,bots:['greedy','random']}),stored=replayPayload(replay);
        await db.$transaction(async tx=>{await tx.matchReplay.create({data:{matchId:m.id,...stored}});await tx.match.update({where:{id:m.id},data:{status:'COMPLETED',winner:replay.winner==='p1'?'PLAYER_A':replay.winner==='p2'?'PLAYER_B':'DRAW',reason:replay.reason,turnCount:replay.turns,replayHash:stored.sha256,replayPath:'postgres:'+m.id,finishedAt:new Date()}});});
      }catch{await db.match.updateMany({where:{id:m.id,status:'RUNNING'},data:{status:'FAILED',reason:'demo-error',finishedAt:new Date()}});}
      if(!closing)setImmediate(()=>void drainDemo());
    }catch{console.error('[Demo] Database operation failed');}finally{demoActive=false;}
  }
  // Only local built-in demo work is interrupted by process restart. Worker leases survive in DB.
  await db.match.updateMany({where:{kind:'DEMO',status:'RUNNING'},data:{status:'FAILED',reason:'server-restarted',finishedAt:new Date()}});
  const server=http.createServer(async(req,res)=>{
    try{
      const url=new URL(req.url,'http://localhost'),p=url.pathname,method=req.method;
      if(closing)throw fail(503,'Server stopping');
      if(!['GET','POST','PATCH','DELETE'].includes(method))throw fail(405,'Method not allowed');
      if(p.startsWith('/api/worker/'))return await worker.handle(req,res,p,readBody,send);
      if(['POST','PATCH','DELETE'].includes(method)&&(req.headers.origin!==frontendOrigin||req.headers['x-ott-request']!=='1'))throw fail(403,'Origin hoặc header CSRF không hợp lệ');
      if(await accounts.route(req,res,url))return;
      if(await tournamentRoutes.handle(req,res,url))return;
      if(p==='/api/health'&&method==='GET'){await db.$queryRaw`SELECT 1`;return send(res,200,{ok:true,persistence:'PostgreSQL',mode:'online',...await worker.status()});}
      if(p==='/api/deployment'&&method==='GET')return send(res,200,{mode:'online',registrationOpen:allowRegister,syncImplemented:false});
      if(p==='/api/judge/status'&&method==='GET')return send(res,200,{images:{},...await worker.status()});
      if(p==='/api/auth/me'&&method==='GET'){
        const {user}=await identity(req);const [bots,matches]=await Promise.all([db.submission.findMany({where:{userId:user.id},orderBy:[{createdAt:'desc'},{id:'desc'}],include:{user:{select:{username:true}}}}),db.match.findMany({where:{createdById:user.id},orderBy:[{createdAt:'desc'},{id:'desc'}],take:20,include:includeMatch})]);
        return send(res,200,{...publicUser(user),bots:bots.map(submission),recentMatches:matches.map(match)});
      }
      if(p==='/api/settings'&&method==='GET')return send(res,200,await settings());
      if(p==='/api/leaderboard'&&method==='GET'){
        let extra=[];try{extra=await db.submission.findMany({where:{status:{not:'REJECTED'}},include:{user:{select:{username:true}}}});}catch(_){}
        return send(res,200,eloService.getLeaderboard(extra));
      }
      if(p==='/api/game'&&method==='GET')return send(res,200,{id:'ott-rps',version:'1.0.0',rows:8,columns:8,pieceTypes:['rock','paper','scissors'],capture:{rock:'scissors',scissors:'paper',paper:'rock'},maxMoves:200,goals:{p1:'h8',p2:'a1'}});
      if(p==='/api/overview'&&method==='GET'){
        const [users,submissions,matches,latest,info]=await Promise.all([db.user.count(),db.submission.count(),db.match.count(),db.match.findMany({take:5,orderBy:[{createdAt:'desc'},{id:'desc'}],include:includeMatch}),worker.status()]);
        return send(res,200,{registeredUsers:users,submissions,matches,registeredBotProfiles:0,latest:latest.map(match),...info});
      }
      if(p==='/api/submissions'&&method==='GET'){const {user}=await identity(req);const rows=await db.submission.findMany({where:{userId:user.id},orderBy:[{createdAt:'desc'},{id:'desc'}],include:{user:{select:{username:true}}}});return send(res,200,rows.map(submission));}
      const sm=p.match(/^\/api\/submissions\/(SUB-[A-F0-9]{8})(?:\/(source))?$/);
      if(sm&&method==='GET'){
        const {user}=await identity(req),s=await owned(user,sm[1]);if(!sm[2])return send(res,200,submission(s));
        const source=await db.submissionSource.findUnique({where:{submissionId:s.id}});if(!source)throw fail(404,'Source missing');if(sha(source.content)!==s.sha256)throw fail(409,'Source integrity mismatch');return send(res,200,{id:s.id,name:s.filename,content:source.content});
      }
      if(p==='/api/submissions'&&method==='POST'){
        const {user}=await identity(req),b=await readBody(req),name=b.name,lang=b.lang;
        if(typeof name!=='string'||!/^[A-Za-z][A-Za-z0-9_]{0,60}\.(py|java|c)$/.test(name)||({py:'Python',java:'Java',c:'C'})[name.split('.').pop()]!==lang)throw fail(400,'Tên file hoặc ngôn ngữ không hợp lệ');
        const source=sourcePayload(b.content);
        const s=await db.$transaction(async tx=>{await userLock(tx,user.id);const current=await tx.user.findUnique({where:{id:user.id}});if(!current?.isActive)throw fail(401,'Cần đăng nhập');if(!(await settings(tx)).submissionsOpen)throw fail(403,'Submissions are closed');if(await tx.submission.count({where:{userId:user.id}})>=50)throw fail(429,'Tối đa 50 bài nộp/tài khoản');const id='SUB-'+crypto.randomBytes(4).toString('hex').toUpperCase();const row=await tx.submission.create({data:{id,userId:user.id,filename:name,language:lang,version:String(b.version||'v1.0').slice(0,24),sourcePath:'postgres:'+id,sha256:sha(source.content),status:'STORED',source:{create:source}},include:{user:{select:{username:true}}}});await audit(tx,user.id,'BOT_UPLOADED',id,'Submission');return row;});
        try{eloService.registerBot({id:s.id,name:s.filename,owner:user.username,lang:s.language});}catch(_){}
        return send(res,201,submission(s));
      }
      if(p==='/api/matches'&&method==='GET'){const rows=await db.match.findMany({orderBy:[{createdAt:'desc'},{id:'desc'}],take:150,include:includeMatch});return send(res,200,rows.map(match));}
      const mm=p.match(/^\/api\/matches\/(M-[A-F0-9]{8})(?:\/(replay))?$/);
      if(mm&&method==='GET'){
        const m=await db.match.findUnique({where:{id:mm[1]},include:includeMatch});if(!m)throw fail(404,'Match not found');if(!mm[2])return send(res,200,match(m));if(m.status!=='COMPLETED')throw fail(409,'Replay chưa sẵn sàng');const row=await db.matchReplay.findUnique({where:{matchId:m.id}});if(!row)throw fail(404,'Replay missing');if(sha(canonical(row.payload))!==row.sha256||row.sha256!==m.replayHash)throw fail(409,'Replay integrity mismatch');return send(res,200,row.payload);
      }
      if(p==='/api/matches'&&method==='POST'){
        const {user}=await identity(req),b=await readBody(req);matchLimit(user.id);
        if(Object.hasOwn(b,'submissionA')||Object.hasOwn(b,'submissionB')){
          await owned(user,b.submissionA);if(Object.hasOwn(b,'submissionB'))throw fail(403,'Gửi submissionA của bạn; hệ thống tự ghép đối thủ.');
          if(!(await worker.status()).challengeReady)throw fail(503,'Worker chưa sẵn sàng.');
          const maxMoves=Number(b.maxMoves??200);if(!Number.isInteger(maxMoves)||maxMoves<1||maxMoves>200)throw fail(400,'Bản thử nghiệm hỗ trợ 1–200 lượt/trận.');
          const m=await db.$transaction(async tx=>{await queueLock(tx);await userLock(tx,user.id);const current=await tx.user.findUnique({where:{id:user.id}});if(!current?.isActive)throw fail(401,'Cần đăng nhập');const mine=await owned(user,b.submissionA,tx);const waiting={kind:'PRACTICE',status:{in:['QUEUED','RUNNING']}};if(await tx.match.count({where:waiting})>=20||await tx.match.count({where:{...waiting,createdById:user.id}})>=2)throw fail(429,'Hàng đợi đang đầy');const where={userId:{not:user.id},user:{isActive:true},source:{isNot:null},status:{not:'REJECTED'}};const count=await tx.submission.count({where});if(!count)throw fail(409,'Cần bot của một tài khoản khác để ghép trận.');const opponent=await tx.submission.findFirst({where,skip:crypto.randomInt(count),orderBy:{id:'asc'}});if(!opponent)throw fail(409,'Đối thủ không còn khả dụng');const pair=crypto.randomInt(2)?[mine,opponent]:[opponent,mine];return makeMatch(tx,user,{kind:'PRACTICE',left:pair[0],right:pair[1],maxMoves});});
          return send(res,202,m);
        }
        const maxMoves=Number(b.maxMoves??200),pieces=Number(b.pieces??6),first=b.first||'Random';if(!Number.isInteger(maxMoves)||maxMoves<1||maxMoves>1000||!Number.isInteger(pieces)||pieces<1||pieces>28||!['Random','Player A','Player B'].includes(first))throw fail(400,'Invalid match configuration');
        const m=await db.$transaction(async tx=>{await queueLock(tx);if(await tx.match.count({where:{kind:'DEMO',status:{in:['QUEUED','RUNNING']}}})>=20)throw fail(429,'Demo queue is full');return makeMatch(tx,user,{kind:'DEMO',maxMoves,pieces,first});});setImmediate(()=>void drainDemo());return send(res,202,m);
      }
      throw fail(404,'API route not found');
    }catch(e){
      const unavailable=['P1000','P1001','P1002','P1008','P1011','P1017','P2021','P2022','P2024','P2028','P2034'].includes(e.code);
      const status=e.status|| (e.code==='P2002'?409:unavailable?503:500);
      if(!e.status)console.error('[API]',/^P\d{4}$/.test(e.code||'')?e.code:'operation-failed');
      if(status===429)res.setHeader('Retry-After','600');
      if(!res.headersSent)send(res,status,{error:e.status?e.message:status===409?'Conflicting data':status===503?'Database temporarily unavailable':'Internal server error'});
    }
  });
  server.requestTimeout=30000;
  setImmediate(()=>void drainDemo());
  return {server,prisma:db,stop(){closing=true;worker.stop();},async close(){closing=true;worker.stop();await db.$disconnect();}};
}
async function main(){
  const production=process.env.NODE_ENV==='production';
  const port=Number(process.env.PORT||3000);if(!Number.isInteger(port)||port<1||port>65535)throw Error('Invalid PORT');
  const app=await createRenderPgApp({frontendOrigin:process.env.FRONTEND_ORIGIN||(production?undefined:'http://127.0.0.1:3000'),secureCookies:production,allowRegister:process.env.ALLOW_SELF_REGISTER!=='false',workerToken:process.env.WORKER_TOKEN});
  app.server.listen(port,'0.0.0.0',()=>console.log('OTT online PostgreSQL API listening; external worker enabled'));
  let stopping=false;for(const signal of ['SIGTERM','SIGINT'])process.on(signal,()=>{if(stopping)return;stopping=true;app.stop();app.server.close(()=>void app.close().then(()=>process.exit(0)));setTimeout(()=>process.exit(0),10000).unref();});
}
if(require.main===module)main().catch(e=>{console.error('[Startup]',/^P\d{4}$/.test(e.code||'')?e.code:'Check DATABASE_URL, FRONTEND_ORIGIN, WORKER_TOKEN and deployed migrations');process.exitCode=1;});
module.exports={createRenderPgApp};
