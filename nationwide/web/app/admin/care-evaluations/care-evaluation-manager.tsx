'use client';
import {useEffect,useState} from 'react';
import {hospitalFetch as fetch} from '@/lib/hospital-fetch';
import {Button} from '@/components/ui/button';

type Evaluation={requestId:number;evaluationId:number;hospitalId:string;evaluatorType:string;rating:number;note:string;authorName:string;caregiverName:string;status:'sent'|'confirmed';sentAt:string;confirmedAt?:string};
export default function CareEvaluationManager(){
 const [items,setItems]=useState<Evaluation[]>([]),[message,setMessage]=useState('불러오는 중…'),[busy,setBusy]=useState<number|null>(null);
 async function load(){try{const r=await fetch('/api/admin/care-evaluations',{cache:'no-store'}),d=await r.json();if(!r.ok)throw Error(d.error);setItems(d.evaluations||[]);setMessage('')}catch(e){setMessage(e instanceof Error?e.message:'평가 목록을 불러오지 못했습니다.')}}
 useEffect(()=>{void load()},[]);
 async function confirm(item:Evaluation){setBusy(item.evaluationId);setMessage('');try{const r=await fetch('/api/admin/care-evaluations',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({requestId:item.requestId,evaluationId:item.evaluationId})}),d=await r.json();if(!r.ok)throw Error(d.error);await load()}catch(e){setMessage(e instanceof Error?e.message:'평가 확인을 저장하지 못했습니다.')}finally{setBusy(null)}}
 return <><h1>간병인 평가 통합 관리</h1><p>간호사·환자·보호자가 보낸 평가는 의뢰별로 확인할 수 있습니다.</p>{message&&<p role="status">{message}</p>}{!message&&!items.length&&<p>접수된 평가가 없습니다.</p>}<div style={{display:'grid',gap:14}}>{items.map(item=><article key={`${item.requestId}-${item.evaluationId}`} style={{border:'1px solid #cbd9d3',borderRadius:12,padding:16,background:'#fff'}}><header style={{display:'flex',justifyContent:'space-between',gap:12,flexWrap:'wrap'}}><strong>의뢰 {item.requestId} · {item.hospitalId||'병원 미지정'}</strong><span>{item.status==='confirmed'?'확인 완료':'관리자 확인 대기'}</span></header><p>평가자: {item.evaluatorType} · {item.authorName} · 간병인: {item.caregiverName||'미확인'} · 별점 {item.rating}/5</p><p style={{whiteSpace:'pre-wrap'}}>{item.note||'추가 의견 없음'}</p><small>보낸 시각: {item.sentAt?new Date(item.sentAt).toLocaleString('ko-KR'):''}{item.confirmedAt?` · 확인: ${new Date(item.confirmedAt).toLocaleString('ko-KR')}`:''}</small>{item.status==='sent'&&<div style={{marginTop:12}}><Button type="button" disabled={busy!==null} onClick={()=>confirm(item)}>{busy===item.evaluationId?'저장 중…':'확인 완료'}</Button></div>}</article>)}</div></>
}
