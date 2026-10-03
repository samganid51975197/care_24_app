export function contributionScope(actor){
 if(actor?.status!=='active')throw Error('승인된 담당자만 나눔 현황을 확인할 수 있습니다.');
 if(actor.role==='admin')return actor.contextHospitalId||null;
 if(actor.role==='hospital'&&actor.hospitalId&&(!actor.contextHospitalId||actor.contextHospitalId===actor.hospitalId))return actor.hospitalId;
 throw Error('협회(간병24) 관리자와 해당 병원 담당자만 확인할 수 있습니다.');
}
