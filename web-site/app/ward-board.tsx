"use client";
import {useEffect,useState} from 'react';
import {Button} from '@/components/ui/button';
import './ward-board.css';
import FloorKeyPlan from './floor-keyplan';
import BedAssignments from './bed-assignments';
import {inWard} from '@/lib/ward-filter.mjs';
type Entry={id:number;building:string;floor:string;ward:string;room:string;patient:string;caregiver:string};
export default function WardBoard({building,ward,onBack,hideKeyPlan=false,hospitalName="",initialRoom=""}:{initialRoom?:string;building:string;ward:string;onBack:()=>void;hideKeyPlan?:boolean;hospitalName?:string}){
 const [entries,setEntries]=useState<Entry[]>([]),[room,setRoom]=useState(initialRoom),[error,setError]=useState(''),[loading,setLoading]=useState(true),[example,setExample]=useState(true),[bed,setBed]=useState(0),[capacity,setCapacity]=useState(4),[toilet,setToilet]=useState("왼쪽"),[door,setDoor]=useState("오른쪽"),[windowPosition,setWindowPosition]=useState("위쪽"),[notes,setNotes]=useState("");
 useEffect(()=>{if(hospitalName){setLoading(false);return;}const controller=new AbortController();fetch('/api/ward-board',{signal:controller.signal}).then(async r=>{const j=await r.json();if(!r.ok)throw Error(j.error||'자료를 불러오지 못했습니다.');setEntries(j.entries)}).catch(e=>{if(e.name!=='AbortError')setError(e.message)}).finally(()=>setLoading(false));return()=>controller.abort()},[]);

 const wardOptions=ward.match(/\d+병동/g)||[];
 const [chosenWard,setChosenWard]=useState(wardOptions[0]||"");
 const effectiveWard=wardOptions.length>1?`${ward.split("층")[0]}층 · ${chosenWard}`:ward;
 const rows=entries.filter(e=>inWard(e,building,effectiveWard));
 const rooms=[...new Set(rows.map(e=>e.room))];
 return <section className="ward-board">{!hideKeyPlan&&<FloorKeyPlan building={building} ward={ward}/>}<Button variant="outline" onClick={onBack}>← 층별 병동으로</Button><h1>{building} · {effectiveWard}</h1>{wardOptions.length>1&&<nav className="numbered-wards" aria-label="병동 선택">{wardOptions.map(w=><button key={w} aria-pressed={chosenWard===w} onClick={()=>{setChosenWard(w);setRoom("");setExample(true);setBed(0)}}>{w}</button>)}</nav>}{ward.includes("/")&&<p>{ward.split("/").slice(1).join("/")}</p>}<p>병실을 선택하면 환자와 담당 간병인을 확인할 수 있습니다.</p>
 {loading?<p role="status">병실 자료를 불러오는 중…</p>:error?<p role="alert">{error}</p>:<><div className="ward-room-list">{rooms.map(r=><button key={r} onClick={()=>{setRoom(r);setExample(false)}} aria-pressed={!example&&room===r}><strong>{r}</strong><span>등록 의뢰 {rows.filter(e=>e.room===r).length}건 · 환자·간병인 보기</span></button>)}</div>{!rooms.length&&<p>이 병동에 표시할 등록 자료가 없습니다.</p>}</>}
 <section className="corridor-overview"><h2>복도 중심 병실 배치</h2><p>배치 예시 · 실제 병실 위치와 번호는 확인 전입니다.</p><div className="corridor-grid"><div className="corridor-spine">중앙 복도</div>{["A","B","C","D","E","F"].map((r,i)=><button key={r} style={{gridColumn:i%2?3:1,gridRow:Math.floor(i/2)+1}} onClick={()=>{setExample(true);setRoom(r);setBed(0)}} aria-pressed={example&&room===r}>예시 병실 {r}<small>병실 평면 보기</small></button>)}</div></section><Button variant="outline" onClick={()=>{setExample(true);setRoom('');setBed(0)}}>병실 배치 설정 (4인실·6인실)</Button>
 {example?<section className="ward-room"><h2>{room&&example?`예시 병실 ${room} · `:""}{capacity}인실 침상 배치 · 예시</h2><p>평면은 기본 예시입니다. 실제 병실명과 침상번호를 지정하여 배정 정보를 저장할 수 있습니다.</p><div className="ward-layout-controls"><label>병실 종류<select value={capacity} onChange={e=>{setCapacity(Number(e.target.value));setBed(0)}}>{[1,2,3,4,5,6].map(n=><option key={n} value={n}>{n}인실</option>)}</select></label><label>화장실 위치<select value={toilet} onChange={e=>setToilet(e.target.value)}>{["왼쪽","오른쪽"].map(x=><option key={x}>{x}</option>)}</select></label></div><div className="ward-floorplan" data-window="위쪽"><div className="ward-window"><span>전면 고정창 · FIX</span><svg viewBox="0 0 600 24" preserveAspectRatio="none" role="img" aria-label="고정창: 평행한 창틀과 유리선, 개폐 표시 없음"><rect x="2" y="3" width="596" height="18"/><path d="M2 9H598 M2 15H598 M150 3V21 M300 3V21 M450 3V21"/></svg></div><p className="bed-number-guide">침상 번호: 입구 왼쪽 1번부터 창가를 돌아 오른쪽 입구 방향으로 배정</p><BedAssignments hospitalName={hospitalName} key={building+effectiveWard+room} building={building} ward={effectiveWard} capacity={capacity} toilet={toilet} onLayout={(c,t)=>{setCapacity(c);setToilet(t)}}/><div className="ward-facilities" data-toilet={toilet}><div className="ward-toilet" style={{order:toilet==="오른쪽"?2:0}}>화장실<br/>{toilet}</div><div className="ward-door"><svg viewBox="0 0 120 110" role="img" aria-label="중앙 여닫이 출입문: 왼쪽 경첩에서 병실 안쪽으로 90도 열리는 문짝과 원호"><path className="door-jamb" d="M0 100H16 M104 100H120"/><path className="door-leaf" d="M18 100V14"/><path className="door-swing" d="M18 14A86 86 0 0 1 104 100"/><circle cx="18" cy="100" r="3"/></svg><span>출입문 · 여닫이</span></div></div></div><div className="room-outside-corridor">중앙 복도</div><label className="ward-notes">현장 추가 사항<textarea value={notes} onChange={e=>setNotes(e.target.value)} placeholder="예: 중앙 통로 확보, 화장실 문 열림 방향, 세면대·수납장 위치, 휠체어 이동 공간"/></label><p><small>침상 입력창의 저장을 누르면 배정과 병실 종류·화장실 위치가 저장됩니다. 현장 추가 사항 메모는 화면 미리보기이며 저장되지 않습니다.</small></p>{bed>0&&<p role="status">{bed}번 침상을 선택했습니다. 실제 배정 자료는 아직 없습니다.</p>}</section>:room&&<section className="ward-room"><h2>{room} · 환자·간병인</h2><p>의뢰 자료와 침상 배정은 별도로 관리합니다.</p><Button variant="outline" onClick={()=>setExample(true)}>이 병동 침상 배정 입력</Button><div className="ward-beds">{rows.filter(e=>e.room===room).map(e=><article key={e.id}><b>의뢰 {e.id} · 침상 미지정</b><span>환자명: {e.patient}</span><span>간병인: {e.caregiver}</span></article>)}</div></section>}
 </section>
}








