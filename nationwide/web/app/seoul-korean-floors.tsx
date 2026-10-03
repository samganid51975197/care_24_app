"use client";
import {useState} from "react";
const floors = [
  {floor:9, title:"입원병동 · 4인실", items:["4인실", "수족온욕실", "반신욕실"]},
  {floor:10, title:"입원병동 · 4인실", items:["4인실", "뜸치료실"]},
  {floor:11, title:"입원병동 · 1인실·VVIP실", items:["1인실", "VVIP실", "혜화라운지"]},
  {floor:1, title:"병원입구 · 주차장", items:["주차장·병원입구"]},
  {floor:3, title:"웰니스 라운지", items:["웰니스 라운지"]},
  {floor:4, title:"혜화홀", items:["혜화홀"]},
  {floor:6, title:"접수·수납 · 여성의학센터", items:["원무팀(접수·수납)", "여성의학센터", "치료실", "좌훈실"]},
  {floor:7, title:"척추신경재활센터", items:["척추신경재활센터", "물리치료실", "도수치료실", "견인치료실", "치료실"]},
  {floor:8, title:"동서암·통합면역센터 · 혜화의과센터", items:["동서암센터·통합면역센터", "혜화의과센터", "진단검사의학팀", "영상의학팀", "면역치료실", "고주파온열암치료실", "치료실"]},
  {floor:12, title:"공식 사진 안내", items:["공식 자료에는 12층 사진만 게시되어 있습니다. 시설 명칭은 병원에 확인해 주세요."]},
  {floor:13, title:"식당", items:["식당"]},
];
export default function SeoulKoreanFloors(){
 const [selected,setSelected]=useState<number|null>(null);
 const detail=floors.find(x=>x.floor===selected);
 return <div className="hospital-floor-guide">
   <p>대전대학교서울한방병원 · 층을 선택하면 병동·시설 안내가 열립니다.</p>
   <nav aria-label="층별 안내" className="hospital-floor-buttons">{floors.map(x=><button type="button" key={x.floor} aria-pressed={selected===x.floor} aria-controls="hospital-floor-detail" onClick={()=>setSelected(x.floor)}><strong>{x.floor}층</strong><span>{x.title}</span></button>)}</nav>
   <section id="hospital-floor-detail" aria-live="polite" className="hospital-floor-detail">{detail?<><h3>{detail.floor}층 · {detail.title}</h3><ul>{detail.items.map(item=><li key={item}>{item}</li>)}</ul>{[9,10,11].includes(detail.floor)&&<p>병실번호·침상 위치는 공식 자료에 공개되지 않았습니다. 입원 안내문 또는 병동 간호사실에서 확인해 주세요.</p>}</>:<p>위의 층 버튼을 눌러 안내를 확인하세요.</p>}</section>
   <p className="hospital-floor-source">출처: 병원 공식 ‘병원 둘러보기’ · 확인일 2026.09.26</p>
   <a href="https://www.djuse.or.kr/content/lookaround" rel="noopener noreferrer">병원 공식 층별 사진 보기 ↗</a>
 </div>;
}
