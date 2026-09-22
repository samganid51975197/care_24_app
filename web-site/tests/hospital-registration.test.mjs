import test from 'node:test';
import assert from 'node:assert/strict';
import {createClient} from '@libsql/client';
import {changeRegistration,listRegistrations} from '../lib/hospital-registration.mjs';
test('two independent approvals, tenant isolation, withdrawal and fresh reapplication',async()=>{
 const db=createClient({url:':memory:'});
 await db.execute('CREATE TABLE auth_users(id TEXT PRIMARY KEY,name TEXT,status TEXT,role TEXT)');
 await db.execute('CREATE TABLE auth_hospitals(id TEXT PRIMARY KEY,name TEXT)');
 await db.execute("INSERT INTO auth_users VALUES('c','간병인','active','caregiver'),('d','다른 간병인','active','caregiver')");
 await db.execute("INSERT INTO auth_hospitals VALUES('A','병원A'),('B','병원B')");
 const c={id:'c',role:'caregiver',status:'active'},d={id:'d',role:'caregiver',status:'active'},a={id:'admin',role:'admin',status:'active'},ha={id:'ha',role:'hospital',hospitalId:'A',status:'active'},hb={id:'hb',role:'hospital',hospitalId:'B',status:'active'};
 try{
 const{id}=await changeRegistration(db,c,{action:'apply',hospitalId:'A'});
 await assert.rejects(changeRegistration(db,c,{action:'apply',hospitalId:'A'}),{status:409});
 await assert.rejects(changeRegistration(db,c,{action:'approve',id}),{status:403});
 await assert.rejects(changeRegistration(db,hb,{action:'approve',id}),{status:404});
 await assert.rejects(changeRegistration(db,d,{action:'withdraw',id}),{status:404});
 assert.equal((await listRegistrations(db,hb)).length,0);assert.equal((await listRegistrations(db,d)).length,0);
 await changeRegistration(db,a,{action:'approve',id});
 assert.equal((await listRegistrations(db,c))[0].status,'pending');
 await changeRegistration(db,ha,{action:'approve',id});
 assert.equal((await listRegistrations(db,c))[0].status,'registered');
 await changeRegistration(db,ha,{action:'revoke',id});
 assert.equal((await listRegistrations(db,c))[0].status,'revoke');
 await changeRegistration(db,c,{action:'apply',hospitalId:'A'});
 assert.equal((await listRegistrations(db,c))[0].association_approved_by,null);
 await changeRegistration(db,ha,{action:'approve',id});
 assert.equal((await listRegistrations(db,c))[0].status,'pending');
 await changeRegistration(db,a,{action:'approve',id});
 assert.equal((await listRegistrations(db,c))[0].status,'registered');
 await db.execute("UPDATE auth_users SET status='suspended' WHERE id='c'");
 assert.equal((await listRegistrations(db,a))[0].status,'account_inactive');
 assert.equal(Number((await db.execute('SELECT count(*) AS n FROM hospital_registration_audit')).rows[0].n),7);
 }finally{db.close();}
});
