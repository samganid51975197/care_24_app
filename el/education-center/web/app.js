'use strict';
const assetUrl = path => path + '?v=20260917-measurement';
const $ = id => document.getElementById(id);
const el = (tag, text, parent) => {const node=document.createElement(tag);if(text!==undefined)node.textContent=text;if(parent)parent.append(node);return node;};
let course, media, translations, pdfPages, illustrations, slidePages, realisticVisuals;
const groupRoutes={'일반교육':'general','전문교육':'special','한국어':'korean'};
const groupName=group=>group==='한국어'?'한국어교육':group;
const listHash=group=>'#courses-'+groupRoutes[group];
function specialistSupplements(target){
  const exam=el('section',undefined,target);exam.className='specialist-supplements';el('h3','전문간병사 시험 연계',exam);el('p','전문교육 72시간 → 과목별 복습·모의실습 → 응시요건 확인 → 시험 응시. 주관: 대한노인돌봄서비스협회(중앙회) · 관리: 주식회사 한국치매케어센터 · 위탁교육: 한국전문돌봄인력양성학원 · 위탁의뢰: 중앙호스피스완화센터. 응시조건·합격기준은 확인 후 안내합니다.',exam);const examLink=el('a','시험 연계 학습·준비 현황 →',exam);examLink.href='specialist-exam.html';
  const section=el('section',undefined,target);section.className='specialist-supplements';el('h3','전문교육 심화 · 장루·욕창 환자 간병',section);
  el('p','기존 전문교육 72시간 안에서 강사가 배정하는 보강 교안입니다. 각 교안에서 그림·주의사항·사례 문제를 확인하고 인쇄할 수 있습니다.',section);
  for(const [title,url] of [['장루 환자 간병 방법과 주의사항','stoma.html'],['욕창돌봄 기본·현장 교안','pressure-care.html'],['욕창돌봄 전문교육 심화 교안','pressure-advanced.html'],['욕창전문간병사 시험 대비 모의고사 80문항','mock-exam.html?exam=pressure']]){const a=el('a',title+' →',section);a.href=url;}
}
function lessonNavigation(lesson,target){
  const nav=el('nav',undefined,target);nav.className='lesson-navigation';nav.setAttribute('aria-label','과목 이동');
  if(lesson.group==='전문교육'){const exam=el('a','전문간병사 시험 준비 →',nav);exam.href='specialist-exam.html';}
  const back=el('a','← '+groupName(lesson.group)+' 과목 목록',nav);back.href=listHash(lesson.group);
  const group=course.lessons.filter(item=>item.group===lesson.group),index=group.findIndex(item=>item.id===lesson.id);
  const adjacent=el('div',undefined,nav);adjacent.className='adjacent-lessons';
  for(const [offset,label] of [[-1,'← 이전 과목'],[1,'다음 과목 →']]){const next=group[index+offset];if(next){const link=el('a',label,adjacent);link.href='#lesson-'+next.id;link.setAttribute('aria-label',label+': '+next.title);}else{const disabled=el('span',label,adjacent);disabled.setAttribute('aria-disabled','true');}}
}
function showCourseList(group,focus=false){
  const target=$('detail');target.querySelectorAll('audio,video').forEach(player=>player.pause());target.replaceChildren();$('sources').hidden=true;
  const back=el('a','← 입국 전 교육 목차',target);back.href='#pre-entry';back.className='sidebar-back';
  el('h2',groupName(group)+' 과목 목록',target);el('p','배울 과목을 선택하세요. 강의 화면의 ← 과목 목록으로 다시 돌아올 수 있습니다.',target);
  if(group==='한국어'){const books=el('a','시중 교재 연계 한국어교육 · 160시간 →',target);books.href='korean-books.html';books.className='sidebar-back';const link=el('a','🎬 영화·드라마 등 한국어교육 영상 자료함 →',target);link.href='korean-media.html';link.className='sidebar-back';}
  const grid=el('div',undefined,target);grid.className='course-cards';
  if(group==='전문교육')specialistSupplements(target);
  for(const lesson of course.lessons.filter(item=>item.group===group)){
    const card=el('a',undefined,grid);card.href='#lesson-'+lesson.id;card.className='course-card';
    const visual=realisticVisuals&&realisticVisuals[lesson.id];if(visual){const img=el('img',undefined,card);img.src=visual.image;img.alt='';img.loading='lazy';img.width=visual.width;img.height=visual.height;}
    const text=el('div',undefined,card);el('small',lesson.id+' · '+lesson.hours+'시간',text);el('h3',lesson.title,text);el('span','과목 열기 →',text);
  }
  if(focus){target.tabIndex=-1;target.focus({preventScroll:true});target.scrollIntoView({block:'start'});}
}
function showContents(focus=false,preOnly=false){
  const target=$('detail');target.querySelectorAll('audio,video').forEach(player=>player.pause());target.replaceChildren();$('sources').hidden=true;
  el('h2',preOnly?'입국 전 교육 목차':'간병사 교육 목차 · 입국 전 / 입국 후',target);
  if(preOnly){const back=el('a','← 입국 전·후 전체 교육 목차',target);back.href='#contents';}
  else{const stages=el('div',undefined,target);stages.className='education-stages';for(const [title,description,href] of [['입국 전 · 베트남 현지교육','280시간 · 일반교육 48시간 + 전문교육 72시간 + 한국어교육 160시간','#pre-entry'],['입국 후 · 국내 적응교육','56시간 제안 과정 · 생활·문화 체험 → 병원 배치 준비','adaptation.html']]){const card=el('a',undefined,stages);card.href=href;el('h3',title,card);el('p',description,card);el('strong','교육 과정 열기 →',card);}}
  el('h3','① 입국 전 · 베트남 현지교육',target);el('p','23개 기본 과목 + 장루·욕창 심화 · 교안·그림·음성·영상·강의 편집기와 한국어교육 영상 자료함',target);
  const groups=el('div',undefined,target);groups.className='contents-groups';
  for(const group of Object.keys(groupRoutes)){
    const section=el('section',undefined,groups);section.className='contents-group';
    const heading=el('h3',undefined,section);const category=el('a',groupName(group)+' 과목 목록 →',heading);category.href=listHash(group);
    if(group==='전문교육')specialistSupplements(section);
    if(group==='한국어'){const books=el('a','교재 연계 수업안 · 160시간 →',section);books.href='korean-books.html';el('br',undefined,section);const link=el('a','영화·드라마 영상 등록·링크 →',section);link.href='korean-media.html';}
    const list=el('ul',undefined,section);
    for(const lesson of course.lessons.filter(item=>item.group===group)){const item=el('li',undefined,list);const link=el('a',`${lesson.id}. ${lesson.title}`,item);link.href='#lesson-'+lesson.id;el('small',lesson.hours+'시간',item);}
  }
  if(!preOnly){const domestic=el('section',undefined,target);domestic.className='post-entry-contents';el('h3','② 입국 후 · 국내 적응교육',domestic);el('p','56시간 교육·체험 제안 과정입니다. 개별 보완과 병원 인계 확인을 마친 뒤 요양병원에 배치합니다.',domestic);const titles=['환영·숙소·생활 안전','음식점 주문·식문화','마트 장보기·생활비','대중교통·백화점 방문','관광지·박물관·공원 체험','요양병원 견학·모의실습','종합 확인·병원 배치 인계'];const list=el('ol',undefined,domestic);titles.forEach((title,i)=>{const link=el('a',`모듈 ${i+1} · 8시간 · ${title}`,el('li',undefined,list));link.href='adaptation.html#day-'+(i+1);});const link=el('a','56시간 과정과 상세 교안 열기 →',domestic);link.href='adaptation.html';}
  if(focus){target.tabIndex=-1;target.focus({preventScroll:true});target.scrollIntoView({block:'start'});}
}
const sourceTerms={G01:['경청','치매 의사소통'],G02:['압박손상','수분 균형','음식·수분'],G03:['음식·음료','음식·수분'],G04:[],G05:['압박손상'],G06:['의료관련감염'],G07:['낙상','압박손상'],S01:['경관영양','수분 균형'],S02:['유치도뇨관','수분 균형'],S03:['폐렴','폐색전증','호흡곤란','네뷸라이저','항암치료 중 발열'],S04:['치매'],S05:['뇌졸중'],S06:['파킨슨','동결'],S07:['저혈당'],S08:['투석','수분 균형'],S09:['암 환자','치료 중 감염','항암치료 중 발열','완화의료'],S10:['완화의료','임종기']};
function showSources(lesson){
  $('sourceList').replaceChildren();
  $('sourceLabel').textContent=`${lesson.id}. ${lesson.title} · 강사용 참고자료`;
  const terms=sourceTerms[lesson.id]||['한국어'];
  const matched=course.sources.filter(s=>terms.some(t=>s.title.includes(t)));
  for(const s of matched){const a=el('a',`${s.title} · 외부 원문`,el('li',undefined,$('sourceList')));a.href=s.url;a.target='_blank';a.rel='noopener';}
  if(!matched.length)el('li','이 과목의 한국어 설명과 실습 내용은 위 강의 본문에서 확인하세요. 외부 자료는 통합 교안의 출처에 정리되어 있습니다.',$('sourceList'));
  $('sourceDetails').open=false;
}
function illustratedLesson(lesson,target){
  const guide=illustrations[lesson.id];if(!guide)return;
  const section=el('section',undefined,target);section.className='illustrated-guide';
  el('h2',`그림으로 배우기 · ${guide.title}`,section);el('p',guide.intro,section);
  const visual=realisticVisuals&&realisticVisuals[lesson.id];
  if(visual&&lesson.id!=='S08'){
    const figure=el('figure',undefined,section);figure.className='care-scene';
    const link=el('a',undefined,figure);link.href=visual.image;link.target='_blank';link.rel='noopener';link.setAttribute('aria-label',guide.title+' 교육 그림 크게 보기');
    const img=el('img',undefined,link);img.src=visual.image;img.alt=visual.alt;img.width=visual.width;img.height=visual.height;
    const caption=el('figcaption',undefined,figure);el('p',`${groupName(lesson.group)} · ${lesson.id} · 장면으로 배우기`,caption).className='scene-kicker';el('h3',visual.title,caption);el('p',visual.caption,caption);
    el('p','AI로 제작한 교육용 상황 그림입니다. 실제 환자 사진이 아니며, 환자별 돌봄계획과 실습 지시에 따라 적용합니다. 그림을 누르면 크게 볼 수 있습니다.',caption).className='hint';
    const keyPoints=el('div',undefined,section);keyPoints.className='scene-keypoints';
    visual.points.forEach(([title,body],i)=>{const card=el('section',undefined,keyPoints);el('span',String(i+1).padStart(2,'0'),card).className='scene-number';el('h3',title,card);el('p',body,card);});
  }
  if(lesson.id==='S08'){
    const figure=el('figure',undefined,section);figure.className='dialysis-comparison';
    const link=el('a',undefined,figure);link.href='assets/dialysis-realistic-comparison-v2.png';link.target='_blank';link.rel='noopener';link.setAttribute('aria-label','혈액투석과 복막투석 비교 그림 크게 보기');
    const img=el('img',undefined,link);img.src=link.href;img.alt='왼쪽: 팔의 혈관통로와 외부 투석기를 연결한 혈액투석. 오른쪽: 복부 카테터와 투석액 주머니를 연결한 복막투석의 개념 그림.';img.width=1536;img.height=1024;
    const caption=el('figcaption',undefined,figure);el('h3','혈액투석과 복막투석, 어디에서 걸러지나요?',caption);
    const descriptions=el('div',undefined,caption);descriptions.className='dialysis-descriptions';
    for(const [title,body] of [['혈액투석 · 몸 밖의 필터','혈액이 혈관통로를 통해 몸 밖의 투석기(필터)를 거친 뒤 몸으로 돌아옵니다. 그림은 팔의 혈관통로를 사용하는 예입니다.'],['복막투석 · 몸 안의 복막','복부 카테터로 넣은 투석액이 복막을 통해 노폐물과 여분의 수분을 받아들입니다. 사용한 투석액은 배액백으로 내보냅니다.']]){const box=el('div',undefined,descriptions);el('h4',title,box);el('p',body,box);}
    el('p','그림을 누르면 크게 볼 수 있습니다. AI로 제작한 교육용 개념 그림이며 실제 환자 사진이 아닙니다. 복부의 투명 표현은 내부 원리를 보여주며, 장치와 연결은 단순화했습니다. 연결·조작 순서를 설명하는 그림은 아닙니다.',caption).className='hint';
    const source=el('a','원리 설명 출처: 미국 NIDDK 신부전 치료 안내',caption);source.href='https://www.niddk.nih.gov/health-information/kidney-disease/kidney-failure/choosing-treatment';source.target='_blank';source.rel='noopener';
  }
  const supplement=visual?el('details',undefined,section):section;if(visual){supplement.className='scene-supplement';el('summary','세부 돌봄 그림과 설명 펼치기',supplement);}
  const grid=el('div',undefined,supplement);grid.className='illustration-grid';
  guide.cards.forEach(([title,art,text],i)=>{const figure=el('figure',undefined,grid);const img=el('img',undefined,figure);img.src=`assets/diagrams/${art}.svg`;img.alt=title;img.width=480;img.height=270;const caption=el('figcaption',undefined,figure);el('h3',`${i+1}. ${title}`,caption);el('p',text,caption);});
  el('p','직접 제작한 교육용 개념도입니다. 환자별 지시와 병원 실습 교육에 맞춰 적용합니다.',section).className='hint';
}
function plan(lesson, target, answers=true) {
  el('p', `${groupName(lesson.group)} · 계획 ${lesson.hours}시간`, target).className='badge';
  el('h2', `${lesson.id}. ${lesson.title}`, target);
  if(lesson.framework){
    const box=el('section',undefined,target);box.className='care-framework';
    el('h3','기본 체계: 관찰 → 기록 → 보고',box);
    for(const [key,title] of [['observe','1. 관찰: 평소와 무엇이 달라졌나요?'],['record','2. 기록: 시간·사실·한 도움을 남깁니다'],['report','3. 보고: 담당자에게 바로 전달합니다'],['urgent','응급이면 기록보다 호출이 먼저'],['example','기록 예시 · 가상 교육 사례'],['reportExample','보고 말하기 예시'],['emotion','말벗·정서지원'],['daily','일상생활지원'],['personal','개인활동지원'],['practice','역할극·평가']]){const step=el('div',undefined,box);step.className='care-step '+key;el('h4',title,step);el('p',lesson.framework[key],step);}
    if(lesson.id!=='G01'){const link=el('a','G01 말벗·정서지원·일상생활·개인활동 강의 듣기',box);link.href='index.html?unit=support#lesson-G01';}
  }
  if(lesson.clinicalReview)el('p',lesson.clinicalReview,target).className='hint';
  if(lesson.measurement){
    const m=lesson.measurement;el('h3',m.title,target);el('p',m.notice,target).className='hint';
    const scroll=el('div',undefined,target);scroll.className='measurement-table';const table=el('table',undefined,scroll);const head=el('tr',undefined,el('thead',undefined,table));m.headers.forEach(t=>{const th=el('th',t,head);th.scope='col';});const body=el('tbody',undefined,table);m.rows.forEach(row=>{const tr=el('tr',undefined,body);row.forEach(t=>el('td',t,tr));});el('p','기록 항목: '+m.blank,target);
  }
  el('p', `설명·시연 ${lesson.allocation[0]}시간 / 연습·실습 ${lesson.allocation[1]}시간 / 평가·피드백 ${lesson.allocation[2]}시간`, target);
  if(lesson.topics){el('h3','세부 교육내용',target);const topics=el('ul',undefined,target);lesson.topics.forEach(x=>el('li',x,topics));}
  el('h3','교안 · 학습 목표',target);const list=el('ul',undefined,target);lesson.objectives.forEach(x=>el('li',x,list));
  el('p',`준비물: ${lesson.materials}`,target);
  el('h3','수업 운영',target);el('p','도입: 사전 경험과 어휘를 확인합니다. 전개: 설명·시연 후 활동을 반복하고 개인별 피드백을 제공합니다. 정리: 확인 문제와 수행 관찰로 부족한 부분을 찾고 보충 계획을 기록합니다. 아래 시간은 여러 차시로 나누어 운영하는 합계입니다.',target);el('p',lesson.activity,target);
  el('h3','강의내용 · 단계별 방법과 주의사항',target);lesson.paragraphs.forEach((p,i)=>{const chapter=el('section',undefined,target);chapter.className='lecture-chapter';if(lesson.sections)el('h4',`${i+1}. ${lesson.sections[i].title}`,chapter);const sentences=p.match(/[^.!?]+[.!?]+\s*|[^.!?]+$/g)||[p];for(let j=0;j<sentences.length;j+=2)el('p',sentences.slice(j,j+2).join('').trim(),chapter);});
  el('h3','베트남어 강의 번역 · Nội dung tiếng Việt',target);el('p','교육 운영 전 강사·통역 담당자의 검토를 위한 번역본입니다.',target).className='hint';translations[lesson.id].forEach(p=>{el('p',p,target).lang='vi';});
  el('h3','학습 확인',target);el('p',lesson.question,target).className='question';
  if(answers)el('p',`해설: ${lesson.answer}`,target);
  el('h3','강사 기록',target);el('p','교육일: __________  강사: __________  학습자: __________',target);el('p','출석·실제 이수시간: __________  관찰 결과: __________',target);el('p','보충할 내용과 재평가 일정: ____________________________________',target);
}
function printLessons(lessons){
  const link=el('a');link.href=assetUrl('pdf/education-guide-ko-vi.pdf');link.download='현지교육-교안-한국어-베트남어.pdf';document.body.append(link);link.click();link.remove();
  const range=lessons.length===1?pdfPages[lessons[0].id]:null;
  $('status').textContent=range?`PDF를 열어 ${range.first}-${range.last}쪽을 선택하여 출력하세요.`:'내려받은 PDF를 열어 전체 또는 원하는 과목의 쪽을 선택하여 출력하세요.';
}
async function printVisualLessons(lessons){
  const area=$('printArea');area.replaceChildren();area.className='visual-workbook';
  for(const lesson of lessons){
    const visual=realisticVisuals&&realisticVisuals[lesson.id];if(!visual)continue;
    const page=el('article',undefined,area);el('p',`${groupName(lesson.group)} · ${lesson.id}`,page).className='badge';el('h2',illustrations[lesson.id].title,page);
    const img=el('img',undefined,page);img.src=visual.image;img.alt=visual.alt;img.className='workbook-image';
    el('h3',visual.title,page);el('p',visual.caption,page);
    const list=el('ol',undefined,page);visual.points.forEach(([title,body])=>{const item=el('li',undefined,list);el('strong',title+' — ',item);item.append(document.createTextNode(body));});
    el('p','실습 메모: __________________________________________________',page);
    el('p','AI 교육용 그림 · 개별 돌봄계획과 실습 지시에 따라 적용합니다. 상세 강의와 출처는 과목별 교육 화면에서 확인하세요.',page).className='hint';
  }
  try{await Promise.all([...area.querySelectorAll('img')].map(img=>img.decode()));window.print();}
  catch(error){$('status').textContent='그림을 불러오지 못해 인쇄를 준비하지 못했습니다. 서버 연결을 확인한 뒤 다시 시도하세요.';}
}
function select(lesson, focus=false){
  $('sources').hidden=false;
  showSources(lesson);
  document.querySelectorAll('nav button').forEach(b=>b.setAttribute('aria-current',String(b.dataset.id===lesson.id)));
  const target=$('detail');target.querySelectorAll('audio,video').forEach(x=>x.pause());target.replaceChildren();
  lessonNavigation(lesson,target);
  const tools=el('div',undefined,target);tools.className='toolbar';const range=pdfPages[lesson.id];const print=el('button',`상세 교안 PDF · 이 과목 ${range.first}-${range.last}쪽`,tools);print.onclick=()=>printLessons([lesson]);
  const edit=el('a','🎬 강의 영상 편집·제작',tools);edit.href='editor.html?lesson='+encodeURIComponent(lesson.id);
  if(lesson.group==='한국어'){const books=el('a','이 과목 교재·자체 연습문제',tools);books.href='korean-books.html#module-'+lesson.id;const library=el('a','영화·드라마 영상 등록·링크',tools);library.href='korean-media.html?lesson='+encodeURIComponent(lesson.id);}
  if(realisticVisuals&&realisticVisuals[lesson.id]){const visualPrint=el('button','이 과목 그림 교안 인쇄',tools);visualPrint.onclick=()=>printVisualLessons([lesson]);}
  el('p',`${lesson.id}. ${lesson.title}`,target).className='badge';
  if(['G02','G05','G07','S09'].includes(lesson.id))specialistSupplements(target);
  if(['S01','S03'].includes(lesson.id)){const feeding=el('section',undefined,target);feeding.className='care-framework';el('h2','콧줄·뱃줄·목의 관 구분과 간병',feeding);el('p','비위관은 코→위, 위루관은 복부→위, 공장루관은 복부→소장으로 연결됩니다. 목 앞의 기관절개관은 호흡용이며 음식·물·약을 넣는 관이 아닙니다.',feeding);const link=el('a','관 종류별 간병·주의사항·확인 문제 열기 →',feeding);link.href='feeding.html';el('p','새 구분 교안은 위 링크에서 확인·인쇄합니다. 기존 PDF·영상은 이번 보강 내용을 포함하지 않습니다.',feeding).className='hint';}
  if(slidePages&&slidePages[lesson.id]){const preview=el('details',undefined,target);preview.className='slide-preview';el('summary','강의 슬라이드 미리보기 · PowerPoint',preview);const img=el('img',undefined,preview);img.src=`slides/slide-${String(slidePages[lesson.id]).padStart(2,'0')}.png`;img.alt=lesson.title+' 핵심 강의 슬라이드';img.loading='lazy';el('p','슬라이드는 핵심 요약입니다. 전체 강의 원고는 아래 본문과 PowerPoint 발표자 노트에서 확인하세요.',preview).className='hint';}
  illustratedLesson(lesson,target);
  const asset=media[lesson.id];
  if(asset){
    el('h2','실사형 한국인 AI 강사',target);el('p',`약 ${Math.floor(asset.durationSeconds/60)}분 ${Math.round(asset.durationSeconds%60)}초 · 특정인을 모델로 하지 않은 AI 이미지 · 아나운서식으로 속도·쉼을 조정한 한국어 여성 합성음성 · 입 모양 동기화 영상 아님 · 280시간 교육의 복습 자료`,target).className='hint';
    const video=el('video',undefined,target);video.controls=true;video.playsInline=true;video.preload='none';video.poster=assetUrl(`media/${lesson.id}.jpg`);video.src=assetUrl(video.canPlayType('video/webm; codecs="vp8, opus"')&&asset.webVideo?asset.webVideo:asset.video);video.setAttribute('aria-label',`${lesson.title} 요약영상`);
    for(const [language,label] of [['vi','Tiếng Việt'],['ko','한국어']]){const track=el('track',undefined,video);track.kind='subtitles';track.srclang=language;track.label=label;track.src=assetUrl(`media/${lesson.id}.${language}.vtt`);track.default=language==='ko';}
    const captionTools=el('div',undefined,target);captionTools.className='toolbar';const captionLabel=el('label','자막 / Phụ đề: ',captionTools);const captionSelect=el('select',undefined,captionLabel);captionSelect.setAttribute('aria-label','자막 언어 선택');for(const [value,label] of [['ko','한국어'],['vi','베트남어 · Tiếng Việt'],['off','자막 끄기 / Tắt']]){const option=el('option',label,captionSelect);option.value=value;}
    const changeCaptions=()=>{for(const track of video.textTracks){track.mode=track.language===captionSelect.value?'showing':'disabled';}};captionSelect.onchange=changeCaptions;video.addEventListener('loadedmetadata',changeCaptions);changeCaptions();
    el('p','한국어 자막이 기본으로 켜집니다. 베트남어는 자막 메뉴에서 선택하세요. 전체 화면에서는 플레이어의 자막 메뉴에서도 선택할 수 있습니다. 내려받은 MP4는 자막을 지원하는 플레이어에서 베트남어·한국어를 선택하세요. 번역과 자막 시점은 교육 운영 전 검토용입니다.',target).className='hint';
    el('h3','음성만 듣기',target);const audio=el('audio',undefined,target);audio.controls=true;audio.preload='none';audio.src=assetUrl(asset.audio);audio.setAttribute('aria-label',`${lesson.title} 요약음성`);
    video.onplay=()=>audio.pause();audio.onplay=()=>video.pause();
    const links=el('div',undefined,target);links.className='toolbar';for(const [label,url] of [['MP3 오디오 내려받기',asset.audio],['MP4 영상 내려받기',asset.video],['베트남어 자막 내려받기',`media/${lesson.id}.vi.vtt`],['한국어 자막 내려받기',`media/${lesson.id}.ko.vtt`]]){const a=el('a',label,links);a.href=assetUrl(url);a.download='';}
    for(const player of [audio,video])player.addEventListener('error',()=>{el('p','재생할 수 없습니다. 내려받기 링크를 이용하거나 페이지를 새로고침해 주세요.',target).setAttribute('role','alert');});
  }else{el('p','이 과목의 미디어가 아직 준비되지 않았습니다. 아래 원고를 이용해 주세요.',target);}
  const body=el('section',undefined,target);plan(lesson,body,false);const answer=el('details',undefined,target);el('summary','확인 문제 해설 보기',answer);el('p',lesson.answer,answer);
  lessonNavigation(lesson,target);
  if(focus){target.tabIndex=-1;target.focus({preventScroll:true});target.scrollIntoView({behavior:'smooth',block:'start'});}
}
async function start(){try{
  const responses=await Promise.all(['course.json','media.json','translations.vi.json','pdf/pages.json','illustrations.json'].map(url=>fetch(url,{cache:'no-store'})));if(responses.some(r=>!r.ok))throw new Error('Course unavailable');[course,media,translations,pdfPages,illustrations]=await Promise.all(responses.map(r=>r.json()));
  try{const slides=await fetch('slides/index.json',{cache:'no-store'});if(slides.ok)slidePages=await slides.json();}catch(error){console.warn('슬라이드 미리보기를 불러올 수 없습니다.',error);}
  try{const visuals=await fetch('realistic-visuals.json',{cache:'no-store'});if(visuals.ok)realisticVisuals=await visuals.json();}catch(error){console.warn('실감형 교육 그림을 불러올 수 없습니다.',error);}
  for(const key of ['title','version','notice','goal','basis'])$(key).textContent=course[key];
  if(realisticVisuals){const visualPrint=el('button','돌봄 17과목 그림 교안 인쇄',document.querySelector('.intro .toolbar'));visualPrint.onclick=()=>printVisualLessons(course.lessons.filter(lesson=>realisticVisuals[lesson.id]));}
  const deckLink=el('a','강의용 PowerPoint 내려받기',document.querySelector('.intro .toolbar'));deckLink.href='slides/caregiver-education.pptx';deckLink.download='간병사-현지교육-디자인.pptx';deckLink.className='deck-download';
  const categories=el('div',undefined,$('workspace'));categories.className='toolbar categories';categories.setAttribute('aria-label','교육 구분');$('workspace').before(categories);
  const contentsButton=el('button','전체 목차',categories);contentsButton.onclick=()=>{location.hash='contents';};
  const preLink=el('a','입국 전 교육 · 280시간',categories);preLink.href='#pre-entry';
  const adaptationLink=el('a','입국 후 국내 적응교육 · 56시간',categories);adaptationLink.href='adaptation.html';
  const showCategory=(group,chosen,focus=false)=>{categories.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.group===group)));$('lessons').replaceChildren();const overview=el('a','← '+groupName(group)+' 과목 목록',$('lessons'));overview.href=listHash(group);overview.className='sidebar-back';course.lessons.filter(l=>l.group===group).forEach(lesson=>{const b=el('button',`${lesson.id}. ${lesson.title}`,$('lessons'));b.dataset.id=lesson.id;el('small',`${groupName(lesson.group)} · 계획 ${lesson.hours}시간`,b);b.onclick=()=>{location.hash='lesson-'+lesson.id;};});if(group==='전문교육'){for(const [label,url] of [['장루 환자 간병','stoma.html'],['욕창돌봄 기본·현장 교안','pressure-care.html'],['욕창돌봄 전문교육 심화 교안','pressure-advanced.html'],['욕창전문간병사 시험 대비 모의고사 80문항','mock-exam.html?exam=pressure']]){const a=el('a',label+' →',$('lessons'));a.href=url;a.className='sidebar-back';}}if(chosen)select(chosen,focus);else showCourseList(group,focus);};
  for(const [group,hours] of [['일반교육',48],['전문교육',72],['한국어',160]]){const b=el('button',`${groupName(group)} · ${hours}시간`,categories);b.dataset.group=group;b.onclick=()=>{location.hash=listHash(group);};}
  const renderRoute=(focus=false)=>{const preOnly=location.hash==='#pre-entry';document.querySelector('main>.intro').hidden=!(preOnly||location.hash.startsWith('#lesson-')||location.hash.startsWith('#courses-'));const chosen=course.lessons.find(x=>`#lesson-${x.id}`===location.hash);const requestedGroup=Object.keys(groupRoutes).find(group=>listHash(group)===location.hash);if(!chosen&&!requestedGroup){if(!preOnly)history.replaceState(null,'','#contents');categories.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(b===contentsButton)));$('lessons').replaceChildren();for(const group of Object.keys(groupRoutes)){const link=el('a',groupName(group)+' 과목 목록 →',$('lessons'));link.href=listHash(group);link.className='sidebar-back';}showContents(focus,preOnly);return;}showCategory(chosen?chosen.group:requestedGroup,chosen,focus);};
  window.addEventListener('hashchange',()=>renderRoute(true));
  $('printAll').disabled=false;$('printAll').onclick=()=>printLessons(course.lessons);$('status').textContent='';renderRoute();
}catch(error){$('status').textContent='교육자료를 불러오지 못했습니다. 서버 연결을 확인하고 새로고침해 주세요.';console.error(error);}}
start();

