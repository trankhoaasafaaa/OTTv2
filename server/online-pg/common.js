'use strict';
const crypto=require('node:crypto');
const fail=(status,message)=>Object.assign(new Error(message),{status});
const sha=value=>crypto.createHash('sha256').update(value).digest('hex');
function canonical(value){
  if(value instanceof Date)return JSON.stringify(value.toISOString());
  if(Array.isArray(value))return '['+value.map(canonical).join(',')+']';
  if(value&&typeof value==='object')return '{'+Object.keys(value).filter(k=>value[k]!==undefined).sort().map(k=>JSON.stringify(k)+':'+canonical(value[k])).join(',')+'}';
  return JSON.stringify(value);
}
function sourcePayload(content){
  if(typeof content!=='string'||!content.isWellFormed()||content.includes('\0')||Buffer.byteLength(content)<1||Buffer.byteLength(content)>500000)throw fail(400,'Source must be valid UTF-8 text, 1–500000 bytes, without NUL');
  return {content,byteLength:Buffer.byteLength(content)};
}
function replayPayload(payload){const bytes=canonical(payload);if(!bytes||Buffer.byteLength(bytes)>8*1024*1024)throw fail(413,'Replay exceeds 8 MiB');return {payload,sha256:sha(bytes),byteLength:Buffer.byteLength(bytes)};}
const includeMatch={creator:{select:{username:true}},submissionA:{select:{filename:true}},submissionB:{select:{filename:true}}};
function submission(s,botNames={}){const bName=(botNames&&typeof botNames==='object'&&botNames[s.id])||s.botName||s.filename;const dt=s.createdAt instanceof Date?s.createdAt.toISOString():(s.createdAt?.toISOString?.()||String(s.createdAt||''));return {id:s.id,userId:s.userId,ownedBy:s.user?.username||null,name:s.filename,botName:bName,lang:s.language,version:s.version,sha256:s.sha256,status:({STORED:'Stored — awaiting external worker',READY:'Ready',REJECTED:'Rejected',BUILDING:'Building'})[s.status]||s.status,date:dt};}
function match(m){return {id:m.id,createdById:m.createdById,ownedBy:m.creator?.username||null,status:m.status.toLowerCase(),mode:m.kind==='DEMO'?'demo':'submitted',submissionA:m.submissionAId,submissionB:m.submissionBId,a:m.submissionA?.filename||m.legacyMetadata?.a||'Greedy Bot',b:m.submissionB?.filename||m.legacyMetadata?.b||'Random Bot',seed:Number(m.seed),maxMoves:m.maxMoves,pieces:m.pieces,first:m.firstPlayerSetting,turns:m.turnCount||0,winner:({PLAYER_A:'p1',PLAYER_B:'p2'})[m.winner]||null,reason:m.reason,replayHash:m.replayHash,createdAt:m.createdAt.toISOString(),startedAt:m.startedAt?.toISOString()||null,finishedAt:m.finishedAt?.toISOString()||null};}
function limiter(limit,windowMs){const map=new Map();return key=>{const now=Date.now();if(map.size>=10000)for(const [k,v]of map)if(v.until<=now)map.delete(k);let b=map.get(key);if(!b||b.until<=now){if(map.size>=10000&&!b)throw fail(429,'Too many requests');b={count:0,until:now+windowMs};map.set(key,b);}if(++b.count>limit)throw fail(429,'Too many requests, try later');};}
async function queueLock(tx){await tx.$executeRaw`SELECT pg_advisory_xact_lock(740018)`;}
async function userLock(tx,id){await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${id}))`;}
async function audit(tx,actorId,action,entityId,entityType='Match',metadata={}){await tx.auditLog.create({data:{actorId,action,entityType,entityId,metadata}});}
function readBody(req,maxBytes=760000){return new Promise((resolve,reject)=>{const chunks=[];let size=0,stopped=false;req.on('data',b=>{if(stopped)return;size+=b.length;if(size>maxBytes){stopped=true;reject(fail(413,'Payload too large'));req.resume();return;}chunks.push(b);});req.on('end',()=>{if(stopped)return;try{const b=JSON.parse(Buffer.concat(chunks).toString('utf8')||'{}');if(!b||typeof b!=='object'||Array.isArray(b))throw Error();resolve(b);}catch{reject(fail(400,'Invalid JSON object'));}});req.on('error',reject);});}
module.exports={fail,sha,canonical,sourcePayload,replayPayload,includeMatch,submission,match,limiter,queueLock,userLock,audit,readBody};
