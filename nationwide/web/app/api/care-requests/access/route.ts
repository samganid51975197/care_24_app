import {getClient,getDb} from '@/db';
import {careRequests} from '@/db/schema';
import {and,eq} from 'drizzle-orm';
import {AccessError,privateJson,rateLimit,requireOrigin} from '@/lib/auth';
import {hashPassword,verifyPassword} from '@/lib/auth-crypto.mjs';
import {accessPhoneHash,assertPin,clientRateKey,ensurePublicCareRequestAccess,normalizePhone,trustedClientIp} from '@/lib/public-care-request-access.mjs';

const lockMs=15*60*1000, maxAttempts=5;
function secret(){const value=process.env.CARE24_REQUEST_ACCESS_PEPPER;if(!value)throw new AccessError(503,'공개 의뢰 보안 설정이 완료되지 않았습니다.');return value;}
async function verifiedAccess(body:Record<string,unknown>){
 const pin=assertPin(body.pin), key=accessPhoneHash(normalizePhone(body.phone),secret()), db=getClient();await ensurePublicCareRequestAccess(db);
 const rows=(await db.execute({sql:'SELECT * FROM care_request_access WHERE phone_hash=?',args:[key]})).rows;
 if(!rows.length)throw new AccessError(401,'전화번호 또는 4자리 비밀번호가 일치하지 않습니다.');
 const now=Date.now();if(rows.some((row:any)=>Number(row.locked_until)>now))throw new AccessError(429,'5회 오류로 15분 동안 확인이 잠겼습니다.');
 const matched=[];for(const row of rows)if(await verifyPassword(pin,String(row.pin_hash)))matched.push(row);
 if(!matched.length){for(const row of rows){const attempts=Number(row.failed_attempts)+1,locked=attempts>=maxAttempts?now+lockMs:0;await db.execute({sql:'UPDATE care_request_access SET failed_attempts=?,locked_until=? WHERE request_id=?',args:[locked?0:attempts,locked,Number(row.request_id)]});}throw new AccessError(401,'전화번호 또는 4자리 비밀번호가 일치하지 않습니다.');}
 for(const row of matched)await db.execute({sql:'UPDATE care_request_access SET failed_attempts=0,locked_until=0 WHERE request_id=?',args:[Number(row.request_id)]});
 return matched.map((row:any)=>Number(row.request_id));
}
export async function POST(req:Request){try{requireOrigin(req);const ip=trustedClientIp(req),body=await req.json() as Record<string,unknown>;await rateLimit(`public-care-access:${clientRateKey(ip,secret())}`,20);const ids=await verifiedAccess(body);if(String(body.action)!=='publish')throw new AccessError(403,'본인 의뢰의 상세 조회·수정은 지원하지 않습니다. 공개 전 의뢰 내용은 관리자만 확인할 수 있습니다.');
 const id=Number(body.requestId);if(!ids.includes(id))throw new AccessError(403,'본인 의뢰만 처리할 수 있습니다.');
 const [request]=await getDb().select({status:careRequests.status}).from(careRequests).where(eq(careRequests.id,id));if(!request)throw new AccessError(404,'의뢰를 찾을 수 없습니다.');
 if(String(body.publicConsent)!=='동의')throw new AccessError(400,'상황판 공개를 위해 민감정보 공개 동의가 필요합니다.');if(request.status!=='draft')throw new AccessError(409,'이미 상황판에 공개되었거나 공개할 수 없는 의뢰입니다.');const [published]=await getDb().update(careRequests).set({status:'requesting',publicConsent:'동의'}).where(and(eq(careRequests.id,id),eq(careRequests.status,'draft'))).returning({id:careRequests.id});if(!published)throw new AccessError(409,'의뢰 상태가 변경되었습니다. 다시 확인해 주세요.');return privateJson({id,status:'requesting',publicStatus:'공개 완료'});
}catch(e){return privateJson({error:e instanceof Error?e.message:'의뢰 확인을 처리하지 못했습니다.'},e instanceof AccessError?e.status:400);}}
