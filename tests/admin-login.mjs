import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
for(const state of [{configured:false,setupAllowed:false,admin:false},{configured:true,setupAllowed:false,admin:false},{configured:false,setupAllowed:true,admin:false}]){
 const nodes=new Map();const get=id=>{if(!nodes.has(id))nodes.set(id,{innerHTML:'',isConnected:true});return nodes.get(id)};
 const context={app:get('app'),document:{querySelector:get},location:{hash:'#admin'},URLSearchParams,fetch:async()=>({ok:true,json:async()=>state}),escapeHtml:s=>s};
 vm.createContext(context);vm.runInContext(fs.readFileSync('admin-login.js','utf8'),context);await vm.runInContext('admin()',context);
 const html=get('#adminLoginState').innerHTML;
 assert(html.includes('id="adminUsername"'));assert(html.includes('id="adminPassword"'));assert.equal(html.includes('id="adminPasswordConfirm"'),state.setupAllowed);
}
console.log('PASS: anonymous mobile login fields visible before and after setup; setup-only confirmation remains owner-gated');
