const rehabLessons=[
 ['guide','patient','재활치료 안내','시작 전 꼭 확인하세요','✚',['환자마다 치료 목표와 허용되는 움직임이 다릅니다. 먼저 담당 의료진의 운동 허용 여부를 확인합니다.','오늘 할 동작, 도움 인원, 횟수와 쉬는 시간을 치료사에게 배운 뒤 시작합니다.','갑작스러운 흉통·숨참·실신·새로운 마비나 말 어눌함이 있으면 운동을 멈추고 즉시 병원 직원에게 알립니다.']],
 ['bed','patient','침상 재활운동','누워서 하는 운동','▰',['의료진이 허용한 경우 발목을 몸 쪽과 반대쪽으로 천천히 움직이는 동작부터 배웁니다.','무릎 굽히기·펴기와 고관절 운동은 수술·골절·피부 상태에 따라 제한될 수 있습니다. 환자별 허용 범위를 확인합니다.','옆으로 돌아눕기는 치료사에게 배운 방법과 필요한 도움을 사용합니다. 팔을 잡아당기거나 몸을 침대 위로 끌지 않습니다.']],
 ['joints','patient','관절운동','굳은 관절을 부드럽게','↔',['어깨·팔꿈치·손목·손가락·무릎·발목 중 오늘 허용된 부위를 확인합니다.','가능하면 환자가 스스로 움직이고, 보조가 필요한 동작은 전문가에게 배운 범위에서만 돕습니다.','통증이나 저항을 무시해 끝까지 꺾지 않습니다. 마비된 어깨를 당기거나 억지로 머리 위로 올리지 않습니다.']],
 ['strength','patient','근력운동','힘을 키우는 운동','＋',['상지·하지·몸통 중 치료사가 정한 부위와 강도를 확인합니다.','덤벨·밴드·무게추는 개별 운동계획에 있을 때만 사용합니다. 임의로 무게나 횟수를 늘리지 않습니다.','힘을 줄 때 숨을 참지 않도록 돕고, 피로·통증이 생기면 쉬면서 담당자에게 알립니다.']],
 ['sit','patient','앉기·일어서기','일상으로 한 걸음','↥',['침상 가장자리에 앉기 전에 기립성 어지럼, 체중부하 제한과 도움 인원을 확인합니다.','의자·휠체어 고정과 발 위치는 병원에서 배운 방법으로 준비합니다.','혼자 일어서게 하거나 간병인의 목을 붙잡고 일어나게 하지 않습니다. 이동은 교육받은 방법과 도구를 사용합니다.']],
 ['walk','patient','보행훈련','다시 걷는 일상','→',['걷기 허용 여부와 필요한 보행기·지팡이, 동행 인원을 확인합니다.','통로의 물기와 장애물, 신발 상태와 연결된 관을 살핍니다.','계단·보행기 사용은 치료사에게 배운 뒤 시행합니다. 어지럼이나 휘청거림이 있으면 즉시 안전하게 멈추고 도움을 요청합니다.']],
 ['swallow','patient','연하 재활치료(삼킴장애)','안전한 삼킴과 식사 보조','◡',['연하란 음식·물·침을 삼키는 과정입니다. 삼킴이 어려운 상태를 연하장애라고 합니다.','연하 재활은 평가에 맞춰 삼킴 기능과 안전한 섭취를 돕는 치료입니다. 음식을 부드럽게 만드는 연화와는 구분합니다.','의료진이 정한 식사 허용 여부·음식 형태·물의 점도·자세를 확인하고 보호자와 간병인이 같은 계획을 따릅니다.']],
 ['daily','patient','일상생활훈련','스스로 하는 생활','⌂',['세면·옷 입기·식사처럼 환자가 원하는 작은 목표를 함께 정합니다.','한 번에 한 가지를 설명하고 스스로 할 시간을 충분히 줍니다. 필요한 부분만 돕습니다.','마비·삼킴·인지 상태에 맞춘 보조도구와 방법은 작업치료사·간호사의 지시를 따릅니다.']],
 ['discharge','patient','퇴원 후 재활관리','가정에서도 이어가기','✓',['퇴원 전에 허용 운동·금지 동작·약·진료일과 문의 연락처를 확인합니다.','집의 통로·욕실·침대 주변을 점검하고 필요한 보조도구 사용법을 배웁니다.','병원 운동계획을 집에 맞게 확인받습니다. 증상 변화가 있으면 운동을 늘리기보다 담당기관에 먼저 문의합니다.']],
 ['neuro-guide','neuro','뇌신경 재활치료 안내','시작 전 꼭 확인하세요','✦',['뇌졸중·파킨슨병 등 질환과 손상 부위에 따라 치료 내용이 달라집니다.','움직임뿐 아니라 말하기·삼킴·기억·감정도 함께 살피며 재활팀의 계획을 따릅니다.','새로운 얼굴 처짐·마비·말 어눌함 등 갑작스러운 변화는 즉시 병원 직원에게 알립니다.']],
 ['brain','neuro','뇌 기능 이해하기','뇌의 구조와 기능','◉',['뇌는 움직임·감각·언어·기억 등 여러 기능을 조절합니다.','회복 속도와 양상은 사람마다 다릅니다. 다른 환자와 비교하거나 회복을 약속하지 않습니다.','어려운 동작과 잘 되는 동작을 재활팀에 알려 도움 방법을 조정합니다.']],
 ['arm','neuro','상지(팔) 기능 회복운동','일상생활 동작 향상','↗',['마비된 팔은 베개나 지지대로 편안하게 받치고 늘어뜨리지 않습니다.','팔을 잡아당겨 환자를 일으키지 않습니다. 어깨 위치와 보조 방법은 치료사에게 배웁니다.','쥐기·펴기·물건 잡기 등은 개별 능력에 맞춰 허용된 활동으로 연습합니다.']],
 ['leg','neuro','하지(다리) 기능 회복운동','걷는 힘을 다시','↥',['다리 힘·감각·균형 상태와 체중을 실어도 되는 정도를 확인합니다.','침상 동작에서 앉기·서기로 넘어가는 시점은 재활팀이 결정합니다.','마비된 다리나 발이 꺾이거나 끼이지 않도록 살피며 이동을 돕습니다.']],
 ['speech','neuro','언어·삼킴 재활훈련','소통하는 즐거움','…',['짧은 문장과 예·아니오 질문을 사용하고 답할 시간을 충분히 줍니다.','삼킴 평가는 전문 치료 영역입니다. 정해진 음식 형태·점도·자세와 금식 지시를 따릅니다.','물이나 음식으로 삼킴을 시험하지 않습니다. 식사 중 기침·젖은 목소리·호흡 변화가 있으면 중단하고 담당자에게 알립니다.']],
 ['cognition','neuro','인지기능 향상훈련','기억하고 생각하는 힘','◎',['오늘 날짜·장소와 다음 활동을 차분하고 짧게 알려줍니다.','익숙한 사진·물건을 활용하되 피로와 집중 시간에 맞춰 활동을 줄입니다.','틀렸다고 다그치지 않습니다. 갑작스러운 혼란·졸림·행동 변화는 간호사에게 알립니다.']],
 ['mood','neuro','감정관리와 사회복귀','더 나은 일상을 위해','♡',['불안·슬픔·좌절을 듣고 환자가 할 수 있는 작은 선택을 존중합니다.','가족과 치료 목표를 공유하고 면회·사회활동은 피로도에 맞춥니다.','지속되는 우울감이나 심한 불안은 재활팀에 알려 상담·지원 서비스를 연결합니다.']]
];
const rehabSources=[['침상 운동 안내','https://www.nth.nhs.uk/resources/bed-exercise/'],['뇌졸중 후 팔 지지·자세','https://www.nth.nhs.uk/resources/how-to-position-your-arm-after-a-stroke/'],['뇌졸중 회복과 재활','https://www.nhs.uk/conditions/stroke/recovery/']];

