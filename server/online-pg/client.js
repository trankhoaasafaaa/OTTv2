'use strict';
function connectionUrl(raw,{production=process.env.NODE_ENV==='production'}={}){
  let url;try{url=new URL(raw);}catch{throw Error('DATABASE_URL is required');}
  if(!['postgres:','postgresql:'].includes(url.protocol)||!url.pathname.slice(1))throw Error('DATABASE_URL must identify PostgreSQL');
  // Public Render certificates validate against the system trust store.
  // Use the external URL with strict verification for both API and migration.
  if(production&&(url.searchParams.get('sslmode')!=='require'||url.searchParams.get('sslaccept')!=='strict'))throw Error('Production DATABASE_URL requires sslmode=require&sslaccept=strict');
  if(url.searchParams.get('sslaccept')==='accept_invalid_certs')throw Error('Disabling certificate verification is not supported');
  for(const [key,value]of Object.entries({connection_limit:'3',connect_timeout:'10',pool_timeout:'10',socket_timeout:'20'}))if(!url.searchParams.has(key))url.searchParams.set(key,value);
  const pool=Number(url.searchParams.get('connection_limit'));
  if(!Number.isInteger(pool)||pool<1||pool>5)throw Error('Use a pool of 1–5 connections');
  return url.toString();
}
function createClient(raw,options){const {PrismaClient}=require('@prisma/client');return new PrismaClient({datasources:{db:{url:connectionUrl(raw,options)}},log:[]});}
module.exports={createClient,connectionUrl};
