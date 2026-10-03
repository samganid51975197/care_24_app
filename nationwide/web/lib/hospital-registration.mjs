import {randomUUID} from 'node:crypto';
export class RegistrationError extends Error {constructor(status,message){super(message);this.status=status;}}
export async function ensureRegistrations(db){
 await db.execute(`CREATE TABLE IF NOT EXISTS hospital_caregiver_registrations (
 id TEXT PRIMARY KEY,caregiver_id TEXT NOT NULL REFERENCES auth_users(id),hospital_id TEXT NOT NULL REFERENCES auth_hospitals(id),
 association_approved_by TEXT,association_approved_at INTEGER,hospital_approved_by TEXT,hospital_approved_at INTEGER,
 closed_action TEXT,created_at INTEGER NOT NULL,updated_at INTEGER NOT NULL,UNIQUE(caregiver_id,hospital_id))`);
 await db.execute(`CREATE TABLE IF NOT EXISTS hospital_registration_audit (id INTEGER PRIMARY KEY AUTOINCREMENT,registration_id TEXT NOT NULL,actor_id TEXT NOT NULL,action TEXT NOT NULL,created_at INTEGER NOT NULL)`);
}
function guard(actor){if(!actor||actor.status!=='active'||!['admin','hospital','caregiver'].includes(actor.role))throw new RegistrationError(403,'승인된 계정으로 로그인해 주세요.');}
export function registrationStatus(r){return r.closed_action||(r.caregiver_status!=='active'?'account_inactive':r.association_approved_by&&r.hospital_approved_by?'registered':'pending');}
export async function listRegistrations(db,actor){
 guard(actor);await ensureRegistrations(db);
 const condition=actor.role==='admin'?'1=1':actor.role==='hospital'?'r.hospital_id=?':'r.caregiver_id=?';
 const args=actor.role==='admin'?[]:[actor.role==='hospital'?actor.hospitalId||'':actor.id];
 const result=await db.execute({sql:`SELECT r.*,u.name AS caregiver_name,u.status AS caregiver_status,h.name AS hospital_name FROM hospital_caregiver_registrations r JOIN auth_users u ON u.id=r.caregiver_id JOIN auth_hospitals h ON h.id=r.hospital_id WHERE ${condition} ORDER BY r.updated_at DESC`,args});
 return result.rows.map(r=>({...r,status:registrationStatus(r)}));
}
export async function changeRegistration(db,actor,input){
 guard(actor);await ensureRegistrations(db);
 const b=input&&typeof input==='object'?input:{};
 const tx=await db.transaction('write');
 try{
  const now=Date.now();let id=String(b.id||'');
  if(b.action==='apply'){
   if(actor.role!=='caregiver')throw new RegistrationError(403,'간병인 본인 계정으로 신청해 주세요.');
   const hospitalId=String(b.hospitalId||'');
   if(!(await tx.execute({sql:'SELECT id FROM auth_hospitals WHERE id=?',args:[hospitalId]})).rows.length)throw new RegistrationError(400,'등록할 병원을 선택해 주세요.');
   const previous=(await tx.execute({sql:'SELECT * FROM hospital_caregiver_registrations WHERE caregiver_id=? AND hospital_id=?',args:[actor.id,hospitalId]})).rows[0];
   if(previous&&!previous.closed_action)throw new RegistrationError(409,'이미 신청했거나 등록된 병원입니다. 진행상태를 확인해 주세요.');
   id=previous?.id||randomUUID();
   if(previous)await tx.execute({sql:'UPDATE hospital_caregiver_registrations SET association_approved_by=NULL,association_approved_at=NULL,hospital_approved_by=NULL,hospital_approved_at=NULL,closed_action=NULL,created_at=?,updated_at=? WHERE id=?',args:[now,now,id]});
   else await tx.execute({sql:'INSERT INTO hospital_caregiver_registrations(id,caregiver_id,hospital_id,created_at,updated_at) VALUES(?,?,?,?,?)',args:[id,actor.id,hospitalId,now,now]});
  }else{
   const r=(await tx.execute({sql:'SELECT r.*,u.status AS caregiver_status,u.role AS caregiver_role FROM hospital_caregiver_registrations r JOIN auth_users u ON u.id=r.caregiver_id WHERE r.id=?',args:[id]})).rows[0];
   if(!r||actor.role==='hospital'&&r.hospital_id!==actor.hospitalId||actor.role==='caregiver'&&r.caregiver_id!==actor.id)throw new RegistrationError(404,'신청을 찾을 수 없습니다.');
   if(r.closed_action)throw new RegistrationError(409,'이미 종료된 신청입니다.');
   if(b.action==='approve'){
    if(actor.role==='caregiver')throw new RegistrationError(403,'본인의 등록 신청을 승인할 수 없습니다.');
    if(r.caregiver_status!=='active'||r.caregiver_role!=='caregiver')throw new RegistrationError(409,'이용 가능한 간병인 계정인지 먼저 확인해 주세요.');
    const prefix=actor.role==='admin'?'association':'hospital';
    if(r[prefix+'_approved_by'])throw new RegistrationError(409,'이미 승인했습니다.');
    await tx.execute({sql:`UPDATE hospital_caregiver_registrations SET ${prefix}_approved_by=?,${prefix}_approved_at=?,updated_at=? WHERE id=?`,args:[actor.id,now,now,id]});
   }else if(['reject','revoke','withdraw'].includes(b.action)){
    if(actor.role==='caregiver'&&b.action!=='withdraw'||actor.role!=='caregiver'&&b.action==='withdraw')throw new RegistrationError(403,'처리 권한이 없습니다.');
    const registered=!!(r.association_approved_by&&r.hospital_approved_by);
    if(b.action==='reject'&&registered||b.action==='revoke'&&!registered)throw new RegistrationError(409,'현재 등록 상태에 맞는 처리를 선택해 주세요.');
    await tx.execute({sql:'UPDATE hospital_caregiver_registrations SET closed_action=?,updated_at=? WHERE id=?',args:[b.action,now,id]});
   }else throw new RegistrationError(400,'처리 항목을 확인해 주세요.');
  }
  await tx.execute({sql:'INSERT INTO hospital_registration_audit(registration_id,actor_id,action,created_at) VALUES(?,?,?,?)',args:[id,actor.id,actor.role+':'+b.action,now]});
  await tx.commit();return {id};
 }catch(e){await tx.rollback();throw e;}finally{tx.close();}
}