const swallowSources=[
 ['삼킴장애 증상과 치료 · NHS','https://www.nhs.uk/symptoms/swallowing-problems-dysphagia/'],
 ['개별 삼킴 재활과 구강관리 · Guy’s and St Thomas’','https://www.guysandstthomas.nhs.uk/health-information/dysphagia-or-swallowing-problems'],
 ['기침 없는 흡인 · Kingston and Richmond','https://www.kingstonandrichmond.nhs.uk/patients-and-families/patient-leaflets/dysphagia-swallowing-difficulties/submit/37072'],
 ['삼킴장애 환자 구강관리 · Leeds Community Healthcare','https://leedscommunityhealthcare.nhs.uk/our-services-a-z/adults-speech-and-language-therapy-2/i-need-more-information-on-swallowing-problems/oral-care-guide-for-people-with-dysphagia/'],
 ['약을 삼키기 어려울 때 · NHS','https://www.nhs.uk/conditions/problems-swallowing-pills/']
];
function swallowEducation(){return `<section class="swallow-education" aria-label="삼킴장애 돌봄 안내">
 <h2>① 평가와 재활치료</h2>
 <p>담당 의사와 삼킴 전문 치료사가 삼킴 상태를 평가하고 치료계획을 정합니다. 필요하면 추가 검사를 안내합니다. 입·혀 움직임, 삼키는 힘이나 타이밍을 돕는 훈련, 자세 조정 등은 평가 결과에 따라 선택합니다.</p>
 <p><strong>보호자·간병인은 배운 방법을 돕습니다.</strong> 치료사에게 동작을 보여 달라고 요청하고, 직접 해 보며 방법·횟수·중단 기준을 확인하세요. 턱 당기기, 고개 돌리기, 반복 삼킴 등을 모든 환자에게 똑같이 적용하지 않습니다.</p>
 <h2>② 식사 보조는 이렇게 확인해요</h2>
 <div class="swallow-steps">
 <section><h3>식사 전</h3><ul><li>금식 여부와 입으로 먹어도 되는지 확인합니다. 금식 중에는 물·음식으로 시험하지 않습니다.</li><li>환자가 충분히 깨어 있는지 확인하고, 병원에서 정한 식사 자세와 도움 방법을 준비합니다.</li><li>허용된 음식 형태·물의 점도·도구·한입 양을 확인합니다. 점도증진제는 지시대로 사용합니다.</li></ul></section>
 <section><h3>식사 중</h3><ul><li>병원에서 정한 양과 속도로 돕고, 삼킬 시간을 충분히 줍니다. 재촉하거나 억지로 먹이지 않습니다.</li><li>기침·사레·젖은 목소리·호흡 변화가 생기면 먹이기를 중단하고 간호사에게 즉시 알립니다.</li><li>졸림·심한 피로가 생기면 중단하고 상태를 확인받습니다. 물로 넘기게 하지 않습니다.</li></ul></section>
 <section><h3>식사 후</h3><ul><li>입안의 남은 음식과 불편감을 확인하고 교육받은 방법으로 구강관리를 돕습니다.</li><li>식후 자세와 유지 시간은 환자별 병원 지시를 따릅니다.</li><li>먹고 마신 양, 식사 시간, 기침·목소리 변화 등을 담당자에게 전달합니다.</li></ul></section>
 </div>
 <h2>③ 꼭 구분할 위험 신호</h2>
 <aside class="rehab-notice"><strong>숨을 못 쉬거나 말을 못 하고, 입술이 파래지거나 의식이 떨어지면 응급상황입니다.</strong><p>즉시 병원 응급호출로 직원을 부르세요. 병원 밖에서는 119에 연락하고 안내를 따르세요. 물이나 음식을 더 주지 않습니다.</p></aside>
 <p>흡인은 음식·물·침 등이 기도로 들어가는 것입니다. <strong>기침이 없는 ‘무증상 흡인’도 있어, 기침이 없다고 안전한 것은 아닙니다.</strong> 반복되는 발열·가래·호흡 변화, 섭취량 감소·체중 감소는 의료진에게 알려 평가받습니다.</p>
 <h2>④ 구강관리·약·관급식 주의사항</h2>
 <ul><li>금식하거나 콧줄·위루관으로 영양을 받아도 구강관리가 필요합니다. 칫솔질·틀니 관리 방법을 간호사에게 배우세요. 헹구거나 뱉기 어렵다면 물을 입에 붓지 말고 안전한 방법을 확인합니다.</li><li>약을 임의로 부수거나 캡슐을 열어 음식에 섞지 않습니다. 간호사·약사에게 안전한 투약 방법을 확인합니다.</li><li>관급식 중 입으로 먹는 연습을 할 수 있는지는 별도로 확인합니다. 음식의 부드러움이나 관급식 여부만으로 삼킴 안전성을 판단하지 않습니다.</li></ul>
 <h2>⑤ 의료진에게 함께 확인해요</h2>
 <ul><li>지금 입으로 먹어도 되나요? 음식과 물은 각각 어떤 형태가 허용되나요?</li><li>식사 자세·도구·도움 인원과 식후 자세 유지 시간은 어떻게 되나요?</li><li>보호자가 도울 수 있는 훈련과 중단 기준, 재평가 시점은 언제인가요?</li></ul>
 <details><summary>확인 문제: 기침이 없으면 물을 조금 줘도 될까요?</summary><p>아니요. 기침 없이 흡인할 수 있습니다. 금식 여부와 물의 허용 점도를 먼저 확인하고, 임의로 시험하지 않습니다.</p></details>
 </section>`}

