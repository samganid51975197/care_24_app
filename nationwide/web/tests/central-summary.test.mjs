import test from 'node:test';
import assert from 'node:assert/strict';
import {centralSummary} from '../lib/central-summary.mjs';
test('counts distinct requests and does not sum drafts, unknown units or both parties',()=>{
 const requests=[{id:1,hospitalId:'h',status:'requesting',careFee:'100000',feePeriod:'1일'},{id:2,hospitalId:'h',status:'matched',careFee:'120000',feePeriod:'1일'},{id:3,hospitalId:null,status:'matched',careFee:'3000000',feePeriod:'1개월'},{id:4,hospitalId:'h',status:'requesting'}];
 const workflows=new Map([[1,{notifiedAt:'2026-09-24',patientContract:'간병비: 150,000원 / 지급 단위: 24시간',caregiverContract:'간병비: 140000원 / 지급 단위: 24시간'}],[2,{submissions:{patient:{content:'간병비: 999999원 / 지급 단위: 24시간',status:'draft'}}}],[4,{applications:[{status:'sent'}]}]]);
 const result=centralSummary(requests,workflows,[{id:'h',name:'요양병원'}],[{id:'h',name:'요양병원',type:'요양병원'}]);
 assert.deepEqual(result.totals,{total:4,requesting:0,matching:1,matched:3,dailyFee:270000,feeKnown:2,feeUnknown:1});
 assert.equal(result.hospitals[0].kind,'요양병원');assert.equal(result.hospitals[1].name,'병원 소속 미지정');
});
test('malformed finalized fee does not silently fall back to old request price',()=>{
 const result=centralSummary([{id:1,status:'matched',careFee:'150000',feePeriod:'1일'}],new Map([[1,{patientContract:'간병비: 협의'}]]),[],[]);
 assert.equal(result.totals.feeUnknown,1);assert.equal(result.totals.dailyFee,0);
});