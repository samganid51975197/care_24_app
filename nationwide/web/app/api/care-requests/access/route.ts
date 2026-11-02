import {getClient,getDb} from '@/db';
import {careRequests} from '@/db/schema';
import {eq} from 'drizzle-orm';
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
export async function POST(req:Request){try{requireOrigin(req);const ip=trustedClientIp(req),body=await req.json() as Record<string,unknown>;await rateLimit(`public-care-access:${clientRateKey(ip,secret())}`,20);const ids=await verifiedAccess(body);const action=String(body.action||'lookup');
 if(action==='lookup'){const rows=await Promise.all(ids.map(async id=>(await getDb().select().from(careRequests).where(eq(careRequests.id,id)))[0]));return privateJson({requests:rows.filter(Boolean).map(r=>({id:r.id,building:r.building,floorName:r.floorName,ward:r.ward,status:r.status,startDate:r.startDate,request:{requesterName:r.requesterName,requesterPhone:r.requesterPhone,patientName:r.patientName,patientGender:r.patientGender,patientBirthYear:r.patientBirthYear,patientAge:r.patientAge,patientWeight:r.patientWeight,diagnosis:r.diagnosis,patientCondition:r.patientCondition,precautions:r.precautions,specialNotes:r.specialNotes,building:r.building,floorName:r.floorName,ward:r.ward,room:r.room,careType:r.careType,startDate:r.startDate,requestNote:r.requestNote,desiredGender:r.desiredGender,desiredNationality:r.desiredNationality,desiredExpertise:r.desiredExpertise,desiredAge:r.desiredAge,desiredPersonality:r.desiredPersonality,desiredOther:r.desiredOther}}))});}
 const id=Number(body.requestId);if(!ids.includes(id))throw new AccessError(403,'본인 의뢰만 처리할 수 있습니다.');
 if(action==='cancel'){await getDb().update(careRequests).set({status:'cancelled',publicConsent:'미동의'}).where(eq(careRequests.id,id));return privateJson({id,status:'cancelled'});}
 if(action==='update'){const input=(body.request||{}) as Record<string,unknown>,allowed=['requesterName','requesterPhone','patientName','patientGender','patientBirthYear','patientAge','patientWeight','diagnosis','patientCondition','precautions','specialNotes','building','floorName','ward','room','careType','startDate','requestNote','desiredGender','desiredNationality','desiredExpertise','desiredAge','desiredPersonality','desiredOther'];const changes=Object.fromEntries(allowed.filter(key=>Object.hasOwn(input,key)).map(key=>[key,String(input[key]||'').trim()]));if(!Object.keys(changes).length)throw new AccessError(400,'수정할 내용을 입력해 주세요.');await getDb().update(careRequests).set(changes).where(eq(careRequests.id,id));return privateJson({id,status:'updated'});}
 throw new AccessError(400,'처리 방법을 확인해 주세요.');
}catch(e){return privateJson({error:e instanceof Error?e.message:'의뢰 확인을 처리하지 못했습니다.'},e instanceof AccessError?e.status:400);}}
