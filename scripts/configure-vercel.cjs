'use strict';
const fs=require('node:fs');
const path=require('node:path');
try {
  const input=process.argv[2];
  const url=new URL(input);
  if(url.protocol!=='https:'||url.origin!==input||url.username||url.password)
    throw Error('Use the exact HTTPS backend origin without a trailing slash');
  const filename=path.resolve(__dirname,'../public/vercel.json');
  const config=JSON.parse(fs.readFileSync(filename,'utf8'));
  const rule=config.rewrites.find(rule=>rule.source==='/api/:path*');
  if(!rule)throw Error('Missing /api rewrite');
  rule.destination=url.origin+'/api/:path*';
  fs.writeFileSync(filename,JSON.stringify(config,null,2)+'\n');
  console.log('Configured Vercel /api proxy. Commit public/vercel.json and redeploy Vercel.');
} catch(error) {console.error(error.message||'Usage: node scripts/configure-vercel.cjs https://YOUR-BACKEND.onrender.com');process.exitCode=1;}
