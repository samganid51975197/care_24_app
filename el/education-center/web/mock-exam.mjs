import * as generalBank from './mock-exam-bank.mjs?v=1';
import {bank as diseaseBank} from './disease-exam-bank.mjs?v=1';
import {bank as pressureBank} from './pressure-exam-bank.mjs?v=2';
import {bank as pressureVi} from './pressure-exam-vi.mjs?v=1';
import {appendVi,mountLanguageControl,bilingualLabel} from './exam-bilingual.mjs?v=1';
import {createProgressPanel} from './exam-progress.mjs?v=3';
import {renderExplanation} from './exam-explanation.mjs?v=2';
import {specialtyBank,specialtyTitles,canonicalId,getCourse} from './specialty-bank.mjs?v=case-difficulty-leadership-20261019';
const requested=new URLSearchParams(location.search).get('exam');
const specialty=Object.hasOwn(specialtyTitles,requested);
const examType=specialty?canonicalId(requested):['disease','pressure'].includes(requested)?requested:'general';
const examLevel=new URLSearchParams(location.search).get('level')==='1'?'1':'2';
const sourceBank=specialty?specialtyBank(examType):({general:generalBank,disease:diseaseBank,pressure:pressureBank})[examType];
const sourceGroups=sourceBank.groups,sourceQuestions=sourceBank.questions;
const sourceGroupById=new Map(sourceGroups.map(([id,name])=>[id,name]));
const groupSources=new Map(),displayGroupByQuestion=new Map();
let groups,layoutQuestions;
const sourceCounts=sourceGroups.map(([id])=>sourceQuestions.filter(q=>q.group===id).length);
if(sourceGroups.length===20&&sourceCounts.every(count=>count===4)){
  groups=sourceGroups;layoutQuestions=sourceQuestions;
  for(const [id] of groups)groupSources.set(id,[id]);
}else{
  groups=[];layoutQuestions=[];
  for(let start=0;start<sourceQuestions.length;start+=4){
    const chunk=sourceQuestions.slice(start,start+4),id=`M${String(groups.length+1).padStart(2,'0')}`;
    const sourceIds=[...new Set(chunk.map(q=>q.group))],sourceNames=sourceIds.map(sourceId=>sourceGroupById.get(sourceId)||sourceId);
    const title=sourceNames.join(' · ') + ` · 문항 ${start+1}–${start+chunk.length}`;
    groups.push([id,title,chunk.find(q=>q.lesson)?.lesson||'']);groupSources.set(id,sourceIds);
    for(const q of chunk){layoutQuestions.push({...q,sourceGroup:q.group,group:id});displayGroupByQuestion.set(q.id,id);}
  }
}
const bilingual=examType==='pressure'&&examLevel==='2';
const baseQuestions=layoutQuestions.map((q,i)=>bilingual?{...q,vi:pressureVi.questions[i]}:q);
const questions=examLevel==='1'?baseQuestions.map(q=>{
 const right=q.options[q.answer],wrong=q.options.filter((_,i)=>i!==q.answer);
 const answer=(q.id*3+1)%4,rawOptions=[
  `먼저 ${right}를 지키도록 현장을 안전하게 정리하고, 담당 의료진에게 관찰 사실과 대응을 전달한다. 이후 교육생이 판단 근거를 설명하고 다시 시연하도록 지도하며 결과와 피드백을 기록한다.`,
  `교육생의 제안인 “${wrong[0]}”을 우선 실행하게 한 뒤, 문제가 드러나면 다음 근무자에게 지도 내용을 넘긴다.`,
  `“${wrong[1]}”을 교육생이 단독으로 처리하도록 맡기고, 지도자는 일정이 끝난 뒤 기록만 검토한다.`,
  `“${wrong[2]}”을 우선 적용한다. 경험 많은 지도자는 익숙한 방식으로 신속히 마무리하고 별도 확인은 생략한다.`
 ];const options=Array(4);rawOptions.forEach((option,index)=>{options[(answer+index)%4]=option;});
 return {...q,prompt:`[1급 지도자 현장판단] ${q.prompt} 교육생이 판단을 망설이거나 다른 대응을 제안한다. 현장 안전과 지도 책임을 함께 고려한 최선의 대응은?`,options,answer,vi:undefined,explanation:`1급 심화 문항은 해당 영역의 안전 원칙뿐 아니라 선임자의 현장 책임도 평가합니다. ${q.explanation} 지도자는 환자 안전을 먼저 확보하고, 권한 범위 안에서 교육생의 수행을 관찰·교정하며, 필요한 보고·사실 기록·결과 확인을 이어야 합니다. 지도 역할이 의료진의 판단이나 간병사의 허용 범위를 대신하지 않습니다.`,kind:'1급 지도·현장판단'};
}):baseQuestions;
const groupVi=id=>bilingual?(groupSources.get(id)||[id]).map(sourceId=>pressureVi.groups.find(g=>g[0]===sourceId)?.[1]).filter(Boolean).join(' · '):undefined;
const grade=answers=>{const details=questions.map(q=>({id:q.id,group:displayGroupByQuestion.get(q.id)||q.group,answered:Number.isInteger(answers[q.id])&&answers[q.id]>=0&&answers[q.id]<4,correct:answers[q.id]===q.answer}));const correct=details.filter(item=>item.correct).length;return {correct,total:questions.length,unanswered:details.filter(item=>!item.answered).length,score:Math.round(correct/questions.length*1000)/10,details};};
const config=specialty?{title:`${specialtyTitles[examType]} 시험 대비 모의고사`,subtitle:'20개 평가 단위 · 단위별 4문항',note:getCourse(examType).examSummary+'입니다. 임상·문항 검토 전 창작 교육안이며 시험 공고의 응시자격·70점 합격기준을 적용하며 신설 자격의 등록 상태는 확인 전입니다.'}:{
  general:{title:'기본 간병교육 모의고사',subtitle:'20개 평가 단위 · 단위별 4문항',note:'기존 S01–S10 교안의 10개 주제(경관영양·도뇨관·호흡·치매·뇌졸중·파킨슨·당뇨·투석·암·호스피스)에서 기본 확인·안전·보고를 복습하는 80문항입니다.'},
  disease:{title:'질환별 사례판단 모의고사',subtitle:'20개 평가 단위 · 단위별 4문항',note:'치매·뇌졸중·파킨슨병·당뇨병·만성 폐질환·신장질환·간암·뇌암·대장암·폐암의 사례 80문항입니다. 사례에서 관찰할 변화와 우선 대응·보고를 판단합니다. 욕창 임상추론 심화와 구분합니다.'},
  pressure:{title:'욕창전문간병사 시험 대비 모의고사',subtitle:'20개 평가 단위 · 단위별 4문항',note:'10개 심화 영역의 80문항입니다. 전문간호 영역의 개념과 근거 판단을 학습하는 창작 평가안이며, 전문간호사 시험과 동등하게 검증된 시험은 아닙니다. 단계 확정·진단·처치 선택과 수행은 권한을 가진 의료진의 영역입니다.'}
}[examType];
config.subtitle=`${config.subtitle} · ${examLevel}급 ${examLevel==='1'?'지도·현장판단 심화':'기본 실무판단'} · 총 80문항`;
const $=id=>document.getElementById(id);
const node=(tag,text,parent)=>{const el=document.createElement(tag);if(text!==undefined)el.textContent=text;if(parent)parent.append(el);return el;};
if(specialty){
  const back=document.querySelector('a.back');back.href=`specialty-courses.html?course=${examType}#manual`;back.textContent='← 이 과정 교안';
  const notices=document.querySelectorAll('section.notice');
  const enrollment=[...notices].find(n=>n.querySelector('a[href="exam-enrollment.html"]'));enrollment.replaceChildren();node('h2','신설 과정 학습용 모의고사',enrollment);node('p','새 과정의 결제·정식 응시·자격증 발급은 개설하지 않았습니다. 기존 자격 등록번호를 적용하지 않습니다.',enrollment);const tablet=node('a','같은 80문항을 태블릿 방식으로 연습 →',enrollment);tablet.href=`tablet-exam.html?exam=${examType}`;
  document.querySelector('.qualification-info')?.remove();
  const source=notices[notices.length-1];source.replaceChildren();node('h2','교안·참고자료·출제 구성',source);const lesson=node('a','이 과정의 교안과 참고 근거 보기 →',source);lesson.href=`specialty-courses.html?course=${examType}#manual`;node('p',getCourse(examType).examSummary+'입니다. 공식 운영 전 내용·정답·오답 검토와 예비평가가 필요합니다.',source);
}
document.title=config.title+` · ${examLevel}급 · 80문항`;
const pressureGuideSummary=$('pressure-guide-summary');if(pressureGuideSummary)pressureGuideSummary.hidden=examType!=='pressure';
const heading=document.querySelector('h1');heading.replaceChildren();node('span',config.title,heading);node('br',undefined,heading);node('span','총 80문항',heading);
if(bilingual){mountLanguageControl(document.querySelector('header'));appendVi(heading,'Đề thi thử ôn thi chứng chỉ chăm sóc chuyên sâu về loét do tì đè · 80 câu');}
document.querySelector('.eyebrow').textContent=config.subtitle;
const levelNav=document.getElementById('level-nav');if(levelNav){for(const [level,label] of [['2','2급 실무판단'],['1','1급 지도·현장판단']]){const link=node('a',label,levelNav);const url=new URL(location.href);url.searchParams.set('level',level);link.href=url.pathname+url.search+url.hash;link.setAttribute('aria-current',String(examLevel===level));} }
 $('exam-description').textContent=config.note+(examLevel==='1'?' 1급은 기존 응시자격 기준에 맞춰 2급 취득 후 현장경력 1년 이상을 전제로 하며, 지도·리더십·현장감 있는 판단을 더합니다. ':' 2급 연습형은 개별 상황에서 안전하게 수행하고 이상을 보고하는 실무 판단을 다룹니다. ')+'80문항은 4문항씩 20개 평가 단위로 나누어 풉니다. 답은 하나를 선택합니다. 모두 학습용이며 공식 기출·합격 판정은 아닙니다.';
