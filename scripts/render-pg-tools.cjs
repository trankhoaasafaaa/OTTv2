'use strict';
const {spawnSync}=require('node:child_process');
const path=require('node:path');
const fs=require('node:fs');
const {createClient,connectionUrl}=require('../server/online-pg/client');
const {validateUsername,validatePassword}=require('../server/auth/service');
const {audit}=require('../server/online-pg/common');
async function bootstrap(prisma,username,password){
  const name=validateUsername(username);
  return prisma.$transaction(async tx=>{
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(740017)`;
    const old=await tx.user.findUnique({where:{username:name}});
    if(old){if(old.role!=='ADMIN'||!old.isActive)throw Error('Username exists and is not an active Admin; nothing changed');return {created:false,username:name};}
    const hash=await require('bcryptjs').hash(validatePassword(password),12);
    const user=await tx.user.create({data:{username:name,passwordHash:hash,role:'ADMIN'}});
    await audit(tx,user.id,'ADMIN_BOOTSTRAPPED',user.id,'User');return {created:true,username:name};
  },{maxWait:10000,timeout:20000});
}
async function check(prisma){
  const ssl=await prisma.$queryRaw`SELECT ssl FROM pg_stat_ssl WHERE pid=pg_backend_pid()`;
  if(process.env.NODE_ENV==='production'&&ssl[0]?.ssl!==true)throw Error('Database connection is not using TLS');
  const counts={};for(const model of ['user','session','submission','submissionSource','match','matchReplay','workerLease','auditLog','jsonImportReceipt','tournament','tournamentEntry','tournamentRound','tournamentGame','tournamentGameReplay','tournamentStanding','tournamentLog','practiceRating','durableRatingReceipt'])counts[model]=await prisma[model].count();
  const missingSources=await prisma.submission.count({where:{source:{is:null}}});
  const missingReplays=await prisma.match.count({where:{status:'COMPLETED',replay:{is:null}}});
  return {tls:ssl[0]?.ssl===true,counts,missingSources,missingReplays};
}
function redact(text,url){return String(text||'').replaceAll(url,'[DATABASE_URL]').replace(/postgres(?:ql)?:\/\/[^\s"']+/g,'[DATABASE_URL]');}
async function main(){
  const command=process.argv[2],url=connectionUrl(process.env.DATABASE_URL);
  if(['deploy','status'].includes(command)){
    const result=spawnSync(process.execPath,[path.resolve(__dirname,'../node_modules/prisma/build/index.js'),'migrate',command,'--schema',path.resolve(__dirname,'../prisma/schema.prisma')],{env:{...process.env,DATABASE_URL:url},encoding:'utf8',maxBuffer:16*1024*1024,timeout:180000});
    process.stdout.write(redact(result.stdout,url));process.stderr.write(redact(result.stderr,url));process.exitCode=result.status??1;return;
  }
  const db=createClient(url);
  try{
    if(command==='check'){const result=await check(db);console.log(JSON.stringify(result,null,2));if(result.missingSources||result.missingReplays)process.exitCode=1;}
    else if(command==='bootstrap')console.log(JSON.stringify(await bootstrap(db,process.env.OTT_ADMIN_USERNAME,process.env.OTT_ADMIN_PASSWORD)));
    else throw Error('Use deploy, status, check or bootstrap');
  }finally{await db.$disconnect();}
}
if(require.main===module)main().catch(e=>{console.error('[DB tool]',e.code||'operation-failed','Check configuration, migrations, existing account conflicts and input; credentials not logged.');process.exitCode=1;});
module.exports={bootstrap,check,redact};
