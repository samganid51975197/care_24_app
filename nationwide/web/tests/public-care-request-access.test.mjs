import assert from 'node:assert/strict';
import test from 'node:test';
import {accessPhoneHash,assertNoNonAdminContractFields,assertPin,canSelfServiceRequest,clientRateKey,normalizePhone} from '../lib/public-care-request-access.mjs';

test('public requester access normalizes phone and hashes it with a server secret',()=>{
 assert.equal(normalizePhone('010-1234-5678'),'01012345678');
 assert.match(accessPhoneHash('010-1234-5678','test-secret'),/^[a-f0-9]{64}$/);
 assert.notEqual(accessPhoneHash('010-1234-5678','test-secret'),clientRateKey('203.0.113.9','test-secret'));
});
test('public requester access requires exactly four numeric digits',()=>{
 assert.equal(assertPin('0123'),'0123');
 assert.throws(()=>assertPin('12345'));
 assert.throws(()=>assertPin('abcd'));
});
test('self-service is limited to draft and publicly requesting care requests',()=>{
 assert.equal(canSelfServiceRequest('draft'),true);
 assert.equal(canSelfServiceRequest('requesting'),true);
 assert.equal(canSelfServiceRequest('matching'),false);
 assert.equal(canSelfServiceRequest('matched'),false);
 assert.equal(canSelfServiceRequest('cancelled'),false);
});
test('a non-admin public request cannot include care fee or contract fields',()=>{
 assert.doesNotThrow(()=>assertNoNonAdminContractFields({patientName:'테스트'}));
 assert.throws(()=>assertNoNonAdminContractFields({careFee:'150000'}),/관리자만/);
 assert.throws(()=>assertNoNonAdminContractFields({contractNote:'계약'}),/관리자만/);
});
