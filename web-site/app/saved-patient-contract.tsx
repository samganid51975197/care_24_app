"use client";
import RequestContractEditor from './request-contract-editor';
import CareDepositGuide from './care-deposit-guide';
export default function SavedPatientContract({id,workflow:w,busy,onSubmit}:{id:number;workflow:any;busy:boolean;onSubmit:(action:string,body:{party:string;content:string})=>void}){
 const submission=w.submissions?.patient;
 const content=w.notifiedAt?w.patientContract:(submission?.content||w.patientContract||'');
 const status=w.notifiedAt?'계약·일정 통보 완료':submission?.status==='sent'?'협회(간병24)에 제출된 계약서':content?'저장된 계약서 · 미통보':'';
 return <section className="request-contract-editor" aria-label="환자·보호자 의뢰계약서 저장본"><h3>환자·보호자 의뢰계약서 · 의뢰 {id}번</h3>{content?<><p><strong>{status}</strong></p>{submission?.updatedAt&&!w.notifiedAt&&<p>마지막 저장·제출: {new Date(submission.updatedAt).toLocaleString('ko-KR',{timeZone:'Asia/Seoul'})}</p>}<p>실제로 저장된 내용을 그대로 표시합니다. 저장·제출만으로 서명이나 계약 체결이 완료되는 것은 아닙니다.</p><pre style={{whiteSpace:'pre-wrap',overflowWrap:'anywhere',padding:16,background:'#fff',border:'1px solid #bdd4ce'}}>{content}</pre><details><summary>현재 입금계좌 안내 보기</summary><p>아래는 현재 안내 계좌입니다. 위 저장된 계약서 원문을 변경하지 않습니다.</p><CareDepositGuide/></details></>:<p role="status">아직 저장하거나 제출한 환자·보호자 의뢰계약서가 없습니다. 의뢰정보로 만든 초안은 실제 작성·저장본이 아닙니다.</p>}{!w.notifiedAt&&<details><summary>{content?'저장된 계약서 수정하기':'의뢰정보로 만든 초안 확인·작성하기'}</summary><RequestContractEditor key={id+':'+(submission?.updatedAt||'draft')} id={id} content={content||w.patientContractDraft||''} busy={busy} onSubmit={onSubmit}/></details>}</section>;
}
