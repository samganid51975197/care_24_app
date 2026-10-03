import test from 'node:test';
import assert from 'node:assert/strict';
import {requestBoardStatus} from '../lib/request-board-status.mjs';
import {emptyWorkflow,transition} from '../lib/care-workflow.mjs';
import {changeWorkflow,readWorkflow} from '../lib/care-workflow.mjs';
import {createClient} from '@libsql/client';
import {randomBytes,randomUUID} from 'node:crypto';
import {writeFileSync,unlinkSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
test('request stays open for applications until selection and contract notification',()=>{
  const request={status:'requesting'},w=emptyWorkflow();
  const actor={id:'caregiver-a',role:'caregiver'};
  const context={status:'requesting',profile:{id:10,ownerUserId:actor.id,applicantName:'테스트 간병인'}};
  assert.equal(requestBoardStatus(request,w),'requesting');
  transition(w,{action:'save_application',note:'가능'},actor,context);
  assert.equal(requestBoardStatus(request,w),'requesting');
  transition(w,{action:'send_application',note:'가능'},actor,context);
  assert.equal(requestBoardStatus(request,w),'matching');
  transition(w,{action:'select',profileId:10},{id:'admin',role:'admin'},context);
  assert.equal(requestBoardStatus(request,w),'matching');
  w.notifiedAt='2026-09-22T00:00:00Z';
  assert.equal(requestBoardStatus(request,w),'matched');
  assert.equal(requestBoardStatus({status:'matched'},undefined),'matched');
});
test('caregiver application is persisted encrypted and reloads by request number',async()=>{
  const db=createClient({url:'file::memory:'}),keyFile=join(tmpdir(),'care24-workflow-test-'+randomUUID()+'.json');
  const previous=process.env.CARE24_KEY_FILE;
  writeFileSync(keyFile,JSON.stringify({active:'test',keys:{test:randomBytes(32).toString('base64')}}));
  process.env.CARE24_KEY_FILE=keyFile;
  try{
    await db.execute('CREATE TABLE care_requests(id INTEGER PRIMARY KEY,status TEXT,matched_at TEXT)');
    await db.execute("INSERT INTO care_requests VALUES(501,'requesting',NULL)");
    const actor={id:'test-caregiver',role:'caregiver'},context={status:'requesting',profile:{id:21,ownerUserId:'test-caregiver',applicantName:'시험 프로필'}};
    await changeWorkflow(db,501,{action:'send_application',profileId:21,note:'시험 신청'},actor,context);
    const saved=await readWorkflow(db,501);
    assert.equal(saved.applications[0].status,'sent');
    assert.equal(saved.applications[0].note,'시험 신청');
    assert.equal((await db.execute('SELECT status FROM care_requests WHERE id=501')).rows[0].status,'matching');
    const raw=String((await db.execute('SELECT payload FROM care_workflows WHERE request_id=501')).rows[0].payload);
    assert.ok(raw.startsWith('care24enc:v1:'));
    assert.ok(!raw.includes('시험 신청'));
    await assert.rejects(changeWorkflow(db,501,{action:'send_application',profileId:21},{id:'other',role:'caregiver'},context),/본인/);
  }finally{db.close();unlinkSync(keyFile);if(previous===undefined)delete process.env.CARE24_KEY_FILE;else process.env.CARE24_KEY_FILE=previous;}
});
