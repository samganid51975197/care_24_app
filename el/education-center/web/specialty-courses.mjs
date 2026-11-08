import {classroomLabel} from './classrooms.mjs';
import {renderMedicationCare} from './medication-care.mjs';
import {renderLessonQA} from './lesson-qa.mjs';
import {courses,specialtyBank,getCourse,canonicalId} from './specialty-bank.mjs?v=ortho-infection-20261019';
const $=id=>document.getElementById(id);
const el=(tag,text,parent)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=text;parent?.append(n);return n;};
const link=(text,href,parent)=>{const a=el('a',text,parent);a.href=href;return a;};
const sorted=courses;
const cards=[];
link('와상환자 재활 보조·옴 치료와 환경관리 참고자료 →','care-reference.html',$('catalog'));
link('두경부암 전문간병사 1·2급 운영규정 초안 →','head-neck-cancer-caregiver-levels-ko.html',$('catalog'));
for(const c of sorted){const card=el('article',undefined,$('course-grid'));card.className='course-card';el('span',`${classroomLabel(c.id)} · ${c.category} · 신설안`,card).className='tag';el('h3',c.title,card);el('p',c.scope,card);el('p',c.examSummary,card);el('p','심화 분야: '+c.tracks.join(' · '),card);const actions=el('div',undefined,card);actions.className='links';link('강의 내용 보기 →',`?course=${c.id}#manual`,actions);link('2 강의 보기 →',`orientation.html?course=${c.id}`,actions);link('3 모의고사 80문항 →',`mock-exam.html?exam=${c.id}`,actions);link('4 시험 오리엔테이션 →',`exam-orientation.html?exam=${c.id}`,actions);link('5 시험 안내 →',`exam-enrollment.html?exam=${c.id}`,actions);link('시험 공통 기준 →','qualification-exam-standard.html',actions);if(c.id==='respiratory')link('1·2급 직무·운영규정 보기 →','respiratory-caregiver-levels-ko.html',actions);if(c.id==='orthopedic')link('1·2급 운영규정 초안 보기 →','orthopedic-caregiver-levels-ko.html',actions);if(c.id==='infection')link('2급 운영규정 초안 보기 →','infection-caregiver-level-2-rules-ko.html',actions);if(c.id==='circulatory')link('1·2급 운영규정 초안 보기 →','circulatory-caregiver-levels-ko.html',actions);if(c.id==='sensory')link('1·2급 운영규정 초안 보기 →','sensory-caregiver-levels-ko.html',actions);if(c.id==='neurological')link('신경계·정신질환 1·2급 규정 →','neurological-caregiver-levels-ko.html',actions);if(c.id==='neurological')link('뇌질환 1·2급 운영규정 초안 →','brain-disease-caregiver-levels-ko.html',actions);if(c.id==='digestive')link('1·2급 운영규정 초안 보기 →','digestive-caregiver-levels-ko.html',actions);if(c.id==='renal')link('1·2급 운영규정 초안 보기 →','renal-caregiver-levels-ko.html',actions);if(c.id==='hematology')link('1·2급 운영규정 초안 보기 →','hematology-caregiver-levels-ko.html',actions);if(c.id==='skin')link('1·2급 운영규정 초안 보기 →','skin-caregiver-levels-ko.html',actions);if(c.id==='endocrine')link('1·2급 운영규정 초안 보기 →','endocrine-caregiver-levels-ko.html',actions);cards.push({id:c.id,title:c.title,card,text:`${c.title} ${c.scope} ${c.tracks.join(" ")} ${c.units.map(u=>u.name).join(" ")}`});}
const pressure=el('article',undefined,$('course-grid'));pressure.className='course-card';el('span',classroomLabel('pressure')+' · 돌봄 특화 · 기존 과정',pressure).className='tag';el('h3','욕창전문간병사',pressure);el('p','압박손상 심화 교안 · 80문항 모의고사 · 시험 오리엔테이션 · 시험 안내',pressure);const pa=el('div',undefined,pressure);pa.className='links';link('강의 내용 보기 →','pressure-advanced.html',pa);link('2 강의 보기 →','orientation.html?course=pressure',pa);link('3 모의고사 80문항 →','mock-exam.html?exam=pressure',pa);link('4 시험 오리엔테이션 →','exam-orientation.html?exam=pressure',pa);link('5 시험 안내 →','exam-enrollment.html?exam=pressure',pa);link('시험 공통 기준 →','qualification-exam-standard.html',pa);link('1·2급 자격과정 운영규정 초안 →','bedbound-pressure-caregiver-levels-ko.html',pa);cards.push({id:'pressure',title:'욕창전문간병사',card:pressure,text:'욕창 압박손상 전문간병사'});
const picker=$('course-picker'),suggestions=$('course-options');
for(const item of cards){const option=el('option',item.title,picker);option.value=item.id;const suggestion=el('option',undefined,suggestions);suggestion.value=item.title;}
function filter(){const term=$('search').value.trim().toLocaleLowerCase('ko');let count=0;for(const item of cards){item.card.hidden=!item.text.toLocaleLowerCase('ko').includes(term);if(!item.card.hidden)count++;}const selected=cards.find(item=>item.title.toLocaleLowerCase('ko')===term);picker.value=selected?.id||'';const families=courses.filter(c=>c.category==='질환군 자격').length;$('count').textContent=`${count}개 과정 · 질환군 ${families}개 + 독립 특화 3개`;$('empty').hidden=count!==0;}
$('search').addEventListener('input',filter);
$('search').addEventListener('change',()=>{const selected=cards.find(item=>item.title.toLocaleLowerCase('ko')===$('search').value.trim().toLocaleLowerCase('ko'));if(selected){picker.value=selected.id;selected.card.scrollIntoView({behavior:'smooth',block:'center'});}});
picker.addEventListener('change',()=>{const selected=cards.find(item=>item.id===picker.value);if(!selected){$('search').value='';filter();$('search').focus();return;}$('search').value=selected.title;filter();selected.card.scrollIntoView({behavior:'smooth',block:'center'});selected.card.querySelector('a')?.focus({preventScroll:true});});
filter();
const requested=new URLSearchParams(location.search).get('course');const id=canonicalId(requested);const course=getCourse(id);
if(course&&requested!==id){const url=new URL(location.href);url.searchParams.set('course',id);if(/^#U\d+$/.test(url.hash))url.hash=requested+'-'+url.hash.slice(1);history.replaceState(null,'',url);}
if(id&&!course){const p=el('p','요청한 과정이 없습니다. 아래 목록에서 과정을 선택하세요.',$('catalog'));p.setAttribute('role','status');}
if(course){
  link('1 교안 단원 보기 →','#units',$('actions'));
  link('2 강의 보기 →','orientation.html?course='+course.id,$('actions'));
  if(course.id==='skin')link('옴 치료·환경관리 참고자료 →','care-reference.html#scabies',$('actions'));
  if(['musculoskeletal','neurological'].includes(course.id))link('재활 보조 참고자료 →','care-reference.html#rehabilitation',$('actions'));
  document.title=course.title+' · 교안';$('manual').hidden=false;$('catalog').hidden=true;$('manual-title').textContent=classroomLabel(course.id)+' · '+course.title+' 강의 내용';$('scope').textContent=course.scope;
  $('assessment-description').textContent=course.examSummary+' · 동일 배점 100점 환산, 공고 기준 70점 이상 합격(56/80문항), 시험시간 80분. 질환군 과정은 일반 공통 40문항을 반복하지 않고 해당 분야 사례·역량을 평가합니다. 호스피스는 기존 사례 40 + 공통 40 구성을 유지합니다.';
  if(course.id==='respiratory'){
    link('호흡기 1·2급 직무·운영규정','#respiratory-rules',$('actions'));
    const rules=el('section',undefined,$('manual'));rules.className='notice';rules.id='respiratory-rules';
    el('h3','호흡기계 질환 전문간병사 1급·2급 · 직무 내용과 운영규정',rules);
    const levelFlow=el('div',undefined,rules);levelFlow.className='flow';
    const level2=el('div',undefined,levelFlow);el('strong','2급 · 직접 돌봄 실무',level2);el('p','환자별 돌봄계획과 배정된 업무에 따라 일상생활을 지원하고, 호흡·의식·기침·가래·활동 변화와 안전 위험을 관찰·보고·기록합니다. 진단·처치·산소 설정 변경은 하지 않습니다.',level2);
    const level1=el('div',undefined,levelFlow);el('strong','1급 · 선임 실무·동료 지도',level1);el('p','2급 자격 취득 후 관련 질환자 현장 간병·돌봄 경력 1년 이상을 증빙하고, 복합 사례의 우선순위 판단·교육생 관찰·피드백·재시연 지도와 반복되는 안전 문제 보고 역량을 평가합니다.',level1);
    el('p','운영 기준: 승인된 응시자격·교육과정 이수 → 필기·실기 평가 → 지도하 현장실습과 근거 기반 평가 → 결과·이의신청·개인정보 보호 기록 → 매년 교육·문항·규정 검토. 1급은 리더십·현장판단 사례를 추가합니다. 의료행위 권한이나 고용·급여 우대를 부여하지 않습니다.',rules);
    link('직무 내용·운영규정 전체 보기 →','respiratory-caregiver-levels-ko.html#qualification-levels',rules);
    $('manual').insertBefore(rules,$('unit-nav'));
  }
  if(course.id==='orthopedic'){
    link('정형외과질환 1·2급 운영규정 초안','orthopedic-caregiver-levels-ko.html',$('actions'));
  }
  if(course.id==='infection'){
    link('감염질환 전문간병사 2급 운영규정 초안','infection-caregiver-level-2-rules-ko.html',$('actions'));
  }
  if(course.id==='circulatory'){
    link('순환계질환 전문간병사 1·2급 운영규정 초안','circulatory-caregiver-levels-ko.html',$('actions'));
  }
  if(course.id==='sensory'){
    link('감각계질환 전문간병사 1·2급 운영규정 초안','sensory-caregiver-levels-ko.html',$('actions'));
  }
  if(course.id==='neurological'){
    link('신경계·정신질환 전문간병사 1·2급 운영규정 초안','neurological-caregiver-levels-ko.html',$('actions'));
    link('뇌질환 전문간병사 1·2급 운영규정 초안','brain-disease-caregiver-levels-ko.html',$('actions'));
  }
  if(course.id==='digestive'){
    link('소화기질환 전문간병사 1·2급 운영규정 초안','digestive-caregiver-levels-ko.html',$('actions'));
  }
  if(course.id==='renal'){
    link('신장·비뇨기계질환 전문간병사 1·2급 운영규정 초안','renal-caregiver-levels-ko.html',$('actions'));
  }
  if(course.id==='hematology'){
    link('혈액질환 전문간병사 1·2급 운영규정 초안','hematology-caregiver-levels-ko.html',$('actions'));
  }
  if(course.id==='skin'){
    link('피부질환 전문간병사 1·2급 운영규정 초안','skin-caregiver-levels-ko.html',$('actions'));
  }
  if(course.id==='endocrine'){
    link('내분비·대사질환 전문간병사 1·2급 운영규정 초안','endocrine-caregiver-levels-ko.html',$('actions'));
  }
  $('shared-section').hidden=course.bankType!=='classic';
  const bank=specialtyBank(id);const blueprint=el('table',undefined,$('blueprint'));const head=el('tr',undefined,blueprint);el('th','출제 영역',head);el('th','문항',head);for(const [gid,name] of bank.groups){const row=el('tr',undefined,blueprint);el('td',name,row);el('td',String(bank.questions.filter(q=>q.group===gid).length),row);}
  const qualification=el('section',undefined,$('manual'));qualification.className='notice';qualification.id='qualification-specification';el('h3','직무·검정 안내',qualification);
  el('h4','직무내용',qualification);el('p',`환자별 돌봄계획과 배정된 업무에 따라 ${course.scope} 대상자의 비의료적 일상생활 지원을 수행합니다. 상태 변화를 관찰해 기록·보고하고 안전한 이동·식사·안위 지원을 제공합니다. 진단·치료·처방·의료행위는 직무에 포함하지 않습니다.`,qualification);
  el('h4','검정기준',qualification);el('p','공고 기준: 80문항 중 70점 이상(56문항 이상 정답). 사례에서 환자 안전, 관찰과 보고, 개인별 계획 준수, 업무범위, 기록·인계 역량을 평가합니다. 1급 응시자는 2급 취득 후 관련 질환자 현장 돌봄 경력 1년 이상을 증빙해야 하며, 세부 응시요건은 해당 공고를 확인합니다.',qualification);
  el('h4','검정방법',qualification);el('p','정식 필기시험은 시험장에서 제공하는 태블릿 PC로 4지선다형 80문항을 80분 동안 풉니다. 회차별 출제는 영역별 문항은행에서 청사진에 따라 균형 있게 추출하는 운영안입니다. 현장실습은 승인된 교육·실습 기준에 따라 별도로 평가하며, 실습일·시간·평가자·관찰근거·피드백·보완실습·최종판정을 기록합니다. 실습평가가 시험 합격점수에 포함되는지는 해당 종목의 승인된 규정과 공고를 따릅니다.',qualification);
  el('h4','검정과목',qualification);const subjects=el('ul',undefined,qualification);for(const [gid,name] of bank.groups){const count=bank.questions.filter(q=>q.group===gid).length;el('li',`${name} (${count}문항)`,subjects);}
  if(id==='orthopedic')link('정형외과질환 1·2급 세부 운영규정·검정기준 보기 →','orthopedic-caregiver-levels-ko.html',qualification);
  if(id==='respiratory')link('호흡기계 1·2급 세부 운영규정·검정기준 보기 →','respiratory-caregiver-levels-ko.html#operating-rules',qualification);
  if(id==='sensory')link('감각계질환 1·2급 세부 운영규정·검정기준 보기 →','sensory-caregiver-levels-ko.html#operating-rules',qualification);
  if(id==='neurological')link('신경계·정신질환 1·2급 세부 운영규정·검정기준 보기 →','neurological-caregiver-levels-ko.html#rules',qualification);
  if(id==='neurological')link('뇌질환 1·2급 세부 운영규정·검정기준 보기 →','brain-disease-caregiver-levels-ko.html#rules',qualification);
  if(id==='digestive')link('소화기질환 1·2급 세부 운영규정·검정기준 보기 →','digestive-caregiver-levels-ko.html#rules',qualification);
  if(id==='renal')link('신장·비뇨기계질환 1·2급 세부 운영규정·검정기준 보기 →','renal-caregiver-levels-ko.html#rules',qualification);
  if(id==='hematology')link('혈액질환 1·2급 세부 운영규정·검정기준 보기 →','hematology-caregiver-levels-ko.html#rules',qualification);
  if(id==='skin')link('피부질환 1·2급 세부 운영규정·검정기준 보기 →','skin-caregiver-levels-ko.html#rules',qualification);
  if(id==='endocrine')link('내분비·대사질환 1·2급 세부 운영규정·검정기준 보기 →','endocrine-caregiver-levels-ko.html#rules',qualification);
  $('manual').insertBefore(qualification,$('unit-nav'));
  link('3 모의고사 80문항 →',`mock-exam.html?exam=${id}`,$('actions'));link('4 시험 오리엔테이션 →',`exam-orientation.html?exam=${id}`,$('actions'));link('5 시험 안내·접수 →',`exam-enrollment.html?exam=${id}`,$('actions'));link('시험 공고·일정 보기','exam-notice.html',$('actions'));link('태블릿 시험 방식 연습','tablet-exam.html?exam='+id,$('actions'));
  const print=el('button','교안 인쇄 / PDF 저장',$('actions'));print.onclick=()=>window.print();
  const download=el('button','문제·정답·해설 내려받기',$('actions'));download.onclick=()=>downloadBank(course);
  for(const u of course.units){
    link(`${u.id} ${u.name}`,`#${u.id}`,$('unit-nav'));
    const section=el('article',undefined,$('units'));section.className='unit';section.id=u.id;el('p',u.track||'독립 특화',section).className='eyebrow';el('h3',`${u.id} · ${u.name}`,section);
    el('h4','학습목표',section);el('p',`“${u.focus}”의 의미를 설명하고, 사례에서 간병사의 우선 행동과 후속 확인을 구분한다.`,section);
    el('h4','핵심 설명 · 강의 원고',section);el('p',u.reason,section);el('p',`돌봄의 출발점은 “${u.focus}”이다. 환자의 평소 상태와 현재 관찰을 비교하고, 자료가 없는 부분은 확인 필요로 남긴다. ${u.action}`,section);
    el('p',`모의 사례: ${u.scenario}`,section).className='case';
    const flow=el('div',undefined,section);flow.className='flow';for(const [head,body] of [['01 관찰 초점',u.focus],['02 우선 대응',u.action],['03 후속 확인',u.followup]]){const cell=el('div',undefined,flow);el('strong',head,cell);el('p',body,cell);}
    renderMedicationCare(section,id,u);
    renderLessonQA(section,u);
    el('h4','실습과 토의',section);el('p',`학습자 3명이 환자·간병사·관찰자 역할을 맡는다. “${u.scenario}”를 카드로 제시하고, 간병사 역할은 위험을 말로 설명한 뒤 안전 보조와 보고를 시연한다. 관찰자는 진단을 단정한 표현, 보고 지연, 환자 의사 누락이 있었는지 기록한다.`,section);
    el('p',`토의 질문: 이 사례에서 직접 확인한 것과 아직 모르는 것은 무엇인가? 왜 “${u.action}”가 필요한가? 후속 계획 “${u.followup}”를 다음 교대에 어떻게 전달할 것인가?`,section);
    el('h4','보고 연습 · 기록 양식',section);el('p','발견 시각 ___ / 마지막 평소 상태 ___ / 환자 표현 ___ / 직접 관찰 ___ / 확인된 측정값·단위 ___ / 알린 담당자·시각 ___ / 확인받은 계획 ___ / 대응 후 반응 ___ / 미해결 문제 ___',section);
    el('p','강사 피드백: 관찰과 추정을 구분했는지, 허용된 도움인지, 필요한 보고를 늦추지 않았는지, 결과를 확인했는지 평가한다.',section).className='hint';
    const tested=bank.groups.some(([gid])=>gid===u.id);link(tested?`${u.name} 연결 문제 풀기 →`:'통합 80문항 연습 →',`mock-exam.html?exam=${id}`+(tested?`#group-${u.id}`:''),section);
  }
  const sources=[[course.source,'과정별 주요 참고자료']];
  if(id==='musculoskeletal')sources.push(['https://www.osha.gov/ergonomics/guidelines/nursing-home/final-nh-guidlines','미국 산업안전보건청 · 요양시설의 근골격계 손상 예방'],['https://www.osha.gov/etools/hospitals/facilities-management/work-related-musculoskeletal-disorders','미국 산업안전보건청 · 손의 힘과 손목 자세']);
  if(id==='dementia')sources.push(['https://www.nia.nih.gov/health/frontotemporal-disorders/what-are-frontotemporal-disorders-causes-symptoms-and-treatment','NIA · 전두측두엽 변성과 원발진행실어증'],['https://health.nih.gov/health-topics-a-z/dementia','NIH · 치매와 치료 가능한 인지저하 원인']);
  if(id==='sensory')sources.push(['https://www.nidcd.nih.gov/health/sudden-deafness','NIDCD · 돌발성 난청']);
  for(const u of course.units)if(u.source&&!sources.some(([url])=>url===u.source))sources.push([u.source,u.track+' 참고자료']);
  if(id==='respiratory')sources.push(['https://www.who.int/health-topics/pneumonia','WHO · 폐렴'],['https://www.who.int/news-room/fact-sheets/detail/chronic-obstructive-pulmonary-disease-(copd)','WHO · COPD'],['https://www.cdc.gov/tb-healthcare-settings/hcp/infection-control/','CDC · 결핵 공기주의'],['https://www.nhs.uk/conditions/bronchiectasis/','NHS · 기관지확장증'],['https://www.nhs.uk/conditions/idiopathic-pulmonary-fibrosis/','NHS · 폐섬유화']);
  if(course.category==='암종별'||id==='hospice')sources.push(['https://www.cancer.gov/about-cancer/treatment/side-effects','NCI · 치료 부작용 관찰'],['https://www.cancer.gov/about-cancer/treatment/side-effects/infection','NCI · 감염·호중구 감소'],['https://www.cancer.gov/about-cancer/treatment/side-effects/mouth-throat/oral-complications-pdq','NCI · 구강 합병증'],['https://www.cancer.gov/publications/pdq/information-summaries/supportive-care','NCI · 지지·완화돌봄']);
  if(id==='neurological')sources.push(['https://www.nice.org.uk/guidance/ng128/chapter/recommendations','NICE · 급성 뇌졸중과 경구 섭취 전 삼킴 선별']);
  if(id==='renal')sources.push(['https://www.niddk.nih.gov/health-information/kidney-disease/kidney-failure/peritoneal-dialysis','NIDDK · 복막투석'],['https://www.cdc.gov/dialysis-safety/hcp/clinical-safety/index.html','CDC · 투석 감염 예방']);
  if(id==='orthopedic')sources.push(['https://orthoinfo.aaos.org/globalassets/pdfs/hip-fractures-cpg_pls.pdf','AAOS · 고관절 골절 후 수술·이동·재활 안내']);
  if(id==='infection')sources.push(['https://www.cdc.gov/infection-control/hcp/isolation-precautions/precautions.html','CDC · 표준주의·전파경로별 주의'],['https://www.cdc.gov/infection-control/hcp/core-practices/','CDC · 의료기관 감염예방 핵심 실천']);
  for(const [url,title] of sources){const a=link(title,url,el('li',undefined,$('references')));a.target='_blank';a.rel='noopener';}
  if(location.hash)requestAnimationFrame(()=>document.getElementById(location.hash.slice(1))?.scrollIntoView());
}
function downloadBank(c){
  const bank=specialtyBank(c.id);const esc=s=>String(s).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const content=`<!doctype html><html lang="ko"><meta charset="utf-8"><title>${esc(c.title)} 80문항</title><style>body{font:16px/1.8 sans-serif;max-width:900px;margin:32px auto;padding:24px}article{break-inside:avoid;border-top:1px solid #bbb;padding:16px 0}aside{background:#eef5f6;padding:12px}@media print{@page{size:A4;margin:16mm}}</style><h1>${esc(c.title)} · 80문항</h1><p>검토 전 창작 교육안 · ${esc(c.examSummary)}. 공식 시험·합격 판정용이 아닙니다. 정답·해설이 포함된 강사용 자료입니다.</p><p>주무부처: 보건복지부 (운영자 제공·신설 자격 확인 전)<br>등록업무 수탁기관: 한국직업능력연구원<br>발급기관: 주식회사 한국치매케어센터<br>자격관리: 대한노인돌봄서비스협회(중앙회)<br>위탁교육: 한국전문돌봄인력양성학원<br>위탁의뢰: 중앙호스피스완화센터</p>${bank.questions.map(q=>`<article><small>${esc(q.group)} · ${esc(q.kind)}</small><h2>${q.id}. ${esc(q.prompt)}</h2><ol>${q.options.map(o=>`<li>${esc(o)}</li>`).join('')}</ol><aside><strong>정답: ${q.answer+1}번</strong><p>${esc(q.explanation)}</p></aside></article>`).join('')}<p>작성일 2026.10.10 · 임상·문항 검토 전</p></html>`;
  const url=URL.createObjectURL(new Blob([content],{type:'text/html;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download=`${c.title}_80문항_정답해설.html`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}






