"use client";
import {useState} from 'react';
import hospitals from './directory.json';
import './directory.css';
export default function Directory(){
 const [region,setRegion]=useState('전체'),[type,setType]=useState('전체'),[query,setQuery]=useState(''),[selected,setSelected]=useState('');
 const rows=hospitals.filter(h=>(region==='전체'||h.region===region)&&(type==='전체'||h.type===type)&&`${h.name} ${h.region} ${h.city}`.includes(query.trim()));
 const detail=hospitals.find(h=>h.id===selected);
 const href=(name:string)=>name==='혜민병원'?'/hospitals/hyemin':name==='분당서울대학교병원'?'/':null;
 return <main className="nationwide-app"><header className="nationwide-brand"><a href="/hospitals" aria-label="전국병원 통합간병 앱"><img src="/ganbyeong24-logo-cropped.webp" alt="간병24 로고"/></a><div><strong>전국병원 통합간병 앱</strong><small>대한노인돌봄서비스협회 관리</small></div></header><h1>전국 병원 찾기</h1><h2>지역별 전국병원 명단</h2><section className="nationwide-filters"><label>병원 이름·지역 검색<input value={query} onChange={e=>setQuery(e.target.value)} placeholder="예: 혜민병원, 광진"/></label><label>지역 구분<select value={region} onChange={e=>setRegion(e.target.value)}>{['전체',...new Set(hospitals.map(h=>h.region))].map(r=><option key={r}>{r}</option>)}</select></label><label>병원 구분<select value={type} onChange={e=>setType(e.target.value)}>{['전체',...new Set(hospitals.map(h=>h.type))].map(t=><option key={t}>{t}</option>)}</select></label></section><p role="status">{rows.length}개 병원</p>
 {detail&&<section className="nationwide-detail"><button onClick={()=>setSelected('')}>닫기</button><h2>{detail.name}</h2><p>{detail.region} · {detail.city} · {detail.type}</p><p>이 병원의 전용 병실 화면은 준비 중입니다. 간병 상담은 전국 대표전화로 연락해 주세요.</p><a href="tel:16005197">전화 의뢰 1600-5197</a></section>}
 <section className="nationwide-list">{rows.map(h=><article key={h.id}><small>{h.region} · {h.city} · {h.type}</small>{href(h.name)?<a href={href(h.name)!}><img src="/ganbyeong24-logo-cropped.webp" alt=""/>{h.name}<span>병실 보기 →</span></a>:<button onClick={()=>setSelected(h.id)}><img src="/ganbyeong24-logo-cropped.webp" alt=""/>{h.name}</button>}</article>)}</section>{!rows.length&&<p>검색 조건에 맞는 병원이 없습니다.</p>}</main>;
}
