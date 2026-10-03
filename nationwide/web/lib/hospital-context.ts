import {getClient} from '@/db';
import {AccessError,type Actor} from './auth';
import catalog from './hospital-catalog.json';
import {hospitalRecord} from './hospital-selection.mjs';

export async function resolveHospital(id:string,actor:Actor,writing=false){
 if(id==='hyemin')id=catalog.find(h=>h.name==='혜민병원')!.id;
 const hospital=catalog.find(h=>h.id===id);
 if(!hospital)throw new AccessError(400,'병원을 확인해 주세요.');
 const hospitalId=await hospitalRecord(getClient(),catalog,id);
 if(!hospitalId)throw new AccessError(400,'병원 등록을 확인해 주세요.');
 if(writing&&actor.role==='hospital'&&actor.hospitalId!==hospitalId)throw new AccessError(403,'소속 병원의 의뢰만 등록할 수 있습니다.');
 return hospitalId;
}
