"use client";
import {useState} from "react";
import FirstBuilding from "./gangnam-sev-first-building";
import styles from "./gangnam-sev-buildings.module.css";

const buildings=["1동 병동","2동 병동","3동 병동"];
const fourTop=["2503","2505","2507","2509","2511"];
const fourBottom=["2506","2510","2512"];
const sixRooms=["2552","2554","2556","2558"];
const thirdTop=["3506","3505","3504","3503","3502","3501"];
const thirdBottom=["3507","3508","3509","3510","3511","3512","3513","3514"];
const thirdBuildingFloors=[
 {id:"5",title:"54병동·수련의 의국",detail:"층별 안내판: 54병동(3551~3560호), 수련의 의국 · 2동 연결"},
 {id:"6",title:"63·64병동",detail:"63병동(3601~3612호), 64병동(3651~3662호)"},
 {id:"7",title:"73·74병동",detail:"73병동(3701~3712호), 74병동(3751~3762호)"},
 {id:"8",title:"83병동",detail:"83병동(3801~3836호)"},
];
function ThirdBuilding({floor,onSelect}:{floor:string|null;onSelect:(floor:string)=>void}){
 return <><h3>3동 층별 병동·병실</h3><nav aria-label="3동 층별 안내" className={styles.floorButtons}>{thirdBuildingFloors.map(item=><button type="button" key={item.id} aria-pressed={floor===item.id} onClick={()=>onSelect(item.id)}><strong>{item.id}층</strong><span>{item.title}</span></button>)}</nav>
 {floor==="5"?<><h3>3동 5층 병실 배치</h3><p>5층 도면 기준 · 3501~3514호, 총 14개 병실</p>
 <div className={styles.planScroll} role="region" aria-label="3동 5층 병실 배치도, 작은 화면에서는 좌우로 이동" tabIndex={0}><div className={styles.thirdPlan}>
 <div className={styles.connection}>연결통로 · 층별 안내판상 2동 연결</div>
 <div className={styles.thirdUpper}><div className={styles.staffArea}>의국·당직실 구역</div><div className={styles.station}>간호사실<span>간이주방 · 세척실 · 준비실</span><span>보호자 휴게실 · 보호구 탈의실</span></div><div className={styles.thirdTop}>{thirdTop.map(number=><div key={number} className={styles.thirdRoom}><strong>{number}호</strong></div>)}</div></div>
 <div className={styles.thirdCorridor}><span>서쪽 계단</span><strong>복도</strong><span>동쪽 계단</span></div>
 <div className={styles.thirdLower}><div className={styles.staffArea}>의국·공용실 구역</div><div className={styles.facilities}>승강기 · 보관실</div><div className={styles.thirdBottom}>{thirdBottom.map(number=><div key={number} className={styles.thirdRoom}><strong>{number}호</strong></div>)}</div></div>
 </div></div><p className={styles.note}>첨부된 5층 도면의 병실 번호와 상대적 위치를 반영한 간략 배치도입니다. 병실별 정원은 자료에 표시되어 있지 않습니다.</p><p className={styles.note}>층별 안내판에는 5층이 54병동(3551~3560호)으로 표기되어 있어 도면(3501~3514호)과 차이가 있습니다. 실제 병동·병실 번호는 현장 확인이 필요합니다.</p>
 </>:floor?<p><strong>{floor}층 · {thirdBuildingFloors.find(item=>item.id===floor)?.title}</strong><br/>{thirdBuildingFloors.find(item=>item.id===floor)?.detail}</p>:<p>층을 선택하면 병동·병실 안내가 표시됩니다.</p>}</>;
}
const secondBuildingFloors=[
 {id:"4",title:"41·42병동",detail:"2405~2467호 · 분만실"},
 {id:"5",title:"51·52병동",detail:"2501~2569호 · 방사성동위원소치료실"},
 {id:"6",title:"61병동",detail:"2601~2657호 · 신경외과중환자실·뇌졸중집중치료실"},
 {id:"7",title:"71·72병동",detail:"2701~2767호"},
 {id:"8",title:"81병동",detail:"2801~2868호"},
];
function Room({number,capacity}:{number:string;capacity:4|6}){return <div className={capacity===4?styles.roomFour:styles.roomSix}><strong>{number}호</strong><span>{capacity}인실</span></div>;}

export default function GangnamSevBuildings({initialBuilding=null}:{initialBuilding?:string|null}){
 const [selected,setSelected]=useState<string|null>(initialBuilding);
 const [floor,setFloor]=useState<string|null>(initialBuilding&&initialBuilding!=="2동 병동"?"5":null);
 return <div className="hospital-floor-guide">
   <p>강남세브란스병원 입원동을 선택하세요.</p>
   <nav aria-label="강남세브란스병원 입원동 선택" className="hospital-floor-buttons">{buildings.map(building=><button key={building} type="button" aria-pressed={selected===building} aria-controls="gangnam-building-detail" onClick={()=>{setSelected(building);setFloor(building!=="2동 병동"?"5":null)}}><strong>{building}</strong><span>층별 병동·병실 안내</span></button>)}</nav>
   <section id="gangnam-building-detail" aria-live="polite" className="hospital-floor-detail">
     {selected==="2동 병동"?<><h3>2동 층별 병동·병실</h3><nav aria-label="2동 층별 안내" className={styles.floorButtons}>{secondBuildingFloors.map(item=><button type="button" key={item.id} aria-pressed={floor===item.id} onClick={()=>setFloor(item.id)}><strong>{item.id}층</strong><span>{item.title}</span></button>)}</nav>{floor&&<>{floor==="5"?<><h3>2동 5층 · 51·52병동</h3><p>4인실 8개 · 6인실 4개</p><div className={styles.plan} aria-label="2동 5층 병실 배치도"><div className={styles.topRow}>{fourTop.map(number=><Room key={number} number={number} capacity={4}/>)}</div><div className={styles.center}><span>복도</span><b>간호사실</b><span>연결통로</span></div><div className={styles.bottomRow}>{fourBottom.map(number=><Room key={number} number={number} capacity={4}/>)}<div className={styles.divider}>간이주방</div>{sixRooms.map(number=><Room key={number} number={number} capacity={6}/>)}</div></div><p className={styles.note}>첨부된 2동 5층 안내도를 바탕으로 간병이 필요한 병실만 표시했습니다.</p></>:<p><strong>{secondBuildingFloors.find(item=>item.id===floor)?.id}층 · {secondBuildingFloors.find(item=>item.id===floor)?.title}</strong><br/>{secondBuildingFloors.find(item=>item.id===floor)?.detail}</p>}</>}</>:selected==="3동 병동"?<ThirdBuilding floor={floor} onSelect={setFloor}/>:selected==="1동 병동"?<FirstBuilding floor={floor} onSelect={setFloor}/>:<p>1동, 2동 또는 3동을 누르면 안내가 표시됩니다.</p>}
   </section>
 </div>;
}
