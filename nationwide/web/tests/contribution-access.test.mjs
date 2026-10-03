import test from 'node:test';
import assert from 'node:assert/strict';
import {contributionScope} from '../lib/contribution-access.mjs';
test('나눔은 승인된 관리자 또는 자기 병원 담당자만 조회한다',()=>{
 assert.equal(contributionScope({role:'admin',status:'active'}),null);
 assert.equal(contributionScope({role:'admin',status:'active',contextHospitalId:'b'}),'b');
 assert.equal(contributionScope({role:'hospital',status:'active',hospitalId:'a'}),'a');
 assert.equal(contributionScope({role:'hospital',status:'active',hospitalId:'a',contextHospitalId:'a'}),'a');
 for(const actor of [null,{role:'caregiver',status:'active'},{role:'hospital',status:'active'},{role:'hospital',status:'active',hospitalId:'a',contextHospitalId:'b'},{role:'admin',status:'pending'}])assert.throws(()=>contributionScope(actor));
});
