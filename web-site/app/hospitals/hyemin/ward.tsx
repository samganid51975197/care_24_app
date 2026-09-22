"use client";
import {useState} from 'react';
import WardBoard from '../../ward-board';
import './hyemin.css';
const floors:Record<string,number[]>={'본관':[5,6,7],'신관':[3,5,6]};
export default function HyeminWard(){
 const [building,setBuilding]=useState('본관'),[floor,setFloor]=useState(5),[opened,setOpened]=useState(false),[imageFailed,setImageFailed]=useState(false),[selectedRoom,setSelectedRoom]=useState("A");
 return <main className="hyemin-app"><header className="hyemin-brand"><a href="/hospitals" aria-label="전국 병원 보기"><img src="/ganbyeong24-logo-cropped.webp" alt="간병24 로고"/></a><div><strong>혜민병원 통합간병 앱</strong><small>대한노인돌봄서비스협회 관리</small></div></header>
 <div className="hyemin-overview"><section><p>서울 광진구 자양로 85</p><h1>혜민병원 층별 병실</h1><p>병동 선택 → 병실 평면 → 침상 정보 입력</p><div className="hyemin-intro"><strong>혜민병원 소개</strong><p>광진구 자양동에 위치한 종합병원으로, 내과·외과·정형외과·신경과 등 다양한 진료과를 갖추고 있습니다. 응급의료와 입원 진료를 제공하며, 인공신장실을 운영합니다.</p><a href="https://www.hira.or.kr/ra/hosp/hospInfoAjax.do?ykiho=JDQ4MTg4MSM1MSMkMSMkMCMkODkkMzgxMzUxIzExIyQxIyQ3IyQ2MiQyNjEwMDIjNjEjJDEjJDQjJDgz" target="_blank" rel="noopener noreferrer">건강보험심사평가원 병원정보 ↗</a></div><div className="hyemin-directions"><strong>찾아오는 길</strong><p>서울특별시 광진구 자양로 85</p><ol className="hyemin-transit"><li><b>전철·지하철</b><span>2호선 구의역 4번 출구 → 병원까지 도보 약 5분</span></li><li><b>시외버스</b><span>동서울터미널 도착 시 → 강변역에서 2호선 건대입구 방면 → 구의역 하차 후 도보</span></li><li><b>시내버스</b><span>2224·2227·3220번 → 자양사거리 하차 후 병원까지 도보</span></li><li><b>마을버스</b><span>광진05번 → 자양사거리 하차 후 병원까지 도보</span></li></ol><small>승차 방향과 최신 운행 경로는 지도에서 확인하세요.</small><a href="https://map.naver.com/p/search/%ED%98%9C%EB%AF%BC%EB%B3%91%EC%9B%90%20%EA%B4%91%EC%A7%84%EA%B5%AC%20%EC%9E%90%EC%96%91%EB%A1%9C%2085" target="_blank" rel="noopener noreferrer">지도·길찾기 ↗</a></div></section><figure>{!imageFailed?<img src="https://www.15774129.go.kr/BCUser/facilitypic/1000000899/1554366532608.jpg" alt="서울 광진구 혜민병원 건물 전경 참고 사진" onError={()=>setImageFailed(true)}/>:<p>전경 사진은 출처에서 확인할 수 있습니다.</p>}<figcaption>혜민병원 건물 전경 · 촬영 시점 미확인<br/><a href="https://www.goifuneral.co.kr/parlor/437/" target="_blank" rel="noopener noreferrer">사진 출처 보기 ↗</a></figcaption></figure></div>
 <p className="hyemin-verification">현장 확인 전 기본 배치입니다. 층 목록은 2016년 공개 자료를 참고했으며 현재 운영 층·병실번호와 다를 수 있습니다. 병원 담당자가 확인한 평면도를 받으면 실제 배치로 교체합니다.</p>
 <nav className="hyemin-building" aria-label="혜민병원 건물 선택">{Object.keys(floors).map(b=><button key={b} aria-pressed={building===b} onClick={()=>{setBuilding(b);setFloor(floors[b][0]);setOpened(false)}}>{b}</button>)}</nav>
 <nav className="hyemin-floors" aria-label="혜민병원 층 선택">{floors[building].map(f=><button key={f} aria-pressed={floor===f} onClick={()=>{setFloor(f);setOpened(true)}}><b>{f}층 병실</b><small>현장 확인 필요</small></button>)}</nav>
 <aside className="hyemin-keyplan"><strong>KEY PLAN · {building} {floor}층</strong><div className="hyemin-room-partitions"><b className="hyemin-plan-corridor">중앙 복도</b>{["A","B","C","D","E","F"].map((r,i)=><button key={r} type="button" style={{gridColumn:i%2?3:1,gridRow:Math.floor(i/2)+1}} aria-pressed={opened&&selectedRoom===r} onClick={()=>{setSelectedRoom(r);setOpened(true)}}><strong>병실 {r}</strong><small>예시 구획</small></button>)}</div><small>기본 개념도 · 실제 건물 외곽과 위치는 미확인</small></aside>
 {!opened&&<button className="hyemin-open" onClick={()=>setOpened(true)}>{building} {floor}층 병실 기본 배치 보기</button>}
 {opened&&<WardBoard key={building+floor+selectedRoom} initialRoom={selectedRoom} hospitalName="혜민병원" hideKeyPlan building={building} ward={`${floor}층 · 병동`} onBack={()=>setOpened(false)}/>}
 <details className="hyemin-sources"><summary>층별 자료 출처와 확인 범위</summary><p>2016년 지역 현황 자료에 본관 5·6·7층 병실, 신관 3·5·6층 병실이 기재되어 있습니다. 2020년 리모델링 이후 현재 평면과 병실번호는 확인되지 않았습니다. 본관 3층 중환자실은 과거 자료에만 나타나 일반 병실 목록에 넣지 않았습니다.</p><a href="https://prezi.com/u6fmih96tf7h/presentation/" target="_blank" rel="noopener noreferrer">2016년 지역 현황 자료 ↗</a><p>전경 사진은 건물 외관 참고용이며 키플랜이나 측량 도면이 아닙니다.</p></details>
 </main>;
}



