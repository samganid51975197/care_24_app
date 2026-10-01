import {getClient} from "@/db";
import {AccessError,privateJson,rateLimit,requireOrigin} from "@/lib/auth";
import {newToken,tokenHash} from "@/lib/auth-crypto.mjs";

export const runtime="nodejs";
const table=`CREATE TABLE IF NOT EXISTS auth_password_resets(token_hash TEXT PRIMARY KEY,user_id TEXT NOT NULL,expires_at INTEGER NOT NULL,created_at INTEGER NOT NULL)`;

export async function POST(req:Request){try{
  requireOrigin(req);
  const body=await req.json(),username=String(body.username||"").trim().toLowerCase();
  if(!/^[a-z0-9][a-z0-9_.-]{3,31}$/.test(username))throw new AccessError(400,"관리자 아이디를 확인해 주세요.");
  await rateLimit(`password-reset:${username}`,3,3600000);
  const email=process.env.CARE24_ADMIN_RECOVERY_EMAIL,apiKey=process.env.CARE24_EMAIL_API_KEY,from=process.env.CARE24_EMAIL_FROM;
  if(!email||!apiKey||!from)throw new AccessError(503,"이메일 인증 발송 설정이 준비되지 않았습니다.");
  const db=getClient();await db.execute(table);
  const user=(await db.execute({sql:"SELECT id FROM auth_users WHERE username=? AND role='admin' AND status='active'",args:[username]})).rows[0] as unknown as {id:string}|undefined;
  if(!user)return privateJson({ok:true});
  const token=newToken(),now=Date.now(),origin=(process.env.CARE24_ORIGIN||new URL(req.url).origin).replace(/\/$/,"");
  await db.batch([{sql:"DELETE FROM auth_password_resets WHERE user_id=? OR expires_at<=?",args:[user.id,now]},{sql:"INSERT INTO auth_password_resets(token_hash,user_id,expires_at,created_at) VALUES(?,?,?,?)",args:[tokenHash(token),user.id,now+15*60*1000,now]}],"write");
  const link=`${origin}/password-reset?token=${encodeURIComponent(token)}`;
  let sent:Response;try{sent=await fetch("https://api.resend.com/emails",{method:"POST",headers:{Authorization:`Bearer ${apiKey}`,"Content-Type":"application/json"},body:JSON.stringify({from,to:[email],subject:"[간병24] 관리자 비밀번호 재설정",html:`<p>관리자 비밀번호를 재설정하려면 아래 링크를 15분 안에 여세요.</p><p><a href="${link}">비밀번호 재설정</a></p><p>본인이 요청하지 않았다면 이 이메일을 무시하세요.</p>`}),signal:AbortSignal.timeout(10000)});}catch{throw new AccessError(502,"Resend 이메일 서비스에 연결하지 못했습니다.");}
  if(!sent.ok){await db.execute({sql:"DELETE FROM auth_password_resets WHERE token_hash=?",args:[tokenHash(token)]});throw new AccessError(502,"인증 이메일을 보내지 못했습니다.");}
  return privateJson({ok:true});
}catch(e){return privateJson({error:e instanceof AccessError?e.message:"인증 이메일 요청을 처리하지 못했습니다."},e instanceof AccessError?e.status:500);}}
