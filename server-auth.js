// Private Worker code: never included in browser assets.
const ADMIN_COOKIE='__Host-care24_admin';
const bytesHex=bytes=>Array.from(new Uint8Array(bytes),b=>b.toString(16).padStart(2,'0')).join('');
const randomHex=size=>bytesHex(crypto.getRandomValues(new Uint8Array(size)));
const digest=async value=>bytesHex(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value)));
function sessionToken(request){return (request.headers.get('Cookie')||'').split(';').map(x=>x.trim()).find(x=>x.startsWith(ADMIN_COOKIE+'='))?.slice(ADMIN_COOKIE.length+1)||''}
async function passwordHash(password,salt){const key=await crypto.subtle.importKey('raw',new TextEncoder().encode(password),'PBKDF2',false,['deriveBits']);return bytesHex(await crypto.subtle.deriveBits({name:'PBKDF2',hash:'SHA-512',salt:new TextEncoder().encode(salt),iterations:100000},key,512))}
function sameHash(a,b){let difference=a.length^b.length;for(let i=0;i<Math.max(a.length,b.length);i++)difference|=(a.charCodeAt(i)||0)^(b.charCodeAt(i)||0);return difference===0}
async function resolveUser(request,env){
 const token=sessionToken(request);
 if(/^[a-f0-9]{64}$/.test(token)){const session=await env.DB.prepare('SELECT token_hash FROM admin_sessions WHERE token_hash=? AND expires_at>?').bind(await digest(token),Date.now()).first();if(session)return {id:'care24-password-admin',email:'',admin:true}}
 return userFrom(request);
}
function withAdminCookie(response,token){response.headers.set('Set-Cookie',ADMIN_COOKIE+'='+token+'; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age='+(token?28800:0));return response}
async function startAdminSession(env){const token=randomHex(32);await env.DB.batch([env.DB.prepare('DELETE FROM admin_sessions WHERE expires_at<=?').bind(Date.now()),env.DB.prepare('INSERT INTO admin_sessions(token_hash,expires_at) VALUES(?,?)').bind(await digest(token),Date.now()+28800000)]);return withAdminCookie(json({ok:true,admin:true}),token)}
async function adminAuth(request,env,path){
 if(path==='state'){
  if(request.method!=='GET')return json({error:'허용되지 않은 요청입니다.'},405);
  const exists=await env.DB.prepare('SELECT id FROM admin_accounts WHERE id=1').first();
  const user=await resolveUser(request,env);
  return json({configured:!!exists,setupAllowed:!exists&&isPlatformAdmin(userFrom(request)),admin:isAdmin(user)});
 }
 if(!['login','setup','logout'].includes(path))return json({error:'찾을 수 없습니다.'},404);
 if(request.method!=='POST')return json({error:'허용되지 않은 요청입니다.'},405);
 if(request.headers.get('Origin')!==new URL(request.url).origin||!request.headers.get('Content-Type')?.startsWith('application/json'))return json({error:'허용되지 않은 전송 요청입니다.'},403);
 if(path==='logout'){const token=sessionToken(request);if(token)await env.DB.prepare('DELETE FROM admin_sessions WHERE token_hash=?').bind(await digest(token)).run();return withAdminCookie(json({ok:true}),'')}
 let data;try{const raw=await request.text();if(raw.length>2048)return json({error:'입력이 너무 깁니다.'},400);data=JSON.parse(raw)}catch{return json({error:'입력을 확인해 주세요.'},400)}
 if(!data||typeof data.username!=='string'||typeof data.password!=='string'||data.password.length>128)return json({error:'아이디와 비밀번호를 확인해 주세요.'},400);
 const username=data.username.trim().toLowerCase(),password=data.password;
 if(path==='setup'){
  if(!isPlatformAdmin(userFrom(request)))return json({error:'최초 계정 설정은 사이트 소유자만 할 수 있습니다.'},403);
  if(!/^[a-z0-9_.-]{3,40}$/.test(username)||password.length<12)return json({error:'아이디는 영문·숫자 등 3~40자, 비밀번호는 12자 이상으로 입력해 주세요.'},400);
  if(await env.DB.prepare('SELECT id FROM admin_accounts WHERE id=1').first())return json({error:'관리자 계정이 이미 설정되어 있습니다.'},409);
  const salt=randomHex(32),hash=await passwordHash(password,salt);
  const result=await env.DB.prepare('INSERT OR IGNORE INTO admin_accounts(id,username,password_hash,salt,created_at) VALUES(1,?,?,?,?)').bind(username,hash,salt,new Date().toISOString()).run();
  if((result.meta?.changes??result.changes)!==1)return json({error:'관리자 계정이 이미 설정되어 있습니다.'},409);
  return startAdminSession(env);
 }
 const client=await digest(request.headers.get('CF-Connecting-IP')||'unknown-client'),now=Date.now();
 await env.DB.prepare('DELETE FROM admin_login_attempts WHERE attempted_at<?').bind(now-900000).run();
 const rate=await env.DB.prepare('SELECT COUNT(*) AS count FROM admin_login_attempts WHERE client_key=? AND attempted_at>=?').bind(client,now-900000).first();
 if(Number(rate?.count)>=8)return json({error:'로그인 시도가 많습니다. 15분 후 다시 시도해 주세요.'},429);
 await env.DB.prepare('INSERT INTO admin_login_attempts(client_key,attempted_at) VALUES(?,?)').bind(client,now).run();
 const account=await env.DB.prepare('SELECT username,password_hash,salt FROM admin_accounts WHERE id=1').first();
 const candidate=await passwordHash(password,account?.salt||'0'.repeat(64));
 if(!account||account.username!==username||!sameHash(candidate,account.password_hash))return json({error:'아이디 또는 비밀번호가 올바르지 않습니다.'},401);
 await env.DB.prepare('DELETE FROM admin_login_attempts WHERE client_key=?').bind(client).run();
 return startAdminSession(env);
}
