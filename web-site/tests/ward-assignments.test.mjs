import test from 'node:test';
import assert from 'node:assert/strict';
import {createClient} from '@libsql/client';
import {mkdtempSync,writeFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {randomBytes} from 'node:crypto';
import {saveWardBed,unpackWard,checkWardAccess} from '../lib/ward-assignments.mjs';
test('encrypted bed records persist; access, duplicate numbers and stale writes are rejected',async()=>{
 const dir=mkdtempSync(join(tmpdir(),'care24-bed-test-')),previous=process.env.CARE24_KEY_FILE;
 process.env.CARE24_KEY_FILE=join(dir,'key.json');writeFileSync(process.env.CARE24_KEY_FILE,JSON.stringify({active:'test',keys:{test:randomBytes(32).toString('base64')}}));
 const db=createClient({url:'file::memory:'});
 try{
  await db.batch(['CREATE TABLE auth_hospitals(id TEXT PRIMARY KEY,name TEXT)','CREATE TABLE auth_audit(actor_id TEXT,target_id TEXT,action TEXT,created_at INTEGER)',"INSERT INTO auth_hospitals VALUES('h1','시험병원')"],'write');
  const actor={id:'a',role:'admin'},body={hospitalId:'h1',building:'1동',ward:'7층 · 71병동',room:'시험병실',slot:1,capacity:4,toilet:'왼쪽',number:'A1',patient:'테스트환자',caregiver:'테스트간병인',version:0};
  const first=await saveWardBed(db,actor,body);
  const raw=(await db.execute('SELECT * FROM ward_assignments')).rows[0];
  assert.ok(String(raw.payload).startsWith('care24enc:v1:'));assert.ok(!String(raw.payload).includes(body.patient));assert.equal(unpackWard(raw).beds[1].patient,body.patient);
  assert.throws(()=>checkWardAccess({role:'caregiver',hospitalId:'h1'},'h1'),{status:403});
  await assert.rejects(saveWardBed(db,{role:'hospital',hospitalId:'h2'},body),{status:403});
  await assert.rejects(saveWardBed(db,actor,body),{status:409});
  await assert.rejects(saveWardBed(db,actor,{...body,version:1,slot:2}),{status:400});
  const second=await saveWardBed(db,{id:'b',role:'hospital',hospitalId:'h1'},{...body,version:1,slot:4,number:'4'});
  assert.equal(second.beds[1].number,'A1');assert.equal(second.beds[4].caregiver,body.caregiver);
  await assert.rejects(saveWardBed(db,actor,{...body,capacity:2,version:2}),{status:400});
  assert.equal((await db.execute('SELECT * FROM ward_assignments')).rows.length,1);
 }finally{db.close();if(previous)process.env.CARE24_KEY_FILE=previous;else delete process.env.CARE24_KEY_FILE;rmSync(dir,{recursive:true,force:true});}
});
