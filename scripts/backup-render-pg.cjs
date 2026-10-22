'use strict';
// Full logical backup, including source/replay and Prisma migration history.
// Docker receives connection credentials via environment, never command arguments.
const fs=require('node:fs'),path=require('node:path');
const {spawnSync}=require('node:child_process');
const {createClient,connectionUrl}=require('../server/online-pg/client');
async function main(){
  const directory=path.resolve(process.argv[2]||'backups');if(directory.includes(','))throw Error('Backup path may not contain commas');
  const url=new URL(connectionUrl(process.env.DATABASE_URL));
  const db=createClient(url.toString());let major;
  try{const rows=await db.$queryRaw`SELECT current_setting('server_version_num') AS version`;major=Math.floor(Number(rows[0].version)/10000);}finally{await db.$disconnect();}
  if(!Number.isInteger(major)||major<13||major>18)throw Error('Unsupported PostgreSQL backup image');
  fs.mkdirSync(directory,{recursive:true,mode:0o700});
  const ca='/etc/ssl/certs/ca-certificates.crt';if(!fs.existsSync(ca))throw Error('Install ca-certificates on WSL before backup');
  const filename='ottv2-'+new Date().toISOString().replace(/[:.]/g,'-')+'.dump';
  const target=path.join(directory,filename);if(fs.existsSync(target))throw Error('Backup already exists');
  const env={...process.env,PGHOST:url.hostname,PGPORT:url.port||'5432',PGUSER:decodeURIComponent(url.username),PGPASSWORD:decodeURIComponent(url.password),PGDATABASE:decodeURIComponent(url.pathname.slice(1)),PGSSLMODE:'verify-full',PGSSLROOTCERT:'/tmp/ott-ca.crt',PGCONNECT_TIMEOUT:'15'};
  const args=['run','--rm','--user',String(process.getuid())+':'+String(process.getgid()),'--mount',`type=bind,source=${directory},target=/backup`,'--mount',`type=bind,source=${ca},target=/tmp/ott-ca.crt,readonly`];
  for(const key of ['PGHOST','PGPORT','PGUSER','PGPASSWORD','PGDATABASE','PGSSLMODE','PGSSLROOTCERT','PGCONNECT_TIMEOUT'])args.push('--env',key);
  args.push('postgres:'+major+'-bookworm','pg_dump','--format=custom','--no-owner','--no-acl','--file','/backup/'+filename);
  const result=spawnSync('docker',args,{env,stdio:['ignore','pipe','pipe'],encoding:'utf8',timeout:300000,maxBuffer:1024*1024});
  if(result.status!==0){if(fs.existsSync(target))fs.renameSync(target,target+'.incomplete');throw Error('Backup failed: check Docker, public database access, certificate bundle and disk space. Partial output is marked incomplete.');}
  if(!fs.existsSync(target)||fs.statSync(target).size===0)throw Error('Backup output missing');fs.chmodSync(target,0o600);
  console.log('Backup created:',target,'('+fs.statSync(target).size+' bytes). Keep private; test restore into a separate database.');
}
if(require.main===module)main().catch(e=>{console.error('[Backup]',(e.code||(/^Prisma/.test(e.name||'')?'Database operation failed':e.message)).replace(/postgres(?:ql)?:\/\/[^\s]+/g,'[DATABASE_URL]'));process.exitCode=1;});