document.querySelectorAll('[data-exam]').forEach(link=>{if(link.dataset.exam===examType)link.setAttribute('aria-current','page');});
const storageKey=`${specialty?`care-family-v3-${examType}`:examType==='general'?'care-vietnam-mock-exam-80-v1':`care-vietnam-${examType}-exam-80-v1`}-level-${examLevel}`;
let answers={},submitted=false,current=0;
try{
  const saved=JSON.parse(localStorage.getItem(storageKey)||'null');
  if(saved&&saved.answers&&typeof saved.answers==='object'){
    for(const q of questions)if(Number.isInteger(saved.answers[q.id])&&saved.answers[q.id]>=0&&saved.answers[q.id]<4)answers[q.id]=saved.answers[q.id];
    submitted=saved.submitted===true;
    if(Number.isInteger(saved.current)&&saved.current>=0&&saved.current<groups.length)current=saved.current;
  }
}catch(_){$('save-status').textContent='이전 답안을 읽지 못했습니다. 새 답안으로 시작합니다.';}
function save(){try{localStorage.setItem(storageKey,JSON.stringify({answers,submitted,current}));}catch(_){$('save-status').textContent='브라우저 저장이 제한되어 있습니다. 나가기 전에 현재 결과를 인쇄해 주세요.';}}
const sections=[],navButtons=[],feedbacks=new Map();
function progress(){const count=Object.keys(answers).length;$('answered').textContent=`총 80문항 중 ${count}문항 응답 · ${80-count}문항 미응답`;if(bilingual)appendVi($('answered'),`Đã trả lời ${count}/80 · Chưa trả lời ${80-count}`);$('answered-meter').value=count;tracker.update(answers);}
function showGroup(index,scroll=false){current=index;sections.forEach((s,i)=>s.hidden=i!==index);navButtons.forEach((b,i)=>b.setAttribute('aria-current',String(i===index)));$('previous').disabled=index===0;$('next').disabled=index===groups.length-1;save();if(scroll){sections[index].querySelector('h2').focus();sections[index].scrollIntoView({block:'start'});}}
function renderResult(focus=false){
  tracker.cancel();
  $('result').hidden=!submitted;
  for(const q of questions){
    const box=feedbacks.get(q.id);box.hidden=!submitted;box.replaceChildren();if(!submitted)continue;
    const correct=answers[q.id]===q.answer;
    box.className='feedback '+(correct?'correct':'wrong');
    const resultTitle=node('h3',`${correct?'정답':answers[q.id]===undefined?'미응답':'오답'} · 정답 ${q.answer+1}번`,box);if(q.vi)appendVi(resultTitle,`${correct?'Đúng':answers[q.id]===undefined?'Chưa trả lời':'Sai'} · Đáp án đúng: ${q.answer+1}`);
    renderExplanation({question:q,selected:answers[q.id],target:box,voice:tracker});
    const link=node('a',`${q.sourceGroup||q.group} 교육 교안 복습 →`,box);link.href=q.lesson||`index.html#lesson-${q.sourceGroup||q.group}`;
  }
  if(!submitted)return;
  const result=grade(answers),target=$('result');target.replaceChildren();
  const resultHeading=node('h2','모의고사 채점 결과',target);if(bilingual)appendVi(resultHeading,`Kết quả luyện tập: ${result.correct}/80 câu đúng · ${result.score} điểm · ${result.unanswered} câu chưa trả lời. Đây không phải kết quả đỗ hoặc trượt kỳ thi chính thức.`);node('p',`${result.correct} / 80문항 정답 · ${result.score}점`,target).className='score';
  node('p',`오답 ${80-result.correct-result.unanswered}문항 · 미응답 ${result.unanswered}문항 (미응답은 0점)`,target);
  const progressLink=node('a','푼 문제·안 푼 문제 번호 확인 →',target);progressLink.href='#question-progress';
  node('p','동일 배점으로 100점 환산한 학습 점수입니다. 공식 합격·불합격이나 자격 취득을 판정하지 않습니다.',target).className='hint';
  const grid=node('div',undefined,target);grid.className='result-grid';
  groups.forEach(([id,title],i)=>{const subset=result.details.filter(q=>q.group===id);const link=node('a',`${id} ${title} · ${subset.filter(q=>q.correct).length}/${subset.length} 정답`,grid);link.href=`#group-${id}`;link.onclick=e=>{e.preventDefault();showGroup(i,true);};});
  node('p','과목을 선택하면 정답·해설을 볼 수 있습니다. 답을 바꾸면 이전 채점 결과가 해제되며 다시 채점할 수 있습니다.',target);
  if(focus){target.focus();target.scrollIntoView({block:'start'});}
}
groups.forEach(([id,title],index)=>{
  const nav=node('button',`${id} · ${title}`,$('group-nav'));nav.type='button';nav.onclick=()=>showGroup(index,true);navButtons.push(nav);appendVi(nav,groupVi(id));
  const section=node('section',undefined,$('question-groups'));section.id=`group-${id}`;section.className='question-group group-head';sections.push(section);
  const groupHeading=node('h2',`${id} · ${title}`,section);groupHeading.tabIndex=-1;appendVi(groupHeading,groupVi(id));node('p',`${questions.filter(q=>q.group===id)[0].id}–${questions.filter(q=>q.group===id).at(-1).id}번 · ${questions.filter(q=>q.group===id).length}문항 / 총 80문항`,section).className='group-count';
  for(const q of questions.filter(q=>q.group===id)){
    const article=node('article',undefined,section);article.className='question';article.id=`question-${q.id}`;article.tabIndex=-1;const badge=node('p','',article);badge.id=`question-state-${q.id}`;const areaId=q.sourceGroup||q.group,areaName=sourceGroupById.get(areaId)||areaId,area=node('p',areaName,article);area.className='question-area';if(q.vi)appendVi(area,groupVi(areaId));const field=node('fieldset',undefined,article);field.className='question-card';const legend=node('legend',undefined,field);legend.className='question-heading';node('span',`문제 ${q.id}`,legend).className='question-number';const prompt=node('span',q.prompt,legend);prompt.className='question-prompt';if(q.vi)appendVi(prompt,q.vi.prompt);const optionList=node('div',undefined,field);optionList.className='option-list';
    q.options.forEach((text,i)=>{const label=node('label',undefined,optionList);label.className='option';const input=node('input',undefined,label);input.type='radio';input.name=`q${q.id}`;input.value=String(i);input.checked=answers[q.id]===i;input.setAttribute('aria-label',`${i+1}번. ${text}`);const number=node('span',String(i+1),label);number.className='option-number';number.setAttribute('aria-hidden','true');const optionText=node('span',text,label);optionText.className='option-text';if(q.vi){appendVi(optionText,q.vi.options[i]);bilingualLabel(input,`${i+1}번. ${text}`,`${i+1}. ${q.vi.options[i]}`);}input.onchange=()=>{answers[q.id]=i;const wasSubmitted=submitted;submitted=false;save();progress();if(wasSubmitted)renderResult();tracker.announceAnswer(q.id);};});
    const clear=node('button','선택 지우기',article);clear.type='button';if(bilingual)appendVi(clear,'Bỏ chọn');clear.setAttribute('aria-label',`${q.id}번 선택 지우기`);clear.onclick=()=>{delete answers[q.id];submitted=false;article.querySelectorAll('input').forEach(input=>input.checked=false);save();progress();renderResult();tracker.cancel();};
    const feedback=node('div',undefined,article);feedback.hidden=true;feedbacks.set(q.id,feedback);
  }
});
const tracker=createProgressPanel({questions,bilingual,host:$('question-progress'),onGo:id=>{const q=questions.find(q=>q.id===id);showGroup(groups.findIndex(([group])=>group===q.group));const article=$(`question-${id}`);article.focus();article.scrollIntoView({block:'start'});}});
$('grade').disabled=false;$('retry').disabled=false;$('print-exam').disabled=false;
$('grade').onclick=()=>{submitted=true;save();renderResult(true);tracker.announceResult(grade(answers).correct);};
$('retry').onclick=()=>{if(!window.confirm('이 브라우저의 80문항 답안과 채점 결과를 지우고 다시 풀까요?'))return;tracker.cancel();answers={};submitted=false;document.querySelectorAll('input[type="radio"]').forEach(input=>input.checked=false);progress();renderResult();showGroup(0,true);};
$('previous').onclick=()=>showGroup(current-1,true);$('next').onclick=()=>showGroup(current+1,true);$('print-exam').onclick=()=>window.print();
if(bilingual){for(const [id,text] of [['grade','Chấm 80 câu'],['retry','Làm lại từ đầu'],['print-exam','In câu hỏi và kết quả'],['previous','Phần trước'],['next','Phần tiếp theo']])appendVi($(id),text);appendVi($('exam-description'),'80 câu học tập thuộc 10 lĩnh vực chuyên sâu. Chọn một đáp án. Không phải đề thi chính thức hoặc kết quả cấp chứng chỉ. Việc chẩn đoán, xác định giai đoạn và thực hiện thủ thuật thuộc nhân viên y tế có thẩm quyền.');}
const requestedGroup=location.hash.startsWith('#group-')?groups.findIndex(([id])=>`#group-${id}`===location.hash):-1;
progress();renderResult();showGroup(requestedGroup>=0?requestedGroup:current);
