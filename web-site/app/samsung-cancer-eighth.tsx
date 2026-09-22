"use client";
import {useState} from "react";
import "./samsung-cancer-eighth.css";
const rooms = [
 {id:"single-a",label:"1인실 A",capacity:1},
 {id:"single-b",label:"1인실 B",capacity:1},
 {id:"double",label:"808호 · 2인실",capacity:2},
 {id:"six",label:"6인실",capacity:6},
];
export default function SamsungCancerEighth(){
 const [wing,setWing]=useState("east"),[selected,setSelected]=useState<string|null>(null);
 const room=rooms.find(item=>item.id===selected);
 const choose=(id:string)=>setSelected(id);
 return <section className="cancer-eighth" aria-labelledby="cancer-eighth-title">
  <h2 id="cancer-eighth-title">암병원 8층 병실 안내</h2>
  <nav aria-label="8층 병동 선택">{[{id:"east",label:"동병동"},{id:"west",label:"서병동"}].map(item=><button key={item.id} type="button" aria-pressed={wing===item.id} onClick={()=>{setWing(item.id);setSelected(null)}}>{item.label}</button>)}</nav>
  {wing==="east"?<><h3>8층 동병동</h3><p>제공해 주신 배치 기준입니다. 1인실 A·B는 구분용 이름이며 실제 병실번호는 확인 대기입니다. 808호는 2인실입니다. 나머지 2인실·6인실의 병실 수와 세부 위치는 추가 확인 후 반영합니다.</p>
   <div className="cancer-east-plan">
    <section aria-label="왼쪽 6인실"><h4>왼쪽 · 6인실 구역</h4><button type="button" onClick={()=>choose("six")} aria-pressed={selected==="six"}>6인실 구성 보기</button><small>병실 수·번호 확인 대기</small></section>
    <section className="cancer-station" aria-label="중앙 간호사실과 원무과"><h4>중앙</h4><strong>간호사실</strong><strong>원무과</strong></section>
    <section aria-label="오른쪽 1인실 두 개와 2인실"><h4>오른쪽 · 1인실·2인실 구역</h4>{rooms.slice(0,3).map(item=><button key={item.id} type="button" onClick={()=>choose(item.id)} aria-pressed={selected===item.id}>{item.label}{item.capacity===1?" · 1개 병실":" 구성 보기"}</button>)}<small>808호 외 2인실 수·번호 확인 대기</small></section>
   </div>
   {room&&<section className="cancer-room-detail" aria-live="polite"><h3>동병동 · {room.label}</h3><p>{room.capacity}인실 구성 · 침상 표시는 정원 안내용이며 실제 위치·번호·환자 배정을 나타내지 않습니다.</p><div className="cancer-capacity">{Array.from({length:room.capacity},(_,i)=><span key={i}>침상</span>)}</div><p>실제 병실번호와 침상 배치는 현장 자료 확인 후 등록합니다.</p></section>}
  </>:<section className="cancer-west-pending"><h3>8층 서병동</h3><p>서병동 병실 배치 확인 대기</p><p>병실 종류·개수·번호와 간호사실 위치를 전달해 주시면 이 구역에 구성합니다.</p></section>}
 </section>;
}