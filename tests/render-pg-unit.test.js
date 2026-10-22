'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {canonical,sha,sourcePayload,replayPayload}=require('../server/online-pg/common');
const {connectionUrl}=require('../server/online-pg/client');
const {redact}=require('../scripts/render-pg-tools.cjs');
test('canonical JSON survives PostgreSQL JSONB key reordering and preserves UTF-8 source',()=>{
  assert.equal(canonical({z:1,a:{y:2,b:3}}),canonical({a:{b:3,y:2},z:1}));
  assert.equal(canonical(new Date('2026-01-01T00:00:00Z')),'"2026-01-01T00:00:00.000Z"');
  const text='print("Xin chào")\n';assert.equal(sourcePayload(text).byteLength,Buffer.byteLength(text));
  assert.throws(()=>sourcePayload('a\0b'));assert.throws(()=>sourcePayload('\ud800'));assert.throws(()=>sourcePayload('x'.repeat(500001)));
  assert.equal(replayPayload({b:2,a:1}).sha256,sha(canonical({a:1,b:2})));
  assert.throws(()=>replayPayload({x:'x'.repeat(8*1024*1024)}));
});
test('production connection requires verified TLS and a bounded connection pool',()=>{
  const url='postgresql://user:password@db.example/db';
  assert.throws(()=>connectionUrl(url,{production:true}),/sslmode/);
  const result=new URL(connectionUrl(url+'?sslmode=require&sslaccept=strict',{production:true}));assert.equal(result.searchParams.get('connection_limit'),'3');
  assert.throws(()=>connectionUrl(url+'?sslmode=require&sslaccept=accept_invalid_certs'));
  assert.throws(()=>connectionUrl(url+'?connection_limit=30'));
  assert.ok(!redact('Connection '+url,url).includes('password'));
});
