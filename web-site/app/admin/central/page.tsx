'use client';
import {useEffect,useState} from 'react';
import Contribution from '../../contribution';
import styles from './central.module.css';
type Counts={total:number;requesting:number;matching:number;matched:number;dailyFee:number;feeKnown:number;feeUnknown:number};
type Data={totals:Counts;hospitals:(Counts&{id:string;name:string;kind:string})[];updatedAt:string};
const num=(v:number)=>v.toLocaleString('ko-KR');
export default function Central(){
 const [data,setData]=useState<Data|null>(null),[error,setError]=useState(''),[denied,setDenied]=useState(false),[query,setQuery]=useState('');
 useEffect(()=>{let live=true,timer:ReturnType<typeof setTimeout>;async function load(){try{const response=await fetch('/api/admin/central',{cache:'no-store'});if(response.status===401||response.status===403){if(live){setData(null);setDenied(true);}return;}if(!response.ok)throw Error('조회 실패');const result=await response.json();if(live){setData(result);setError('');}}catch{if(live)setError('최신 현황을 불러오지 못했습니다. 아래에 이전 값이 표시될 수 있습니다.');}finally{if(live)timer=setTimeout(load,5000);}}load();return()=>{live=false;clearTimeout(timer);};},[]);
 if(denied)return <main className={styles.page}><h1>중앙 간병24 관리</h1><p>관리자만 확인할 수 있습니다.</p></main>;
 return <main className={styles.page}><header className={styles.header}><div><span>관리자 전용 · 전국 통합</span><h1>중앙 간병24 관리</h1><p>전국 병원·요양병원의 간병 의뢰와 매칭·입금 현황</p></div><a href="/admin">가입 승인·소속 관리 →</a></header>
 <p role="status">{data?`${new Date(data.updatedAt).toLocaleString('ko-KR')} 기준 · 5초마다 자동 갱신`:'현황을 불러오는 중입니다.'}</p>{error&&<p role="alert" className={styles.error}>{error}</p>}
 {data&&<><section className={styles.cards} aria-label="전국 매칭 현황">{[['전체 의뢰',data.totals.total],['간병인 모집 중',data.totals.requesting],['매칭 상담 중',data.totals.matching],['매칭 완료',data.totals.matched]].map(([label,value])=><article key={label}><span>{label}</span><strong>{num(Number(value))}건</strong></article>)}</section>
 <section className={styles.money}><h2>매칭 완료 의뢰의 24시간 간병비 단가 합계</h2><strong>{num(data.totals.dailyFee)}원</strong><p>금액 확인 {data.totals.feeKnown}건 · 금액 또는 지급 단위 확인 필요 {data.totals.feeUnknown}건</p><p>확정 계약서의 24시간 단가를 우선 집계합니다. 계약서가 없으면 의뢰서의 일 단가를 사용합니다. 전체 기간의 계약 총액이나 실제 입금액이 아닙니다. 확인이 필요한 금액은 합계에서 제외합니다.</p></section>
 <section className={styles.hospitals}><h2>병원·요양병원별 현황</h2><label>병원 검색<input value={query} onChange={e=>setQuery(e.target.value)} placeholder="병원명 또는 요양병원"/></label><div className={styles.scroll}><table><thead><tr><th>병원</th><th>종류</th><th>전체 의뢰</th><th>모집 중</th><th>상담 중</th><th>매칭 완료</th><th>24시간 단가 합계</th><th>금액 확인 필요</th></tr></thead><tbody>{data.hospitals.filter(h=>(h.name+' '+h.kind).includes(query)).map(h=><tr key={h.id}><th>{h.name}</th><td>{h.kind}</td><td>{num(h.total)}</td><td>{num(h.requesting)}</td><td>{num(h.matching)}</td><td>{num(h.matched)}</td><td>{num(h.dailyFee)}원</td><td>{h.feeUnknown}건</td></tr>)}</tbody></table></div>{!data.hospitals.length&&<p>등록된 간병 의뢰가 없습니다.</p>}<p>의뢰가 등록된 병원만 표시합니다. 소속이 연결되지 않은 기존 의뢰는 ‘병원 소속 미지정’으로 집계합니다.</p></section>
 <section className={styles.payments}><h2>전국 입금·환불 장부</h2><p>기존 입금 장부에는 병원별 연결 정보가 없어 전국 합계로 표시합니다. 은행 자동 조회가 아닌 관리자가 확인해 등록한 금액입니다.</p><Contribution/></section></>}
 </main>;
}