function rehabContext(){const id=new URLSearchParams(location.hash.split('?')[1]||'').get('hospital');return id?findFacility(id):null}
function rehabHref(id=''){const h=rehabContext();return '#rehabilitation'+(id?'/'+id:'')+(h?'?hospital='+encodeURIComponent(h.id):'')}
function rehabilitation(id){
 const h=rehabContext(),lesson=rehabLessons.find(x=>x[0]===id),home=h?'#'+(h.kind?'care-facility/':'hospital/')+h.id:'#home';
 document.querySelector('#brandHospital').textContent=h?h.name+' 통합간병 앱':'환자·보호자 재활교육';document.title=(lesson?lesson[2]:'재활치료')+' · 간병24';
 const nav=`<nav class="rehab-top"><a href="${lesson?rehabHref():home}">← ${lesson?'재활치료 목록':'홈으로'}</a><strong>${lesson?lesson[2]:'재활치료'}</strong><a href="${home}" aria-label="병원 홈">⌂ 홈</a></nav>`;
 const notice='<aside class="rehab-notice"><strong>의료진이 정한 범위에서 함께해요.</strong><p>환자별 허용 동작·횟수·도움 인원을 먼저 확인하세요. 통증·어지럼·숨참이 생기면 중단하고 담당자에게 알리세요.</p></aside>';
 if(lesson){const n=rehabLessons.indexOf(lesson),group=lesson[1],sources=id==='swallow'?swallowSources:rehabSources;app.innerHTML=`<section class="rehab-shell">${nav}<header class="rehab-banner"><span>${group==='patient'?'환자 재활치료':'뇌신경 재활치료'}</span><h1>${lesson[2]}</h1><p>${lesson[3]}</p></header><article class="rehab-content"><h2>함께 확인할 내용</h2><ol>${lesson[5].map(x=>'<li>'+x+'</li>').join('')}</ol>${id==='swallow'?swallowEducation():notice}${id==='speech'?`<p><a class="swallow-link" href="${rehabHref('swallow')}">연하 재활치료(삼킴장애) 자세히 보기 →</a></p>`:''}<section class="rehab-media-note"><h2>교육영상</h2><p>현재는 읽는 교육자료입니다. 첨부 시안의 재생 화면은 실제 영상이 아니며, 병원 검수를 마친 영상이 연결되면 이곳에서 안내합니다.</p></section><details><summary>공식 참고자료 보기</summary><ul>${sources.map(([t,u])=>`<li><a href="${u}" target="_blank" rel="noopener noreferrer">${t} ↗</a></li>`).join('')}</ul><p>2026.09.21 확인 · 병원의 개별 치료계획이 우선입니다.</p></details><nav class="rehab-pagination">${n>0?`<a href="${rehabHref(rehabLessons[n-1][0])}">← 이전 교육</a>`:'<span></span>'}<a href="${rehabHref()}">전체 목록</a>${n<rehabLessons.length-1?`<a href="${rehabHref(rehabLessons[n+1][0])}">다음 교육 →</a>`:'<span></span>'}</nav></article></section>`;return}
 app.innerHTML=`<section class="rehab-shell">${nav}<header class="rehab-banner"><span>환자 · 보호자 · 간병인이 함께 보는 교육</span><h1>병상에서 시작하는<br>회복의 한 걸음</h1><p>오늘 허용된 움직임부터, 천천히 함께 배워요.</p></header><p class="rehab-separate">재활교육 전용 화면입니다. 간병인 의뢰서를 작성하거나 접수하는 화면과 구분됩니다.</p><div class="rehab-columns">${[['patient','환자 재활치료','9개 교육'],['neuro','뇌신경 재활치료','7개 교육']].map(([g,title,count])=>`<section aria-label="${title}"><h2>${title} <small>${count}</small></h2><div class="rehab-list">${rehabLessons.filter(x=>x[1]===g).map((x,i)=>`<a class="rehab-item tone-${i%5}" href="${rehabHref(x[0])}"><span class="rehab-icon" aria-hidden="true">${x[4]}</span><span><strong>${x[2]}</strong><small>${x[3]}</small></span><b aria-hidden="true">›</b></a>`).join('')}</div></section>`).join('')}</div>${notice}<details class="rehab-reference"><summary>요청하신 화면 구성 이미지 보기</summary><p>아래 이미지는 화면 디자인 시안입니다. 표시된 재생시간·운동 횟수는 실제 영상이나 환자별 처방을 뜻하지 않습니다.</p><a href="assets/rehabilitation-reference.png" target="_blank" rel="noopener"><img src="assets/rehabilitation-reference.png" alt="사용자가 제공한 간병24 환자 재활치료와 뇌신경 재활치료 화면 구성 시안" loading="lazy"></a></details><p class="rehab-footer">당신의 회복을 응원합니다. <img src="assets/care24-brand.webp" alt="간병24 로고"> 함께합니다.</p></section>`;
}
