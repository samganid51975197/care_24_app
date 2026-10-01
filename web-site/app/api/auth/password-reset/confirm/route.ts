import {getClient} from "@/db";
import {AccessError,privateJson,rateLimit,requireOrigin} from "@/lib/auth";
import {hashPassword,tokenHash} from "@/lib/auth-crypto.mjs";

export const runtime="nodejs";
export async function POST(req:Request){try{
  requireOrigin(req);
  const body=await req.json(),token=String(body.token||""),password=String(body.password||"");
  if(!/^[A-Za-z0-9_-]{43}$/.test(token)||password.length<12||password.length>128)throw new AccessError(400,"재설정 정보와 비밀번호를 확인해 주세요.");
  await rateLimit(`password-reset-token:${tokenHash(token)}`,5,3600000);
  const db=getClient(),now=Date.now();await db.execute("CREATE TABLE IF NOT EXISTS auth_password_resets(token_hash TEXT PRIMARY KEY,user_id TEXT NOT NULL,expires_at INTEGER NOT NULL,created_at INTEGER NOT NULL)");
  const row=(await db.execute({sql:"SELECT user_id FROM auth_password_resets WHERE token_hash=? AND expires_at>?",args:[tokenHash(token),now]})).rows[0] as unknown as {user_id:string}|undefined;
  if(!row)throw new AccessError(403,"재설정 링크가 만료되었거나 이미 사용되었습니다.");
  const encoded=await hashPassword(password);
  await db.batch([{sql:"UPDATE auth_users SET password_hash=? WHERE id=? AND role='admin'",args:[encoded,row.user_id]},{sql:"DELETE FROM auth_sessions WHERE user_id=?",args:[row.user_id]},{sql:"DELETE FROM auth_password_resets WHERE user_id=?",args:[row.user_id]}],"write");
  return privateJson({ok:true});
}catch(e){return privateJson({error:e instanceof AccessError?e.message:"비밀번호를 재설정하지 못했습니다."},e instanceof AccessError?e.status:500);}}
