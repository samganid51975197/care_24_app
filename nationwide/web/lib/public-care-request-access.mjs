import {createHmac} from 'node:crypto';

export function normalizePhone(value){
  const phone=String(value||'').replace(/\D/g,'');
  if(!/^01\d{8,9}$/.test(phone))throw Error('연락처를 확인해 주세요.');
  return phone;
}
export function assertPin(value){
  const pin=String(value||'');
  if(!/^\d{4}$/.test(pin))throw Error('숫자 4자리 비밀번호를 입력해 주세요.');
  return pin;
}
export function keyedHash(value,secret){
  if(!secret)throw Error('공개 의뢰 보안 설정이 완료되지 않았습니다.');
  return createHmac('sha256',secret).update(value).digest('hex');
}
export function accessPhoneHash(phone,secret){return keyedHash(normalizePhone(phone),secret);}
export function clientRateKey(ip,secret){return keyedHash(`client-ip:${ip}`,secret);}
export const contractOnlyFields=['careFee','feePeriod','paymentMethod','paymentDue','contractNote','contractVersion','contractSignedAt'];
export function assertNoNonAdminContractFields(body){
 if(contractOnlyFields.some(key=>String(body?.[key]||'').trim()))throw Error('간병비·계약금액은 관리자만 입력할 수 있습니다.');
}
export function canSelfServiceRequest(status){return ['draft','requesting'].includes(String(status));}
export async function ensurePublicCareRequestAccess(db){
  await db.execute(`CREATE TABLE IF NOT EXISTS care_request_access (
    request_id INTEGER PRIMARY KEY,
    phone_hash TEXT NOT NULL,
    pin_hash TEXT NOT NULL,
    failed_attempts INTEGER NOT NULL DEFAULT 0,
    locked_until INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`);
  await db.execute('CREATE INDEX IF NOT EXISTS care_request_access_phone_idx ON care_request_access(phone_hash)');
}
export function trustedClientIp(req){
  const value=req.headers.get('x-care24-client-ip')||'';
  if(process.env.NODE_ENV!=='production'&&(!value||value==='127.0.0.1'||value==='::1'))return 'local-preview';
  if(process.env.CARE24_TRUSTED_PROXY!=='gabia-nginx'||!/^(?:\d{1,3}\.){3}\d{1,3}$|^[0-9a-f:]+$/i.test(value))throw Error('공개 의뢰 접수 보안 게이트웨이 설정이 필요합니다.');
  return value;
}
