"use client";
import {useState} from 'react';
import {Button} from '@/components/ui/button';
import {readContractFields,writeContractFields} from '../lib/request-contract-fields.mjs';

export default function RequestContractEditor({id,content,busy,onSubmit}:{id:number;content:string;busy:boolean;onSubmit:(action:string,body:{party:string;content:string})=>void}) {
 const [fields,setFields]=useState(()=>readContractFields(content));
 const [review,setReview]=useState(false);
 const update=(name:keyof typeof fields,value:string)=>setFields(previous=>({...previous,[name]:value}));
 return <form className="request-contract-editor" onSubmit={e=>{
  e.preventDefault();
  onSubmit((e.nativeEvent as SubmitEvent).submitter?.getAttribute('value')||'save_contract',{party:'patient',content:writeContractFields(fields)});
 }}>
  <h3>간병의뢰계약서 · 의뢰 {id}번</h3>
  <p>간병비와 계약 내용을 확인한 뒤 저장하거나 협회·간병24에 보내세요.</p>
  <div className="request-contract-fee">
   <label>간병비 (원)<input name="fee" type="number" min="0" step="1" required value={fields.fee} onChange={e=>update('fee',e.target.value)} placeholder="합의한 금액"/></label>
   <label>간병비 지급 기준<input name="period" value="24시간" readOnly/></label>
  </div>
  <label>의뢰계약서 내용<textarea name="content" required maxLength={10500} rows={16} value={fields.body} onChange={e=>update('body',e.target.value)}/></label>
  <label className="request-contract-signature">환자(보호자) 성명 및 서명:<input name="patientSignature" value={fields.patientSignature} maxLength={200} placeholder="성명 및 서명" onChange={e=>update('patientSignature',e.target.value)}/></label>
  <label className="request-contract-signature">협회(간병24) 담당자 성명 및 서명:<input name="associationSignature" value={fields.associationSignature} maxLength={200} placeholder="성명 및 서명" onChange={e=>update('associationSignature',e.target.value)}/></label>
  <label>계약일<input name="contractDate" type="date" required value={fields.date} onChange={e=>update('date',e.target.value)}/></label>
  <small>저장·보내기가 완료되면 결과 화면의 ‘확인’을 눌러 주세요. 저장·보내기는 당사자의 서명이나 계약 체결을 대신하지 않습니다.</small>
  <p className="document-action-order">저장 → 보내기 → 확인</p><div className="workflow-actions"><Button type="submit" value="save_contract" disabled={busy}>의뢰계약서 저장</Button><Button type="submit" value="send_contract" disabled={busy}>협회·간병24로 보내기</Button><Button type="button" variant="outline" disabled={busy} aria-expanded={review} onClick={()=>setReview(!review)}>확인</Button></div>
  {review&&<section className="request-contract-review" aria-label="작성한 계약서 확인"><h4>작성한 계약서 확인</h4><p role="status">아래 내용을 확인해 주세요. 아직 저장하거나 보내지 않았습니다.</p><pre style={{whiteSpace:"pre-wrap",overflowWrap:"anywhere"}}>{writeContractFields(fields)}</pre></section>}
 </form>;
}
