import {getClient} from '../../../../db';
import {AccessError,privateJson,rateLimit,requireOrigin} from '../../../../lib/auth';
import {hashPassword,tokenHash} from '../../../../lib/auth-crypto.mjs';
export async function POST(req:Request){try{
 requireOrigin(req);await rateLimit('bootstrap',10);
 const b=await req.json();
 if(typeof b.password!=='string'||b.password.length<12||b.password.length>128)throw new AccessError(400,'비밀번호는 12~128자로 입력해 주세요.');
 const db=getClient(),hash=tokenHash(String(b.token||''));
 const setup=(await db.execute({sql:'SELECT id FROM auth_bootstrap WHERE id=1 AND token_hash=? AND expires_at>?',args:[hash,Date.now()]})).rows[0];
 if(!setup)throw new AccessError(403,'설정 링크가 만료되었거나 유효하지 않습니다.');
 const passwordHash=await hashPassword(b.password);
 const tx=await db.transaction('write');
 try{
  const consumed=await tx.execute({sql:'DELETE FROM auth_bootstrap WHERE id=1 AND token_hash=? AND expires_at>? RETURNING id',args:[hash,Date.now()]});
  if(!consumed.rows.length)throw new AccessError(403,'이미 사용한 설정 링크입니다.');
  if((await tx.execute("SELECT id FROM auth_users WHERE role='admin'")).rows.length)throw new AccessError(403,'초기 관리자 설정은 이미 완료되었습니다.');
  await tx.execute({sql:"INSERT INTO auth_users(id,username,name,password_hash,requested_role,requested_hospital,role,status,created_at) VALUES(?,?,?,?,'admin','','admin','active',?)",args:[crypto.randomUUID(),'samganid5197','황세옥',passwordHash,Date.now()]});
  await tx.commit();
 }catch(e){await tx.rollback();throw e;}finally{tx.close();}
 return privateJson({ok:true});
}catch(e){return privateJson({error:e instanceof AccessError?e.message:'관리자 설정 실패'},e instanceof AccessError?e.status:500);}}
