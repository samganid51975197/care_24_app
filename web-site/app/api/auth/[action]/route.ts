import { getClient } from "../../../../db";
import { AccessError, currentActor, privateJson, rateLimit, readToken, requireOrigin, sessionCookie } from "../../../../lib/auth";
import { hashPassword, newToken, tokenHash, verifyPassword } from "../../../../lib/auth-crypto.mjs";
import { isLegacyPreviewLogout } from "../../../../lib/logout-origin.mjs";
export const runtime = "nodejs";
const actionOf = (req: Request) => new URL(req.url).pathname.split('/').pop();
export async function GET(req: Request) {
  if (actionOf(req) !== 'me') return privateJson({error:"찾을 수 없습니다."},404);
  try { return privateJson({user:await currentActor(req)}); } catch { return privateJson({error:"로그인 상태 확인 실패"},503); }
}
export async function POST(req: Request) {
  try {
    const action = actionOf(req);
    const legacyLogout = action === 'logout' && isLegacyPreviewLogout(req);
    if (!legacyLogout) requireOrigin(req);
    const db = getClient();
    if (action === 'logout') {
      await db.execute({sql:'DELETE FROM auth_sessions WHERE token_hash=?',args:[tokenHash(readToken(req))]});
      const clearCookie = legacyLogout
        ? 'care24_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0'
        : sessionCookie('',true);
      return privateJson({ok:true},200,{'Set-Cookie':clearCookie});
    }
    if (!['signup','login'].includes(action || '')) return privateJson({error:"찾을 수 없습니다."},404);
    if (Number(req.headers.get('content-length')) > 8192) throw new AccessError(413,"입력이 너무 깁니다.");
    const raw=await req.text(); if(raw.length>8192)throw new AccessError(413,"입력이 너무 깁니다.");
    const b = JSON.parse(raw), username = String(b.username || '').trim().toLowerCase(), password = String(b.password || '');
    if (!/^[a-z0-9][a-z0-9_.-]{3,31}$/.test(username) || password.length<12 || password.length>128) throw new AccessError(400,"아이디는 영문·숫자 등 4~32자, 비밀번호는 12~128자로 입력해 주세요.");
    await rateLimit('auth-global',100);
    await rateLimit(`auth-user:${username}`,10);
    if (action === 'signup') {
      await rateLimit('signup-global',20,3600000);
      const name=String(b.name || '').trim(), requestedRole=String(b.role), requestedHospital=String(b.hospital || '').trim();
      if (!name || name.length>80 || !['caregiver','hospital'].includes(requestedRole) || !requestedHospital || requestedHospital.length>120) throw new AccessError(400,"이름, 신청 역할, 소속 병원을 확인해 주세요.");
      if(username==='samganid5197') throw new AccessError(400,'관리자 예약 계정입니다. 초기 관리자 설정을 이용해 주세요.');
      const exists=await db.execute({sql:'SELECT id FROM auth_users WHERE username=?',args:[username]});
      if(exists.rows.length) throw new AccessError(409,"사용할 수 없는 아이디입니다.");
      const encoded=await hashPassword(password);
      await db.execute({sql:`INSERT INTO auth_users(id,username,name,password_hash,requested_role,requested_hospital,role,status,created_at) VALUES(?,?,?,?,?,?,'caregiver','pending',?)`,args:[crypto.randomUUID(),username,name,encoded,requestedRole,requestedHospital,Date.now()]});
      return privateJson({ok:true,message:"가입 신청이 완료되었습니다. 관리자 승인 후 이용할 수 있습니다."},201);
    }
    const found=await db.execute({sql:'SELECT * FROM auth_users WHERE username=?',args:[username]});
    const user=found.rows[0];
    const dummy='scrypt-v1$00000000000000000000000000000000$'+'00'.repeat(64);
    const valid=await verifyPassword(password,String(user?.password_hash || dummy));
    if (!user || !valid) throw new AccessError(401,"아이디 또는 비밀번호가 올바르지 않습니다.");
    if(user.status!=='active') throw new AccessError(403,user.status==='pending'?"관리자 승인 대기 중입니다.":"이용이 제한된 계정입니다. 관리자에게 문의해 주세요.");
    const token=newToken();
    await db.execute({sql:'DELETE FROM auth_sessions WHERE expires_at<=?',args:[Date.now()]});
    await db.execute({sql:'INSERT INTO auth_sessions(token_hash,user_id,expires_at) VALUES(?,?,?)',args:[tokenHash(token),user.id,Date.now()+28800000]});
    return privateJson({ok:true},200,{'Set-Cookie':sessionCookie(token)});
  } catch(e) { return privateJson({error:e instanceof AccessError?e.message:"로그인 요청을 처리하지 못했습니다."},e instanceof AccessError?e.status:500); }
}
