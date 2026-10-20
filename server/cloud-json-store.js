'use strict';
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

function createJsonStore(dataDir) {
  fs.mkdirSync(dataDir, {recursive:true,mode:0o700});
  const filename = path.join(dataDir,'arena.json');
  const empty = () => ({version:1,revision:0,users:[],sessions:[],submissions:[],matches:[],audit:[],settings:{submissionsOpen:true}});
  function validate(value) {
    if (!value || value.version !== 1 || !Number.isSafeInteger(value.revision) ||
      !['users','sessions','submissions','matches','audit'].every(key=>Array.isArray(value[key])) ||
      typeof value.settings?.submissionsOpen !== 'boolean') throw new Error('Invalid arena.json schema. Original data has been preserved.');
    return value;
  }
  function write(value) {
    const content=JSON.stringify(validate(value));
    if(Buffer.byteLength(content)>50*1024*1024)throw Object.assign(new Error('JSON metadata limit reached; migrate to a database'),{status:507});
    const temp=filename+'.'+crypto.randomBytes(8).toString('hex')+'.tmp';
    let fd;
    try {
      fd=fs.openSync(temp,'wx',0o600);fs.writeFileSync(fd,content);fs.fsyncSync(fd);fs.closeSync(fd);fd=undefined;
      fs.renameSync(temp,filename);
    } catch(error) {
      if(fd!==undefined)fs.closeSync(fd);
      fs.rmSync(temp,{force:true});throw error;
    }
  }
  let state;
  if(fs.existsSync(filename)) {
    try {state=validate(JSON.parse(fs.readFileSync(filename,'utf8')));}
    catch {throw new Error('Cannot read arena.json. Refusing to replace existing data with an empty database.');}
  } else {state=empty();write(state);}
  return {
    filename,
    read:()=>structuredClone(state),
    mutate(callback) {
      // One Node process only. Reject stale writes instead of overwriting another writer.
      const disk=validate(JSON.parse(fs.readFileSync(filename,'utf8')));
      if(disk.revision!==state.revision)throw Object.assign(new Error('Another process modified arena.json; stop duplicate writers and restart'),{status:503});
      const next=structuredClone(state);
      const result=callback(next);
      if(result&&typeof result.then==='function')throw new Error('JSON mutations must be synchronous');
      next.revision=state.revision+1;
      write(next);state=next;
      return structuredClone(result);
    }
  };
}
module.exports={createJsonStore};
