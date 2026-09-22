"use client";
import {useState} from 'react';
import {Button} from '@/components/ui/button';
import WardBoard from './ward-board';
import './sixth-floor.css';

function KeyPlan({ward,onSelect}:{ward:string;onSelect:(ward:string)=>void}){
 return <nav className="sixth-keyplan" aria-label="6층 Key Plan 전체 위치 안내도"><header><strong>KEY PLAN <span>1동 6층 · 공식 건물 평면</span></strong><small>병동을 눌러 이동</small></header>
  <div className="official-keyplan">
   <img src="https://www.snubh.org/front/images/introduce/img_floorA_6.gif" width="681" height="502" alt="분당서울대학교병원 공식 1동 6층 평면도. 중앙 엘리베이터와 화장실을 중심으로 위쪽과 좌우로 뻗는 건물 형태."/>
   <div className="official-keyplan-core"><b>중앙 엘리베이터</b><small>일반용 · 환자용</small></div>
   <button className="official-ward-61" aria-pressed={ward==='61병동'} onClick={()=>onSelect('61병동')}><b>61병동</b><span>{ward==='61병동'?'● 현재 위치':'병실 보기'}</span></button>
   <button className="official-ward-62" aria-pressed={ward==='62병동'} onClick={()=>onSelect('62병동')}><b>62병동</b><span>{ward==='62병동'?'● 현재 위치':'병실 보기'}</span></button>
  </div>
  <p>병동 명칭과 일반용·환자용 구분은 현장 안내를 반영했습니다.</p>
  <a className="keyplan-source" href="https://www.snubh.org/intro/floor/guide.do?dong=A&floor=6F" target="_blank" rel="noopener noreferrer">도면 출처: 분당서울대학교병원 · 공식 안내 보기 ↗</a>
 </nav>;
}
export default function SixthFloor({onBack}:{onBack:()=>void}){
 const [ward,setWard]=useState('');
 if(ward)return <><KeyPlan ward={ward} onSelect={setWard}/><WardBoard hideKeyPlan key={ward} building="1동" ward={`6층 · ${ward}`} onBack={()=>setWard('')}/></>;
 return <section className="sixth-floor" aria-label="1동 6층 병동 배치">
  <Button variant="outline" onClick={onBack}>← 층별 병동으로</Button>
  <h1>1동 6층 · 61병동 · 62병동</h1>
  <p>중앙 엘리베이터를 기준으로 병동을 선택하세요.</p>
  <KeyPlan ward="" onSelect={setWard}/>
  <p className="sixth-floor-source">공식 1동 6층 도면을 표시합니다. 공식 층별안내는 왼쪽 ‘병동’, 오른쪽 ‘62치료센터’로 표기합니다. 일반용·환자용 구분은 관리자 제공 정보를 반영했습니다.</p>
  <a href="https://www.snubh.org/intro/floor/guide.do?dong=A&floor=6F" target="_blank" rel="noopener noreferrer">분당서울대학교병원 공식 6층 배치도 보기 ↗</a>
 </section>;
}

