import {getClient} from '../../../../db';
import {AccessError, privateJson, withActor} from '../../../../lib/auth';
export const GET=(req:Request)=>withActor(req,async()=>{
  const db=getClient();
  const users=await db.execute('SELECT id,username,name,requested_role,requested_hospital,role,hospital_id,status,created_at FROM auth_users ORDER BY created_at DESC LIMIT 500');
  const hospitals=await db.execute('SELECT id,name FROM auth_hospitals ORDER BY name');
  return privateJson({users:users.rows,hospitals:hospitals.rows});
},true);
export const POST=(req:Request)=>withActor(req,async(actor)=>{
  const b=await req.json(), db=getClient();
  if(b.action==='hospital') {
    const name=String(b.name||'').trim();
    if(!name||name.length>120) throw new AccessError(400,'병원명을 확인해 주세요.');
    await db.execute({sql:'INSERT INTO auth_hospitals(id,name) VALUES(?,?)',args:[crypto.randomUUID(),name]});
    return privateJson({ok:true});
  }
  if(b.id===actor.id) throw new AccessError(400,'본인 관리자 권한은 이 화면에서 변경할 수 없습니다.');
  const target=(await db.execute({sql:'SELECT id,role,status FROM auth_users WHERE id=?',args:[String(b.id)]})).rows[0];
  if(!target) throw new AccessError(404,'계정을 찾을 수 없습니다.');
  if(target.role==='admin') throw new AccessError(403,'관리자 계정 변경은 서버 관리 절차를 이용해 주세요.');
  if(!['active','rejected','suspended'].includes(b.status)||!['hospital','caregiver'].includes(b.role)) throw new AccessError(400,'역할과 처리 상태를 확인해 주세요.');
  const hospitalId=String(b.hospitalId||'');
  if(b.status==='active' && !(await db.execute({sql:'SELECT id FROM auth_hospitals WHERE id=?',args:[hospitalId]})).rows.length) throw new AccessError(400,'승인할 소속 병원을 지정해 주세요.');
  await db.batch([
    {sql:'UPDATE auth_users SET role=?,hospital_id=?,status=? WHERE id=?',args:[b.role,hospitalId||null,b.status,b.id]},
    {sql:'DELETE FROM auth_sessions WHERE user_id=?',args:[b.id]},
    {sql:'INSERT INTO auth_audit(actor_id,target_id,action,created_at) VALUES(?,?,?,?)',args:[actor.id,b.id,JSON.stringify({status:b.status,role:b.role,hospitalId}),Date.now()]}
  ],'write');
  return privateJson({ok:true});
},true);
