import {depositGuide} from './care-deposit-accounts.mjs';
// Copy recorded facts only. Unagreed terms and signatures remain unfilled.
export function requestContractDraft(request, workflow, actor) {
  if(actor.role!=='admin'&&request.ownerUserId!==actor.id)return undefined;
  const value=key=>String(request[key]||'미기재 · 확인 필요');
  const selected=workflow.applications.find(a=>a.profileId===workflow.selected);
  return [
    '돌봄서비스(간병) 의뢰계약서 · 확인용 초안',
    `의뢰번호: ${request.id}`,
    `의뢰인: ${value('requesterName')}`,
    ...(actor.role==='admin'?[`연락처: ${value('requesterPhone')}`]:[]),
    `환자 성명: ${value('patientName')}`,
    `환자 성별: ${value('patientGender')} / 나이: ${value('patientAge')}세`,
    `간병 장소: ${['building','floorName','ward','room'].map(value).join(' / ')}`,
    `간병 구분: ${value('careType')}`,
    `간병 시작일: ${value('startDate')}`,
    `간병 일정: ${value('serviceSchedule')}`,
    `시작 시간: ${value('serviceStartTime')} / 종료 시간: ${value('serviceEndTime')}`,
    `담당 간병인: ${selected?selected.name:'협회 선정 전 · 확인 필요'}`,
    `간병비: ${value('careFee')} / 지급 단위: ${value('feePeriod')}`,
    `지급 방법: ${value('paymentMethod')} / 지급일: ${value('paymentDue')}`,
    `휴게시간: ${value('restTime')} / 휴일 조건: ${value('holidayTerms')}`,
    `요청사항: ${value('requestNote')}`,
    `변경·취소 조건: ${value('cancellationTerms')}`,
    '',
    depositGuide,
    '',
    '위 내용은 저장된 의뢰정보를 옮긴 초안입니다. 미기재 항목과 계약 조건을 당사자가 확인한 후 작성해 주세요.',
    '환자·보호자 성명 및 서명: ____________________',
    '협회(간병24) 담당자 성명 및 서명: ____________________',
    '계약일: ____________________',
    '자동 작성·저장·보내기는 서명이나 계약 체결을 대신하지 않습니다.',
  ].join('\n');
}
