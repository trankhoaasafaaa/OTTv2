'use strict';
const {createClient}=require('../server/online-pg/client');
const {loadSnapshot,importSnapshot}=require('../server/online-pg/import-json');
async function main(){
  const args=process.argv.slice(2),dir=args.find(x=>!x.startsWith('--'));
  if(!dir||args.some(x=>x.startsWith('--')&&!['--write','--dry-run','--check-files'].includes(x)))throw Error('Use SNAPSHOT_DIRECTORY [--check-files|--dry-run|--write]');
  const snapshot=loadSnapshot(dir);console.log('Snapshot validated:',JSON.stringify(snapshot.summary));
  if(args.includes('--check-files'))return;
  const db=createClient(process.env.DATABASE_URL);
  try{console.log(JSON.stringify(await importSnapshot(db,snapshot,{write:args.includes('--write')}),null,2));}finally{await db.$disconnect();}
}
if(require.main===module)main().catch(e=>{console.error('[Import]',e.code||(/^Prisma/.test(e.name||'')?'Database operation failed':String(e.message)).replace(/postgres(?:ql)?:\/\/[^\s]+/g,'[DATABASE_URL]'));process.exitCode=1;});
