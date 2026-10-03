import {getClient} from '../../../../db';
import {AccessError,privateJson,withActor} from '../../../../lib/auth';
const tables=['applications','document_bundles','privacy_consents','care_contracts','submissions','care_requests','board_posts'];
export const POST=(req:Request)=>withActor(req,async actor=>{
 const b=await req.json(),table=String(b.table),id=Number(b.id),hospitalId=String(b.hospitalId||''),ownerId=String(b.ownerUserId||'');
 if(!tables.includes(table)||!Number.isSafeInteger(id)||id<1)throw new AccessError(400,'자료 종류와 번호를 확인해 주세요.');
 const db=getClient();
 if(!(await db.execute({sql:'SELECT id FROM auth_hospitals WHERE id=?',args:[hospitalId]})).rows.length)throw new AccessError(400,'등록된 병원을 선택해 주세요.');
 if(ownerId && !(await db.execute({sql:"SELECT id FROM auth_users WHERE id=? AND hospital_id=? AND status='active' AND role='caregiver'",args:[ownerId,hospitalId]})).rows.length)throw new AccessError(400,'해당 병원의 승인된 간병인을 선택해 주세요.');
 const result=await db.batch([
  {sql:`UPDATE ${table} SET owner_user_id=?,hospital_id=? WHERE id=? RETURNING id`,args:[ownerId||null,hospitalId,id]},
  {sql:'INSERT INTO auth_audit(actor_id,target_id,action,created_at) VALUES(?,?,?,?)',args:[actor.id,`${table}:${id}`,JSON.stringify({hospitalId,ownerId}),Date.now()]}
 ],'write');
 if(!result[0].rows.length)throw new AccessError(404,'자료를 찾을 수 없습니다.');
 return privateJson({ok:true});
},true);
