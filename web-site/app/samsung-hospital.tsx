"use client";

import {useState} from "react";
import {ArrowLeft, Building2, ChevronRight, ExternalLink} from "lucide-react";
import guide from "@/lib/samsung-guide.json";
import WardBoard from "./ward-board";
import "./samsung-hospital.css";

const buildings = guide.buildings.filter(building => building.id !== "proton");
const officialMap = "https://www.samsunghospital.com/home/info/map.do";
const changes = "https://www.samsunghospital.com/home/info/noticeView.do?seq=2364";
type Floor = (typeof guide.buildings)[number]["floors"][number];

function summary(floor: Floor) {
  const clinical = floor.facilities.filter(item => /간호사실|중환자실|분만|신생아|이식|낮병동|임상시험/.test(item));
  return (clinical.length ? clinical : floor.facilities).slice(0, 3).join(" · ") || "세부 시설은 공식 안내에서 확인해 주세요";
}

export function SamsungBuildings({onSelect}: {onSelect: (building: string) => void}) {
  return <>
    <div className="legacy-buildings samsung-buildings">
      {buildings.map((building, index) => <button type="button" key={building.id} onClick={() => onSelect(building.name)}>
        <div className={index === 0 ? "teal" : "navy"}><Building2/><strong>{building.name}</strong></div>
        <section><h2>{building.name} 병동·시설</h2><p>{building.floors.filter(floor => floor.hasWard).length}개 층 병동·집중치료 안내</p><b>층별 병동 보기 <ChevronRight/></b></section>
      </button>)}
    </div>
    <p className="legacy-guide samsung-source-note">공식 병원둘러보기 공개 자료 기준 · 확인 {guide.checkedAt}. 리모델링으로 위치가 달라질 수 있으니 입원 안내문을 우선 확인하세요. <a href={changes} target="_blank" rel="noopener noreferrer">원내 위치 변경 안내 ↗</a></p>
    <a className="samsung-treatment-link" href="https://www.samsunghospital.com/_newhome/info/guide/proton/B1F.html" target="_blank" rel="noopener noreferrer">양성자치료센터 공식 위치 안내 <ExternalLink size={16}/></a>
  </>;
}

export function SamsungFloors({buildingName, onBack, onSelect}: {buildingName: string; onBack: () => void; onSelect: (floor: string) => void}) {
  const [showAll, setShowAll] = useState(false);
  const building = buildings.find(item => item.name === buildingName);
  if (!building) return <button onClick={onBack}>건물 선택으로</button>;
  const floors = building.floors.filter(floor => showAll || floor.hasWard);
  return <div className="legacy-wards samsung-floors">
    <button type="button" className="legacy-back" onClick={onBack}><ArrowLeft/>본관·암병원·별관 선택으로</button>
    <section>
      <header><span><Building2/></span><div><p>삼성서울병원 통합간병 앱</p><h1>{building.name} 층별 병동</h1></div></header>
      <div className="samsung-floor-filters" aria-label="층 안내 범위">
        <button type="button" aria-pressed={!showAll} onClick={() => setShowAll(false)}>병동·집중치료</button>
        <button type="button" aria-pressed={showAll} onClick={() => setShowAll(true)}>전체 층·시설</button>
      </div>
      <div className="legacy-ward-grid">{floors.map(floor => <button type="button" key={floor.id} onClick={() => onSelect(floor.id)}>
        <span><small>{floor.id}</small><b>{floor.label} · {floor.hasWard ? "병동·치료시설" : "시설 안내"}<em>{summary(floor)}</em></b></span><ChevronRight/>
      </button>)}</div>
      <p className="legacy-guide">층을 선택하면 공식 시설 목록과 안내도를 확인할 수 있습니다. 병실·침상 평면은 현장 확인 후 등록합니다.</p>
    </section>
  </div>;
}

