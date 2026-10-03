import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const root=new URL('../',import.meta.url);
const read=p=>fs.readFileSync(new URL(p,root),'utf8');
const ctx=vm.createContext({});
for(const f of ['hospitals.js','care-facilities.js','rehabilitation-departments.js','inpatient-specialties.js','korean-hospitals.js','inpatient-hospitals.js'])vm.runInContext(read('public/regional/'+f),ctx);
const rows=vm.runInContext('rehabilitationDirectory',ctx);
const catalog=JSON.parse(read('lib/hospital-catalog.json'));
test('All listed rehabilitation institutions have usable hospital routes and unique IDs',()=>{
 assert.equal(new Set(rows.map(h=>h.id)).size,rows.length);
 for(const h of rows){assert.ok(catalog.some(c=>c.id===h.id&&c.name===h.name),h.id);assert.ok(h.rehabDepartment||h.rehabDesignation);}
});
test('Registered departments expand the 71 designated institutions across all regions',()=>{
 assert.equal(rows.filter(h=>h.rehabDesignation).length,71);
 assert.equal(rows.filter(h=>h.rehabDepartment).length,1609);
 assert.equal(rows.length,1616);
 assert.equal(new Set(rows.map(h=>h.region)).size,17);
 assert.ok(rows.some(h=>h.id==='snubh'&&h.rehabDepartment));
 assert.ok(rows.some(h=>h.id==='snuh'&&h.rehabDepartment));
 assert.ok(rows.filter(h=>h.rehabDepartment).every(h=>h.address&&h.sourceDate==='2026-06'));
});
test('Nationwide directory retains all rehabilitation entries without duplicate IDs',()=>{
 const all=vm.runInContext('directoryHospitals',ctx);
 assert.equal(all.length,new Set(all.map(h=>h.id)).size);
 for(const h of rows)assert.ok(all.some(a=>a.id===h.id));
});
test('Orthopedics and plastic surgery entries have positive inpatient beds and routes',()=>{
 const entries=vm.runInContext('inpatientSpecialtyDirectory',ctx);
 assert.equal(entries.length,4427);
 assert.equal(entries.length,new Set(entries.map(h=>h.id)).size);
 assert.equal(entries.filter(h=>h.inpatientSpecialties.includes('정형외과')).length,3911);
 assert.equal(entries.filter(h=>h.inpatientSpecialties.includes('성형외과')).length,1039);
 assert.ok(entries.some(h=>h.legalType==='의원'));
 for(const h of entries){assert.ok(h.inpatientBeds>0&&h.inpatientVerified);assert.equal(h.inpatientSourceDate,'2026-06');assert.ok(catalog.some(c=>c.id===h.id));}
});
