import test from 'node:test';
import assert from 'node:assert/strict';
import {requestContractDraft} from '../lib/request-contract-draft.mjs';
const request={id:13,ownerUserId:2,requesterName:'시험 의뢰인',requesterPhone:'010-0000-0000',patientName:'시험 환자',startDate:'2026-10-01'};
const workflow={applications:[{profileId:5,name:'시험 간병인',status:'sent'}],selected:null};
test('계약 초안은 작성자·관리자만 열람하고 연락처는 관리자만 포함',()=>{
 assert.equal(requestContractDraft(request,workflow,{id:3,role:'caregiver'}),undefined);
 const own=requestContractDraft(request,workflow,{id:2,role:'hospital'});
 assert.ok(own.includes('의뢰번호: 13'));assert.ok(own.includes('2026-10-01'));
 assert.ok(!own.includes(request.requesterPhone));assert.ok(!own.includes('시험 간병인'));
 assert.ok(own.includes('협회 선정 전'));assert.ok(own.includes('서명: ____________________'));
 assert.ok(requestContractDraft(request,workflow,{id:1,role:'admin'}).includes(request.requesterPhone));
});