export function SamsungFloorDetail({buildingName, floorId, onBack}: {buildingName: string; floorId: string; onBack: () => void}) {
  const [imageFailed, setImageFailed] = useState(false);
  const building = buildings.find(item => item.name === buildingName);
  const floor = building?.floors.find(item => item.id === floorId);
  if (!building || !floor) return <button onClick={onBack}>층별 안내로</button>;
  return <div className="samsung-floor-detail">
    <button type="button" className="legacy-back" onClick={onBack}><ArrowLeft/>{building.name} 층별 병동으로</button>
    <section className="card samsung-official-plan">
      <p className="eyebrow">삼성서울병원 공식 공개 안내</p><h1>{building.name} {floor.label}</h1>
      <p>공식 안내도에 표시된 시설입니다. 현재 병동 배정은 병원의 입원 안내를 확인하세요.</p>
      {floor.facilities.length > 0 ? <ul className="samsung-facilities">{floor.facilities.filter(Boolean).map((item, index) => <li key={index}>{item}</li>)}</ul> : <p>공식 페이지에 상세 시설 목록이 없어 표시하지 않았습니다.</p>}
      <a href={floor.source} target="_blank" rel="noopener noreferrer">{building.name} {floor.label} 공식 안내도 열기 ↗</a>
      <details><summary>공식 층별 안내도 펼치기</summary>{floor.planUrl && !imageFailed ? <a href={floor.source} target="_blank" rel="noopener noreferrer"><img src={floor.planUrl} alt={`삼성서울병원 ${building.name} ${floor.label} 공식 층별 안내도`} onError={() => setImageFailed(true)}/></a> : <p>위의 공식 안내도 링크에서 확인해 주세요.</p>}</details>
    </section>
    {floor.hasWard && <><p className="samsung-source-note">아래 병실·침상 평면은 현장 확인용 예시입니다. 실제 병실번호·침상·문·창문 위치는 현장 도면을 받아 반영합니다.</p><WardBoard key={building.id+floor.id} building={building.name} ward={`${floor.label} · 병동`} hospitalName="삼성서울병원" hideKeyPlan onBack={onBack}/></>}
  </div>;
}

export function SamsungIntroduction({hospitalId}: {hospitalId: string}) {
  return <section className="card samsung-introduction">
    <h2>삼성서울병원 소개·찾아오는 길</h2>
    <p>서울 강남구 일원동에 위치한 삼성서울병원은 본관·별관·암병원과 양성자치료센터로 구성되어 있습니다. 이 화면은 건물별 공식 층별 안내를 바탕으로 입원 병동과 주요 시설을 찾도록 구성했습니다.</p>
    <p><strong>주소</strong> · {guide.address}</p>
    <h3>병원 셔틀버스</h3><p>SRT 수서역 3번 출구 셔틀 정류장 → 지하철 수서역 1번 출구 → 일원역 1번 출구 → 본관 Gate 1 → 암병원 Gate 7·Gate 6 순서로 이동합니다. 돌아오는 길의 일원역 7번 출구와 수서역 6번 출구는 하차 전용입니다.</p>
    <p><a href="https://www.samsunghospital.com/en/patient-guide/location-parking.do" target="_blank" rel="noopener noreferrer">공식 셔틀 노선·시간표 확인 ↗</a></p>
    <h3>지하철</h3><p>3호선 일원역 1번 출구에서 병원 방면으로 이동합니다. 현재 버스 환승·도보 경로는 아래 지도에서 확인하세요.</p>
    <div className="samsung-direction-links"><a href={officialMap} target="_blank" rel="noopener noreferrer">셔틀버스·공식 교통안내 ↗</a><a href="https://map.naver.com/p/search/서울특별시%20강남구%20일원로%2081%20삼성서울병원" target="_blank" rel="noopener noreferrer">지도·대중교통 경로 ↗</a><a href="https://www.samsunghospital.com/module/map/map.jsp" target="_blank" rel="noopener noreferrer">지하철·버스 안내 출처 ↗</a></div>
    <p><a href={`/hospital-registration?hospital=${encodeURIComponent(hospitalId)}&name=${encodeURIComponent(guide.name)}`}>이 병원 간병인 등록·승인 현황</a></p>
  </section>;
}
