import test from 'node:test';
import assert from 'node:assert/strict';
import {createClient} from '@libsql/client';
import {hospitalRecord} from '../lib/hospital-selection.mjs';
import fs from 'node:fs';
import vm from 'node:vm';
import {drizzle} from 'drizzle-orm/libsql';
import {sqliteTable,text,integer} from 'drizzle-orm/sqlite-core';
import {recordScope,hospitalFilter} from '../lib/hospital-scope.mjs';
test('hospital filters preserve owner and staff authorization and isolate legacy Bundang records',async()=>{
 const client=createClient({url:'file::memory:'});
 try{
 await client.execute('CREATE TABLE records(id INTEGER,hospital_id TEXT,owner_id TEXT)');
 await client.execute("INSERT INTO records VALUES(1,'a','one'),(2,'b','one'),(3,NULL,'one'),(4,'b','two')");
 const table=sqliteTable('records',{id:integer('id'),hospitalId:text('hospital_id'),ownerUserId:text('owner_id')});const db=drizzle(client);
 const ids=async actor=>(await db.select().from(table).where(recordScope(table,actor))).map(r=>r.id);
 assert.deepEqual(await ids({role:'admin',contextHospitalId:'b'}),[2,4]);
 assert.deepEqual(await ids({role:'hospital',hospitalId:'a',contextHospitalId:'b'}),[]);
 assert.deepEqual(await ids({role:'caregiver',id:'one',contextHospitalId:'b'}),[2]);
 assert.deepEqual(await ids({role:'admin',contextHospitalId:'a',legacyHospital:true}),[1,3]);
 assert.deepEqual((await db.select().from(table).where(hospitalFilter(table,{contextHospitalId:'b'}))).map(r=>r.id),[2,4]);
 }finally{client.close();}
});
test('hospital identity keeps existing IDs and does not merge hospitals with the same name',async()=>{
 const db=createClient({url:'file::memory:'});
 try{
 await db.execute('CREATE TABLE auth_hospitals(id TEXT PRIMARY KEY,name TEXT)');
 await db.execute("INSERT INTO auth_hospitals VALUES('existing-a','병원 A'),('other','동명병원'),('same-2','동명병원')");
 const catalog=[{id:'a',name:'병원 A'},{id:'same-1',name:'동명병원'},{id:'same-2',name:'동명병원'}];
 assert.equal(await hospitalRecord(db,catalog,'a'),'existing-a');
 assert.equal(await hospitalRecord(db,catalog,'same-1'),null);
 assert.equal(await hospitalRecord(db,catalog,'same-2'),'same-2');
 assert.equal(await hospitalRecord(db,catalog,'unknown'),null);
 }finally{db.close();}
});
test('every general, nursing, rehabilitation and hospice detail opens its working hospital app',()=>{
 const base=new URL('../public/regional/',import.meta.url);
 const catalog=JSON.parse(fs.readFileSync(new URL('../lib/hospital-catalog.json',import.meta.url),'utf8'));
 let target='';const location={hash:'#hospital/boramae',replace:url=>{target=url}};
 const context=vm.createContext({document:{querySelector:()=>({})},location,window:{location,top:{location:{href:''}},addEventListener(){}},scrollTo(){}});
 for(const name of ['hospitals.js','care-facilities.js','inpatient-hospitals.js','hospice-directory.js','directory-navigation.js'])vm.runInContext(fs.readFileSync(new URL(name,base),'utf8'),context);
 for(const h of catalog){target='';context.window.top.location.href='';location.hash='#'+(h.kind?'care-facility':'hospital')+'/'+h.id;vm.runInContext('route()',context);assert.equal(target||context.window.top.location.href,h.id==='snubh'?'/':h.name==='혜민병원'?'/hospitals/hyemin':'/hospitals/'+encodeURIComponent(h.id),h.name);}
});
