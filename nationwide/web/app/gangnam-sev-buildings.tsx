"use client";

import { useState } from "react";

const buildings = {
  "1동": [["5층", "1501~1510 · 1512~1522호"], ["6층", "1601~1622호"], ["7층", "1701~1711호"], ["8층", "1801~1809호"]],
  "2동": [["4층", "41·42병동 · 분만실"], ["5층", "51·52병동 · 2501~2569호 · 방사성동위원소치료실"], ["6층", "61병동 · 신경외과중환자실·뇌졸중집중치료실"], ["7층", "71·72병동"], ["8층", "81병동"]],
  "3동": [["5층", "54병동 · 3501~3514호 · 수련의 의국"], ["6층", "63·64병동 · 3601~3662호"], ["7층", "73·74병동 · 3701~3762호"], ["8층", "83병동 · 3801~3836호"]],
} as const;

export default function GangnamSevBuildings() {
  const [building, setBuilding] = useState<keyof typeof buildings>("1동");
  const [floor, setFloor] = useState("");
  const selected = buildings[building].find(([name]) => name === floor);
  return <section className="hospital-floor-guide" aria-labelledby="gangnam-floor-guide-title">
    <h2 id="gangnam-floor-guide-title">강남세브란스병원 병동·병실 안내</h2>
    <p>입원동과 층을 선택하면 병동 안내를 확인할 수 있습니다. 실제 병실·침상 배정은 병원 현장 확인이 필요합니다.</p>
    <nav className="hospital-floor-buttons" aria-label="입원동 선택">{(Object.keys(buildings) as Array<keyof typeof buildings>).map((name) => <button key={name} type="button" aria-pressed={building === name} onClick={() => { setBuilding(name); setFloor(""); }}><strong>{name}</strong><span>병동·병실 안내</span></button>)}</nav>
    <h3>{building} 층별 안내</h3>
    <nav className="hospital-floor-buttons" aria-label={`${building} 층 선택`}>{buildings[building].map(([name, detail]) => <button key={name} type="button" aria-pressed={floor === name} onClick={() => setFloor(name)}><strong>{name}</strong><span>{detail}</span></button>)}</nav>
    {selected ? <div className="hospital-floor-detail" aria-live="polite"><h3>{building} {selected[0]}</h3><p>{selected[1]}</p><p className="floor-guide-note">층별 안내도는 참고용입니다. 진료과·병동 운영 및 실제 병실 번호는 병원 안내에 따라 달라질 수 있습니다.</p></div> : <p>층을 선택하면 안내가 표시됩니다.</p>}
    <a href="https://gs.severance.healthcare/gs/patient-carer/guide/facility/floormap.do" target="_blank" rel="noopener noreferrer">강남세브란스병원 공식 층별 안내 ↗</a>
  </section>;
}
