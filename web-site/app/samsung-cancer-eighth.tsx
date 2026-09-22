"use client";
import {useState} from "react";
import "./samsung-cancer-eighth.css";
const rooms = [
 {id:"single-a",label:"1인실 A",capacity:1},
 {id:"single-b",label:"1인실 B",capacity:1},
 {id:"double",label:"808호 · 2인실",capacity:2},
 {id:"six",label:"6인실",capacity:6},
];
function DoubleRoomPlan(){
 return <figure className="double-room-plan"><svg viewBox="0 0 520 620" role="img" aria-labelledby="double-plan-title double-plan-description">
  <title id="double-plan-title">808호 2인실 평면배치도</title><desc id="double-plan-description">아래 복도에서 왼쪽 출입구로 들어갑니다. 오른쪽 입구 옆은 화장실이며 화장실은 출입문 쪽으로 넓혔습니다. 환자 침대 두 개는 900×2100mm 비율이며 머리를 오른쪽 벽에 두고 커튼 양쪽에 가깝게 배치했습니다. 창가 간병인 침대는 창문 벽에 붙였습니다. 각 환자 침대 바깥쪽인 창가와 화장실 쪽에 600×1800mm 간병인 침대를 하나씩 점선과 바퀴로 표시했습니다. 창문은 출입구 반대편 위쪽입니다.</desc>
  <rect x="30" y="35" width="460" height="510" rx="4" fill="#fff" stroke="#365d62" strokeWidth="5"/>
  <path d="M95 35H425" stroke="#57a6c0" strokeWidth="12"/><path d="M95 35H425" stroke="#e5f8ff" strokeWidth="3"/><text x="260" y="22" textAnchor="middle">창문 · 출입구 반대편</text>
  <text x="130" y="270" textAnchor="middle" fill="#52777c">이동 통로</text>
  <g fill="#e8f3f0" stroke="#467b72" strokeWidth="3"><rect x="260" y="125" width="228" height="97.71" rx="10"/><rect x="260" y="234" width="228" height="97.71" rx="10"/></g>
  <g fill="#fff" stroke="#467b72" strokeWidth="2"><rect x="451" y="153" width="26" height="57" rx="5"/><rect x="451" y="246" width="26" height="57" rx="5"/></g>
  <text x="350" y="175" textAnchor="middle">환자 침대</text><text x="350" y="268" textAnchor="middle">환자 침대</text>
  <g aria-label="간병인 이동식 침대 두 개 · 각각 600×1800mm" fill="#fff8e9" stroke="#977337" strokeWidth="2" strokeDasharray="6 4">
   <rect x="308" y="38" width="180" height="60" rx="5"/><rect x="308" y="337" width="180" height="60" rx="5"/>
  </g>
  <g fill="#fff" stroke="#977337" strokeWidth="2">{[38,337].map(y=><g key={y}><rect x="465" y={y+12} width="16" height="36" rx="3"/>{[317,479].map(x=><g key={x}><circle cx={x} cy={y+5} r="3"/><circle cx={x} cy={y+55} r="3"/></g>)}</g>)}</g>
  <g fontSize="13" fill="#785921" textAnchor="middle"><text x="386" y="61">간병인 침대 · 창가</text><text x="386" y="82">600 × 1800 mm</text><text x="386" y="360">간병인 침대 · 화장실 쪽</text><text x="386" y="381">600 × 1800 mm</text></g>
  <g fontSize="13" textAnchor="middle" fill="#467b72"><text x="350" y="198">900 × 2100 mm</text><text x="350" y="291">900 × 2100 mm</text></g>
  <path d="M235 228H488" stroke="#a56795" strokeWidth="4" strokeDasharray="9 6"/><text x="170" y="234" fill="#854575">커튼</text>
  <rect x="215" y="400" width="275" height="145" fill="#eef1f6" stroke="#365d62" strokeWidth="3"/><text x="352" y="462" textAnchor="middle">화장실</text><text x="352" y="490" textAnchor="middle">입구 오른쪽</text>
  <path d="M70 545H200" stroke="#fff" strokeWidth="9"/><path d="M70 545V435" fill="none" stroke="#365d62" strokeWidth="3"/><path d="M70 435A110 110 0 0 1 180 545" fill="none" stroke="#789599" strokeWidth="2" strokeDasharray="5 4"/>
  <text x="135" y="570" textAnchor="middle">출입구 · 왼쪽</text><rect x="30" y="585" width="460" height="30" fill="#e6ecee"/><text x="260" y="607" textAnchor="middle">복도 → 병실 안쪽으로 진입</text>
 </svg><figcaption>환자 침대는 900×2100mm(90×210cm) 비율로 커튼 양쪽에 배치하고, 창가 간병인 침대는 창문 벽에 붙였습니다. 점선과 바퀴는 이동식 간병인 침대(600×1800mm, 가로세로 3:1 비율)를 나타냅니다. 전체 도면은 실측 축척이 아닌 개념도입니다. 808호의 실측 치수와 문 열림 방향은 현장 확인 후 확정합니다.</figcaption></figure>;
}
export default function SamsungCancerEighth(){
 const [wing,setWing]=useState("east"),[selected,setSelected]=useState<string|null>(null);
 const room=rooms.find(item=>item.id===selected);
 const choose=(id:string)=>setSelected(id);
 return <section className="cancer-eighth" aria-labelledby="cancer-eighth-title">
  <h2 id="cancer-eighth-title">암병원 8층 병실 안내</h2>
  <nav aria-label="8층 병동 선택">{[{id:"east",label:"동병동"},{id:"west",label:"서병동"}].map(item=><button key={item.id} type="button" aria-pressed={wing===item.id} onClick={()=>{setWing(item.id);setSelected(null)}}>{item.label}</button>)}</nav>
  {wing==="east"?<><h3>8층 동병동</h3><p>제공해 주신 배치 기준입니다. 1인실 A·B는 구분용 이름이며 실제 병실번호는 확인 대기입니다. 808호는 2인실입니다. 나머지 2인실·6인실의 병실 수와 세부 위치는 추가 확인 후 반영합니다.</p>
   <div className="cancer-front-back" aria-label="간호사실 앞뒤 병실 배치"><div>간호사실 뒤쪽 병실 구역 · 번호·개수 확인 대기</div><div className="cancer-plan-corridor">뒤쪽 복도</div><div className="cancer-east-plan">
    <section aria-label="왼쪽 6인실"><h4>왼쪽 · 6인실 구역</h4><button type="button" onClick={()=>choose("six")} aria-pressed={selected==="six"}>6인실 구성 보기</button><small>병실 수·번호 확인 대기</small></section>
    <section className="cancer-station" aria-label="중앙 간호사실과 원무과"><h4>중앙</h4><strong>간호사실</strong><strong>원무과</strong></section>
    <section aria-label="오른쪽 1인실 두 개와 2인실"><h4>오른쪽 · 1인실·2인실 구역</h4>{rooms.slice(0,3).map(item=><button key={item.id} type="button" onClick={()=>choose(item.id)} aria-pressed={selected===item.id}>{item.label}{item.capacity===1?" · 1개 병실":" 구성 보기"}</button>)}<small>808호 외 2인실 수·번호 확인 대기</small></section>
   </div><div className="cancer-plan-corridor">앞쪽 복도</div><div>간호사실 앞쪽 병실 구역 · 번호·개수 확인 대기</div></div>
   {room&&<section className="cancer-room-detail" aria-live="polite"><h3>동병동 · {room.label}</h3>{room.id==="double"?<DoubleRoomPlan/>:<><p>{room.capacity}인실 구성 · 침상 표시는 정원 안내용이며 실제 위치·번호·환자 배정을 나타내지 않습니다.</p><div className="cancer-capacity">{Array.from({length:room.capacity},(_,i)=><span key={i}>침상</span>)}</div><p>실제 병실번호와 침상 배치는 현장 자료 확인 후 등록합니다.</p></>}</section>}
  </>:<section className="cancer-west-pending"><h3>8층 서병동</h3><p>서병동 병실 배치 확인 대기</p><p>병실 종류·개수·번호와 간호사실 위치를 전달해 주시면 이 구역에 구성합니다.</p></section>}
 </section>;
}