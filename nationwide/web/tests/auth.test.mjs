import test from 'node:test';
import assert from 'node:assert/strict';
import {createClient} from '@libsql/client';
import {hashPassword,verifyPassword,tokenHash,newToken} from '../lib/auth-crypto.mjs';
import {encryptText,encryptBytes} from '../lib/data-crypto.mjs';
import {protectedFields} from '../lib/protected-fields.mjs';
import {mkdir,writeFile,unlink,readFile} from 'node:fs/promises';
const origin='http://127.0.0.1:3100';
const db=createClient({url:'file:.private/preview.db'});
const prefix='test_'+crypto.randomUUID().replaceAll('-','').slice(0,10);
const password=crypto.randomUUID()+crypto.randomUUID();
const records=[],userIds=[],hospitalIds=[];
const resources=[['applications','applications','applications'],['document_bundles','documents','bundles'],['privacy_consents','consents','consents'],['care_contracts','care-contracts','contracts'],['submissions','submissions','submissions'],['care_requests','care-requests','requests'],['board_posts','board-posts?type='+encodeURIComponent('공지사항'),'posts']];
async function call(path,{method='GET',cookie='',body,originHeader=origin}={}){return fetch(origin+path,{method,headers:{...(cookie?{cookie}:{}),...(method==='GET'?{}:{origin:originHeader,'content-type':'application/json'})},body:body===undefined?undefined:JSON.stringify(body)});}
async function seedUser(suffix,role,hospital,status='active'){
 const id=prefix+suffix;userIds.push(id);
 await db.execute({sql:'INSERT INTO auth_users(id,username,name,password_hash,requested_role,requested_hospital,role,hospital_id,status,created_at) VALUES(?,?,?,?,?,?,?,?,?,?)',args:[id,id,'테스트 '+suffix,await hashPassword(password),role,'테스트병원',role,hospital,status,Date.now()]});return id;
}
async function login(username){const r=await call('/api/auth/login',{method:'POST',body:{username,password}});assert.equal(r.status,200,await r.clone().text());assert.match(r.headers.get('set-cookie'),/HttpOnly/);assert.match(r.headers.get('set-cookie'),/SameSite=Lax/);return r.headers.get('set-cookie').split(';')[0];}
async function seedRecord(table,hospital,owner){
 const columns=(await db.execute(`PRAGMA table_info(${table})`)).rows;
 const fields={hospital_id:hospital,owner_user_id:owner};
 for(const c of columns)if(c.name!=='id'&&c.notnull&&c.dflt_value===null)fields[c.name]='fixture';
 if(table==='board_posts'){fields.board_type='공지사항';fields.attachments='[]';}
 if(table==='care_requests')fields.status='requesting';
 for(const col of protectedFields[table]||[])if(typeof fields[col]==='string')fields[col]=encryptText(fields[col],`${table}.${col}`);
 const names=Object.keys(fields),result=await db.execute({sql:`INSERT INTO ${table}(${names.join(',')}) VALUES(${names.map(()=>'?').join(',')}) RETURNING id`,args:Object.values(fields)});
 const id=Number(result.rows[0].id);records.push([table,id]);return id;
}
test('password hashes use unique salts and reject wrong passwords',async()=>{
 const a=await hashPassword(password),b=await hashPassword(password);assert.notEqual(a,b);assert.ok(await verifyPassword(password,a));assert.equal(await verifyPassword('incorrect',a),false);assert.equal(await verifyPassword(password,'invalid'),false);assert.notEqual(tokenHash(newToken()),newToken());
});
test('HTTP authentication and hospital/owner authorization',async t=>{
 try{
  for(const h of ['A','B']){const id=prefix+h;hospitalIds.push(id);await db.execute({sql:'INSERT INTO auth_hospitals(id,name) VALUES(?,?)',args:[id,id]});}
  const [ha,hb]=hospitalIds;
  const admin=await seedUser('admin','admin',null),staffA=await seedUser('staffa','hospital',ha),staffB=await seedUser('staffb','hospital',hb),careA=await seedUser('carea','caregiver',ha),careA2=await seedUser('carea2','caregiver',ha),careB=await seedUser('careb','caregiver',hb),pending=await seedUser('pending','caregiver',ha,'pending');
  const adminCookie=await login(admin),aCookie=await login(staffA),bCookie=await login(staffB),careCookie=await login(careA);
  await t.test('anonymous, pending, forged identities and CSRF are blocked',async()=>{
   for(const [,endpoint] of resources)assert.equal((await call('/api/'+endpoint)).status,401);
   assert.equal((await call('/api/auth/login',{method:'POST',body:{username:pending,password}})).status,403);
   assert.equal((await call('/api/admin/users',{cookie:careCookie})).status,403);
   assert.equal((await call('/api/auth/logout',{method:'POST',cookie:careCookie,originHeader:'https://evil.invalid'})).status,403);
   assert.equal((await fetch(origin+'/api/applications',{headers:{'oai-authenticated-user-email':'admin@example.test','x-role':'admin'}})).status,401);
  });
  for(const [table,endpoint,key] of resources){
   await t.test(table+' isolates hospitals and caregiver ownership',async()=>{
    const own=await seedRecord(table,ha,careA),sameHospitalOther=await seedRecord(table,ha,careA2),other=await seedRecord(table,hb,careB),legacy=await seedRecord(table,null,null);
    for(const [cookie,expected] of [[aCookie,[own,sameHospitalOther]],[bCookie,[other]],[careCookie,[own]],[adminCookie,[own,sameHospitalOther,other,legacy]]]){
     const r=await call('/api/'+endpoint,{cookie});assert.equal(r.status,200,await r.clone().text());assert.equal(r.headers.get('cache-control'),'no-store');const d=await r.json();const ids=d[key].map(x=>x.id);for(const id of [own,sameHospitalOther,other,legacy])assert.equal(ids.includes(id),expected.includes(id),`${table}: ${id}`);
    }
   });
  }
  await t.test('writes cannot forge ownership or update another hospital',async()=>{
   const body=Object.fromEntries(['applicantName','applicantPhone','applicantBirth','applicantGender','careerYears','preferredDate','caregiverHandwriting'].map(x=>[x,'fixture']));Object.assign(body,{ownerUserId:careB,hospitalId:hb});
   const r=await call('/api/applications',{method:'POST',cookie:careCookie,body});assert.equal(r.status,201,await r.clone().text());const row=(await r.json()).application;records.push(['applications',row.id]);assert.equal(row.ownerUserId,careA);assert.equal(row.hospitalId,ha);
   assert.equal((await call('/api/applications',{method:'PATCH',cookie:bCookie,body:{...body,id:row.id}})).status,404);
   assert.equal((await call('/api/consents',{method:'PATCH',cookie:careCookie,body:{id:row.id,action:'confirm'}})).status,403);
  });
  await t.test('signup stays pending and admin cannot be requested',async()=>{
   const username=prefix+'signup';userIds.push(username);
   assert.equal((await call('/api/auth/signup',{method:'POST',body:{username,password,name:'가입시험',role:'admin',hospital:'병원'}})).status,400);
   const r=await call('/api/auth/signup',{method:'POST',body:{username,password,name:'가입시험',role:'hospital',hospital:'병원',status:'active',hospitalId:hb}});assert.equal(r.status,201);
   const user=(await db.execute({sql:'SELECT * FROM auth_users WHERE username=?',args:[username]})).rows[0];userIds.push(user.id);assert.equal(user.status,'pending');assert.equal(user.role,'caregiver');assert.equal(user.hospital_id,null);
   assert.equal((await call('/api/auth/login',{method:'POST',body:{username,password}})).status,403);
   const approve=await call('/api/admin/users',{method:'POST',cookie:adminCookie,body:{id:user.id,status:'active',role:'hospital',hospitalId:ha}});assert.equal(approve.status,200);
   const approvedCookie=await login(username);
   assert.equal((await call('/api/applications',{cookie:approvedCookie})).status,200);
   assert.equal((await call('/api/admin/users',{method:'POST',cookie:adminCookie,body:{id:user.id,status:'suspended',role:'hospital',hospitalId:ha}})).status,200);
   assert.equal((await call('/api/applications',{cookie:approvedCookie})).status,401);
  });
  await t.test('private attachments deny another user and allow their owner',async()=>{
   const key='caregiver-documents/'+crypto.randomUUID(),dir='.private/uploads/caregiver-documents';await mkdir(dir,{recursive:true});await writeFile('.private/uploads/'+key,encryptBytes(Buffer.from('fixture'),'upload:'+key));await writeFile('.private/uploads/'+key+'.json',encryptBytes(Buffer.from('{"contentType":"text/plain"}'),'metadata:'+key));
   try{const id=await seedRecord('document_bundles',ha,careA);await db.execute({sql:'UPDATE document_bundles SET attachments=? WHERE id=?',args:[encryptText(JSON.stringify([{storageKey:key}]),'document_bundles.attachments'),id]});const url='/api/document-media?id='+id+'&key='+encodeURIComponent(key);assert.equal((await call(url)).status,401);assert.equal((await call(url,{cookie:bCookie})).status,404);const allowed=await call(url,{cookie:careCookie});assert.equal(allowed.status,200);assert.equal(await allowed.text(),'fixture');assert.equal(allowed.headers.get('cache-control'),'no-store');assert.equal((await call('/api/board-media?key='+encodeURIComponent(key),{cookie:careCookie})).status,404);}finally{await unlink('.private/uploads/'+key);await unlink('.private/uploads/'+key+'.json');}
  });
  await t.test('new sensitive documents and uploads are encrypted at rest',async()=>{
   const form=new FormData();for(const[k,v]of Object.entries({caregiverName:'fixture',caregiverPhone:'fixture',bankName:'fixture',accountNumber:'TEST-ONLY-ACCOUNT-2345',accountHolder:'fixture',subjectResidentNo:'TEST-ONLY-RESIDENT-1234',evaluation:'확인중',decision:'결정대기',reviewer:'fixture',reviewedAt:'2026-09-13',action:'save'}))form.set(k,v);
   form.append('files_0',new Blob(['TEST-ONLY-PRIVATE-UPLOAD'],{type:'application/pdf'}),'fixture.pdf');
   const r=await fetch(origin+'/api/documents',{method:'POST',headers:{cookie:careCookie,origin},body:form});assert.equal(r.status,201,await r.clone().text());const row=(await r.json()).bundle;records.push(['document_bundles',row.id]);
   const files=JSON.parse(row.attachments);
   try{const raw=(await db.execute({sql:'SELECT account_number,criminal_request_data,attachments FROM document_bundles WHERE id=?',args:[row.id]})).rows[0];for(const value of Object.values(raw))assert.ok(String(value).startsWith('care24enc:v1:'));assert.equal(row.accountNumber,'TEST-ONLY-ACCOUNT-2345');assert.ok(row.criminalRequestData.includes('TEST-ONLY-RESIDENT-1234'));for(const f of files){const bytes=await readFile('.private/uploads/'+f.storageKey);assert.ok(bytes.toString().startsWith('care24enc:v1:'));assert.ok(!bytes.includes(Buffer.from('TEST-ONLY-PRIVATE-UPLOAD')));const denied=await call('/api/document-media?id='+row.id+'&key='+encodeURIComponent(f.storageKey),{cookie:bCookie});assert.equal(denied.status,404);}}
   finally{for(const f of files){await unlink('.private/uploads/'+f.storageKey);await unlink('.private/uploads/'+f.storageKey+'.json');}}
  });
  await t.test('contracts save without removed duties and special terms',async()=>{
   const body=Object.fromEntries(['employerName','employerPhone','caregiverName','caregiverPhone','patientName','workplace','workStart','workEnd','workHours','salaryPeriod','payDate','bankName','bankAccount','bankHolder','socialInsurance','retirementPension','employerSignature','caregiverSignature','signedAt'].map(k=>[k,'fixture']));
   for(const contractType of ['개인간병 근로계약서','공동간병 계약서']){
    const payload={...body,contractType,private24Salary:'100000',fullTimeSalary:'100000'};
    const saved=await call('/api/care-contracts',{method:'POST',cookie:careCookie,body:payload});assert.equal(saved.status,201,await saved.clone().text());
    const row=(await saved.json()).contract;records.push(['care_contracts',row.id]);assert.equal(row.duties,'');assert.ok(String((await db.execute({sql:'SELECT bank_account FROM care_contracts WHERE id=?',args:[row.id]})).rows[0].bank_account).startsWith('care24enc:v1:'));
    const edited=await call('/api/care-contracts',{method:'PATCH',cookie:careCookie,body:{...payload,id:row.id}});assert.equal(edited.status,200);
   }
  });
  await t.test('logout revokes session and expiry is enforced',async()=>{
   await db.execute({sql:'UPDATE auth_sessions SET expires_at=0 WHERE user_id=?',args:[staffB]});assert.equal((await call('/api/applications',{cookie:bCookie})).status,401);
   const r=await call('/api/auth/logout',{method:'POST',cookie:careCookie});assert.equal(r.status,200);assert.match(r.headers.get('set-cookie'),/Max-Age=0/);assert.equal((await call('/api/applications',{cookie:careCookie})).status,401);
  });
 }finally{
  for(const [table,id]of records)await db.execute({sql:`DELETE FROM ${table} WHERE id=?`,args:[id]});
  for(const id of userIds){await db.execute({sql:'DELETE FROM auth_sessions WHERE user_id=?',args:[id]});await db.execute({sql:'DELETE FROM auth_audit WHERE actor_id=? OR target_id=?',args:[id,id]});await db.execute({sql:'DELETE FROM auth_users WHERE id=?',args:[id]});}
  for(const id of hospitalIds)await db.execute({sql:'DELETE FROM auth_hospitals WHERE id=?',args:[id]});db.close();
 }
});
