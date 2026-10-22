'use strict';
const fs=require('node:fs'),path=require('node:path');
const dotenv=require('dotenv');
const file=path.resolve(__dirname,'../.env.render-pg');
const config=dotenv.parse(fs.readFileSync(file));
let url;try{url=new URL(config.DATABASE_URL);}catch{throw Error('Paste the External Database URL into .env.render-pg first');}
if(!['postgresql:','postgres:'].includes(url.protocol)||!url.hostname.endsWith('.render.com'))throw Error('Use the full Render External Database URL; internal hostnames are not supported by this TLS profile');
for(const [k,v]of Object.entries({sslmode:'require',sslaccept:'strict',connection_limit:'3',connect_timeout:'10',pool_timeout:'10',socket_timeout:'20'}))url.searchParams.set(k,v);
const workerFile=path.resolve(__dirname,'../.env.worker');
if(!/^[a-f0-9]{64}$/.test(config.WORKER_TOKEN||'')&&fs.existsSync(workerFile))config.WORKER_TOKEN=dotenv.parse(fs.readFileSync(workerFile)).WORKER_TOKEN;
if(!/^[a-f0-9]{64}$/.test(config.WORKER_TOKEN||''))throw Error('Set the existing 64-hex WORKER_TOKEN, never create a different token here');
let origin;try{origin=new URL(config.FRONTEND_ORIGIN);}catch{throw Error('Set FRONTEND_ORIGIN');}
if(origin.protocol!=='https:'||origin.origin!==config.FRONTEND_ORIGIN)throw Error('Use an exact HTTPS frontend origin without a trailing slash');
Object.assign(config,{DATABASE_URL:url.toString(),NODE_ENV:'production'});
fs.writeFileSync(file,Object.entries(config).map(([k,v])=>k+'='+JSON.stringify(v)).join('\n')+'\n',{mode:0o600});fs.chmodSync(file,0o600);
console.log('Configured .env.render-pg with strict TLS and pool=3. No credentials printed.');
