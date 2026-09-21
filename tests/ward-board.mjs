import assert from 'node:assert/strict';
import fs from 'node:fs';
import {DatabaseSync} from 'node:sqlite';
const {default:worker}=await import('data:text/javascript;base64,'+fs.readFileSync(new URL('../dist/server/index.js',import.meta.url)).toString('base64'));
const db=new DatabaseSync(':memory:');
for(const file of ['0001_secure_messages.sql','0002_care_board.sql','0003_care_end_time.sql'])db.exec(fs.readFileSync(new URL('../drizzle/'+file,import.meta.url),'utf8'));
const wrap=(sql,args=[])=>({bind(...values){return wrap(sql,values)},async first(){return db.prepare(sql).get(...args)},async all(){return {results:db.prepare(sql).all(...args)}},run(){return db.prepare(sql).run(...args)}});
const env={DB:{prepare:wrap,async batch(stmts){return stmts.map(s=>s.run())}}};
const headers={'Content-Type':'application/json','Origin':'https://test.local','oai-authenticated-user-id':'test-user','oai-authenticated-user-email':'test@example.invalid'};
async function api(path,body,auth=true){return worker.fetch(new Request('https://test.local'+path,{method:body?'POST':'GET',headers:auth?headers:{},...(body?{body:JSON.stringify(body)}:{})}),env)}
const request={hospitalId:'hospital-5',hospitalName:'삼성서울병원',category:'환자·보호자 의뢰',recipient:'both',title:'환자·보호자 의뢰 · 삼성서울병원',body:'PRIVATE MEDICAL MEMO',contact:'PRIVATE PHONE',board:{building:'암병원',floor:'8층',room:'확인된 병실',bed:'2번',date:'2026-09-25',time:'13:45',endDate:'2026-09-26',endTime:'09:00'}};
let res=await api('/api/messages',request);assert.equal(res.status,201);const {reference}=await res.json();
assert.equal((await api('/api/board?hospitalId=hospital-5',null,false)).status,401);
let board=await (await api('/api/board?hospitalId=hospital-5')).json();assert.equal(board.items.length,1);assert.equal(board.items[0].time,'13:45');assert.equal(board.items[0].reference,reference);assert(!JSON.stringify(board).includes('PRIVATE'));assert.deepEqual((await (await api('/api/board?hospitalId=snubh')).json()).items,[]);
const apply={hospitalId:'hospital-5',hospitalName:'삼성서울병원',category:'간병인 신청',recipient:'both',title:'간병인 신청 · 삼성서울병원',body:'지원 의뢰번호: '+reference,contact:'TEST',jobReference:reference,schedule:request.board};
assert.equal((await api('/api/messages',apply)).status,201);assert.equal((await api('/api/messages',{...apply,hospitalId:'snubh'})).status,400);
assert.equal((await api('/api/messages',{...request,board:{...request.board,time:'25:00'}})).status,400);
assert.equal((await api('/api/messages',{...request,board:{...request.board,date:'2026-99-99'}})).status,400);
db.prepare("UPDATE secure_messages SET status='배정 완료' WHERE reference=?").run(reference);
assert.equal((await api('/api/messages',apply)).status,400);assert.deepEqual((await (await api('/api/board?hospitalId=hospital-5')).json()).items,[]);
console.log('PASS: migrations, request persistence, sanitized board, hospital isolation, selected application, closed request, authentication and time validation.');

assert.equal((await api('/api/messages',null,false)).status,401);
assert.equal((await api('/api/messages')).status,403);
assert.equal((await api('/api/messages?admin=true')).status,403);
const own=await (await api('/api/my-messages')).json();assert(own.items.length>0);assert.equal(own.admin,false);
const outsider=new Request('https://test.local/api/my-messages',{headers:{'oai-authenticated-user-id':'other-user','oai-authenticated-user-email':'other@example.invalid'}});
assert.deepEqual((await (await worker.fetch(outsider,env)).json()).items,[]);
for(const ownerHeaders of [{'oai-authenticated-user-id':'f2d83ab1-c5bd-41aa-8991-e4d70322e4e5','oai-authenticated-user-email':'owner@example.invalid'},{'oai-authenticated-user-id':'owner-site-subject','oai-authenticated-user-email':'samganid5197@naver.com'}]){
 const result=await worker.fetch(new Request('https://test.local/api/messages',{headers:ownerHeaders}),env);assert.equal(result.status,200);assert.equal((await result.json()).admin,true);
 const session=await worker.fetch(new Request('https://test.local/api/session',{headers:ownerHeaders}),env);assert.equal((await session.json()).admin,true);
}
assert.equal((await (await api('/api/session')).json()).admin,false);
console.log('PASS: owner-only inbox, anonymous 401, ordinary user 403, no query override, own-message isolation and owner identity mapping');

assert.equal(board.items[0].endTime,'09:00');
for(const delta of [{endTime:''},{endDate:'2026-09-25',endTime:'12:00'},{endDate:'2026-02-30'},{endTime:'24:00'}]){assert.equal((await api('/api/messages',{...request,board:{...request.board,...delta}})).status,400);assert.equal((await api('/api/messages',{...apply,jobReference:undefined,schedule:{...request.board,...delta}})).status,400)}
assert.equal((await api('/api/messages',{...apply,jobReference:undefined,schedule:undefined})).status,400);
console.log('PASS: end time persistence, overnight range and invalid/missing schedule rejection for both forms');
const location={building:'암병원',floor:'8층',room:'803호 (1인실)',bed:''};
const edit={reference,expected:request.board,location};
async function editApi(value,admin=true){return worker.fetch(new Request('https://test.local/api/room-edit',{method:'POST',headers:{...headers,...(admin?{'oai-authenticated-user-id':'f2d83ab1-c5bd-41aa-8991-e4d70322e4e5'}:{})},body:JSON.stringify(value)}),env)}
assert.equal((await editApi(edit,false)).status,403);
assert.equal((await editApi({...edit,location:{...location,floor:'bad'}})).status,400);
assert.equal((await editApi(edit)).status,200);
assert.equal(db.prepare('SELECT room FROM care_board_requests WHERE reference=?').get(reference).room,location.room);
assert(db.prepare('SELECT body FROM secure_messages WHERE reference=?').get(reference).body.includes('병실: 803호 (1인실)'));
assert.equal((await editApi(edit)).status,409);
assert(db.prepare("SELECT action FROM secure_message_audit WHERE action LIKE '%room_updated%'").get());
console.log('PASS: admin-only room editing, persistence, body sync, audit and stale edit protection');
