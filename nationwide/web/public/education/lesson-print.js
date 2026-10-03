function lessonEscape(value){return String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function newSixtyMinuteLesson(id,index){
 const course=newCourseDefinitions[id],[title,content]=course.lessons[index],items=diseaseSpecificQuestions[id].slice(index*5,index*5+5);
 return {title,course:course.title,index,objectives:[`${title}의 핵심 상황에서 관찰 사실과 추측을 구분한다.`,'직접 도울 수 있는 생활지원과 의료진에게 확인할 일을 구분한다.','발생 시각·관찰 사실·시행한 도움·현재 상태를 포함해 보고한다.'],segments:[
  {time:'0–5분',minutes:5,title:'도입 · 경험과 목표 확인',text:`강사는 “${items[0][1]}”을 제시하고 학습자에게 먼저 할 행동을 묻습니다. 정답을 바로 제시하기보다 환자 안전·선택·업무 범위 중 판단 근거를 말하게 합니다.`,activity:'학습자 활동: 관찰할 사실 1개와 확인할 지시 1개를 기록합니다.'},
  {time:'5–15분',minutes:10,title:'핵심 개념 강의',text:content,activity:'강사 진행: 문장마다 생활지원·관찰·보고·금지행위로 분류합니다. 학습자는 각 분류의 예를 하나씩 설명합니다.'},
  {time:'15–25분',minutes:10,title:'상황별 판단과 근거',text:items.slice(0,3).map((q,i)=>`${i+1}. ${q[1]}\n판단 원칙: ${q[2][q[3]]}`).join('\n\n'),activity:'강사 질문: 다른 선택을 먼저 하면 무엇을 놓칠 수 있나요? 학습자는 각 상황의 우선순위를 설명합니다.'},
  {time:'25–35분',minutes:10,title:'생활지원과 업무 경계',text:items.slice(3).map((q,i)=>`${i+4}. ${q[1]}\n판단 원칙: ${q[2][q[3]]}`).join('\n\n'),activity:'학습자 활동: 직접 수행 가능한 도움, 먼저 물어볼 사항, 임의로 해서는 안 되는 일을 세 칸으로 정리합니다.'},
  {time:'35–40분',minutes:5,title:'기록·보고 시범',text:`강사가 ${items[0][1]} 상황을 사용해 관찰 사실과 환자 진술을 구분하는 보고를 시범 보입니다. 알 수 없는 수치나 진단은 만들지 않고 “확인하지 못함”으로 구분합니다.`,activity:'보고 연습 틀: “○시경 [관찰 사실]을 확인했습니다. 환자는 [표현]이라고 말합니다. [도움]을 시행했고 현재 [상태]입니다. 확인을 부탁드립니다.”'},
  {time:'40–55분',minutes:15,title:'사례 토의·역할 실습',text:`사례: ${items[4][1]}\n환자·간병인·관찰자 역할을 나눕니다. 3분 상황 정리, 5분 설명·보고 역할 연습, 4분 역할 교대, 3분 피드백으로 진행합니다.`,activity:'관찰자는 환자 확인, 존중하는 설명, 상태 변화 보고, 업무 범위 준수, 정확한 인계를 확인합니다. 실제 투약·처치 실습은 하지 않습니다.'},
  {time:'55–60분',minutes:5,title:'확인평가·정리',text:'아래 두 문항을 풀고, 선택 이유와 오늘 실습에 적용할 행동 한 가지를 말합니다. 강사는 오개념을 확인하여 다음 학습에 반영합니다.',activity:'2분 응답 → 2분 근거 토의 → 1분 핵심 정리'}
 ],questions:[items[1],items[4]],source:course.source};
}
function legacySixtyMinuteLesson(id,index){const detail=sessionDetail(id,index);return{title:detail.title,course:educationModules.find(m=>m.id===id)?.subject||id,index,objectives:detail.objectives,segments:[...detail.segments.map(s=>({time:s.time,minutes:10,title:s.name,text:s.items.join('\n'),activity:'학습자는 관찰·보고·업무 경계를 구분하여 설명합니다.'})),{time:'40–55분',minutes:15,title:'사례·실습',text:detail.caseText,activity:'관찰자는 안전 확보와 보고 순서를 확인하고 피드백합니다.'},{time:'55–60분',minutes:5,title:'확인평가',text:detail.quizText,activity:'답과 이유를 설명한 뒤 강사 피드백을 확인합니다.'}],questions:[],answerText:detail.answerText,source:''}}
function lessonPlanMarkup(model,answers=false){const esc=lessonEscape;return `<article class="sixty-minute-plan"><header><p>${esc(model.course)} · ${model.index+1}차시 · 60분 수업용 교안</p><h2>${esc(model.title)}</h2><p>강의 40분 + 사례·실습 15분 + 확인평가 5분</p></header><h3>학습목표</h3><ol>${model.objectives.map(x=>`<li>${esc(x)}</li>`).join('')}</ol><p>준비물: 교안·필기구·기관의 환자별 돌봄 지침·빈 인계 기록지. 사례에는 실명 등 개인정보를 사용하지 않습니다.</p>${model.segments.map(s=>`<section><h3>${esc(s.time)} · ${esc(s.title)}</h3><p class="lesson-lines">${esc(s.text)}</p><p class="lesson-activity">${esc(s.activity)}</p></section>`).join('')}<section><h3>확인문제</h3>${model.questions.map((q,i)=>`<p><strong>문제${i+1}. ${esc(q[1])}</strong></p><ol class="lesson-options">${q[2].map((a,n)=>`<li>${['①','②','③','④'][n]} ${esc(a)}</li>`).join('')}</ol>`).join('')}<p>내 답과 판단 근거: __________________________________________________</p></section><section><h3>실습 기록·인계 연습지</h3><p>발생 시각: __________________　관찰 사실: ____________________________</p><p>환자 표현: __________________　수행한 도움: __________________________</p><p>보고 대상·시각: ______________　현재 상태·확인할 사항: ________________</p></section>${answers?`<section class="teacher-answer"><h3>강사용 정답·평가기준</h3>${model.questions.map((q,i)=>`<p>문제${i+1}: ${['①','②','③','④'][q[3]]} — ${esc(q[2][q[3]])}</p>`).join('')}<p>${esc(model.answerText||'안전 확인, 환자 의사 존중, 사실에 근거한 보고, 의료행위 경계, 정확한 인계를 모두 설명하는지 확인합니다.')}</p></section>`:''}${model.source?`<p>교육 참고: <a href="${esc(model.source)}">${esc(model.source)}</a></p>`:''}<footer>60분은 수업 운영 계획입니다. 출력이나 학습 완료 버튼만으로 실제 출석·교육시간을 인증하지 않습니다.</footer></article>`}
function openLessonPrint(models){
 document.getElementById('lessonPrintPreview')?.remove();
 const preview=document.createElement('div');preview.id='lessonPrintPreview';preview.setAttribute('role','dialog');preview.setAttribute('aria-modal','true');preview.setAttribute('aria-label','60분 강의 교안 출력');
 preview.innerHTML=`<div class="print-controls"><button type="button" data-print>교안 인쇄 / PDF 저장</button><label><input type="checkbox" data-answers> 강사용 정답 포함</label><span>${models.length}차시 · 차시당 60분</span><button type="button" data-close>교안 닫기</button></div><div class="print-pages">${models.map(m=>lessonPlanMarkup(m,true)).join('')}</div>`;
 const previousFocus=document.activeElement;
 preview.querySelector('[data-print]').onclick=()=>window.print();
 preview.querySelector('[data-answers]').onchange=e=>preview.classList.toggle('include-answers',e.target.checked);
 function close(){preview.remove();document.body.classList.remove('lesson-preview-open');previousFocus?.focus()}
 preview.querySelector('[data-close]').onclick=close;
 preview.onkeydown=e=>{if(e.key==='Escape')close();if(e.key==='Tab'){const controls=[...preview.querySelectorAll('button,input,a')];const first=controls[0],last=controls[controls.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}}};
 document.body.append(preview);document.body.classList.add('lesson-preview-open');preview.querySelector('[data-print]').focus();

}
const renderNewCourseWithPrint=renderNewCourse;
renderNewCourse=function(id){renderNewCourseWithPrint(id);if(!newCourseDefinitions[id])return;
 const all=document.createElement('button');all.type='button';all.textContent='전체 6차시 교안 보기·출력';all.addEventListener('click',()=>openLessonPrint(newCourseDefinitions[id].lessons.map((_,i)=>newSixtyMinuteLesson(id,i))));newCoursePanel.querySelector('h3').after(all);
 newCoursePanel.querySelectorAll('.new-course-lessons>details').forEach((details,i)=>{const summary=details.querySelector('summary'),complete=details.querySelector('button');summary.textContent=summary.textContent.replace('차시.','차시 · 60분.');details.replaceChildren(summary);const plan=document.createElement('div');plan.innerHTML=lessonPlanMarkup(newSixtyMinuteLesson(id,i));details.append(plan);const print=document.createElement('button');print.type='button';print.textContent='이 차시 교안 보기·출력';print.addEventListener('click',()=>openLessonPrint([newSixtyMinuteLesson(id,i)]));details.append(print,complete)});
};
const lessonPrintButton=document.createElement('button');lessonPrintButton.type='button';lessonPrintButton.textContent='선택한 60분 차시 교안 보기·출력';lessonPrintButton.addEventListener('click',()=>openLessonPrint([legacySixtyMinuteLesson(activeCourseId,activeCourseLesson)]));detailedCourse.querySelector('.detailed-actions').prepend(lessonPrintButton);
const legacyAllPrintButton=document.createElement('button');legacyAllPrintButton.type='button';legacyAllPrintButton.textContent='현재 과정 전체 60분 교안 보기·출력';legacyAllPrintButton.addEventListener('click',()=>openLessonPrint(courseTitles[activeCourseId].map((_,i)=>legacySixtyMinuteLesson(activeCourseId,i))));detailedCourse.querySelector('.detailed-actions').prepend(legacyAllPrintButton);
const sixtyLessonStyle=document.createElement('style');sixtyLessonStyle.textContent='#newCourseClassroom .sixty-minute-plan h2{font-size:21px}#newCourseClassroom .sixty-minute-plan h3{font-size:18px}#newCourseClassroom .sixty-minute-plan section{border-top:1px solid #cdded9;padding:12px 0}#newCourseClassroom .lesson-lines{white-space:pre-line}#newCourseClassroom .lesson-options{list-style:none;padding-left:0}#newCourseClassroom .lesson-activity{background:#eaf4ef;padding:12px}#newCourseClassroom .sixty-minute-plan footer{font-size:13px;color:#53695f}#newCourseClassroom details>button{margin:6px}';document.head.append(sixtyLessonStyle);
if(newCourseDefinitions[activeExamTrack])renderNewCourse(activeExamTrack);

const printPreviewStyle=document.createElement('style');printPreviewStyle.textContent=`
body.lesson-preview-open{overflow:hidden}
#lessonPrintPreview{position:fixed;inset:0;z-index:100000;background:#f0f4f3;overflow:auto;color:#173f5f;font:16px/1.75 Arial,'Malgun Gothic',sans-serif}
#lessonPrintPreview .print-controls{position:sticky;top:0;z-index:1;background:#e0efe8;padding:16px;display:flex;align-items:center;gap:16px;flex-wrap:wrap;border-bottom:1px solid #abc8b9}
#lessonPrintPreview button{padding:12px 18px;background:#173f5f;color:white;border:0;border-radius:8px;font-size:16px;cursor:pointer}
#lessonPrintPreview .print-pages{max-width:900px;background:white;margin:24px auto;padding:32px}
#lessonPrintPreview .sixty-minute-plan{margin:20px 0;break-after:page}
#lessonPrintPreview .sixty-minute-plan:last-child{break-after:auto}
#lessonPrintPreview header{border-bottom:3px solid #197862}
#lessonPrintPreview h2{font-size:24px}#lessonPrintPreview h3{font-size:18px;break-after:avoid}
#lessonPrintPreview .lesson-lines{white-space:pre-line}
#lessonPrintPreview .lesson-activity{background:#f2f6f4;padding:10px}
#lessonPrintPreview .lesson-options{list-style:none;padding:0}
#lessonPrintPreview .teacher-answer{display:none;border:1px dashed #6c8f82;padding:10px}
#lessonPrintPreview.include-answers .teacher-answer{display:block}
#lessonPrintPreview footer{font-size:12px;color:#586c64;margin-top:20px}
@media print{@page{size:A4;margin:16mm}body.lesson-preview-open{overflow:visible!important}body.lesson-preview-open>*:not(#lessonPrintPreview){display:none!important}#lessonPrintPreview{position:static!important;overflow:visible!important;background:white;font-size:11pt}#lessonPrintPreview .print-controls{display:none!important}#lessonPrintPreview .print-pages{max-width:none;margin:0;padding:0}#lessonPrintPreview a{color:inherit;text-decoration:none}}
`;document.head.append(printPreviewStyle);
