"use client";
import {useState} from 'react';
export default function FloorKeyPlan({building,ward}:{building:string;ward:string}){
 const [failed,setFailed]=useState(false);
 const floor=ward.match(/\d+/)?.[0]||'6';
 const dong=building==='1동'?'A':'B';
 const imageFloor=dong==='A'&&['10','11'].includes(floor)?'5':floor;
 const href=`https://www.snubh.org/intro/floor/guide.do?dong=${dong}&floor=${floor}F`;
 return <aside className="floor-keyplan-small"><strong>KEY PLAN · {building} {floor}층</strong><a href={href} target="_blank" rel="noopener noreferrer">{!failed&&<img src={`https://www.snubh.org/front/images/introduce/img_floor${dong}_${imageFloor}.gif`} alt={`${building} ${floor}층 공식 층별 안내도`} onError={()=>setFailed(true)}/>}공식 도면 확대 ↗</a></aside>;
}
