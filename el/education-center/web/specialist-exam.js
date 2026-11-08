'use strict';
const key='care-vietnam-specialist-exam-prep-v1';
const $=id=>document.getElementById(id);
const node=(tag,text,parent)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=text;if(parent)parent.append(n);return n;};
let saved={};
try{const data=JSON.parse(localStorage.getItem(key)||'{}');if(data&&typeof data==='object'&&!Array.isArray(data))saved=data;}catch(_){$('storage-note').textContent='저장된 복습 표시를 읽지 못했습니다. 이번 화면에서 다시 체크할 수 있습니다.';}
function persist(){try{localStorage.setItem(key,JSON.stringify(saved));}catch(_){$('storage-note').textContent='브라우저 저장이 차단되어 있습니다. 화면을 닫기 전에 점검표를 인쇄해 주세요.';}}
$('print').onclick=()=>window.print();
fetch('course.json',{cache:'no-store'}).then(r=>{if(!r.ok)throw new Error('course');return r.json();}).then(course=>{
 const lessons=course.lessons.filter(l=>l.group==='전문교육');
 const update=()=>{const completed=lessons.filter(l=>saved[l.id+'-review']===true&&saved[l.id+'-practice']===true);const hours=completed.reduce((sum,l)=>sum+Number(l.hours),0);$('progress').textContent=`복습·모의실습 체크 ${completed.length}/${lessons.length}과목 · 체크한 과목의 계획시간 ${hours}/72시간`;$('meter').max=lessons.length;$('meter').value=completed.length;};
 for(const lesson of lessons){
  const article=node('article',undefined,$('subjects'));article.className='subject';
  node('p',`${lesson.id} · 계획 ${lesson.hours}시간`,article).className='badge';node('h3',lesson.title,article);
  const link=node('a','교육 교안 열기 →',article);link.href='index.html#lesson-'+lesson.id;link.className='lesson-link';
  node('h4','학습목표 · 복습 범위',article);const list=node('ul',undefined,article);for(const objective of lesson.objectives||[])node('li',objective,list);
  if(lesson.question){const quiz=node('details',undefined,article);node('summary','자기점검 문제',quiz);node('p',lesson.question,quiz);const answer=node('details',undefined,quiz);node('summary','교육 원고의 해설 보기',answer);node('p',lesson.answer||'담당 강사와 답을 확인하세요.',answer);}
  node('h4','모의 실습 준비',article);node('p',lesson.activity||'교안의 모의 실습을 담당 강사와 함께 연습하세요.',article);
  if(lesson.framework&&lesson.framework.practice)node('p',lesson.framework.practice,article);
  const checks=node('div',undefined,article);checks.className='checks';
  for(const [kind,label] of [['review','교안·문제 복습'],['practice','모의 실습 연습']]){const wrap=node('label',undefined,checks);const input=node('input',undefined,wrap);input.type='checkbox';input.checked=saved[lesson.id+'-'+kind]===true;input.setAttribute('aria-label',lesson.id+' '+label);node('span',label,wrap);input.onchange=()=>{saved[lesson.id+'-'+kind]=input.checked;persist();update();};}
 }
 update();
}).catch(()=>{$('progress').textContent='교육과정을 불러오지 못했습니다. 연결을 확인한 뒤 새로고침해 주세요.';});
