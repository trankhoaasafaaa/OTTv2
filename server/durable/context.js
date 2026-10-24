'use strict';
// A request-scoped unit of work. Online operations must enter through postgres.js.
const {AsyncLocalStorage}=require('node:async_hooks');
const context=new AsyncLocalStorage();
module.exports={context,current:()=>context.getStore()};
