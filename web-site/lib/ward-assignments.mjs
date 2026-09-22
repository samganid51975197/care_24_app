import {encryptText,decryptText} from './data-crypto.mjs';
export class WardError extends Error { constructor(status,message){super(message);this.status=status;} }
export function checkWardAccess(actor,hospitalId){
 if(!['admin','hospital'].includes(actor.role))throw new WardError(403,'침상 배정은 관리자와 해당 병원 담당자만 이용할 수 있습니다.');
 if(actor.role==='hospital'&&(!actor.hospitalId||actor.hospitalId!==hospitalId))throw new WardError(403,'소속 병원의 자료만 이용할 수 있습니다.');
}
export async function ensureWardAssignments(db){await db.execute(`CREATE TABLE IF NOT EXISTS ward_assignments (id TEXT PRIMARY KEY,hospital_id TEXT NOT NULL,building TEXT NOT NULL,ward TEXT NOT NULL,room TEXT NOT NULL,payload TEXT NOT NULL,version INTEGER NOT NULL DEFAULT 1,updated_at TEXT NOT NULL,UNIQUE(hospital_id,building,ward,room))`);}
export function unpackWard(row){return {...row,...JSON.parse(decryptText(String(row.payload),'ward_assignments.'+row.id)),payload:undefined};}
export async function saveWardBed(db,actor,b){
 const text=(v,max)=>{if(typeof v!=='string'||v.trim().length>max)throw new WardError(400,'입력 내용을 확인해 주세요.');return v.trim();};
 const hospitalId=text(b.hospitalId,100),building=text(b.building,10),ward=text(b.ward,100),room=text(b.room,40);
 checkWardAccess(actor,hospitalId);
 const slot=Number(b.slot),capacity=Number(b.capacity),number=text(b.number,20),patient=text(b.patient,80),caregiver=text(b.caregiver,80);
 if(!hospitalId||!['1동','2동','본관','신관'].includes(building)||!ward||!room||!number||!Number.isInteger(capacity)||capacity<1||capacity>6||!Number.isInteger(slot)||slot<1||slot>capacity||!['왼쪽','오른쪽'].includes(b.toilet))throw new WardError(400,'병실명, 침상번호와 병실 종류를 확인해 주세요.');
 await ensureWardAssignments(db);
 const tx=await db.transaction('write');
 try{
  if(!(await tx.execute({sql:'SELECT id FROM auth_hospitals WHERE id=?',args:[hospitalId]})).rows.length)throw new WardError(400,'등록된 병원을 선택해 주세요.');
  const row=(await tx.execute({sql:'SELECT * FROM ward_assignments WHERE hospital_id=? AND building=? AND ward=? AND room=?',args:[hospitalId,building,ward,room]})).rows[0];
  if(Number(b.version)!==Number(row?.version||0))throw new WardError(409,'다른 담당자가 수정했습니다. 병실을 다시 불러온 뒤 저장해 주세요.');
  const old=row?unpackWard(row):{beds:{}};
  if(Object.entries(old.beds).some(([key,value])=>Number(key)>capacity&&(value.patient||value.caregiver)))throw new WardError(400,'기존 배정이 있는 침상은 숨길 수 없습니다. 먼저 해당 침상 배정을 비워 주세요.');
  const beds=Object.fromEntries(Object.entries(old.beds).filter(([key])=>Number(key)<=capacity));
  for(let n=1;n<=capacity;n++)if(n!==slot&&(beds[n]?.number||String(n))===number)throw new WardError(400,'같은 병실에 동일한 침상번호가 있습니다. 다른 번호를 입력해 주세요.');
  beds[slot]={number,patient,caregiver};
  const id=row?.id||crypto.randomUUID(),version=Number(row?.version||0)+1,updatedAt=new Date().toISOString();
  const payload=encryptText(JSON.stringify({beds,capacity,toilet:b.toilet}),'ward_assignments.'+id);
  await tx.execute({sql:'INSERT INTO ward_assignments(id,hospital_id,building,ward,room,payload,version,updated_at) VALUES(?,?,?,?,?,?,?,?) ON CONFLICT(hospital_id,building,ward,room) DO UPDATE SET payload=excluded.payload,version=excluded.version,updated_at=excluded.updated_at',args:[id,hospitalId,building,ward,room,payload,version,updatedAt]});
  await tx.execute({sql:'INSERT INTO auth_audit(actor_id,target_id,action,created_at) VALUES(?,?,?,?)',args:[actor.id,'ward_assignments:'+id,'save_bed:'+slot,Date.now()]});
  await tx.commit();return {id,hospital_id:hospitalId,building,ward,room,beds,capacity,toilet:b.toilet,version,updated_at:updatedAt};
 }catch(e){await tx.rollback();throw e;}finally{tx.close();}
}

