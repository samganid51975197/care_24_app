import test from 'node:test';
import assert from 'node:assert/strict';
import {joinRehabilitationNotes, splitRehabilitationNotes} from '../lib/rehabilitation-notes.mjs';
import {requestChanges, requestForEditor} from '../lib/care-request-edit.mjs';

test('legacy notes and arbitrary similar headings remain unchanged',()=>{
  for(const value of ['', '야간 관찰\n보호자 동행', '내용\n\n[재활치료 안내]\n직접 적은 메모']) {
    assert.deepEqual(splitRehabilitationNotes(value), {specialNotes:value});
    assert.equal(joinRehabilitationNotes({specialNotes:value}),value);
  }
});
test('rehabilitation information survives save and edit in a custom hospital',()=>{
  const fields={specialNotes:'야간 관찰',rehabStatus:'치료 중',rehabType:'작업치료',rehabSchedule:'오전 / 치료실',rehabAssistance:'휠체어 동행',rehabPrecautions:'의료진 안내 확인'};
  const body={requesterName:'시험',requesterPhone:'01000000000',patientName:'시험',patientGender:'여',patientAge:'70',patientWeight:'60',diagnosis:'시험',patientCondition:'시험',building:'본관',floorName:'7층',ward:'병동',room:'701',careType:'개인간병',startDate:'2030-01-01',publicConsent:'동의',specialNotes:joinRehabilitationNotes(fields)};
  const edited=requestForEditor(requestChanges(body),{role:'admin'});
  assert.deepEqual(splitRehabilitationNotes(edited.specialNotes),fields);
  assert.equal(joinRehabilitationNotes(splitRehabilitationNotes(edited.specialNotes)),body.specialNotes);
});
test('choosing none removes stale treatment details; clearing status removes block',()=>{
  const fields={specialNotes:'기존 메모',rehabStatus:'없음',rehabType:'이전 치료'};
  assert.equal(splitRehabilitationNotes(joinRehabilitationNotes(fields)).rehabType,'');
  assert.equal(joinRehabilitationNotes({...fields,rehabStatus:''}),'기존 메모');
});
test('optional blank notes and details survive server whitespace trimming',()=>{
  const value=joinRehabilitationNotes({rehabStatus:'치료 예정'}).trim();
  assert.equal(splitRehabilitationNotes(value).rehabStatus,'치료 예정');
  assert.equal(splitRehabilitationNotes(value).specialNotes,'');
  assert.equal(splitRehabilitationNotes(value).rehabPrecautions,'');
});
