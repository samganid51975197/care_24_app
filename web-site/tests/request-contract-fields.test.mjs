import test from 'node:test';
import assert from 'node:assert/strict';
import {readContractFields,writeContractFields} from '../lib/request-contract-fields.mjs';
test('기존 계약의 서명과 날짜를 유지하고 수정 후 다시 읽을 수 있다',()=>{
 const text='조건: 원문 유지\n간병비: 150000원 / 지급 단위: 1일\n환자·보호자 성명 및 서명: 보존할서명\n협회·간병24 담당자 성명 및 서명: ____________________\n계약일: 2026-09-24';
 const fields=readContractFields(text);
 assert.equal(fields.patientSignature,'보존할서명');
 assert.equal(fields.associationSignature,'');
 assert.equal(fields.date,'2026-09-24');
 assert.equal(fields.body,'조건: 원문 유지');
 const updated=writeContractFields(fields);
 assert.ok(updated.includes('지급 단위: 24시간'));
 const roundTrip=readContractFields(updated);assert.ok(roundTrip.body.startsWith(fields.body));for(const key of ['fee','patientSignature','associationSignature','date'])assert.equal(roundTrip[key],fields[key]);assert.ok(updated.includes('1005-804-669803'));assert.ok(updated.includes('1005-304-803945'));assert.equal(writeContractFields(roundTrip),updated);
});
test('미작성 계약에는 예시 성명이나 계약일을 넣지 않는다',()=>{
 const fields=readContractFields('계약 내용\n환자·보호자 성명 및 서명: ____\n계약일: ____');
 assert.equal(fields.patientSignature,'');assert.equal(fields.date,'');
 assert.ok(!writeContractFields(fields).includes('시험'));
});
test('해석할 수 없는 기존 금액과 계약일 기록을 삭제하지 않는다',()=>{
 const fields=readContractFields('원문\n간병비: 별도 협의\n계약일: 구두 합의한 날');
 assert.ok(fields.body.includes('간병비: 별도 협의'));
 assert.ok(fields.body.includes('기존 계약일 기록: 구두 합의한 날'));
});
