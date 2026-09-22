import test from 'node:test';
import assert from 'node:assert/strict';
import {inWard} from '../lib/ward-filter.mjs';
test('61 and 62 remain separated within building 1',()=>{
 const entry={building:'1동',floor:'6층',ward:'61병동'};
 assert.equal(inWard(entry,'1동','6층 · 61병동'),true);
 assert.equal(inWard(entry,'1동','6층 · 62병동'),false);
 assert.equal(inWard({...entry,building:'2동'},'1동','6층 · 61병동'),false);
 assert.equal(inWard({...entry,ward:'1병동'},'1동','6층 · 61병동'),true);
 assert.equal(inWard({...entry,ward:'2병동'},'1동','6층 · 62병동'),true);
 assert.equal(inWard({...entry,floor:'7층',ward:'1병동'},'1동','6층 · 61병동'),false);
});
test('numbered wards on other floors keep records separated',()=>{
 for(const floor of [4,5,7,8,9,10,11,12,13]){
  const entry={building:'1동',floor:`${floor}층`,ward:'1병동'};
  assert.equal(inWard(entry,'1동',`${floor}층 · ${floor}1병동`),true);
  assert.equal(inWard(entry,'1동',`${floor}층 · ${floor}2병동`),false);
  assert.equal(inWard({...entry,ward:`${floor}2병동`},'1동',`${floor}층 · ${floor}2병동`),true);
 }
});
