export const requestFields='requesterName requesterPhone patientName patientGender patientAge patientBirthYear patientWeight diagnosis patientCondition building floorName ward room careType startDate precautions specialNotes requestNote desiredGender desiredNationality desiredAge desiredExpertise desiredPersonality desiredOther publicConsent'.split(' ');
export const canEditRequest=(actor,row)=>actor.role==='admin'||(row.ownerUserId!=null&&row.ownerUserId===actor.id);
export function editableRequest(row){return Object.fromEntries(requestFields.map(k=>[k,row[k]??'']))}
export function requestChanges(body){
 const result=editableRequest(body);for(const k of requestFields)result[k]=String(result[k]).trim();
 if(result.patientBirthYear&&(!/^\d{4}$/.test(result.patientBirthYear)||Number(result.patientBirthYear)>new Date().getFullYear()||Number(result.patientBirthYear)<new Date().getFullYear()-120))throw Error('출생연도를 확인하세요.');
 const required='requesterName requesterPhone patientName patientGender patientAge patientWeight diagnosis patientCondition building floorName ward careType startDate'.split(' ');
 if(required.some(k=>!result[k]))throw Error('필수 의뢰 항목을 모두 작성해 주세요.');
 if(result.publicConsent!=='동의')throw Error('수정 내용의 공개 동의를 확인해 주세요.');
 if(body.roomStatus==='emergency_waiting')result.room='응급실 대기 중 (병실 미배정·간병인 미지정)';
 if(!result.room)throw Error('병실 또는 응급실 대기 상태를 입력하세요.');
 if(!['여','남'].includes(result.patientGender)||!['개인간병','공동간병'].includes(result.careType))throw Error('선택 항목을 확인하세요.');
 if(!Number.isFinite(Number(result.patientAge))||Number(result.patientAge)<0||Number(result.patientAge)>120||!Number.isFinite(Number(result.patientWeight))||Number(result.patientWeight)<1||Number(result.patientWeight)>300)throw Error('나이와 체중을 확인하세요.');
 if(!/^\d{4}-\d{2}-\d{2}$/.test(result.startDate)||!Number.isFinite(Date.parse(result.startDate)))throw Error('시작일을 확인하세요.');
 if(Object.values(result).some(v=>v.length>4000))throw Error('입력 내용은 항목당 4000자 이내로 작성하세요.');
 return result;
}

export function requestForEditor(row,actor){const result=editableRequest(row);if(actor.role!=='admin')delete result.requesterPhone;return result;}
export function requestEditChanges(body,row,actor){const preservePhone=actor.role!=='admin'&&!String(body.requesterPhone||'').trim();const result=requestChanges(preservePhone?{...body,requesterPhone:row.requesterPhone||'기존 비공개 연락처'}:body);if(preservePhone)delete result.requesterPhone;return result;}
