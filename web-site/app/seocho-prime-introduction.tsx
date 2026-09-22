import {Button} from '@/components/ui/button';
const treatments=[
  {title:'운동·작업치료',description:'환자의 기능 평가에 따라 움직임·보행과 손 사용 등 일상에 필요한 기능의 회복을 돕습니다.',page:'01'},
  {title:'일상생활동작치료',description:'자기관리, 이동, 휠체어 사용 등 일상생활의 독립성을 높이는 훈련을 진행합니다.',page:'02'},
  {title:'언어·인지치료',description:'언어와 의사소통의 어려움, 인지기능 저하에 대해 환자 상태에 맞춘 치료를 진행합니다.',page:'03'},
  {title:'통증·연하치료',description:'통증 완화를 위한 치료와 음식물을 삼키는 기능을 돕는 연하 재활치료를 안내합니다.',page:'04'},
];
export default function SeochoPrimeIntroduction({onCareRequest}:{onCareRequest:()=>void}){
  return <section className="card" style={{margin:"20px 0",lineHeight:1.8}} aria-label="서초프라임요양병원 안내">
    <h2>서초프라임요양병원 소개·찾아오는 길</h2>
    <p>서울 서초구에 위치한 요양병원으로, 운동·작업치료, 일상생활동작치료, 언어·인지치료 등 재활 프로그램을 운영합니다.</p>
    <p>환자·보호자는 간병 의뢰서에 치료 일정과 치료실 이동·동행 도움을 함께 작성할 수 있습니다.</p>
    <section aria-labelledby="prime-rehabilitation-title" style={{margin:'20px 0',padding:18,border:'1px solid #acd0c7',borderRadius:14,background:'#f3faf7'}}>
      <h2 id="prime-rehabilitation-title">재활치료 안내</h2>
      <p>환자 상태를 평가한 후 의료진이 치료 종류와 일정을 정합니다.</p>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(min(100%,240px),1fr))',gap:14}}>
        {treatments.map(t=><article key={t.page} style={{padding:16,borderRadius:10,background:'#fff',border:'1px solid #dce7e3'}}><h3>{t.title}</h3><p>{t.description}</p><a href={`https://prime7575.co.kr/treatment_${t.page}.php`} target="_blank" rel="noopener noreferrer">병원 공식 {t.title} 안내 ↗</a></article>)}
      </div>
      <h3 style={{marginTop:18}}>재활치료 중 간병 도움</h3>
      <p>치료실 왕복 동행, 휠체어 이동, 일정 확인 등 필요한 도움을 의뢰서에 적어주세요. 치료는 의료진·치료사가 시행하며 간병인은 의료진이 안내한 범위에서 일상생활을 돕습니다.</p>
      <Button type="button" onClick={onCareRequest}>재활치료 도움 포함 간병 의뢰</Button>
      <p><small>병원 공식 재활센터 안내 기준 · 2026.9.22 확인</small></p>
    </section>
    <div className="request-grid">
      <div><h3>병원 안내</h3><p>서울특별시 서초구 방배천로2길 22 (방배동)</p><p><a href="tel:025887575">병원 대표전화 02-588-7575</a><br/><a href="tel:01021352875">병원 입원상담 010-2135-2875</a></p></div>
      <div><h3>대중교통</h3><p>2호선 사당역 13·14번 출구에서 도보 약 1분<br/>4호선 사당역 12번 출구에서 도보 약 2분</p><a href={"https://map.naver.com/p/search/"+encodeURIComponent("서초프라임요양병원 서울 서초구 방배천로2길 22")} target="_blank" rel="noopener noreferrer">지도에서 위치·길찾기 확인 ↗</a></div>
      <div><h3>진료시간</h3><p>평일 09:00–17:30<br/>토요일 09:00–13:00<br/>점심 12:00–13:00<br/>일요일·공휴일 휴무</p></div>
    </div>
    <details><summary>병동·입원 안내</summary><p>공식 홈페이지에서 VIP병동·격리병동 안내를 확인할 수 있습니다. 실제 건물·층·병실·침상 배치는 현장 확인 자료 등록 후 제공됩니다.</p><p><a href="https://prime7575.co.kr/hospital_05.php" target="_blank" rel="noopener noreferrer">공식 병동 안내 ↗</a> · <a href="https://prime7575.co.kr/guide_02.php" target="_blank" rel="noopener noreferrer">입퇴원 및 필요서류 ↗</a></p></details>
    <p><a href="/hospital-registration?hospital=seocho-prime&name=%EC%84%9C%EC%B4%88%ED%94%84%EB%9D%BC%EC%9E%84%EC%9A%94%EC%96%91%EB%B3%91%EC%9B%90">이 병원 간병인 등록·승인 현황</a></p>
    <small>안내 출처: <a href="https://prime7575.co.kr/hospital_01.php" target="_blank" rel="noopener noreferrer">병원 공식 소개</a> · <a href="https://prime7575.co.kr/guide_01.php" target="_blank" rel="noopener noreferrer">공식 진료·교통 안내</a> (2026.9.22 확인). 입원·진료 일정은 병원에 확인해 주세요.</small>
  </section>;
}
