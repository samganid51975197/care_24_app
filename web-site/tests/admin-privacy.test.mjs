import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createRequire} from 'node:module';
import * as privacy from '../lib/admin-privacy.mjs';
const require=createRequire(import.meta.url);
const ts=require('typescript');
let actor;
const mod={exports:{}};
const output=ts.transpileModule(fs.readFileSync(new URL('../lib/auth.ts',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
new Function('require','exports',output)(name=>{
 if(name==='./admin-privacy.mjs')return privacy;
 if(name==='../db')return {getClient:()=>({execute:async()=>({rows:[actor]})})};
 if(name==='./auth-crypto.mjs')return {tokenHash:()=>''};
 if(name==='drizzle-orm')return {and:()=>null,eq:()=>null};
 if(name==='./hospital-scope.mjs')return {};
 throw Error(name);
},mod.exports);
const {withActor}=mod.exports;
process.env.CARE24_ORIGIN='https://test.invalid';
function request(path,method='GET',body){return new Request('https://test.invalid'+path,{method,headers:{cookie:'care24_session='+'a'.repeat(43),origin:process.env.CARE24_ORIGIN,'content-type':'application/json'},...(method!=='GET'?{body:JSON.stringify(body||{})}:{})});}
test('실제 인증 래퍼가 일반 계정의 문서 조회·변경을 거부하고 관리자 접근은 유지한다',async()=>{
 for(const role of ['hospital','caregiver','admin']){
 actor={id:'user',status:'active',role};
 for(const path of ['/api/applications','/api/%63are-contracts/','/api/documents','/api/consents','/api/submissions','/api/care-contracts','/api/document-media','/api/ward-board','/api/ward-assignments','/api/contribution','/api/care-requests/31'])for(const method of ['GET','POST','PATCH']){
 let called=false;
 const response=await withActor(request(path,method),async()=>{called=true;return Response.json({private:'secret'});});
 assert.equal(response.status,role==='admin'?200:403,`${role} ${method} ${path}`);
 assert.equal(called,role==='admin');
 }
 }
});
test('의뢰 최초 작성과 금액 없는 간병 신청은 허용하고 금액 작성과 계약 조회는 차단한다',async()=>{
 actor={id:'user',status:'active',role:'caregiver'};
 for(const [path,body,status] of [
 ['/api/care-requests',{patientName:'홍길동'},200],
 ['/api/care-requests',{careFee:'150000'},403],
 ['/api/care-workflow',{action:'send_application',note:''},200],
 ['/api/care-workflow',{action:'send_contract',content:'계약'},403]]){
 const response=await withActor(request(path,'POST',body),async()=>Response.json({ok:true}));assert.equal(response.status,status);
 }
 const data={id:31,patientContract:'비밀계약 150000원',caregiverContract:'비밀계약',patientContractDraft:'비밀계약',submissions:{patient:{content:'비밀계약'}},applications:[],diary:[{text:'비밀환자'}]};
 const response=await withActor(request('/api/care-workflow?id=31'),async()=>Response.json(data));
 assert.ok(!(await response.text()).includes('비밀'));
});
test('가운데 이름 가림과 공개 돌봄 설명의 연락처·병실·금액 제외',()=>{
 assert.equal(privacy.maskPatientName('홍길동'),'홍○동');assert.equal(privacy.maskPatientName('김철'),'김○');assert.equal(privacy.maskPatientName('김'),'○');
 const text=privacy.publicCareText('홍길동 010-1234-5678 808호 150,000원 이동 보조',['홍길동','808']);
 for(const secret of ['홍길동','010-1234-5678','808','150,000'])assert.ok(!text.includes(secret));
 assert.ok(text.includes('이동 보조'));
 const response=privacy.nonAdminResponse('/api/care-requests',{requests:[{id:31,patientName:'홍길동',room:'808',requesterPhone:'01012345678',careFee:'150000',status:'requesting',patientCondition:'이동 보조'}]});
 assert.equal(response.requests[0].patientName,'홍○동');assert.equal(response.requests[0].patientCondition,'이동 보조');
 for(const key of ['room','requesterPhone','careFee'])assert.ok(!(key in response.requests[0]));
});
