'use strict';
// Read-only export using the existing public APIs; never deploy an export endpoint first.
const fs=require('node:fs/promises'),path=require('node:path');
async function main(){
 const [base,directory]=process.argv.slice(2);const url=new URL(base);
 if(!['https:','http:'].includes(url.protocol)||url.username||url.password)throw Error('Use an HTTP(S) API origin without credentials');
 if(!directory)throw Error('Usage: node scripts/export-online-state.cjs API_ORIGIN NEW_DIRECTORY');
 const root=path.resolve(directory);await fs.mkdir(root,{recursive:false,mode:0o700});await fs.mkdir(path.join(root,'replays'));
 async function get(p){const r=await fetch(url.origin+'/api'+p,{signal:AbortSignal.timeout(120000)});if(!r.ok)throw Error('Export request failed: '+p+' HTTP '+r.status);return r.json();}
 const ratings=await get('/leaderboard'),summary=await get('/tournaments');if(!Array.isArray(ratings)||!Array.isArray(summary))throw Error('Invalid list response');
 await fs.writeFile(path.join(root,'ratings.json'),JSON.stringify(ratings,null,2),{mode:0o600});
 const tournaments=[];const missing=[];
 for(const row of summary){if(!/^[a-zA-Z0-9_-]{1,64}$/.test(row.id))throw Error('Invalid tournament ID');const t=await get('/tournaments/'+row.id);tournaments.push(t);for(const m of t.matches||[])if(m.replayAvailable){if(!/^[a-zA-Z0-9_-]{1,64}$/.test(m.id))throw Error('Invalid match ID');try{const r=await get('/matches/'+m.id+'/replay');await fs.writeFile(path.join(root,'replays',m.id+'.json'),JSON.stringify(r),{mode:0o600});}catch{missing.push(m.id);}}}
 await fs.writeFile(path.join(root,'tournaments.json'),JSON.stringify(tournaments,null,2),{mode:0o600});
 await fs.writeFile(path.join(root,'export-report.json'),JSON.stringify({createdAt:new Date().toISOString(),ratings:ratings.length,tournaments:tournaments.length,missingReplays:missing},null,2),{mode:0o600});
 console.log(JSON.stringify({directory:root,ratings:ratings.length,tournaments:tournaments.length,missingReplays:missing},null,2));
 if(missing.length)process.exitCode=1;
}
main().catch(e=>{console.error('[Export]',e.message);process.exitCode=1});
