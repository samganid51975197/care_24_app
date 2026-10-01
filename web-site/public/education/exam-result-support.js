// Result guidance and a locally saved application; sharing does not imply association receipt.
function certificateApplicationEligible(track,kind){
  if(kind==='practice')return Boolean(actualExamSubmissions[track]?.passed);
  if(kind==='qualification')return Boolean(actualExamSubmissions[track]?.passed)&&educationModules.every(m=>completedModules.has(m.id));
  return kind==='course'&&track==='dialysis'&&trackEligible(track);
}
function appendExamGuidance(panel,{passed,track,kind}){
  panel.querySelector('.exam-outcome-guidance')?.remove();
  const section=document.createElement('section');section.className='exam-outcome-guidance';
  const title=document.createElement('h3');title.textContent=passed?'합격을 진심으로 축하드립니다!':'끝까지 도전하신 노력에 박수를 보냅니다.';
  const message=document.createElement('p');message.textContent=passed?'꾸준히 공부한 결실입니다. 배운 내용을 현장에서 따뜻하고 안전한 돌봄으로 이어가 주세요.':'이번 결과가 여러분의 가능성을 결정하지는 않습니다. 어려웠던 내용을 차근차근 복습해 보세요. 다음 도전을 응원합니다.';
  section.append(title,message);
  if(passed){
    const eligible=certificateApplicationEligible(track,kind),button=document.createElement('button'),note=document.createElement('p');
    button.type='button';button.textContent=kind==='course'?'수료·인증서 발급 신청':'합격증 발급 신청';button.disabled=!eligible;
    note.textContent=kind==='mock'?'모의고사 합격은 연습 결과입니다. 실제 자격시험 합격과 교육 이수 후 합격증 발급을 신청할 수 있습니다.':eligible?'발급 신청서를 작성하세요. 협회(간병24)의 확인을 거쳐 발급됩니다.':'필요한 교육·실습·평가 요건을 완료한 후 발급을 신청할 수 있습니다.';
    button.addEventListener('click',()=>openCertificateApplication(section,track,kind));section.append(note,button);
    if(kind==='qualification'){
      const practiceButton=document.createElement('button');practiceButton.type='button';practiceButton.textContent='실습 신청';practiceButton.disabled=!certificateApplicationEligible(track,'practice');
      practiceButton.addEventListener('click',()=>openCertificateApplication(section,track,'practice'));section.append(practiceButton);
      const info=document.createElement('p');info.textContent='합격증 발급 신청서에서 실습도 함께 신청할 수 있습니다. 실습 신청은 실습 완료나 배정 확정을 의미하지 않습니다.';section.append(info);
    }
  }else{
    const note=document.createElement('p');note.textContent=kind==='qualification'?'자격시험 재응시 일정과 절차는 협회(간병24)에 문의해 주세요.':'학습 내용을 복습한 뒤 모의고사에 다시 도전해 보세요.';section.append(note);
  }
  panel.append(section);
}
function openCertificateApplication(parent,track,kind){
  parent.querySelector(`[data-application-kind="${kind}"]`)?.remove();
  const form=document.createElement('form');form.className='certificate-application';form.dataset.applicationKind=kind;
  form.innerHTML='<h4>발급 신청서</h4><p>이 화면에서는 신청서를 이 기기에 저장하고 공유할 수 있습니다. 협회 접수·승인 여부는 별도로 확인해야 합니다.</p><label>신청자 성명<input name="candidate" required maxlength="60" autocomplete="name"></label>'+(kind==='qualification'?'<label>신청 등급<select name="level"><option>1급</option><option selected>2급</option></select></label>':'')+'<div><button type="submit">저장</button><button type="button" data-send disabled>협회(간병24) 보내기</button><button type="button" data-confirm disabled>확인</button></div><p role="status"></p>';
  if(kind==='practice'||kind==='qualification'){
    form.querySelector('h4').textContent=kind==='practice'?'실습 신청서':'이론시험 합격증 발급·실습 신청서';
    const fields=document.createElement('fieldset');fields.innerHTML='<legend>실습 신청 · 총 120시간(5일 × 24시간)</legend><label><input type="checkbox" name="practice" checked> 실습도 함께 신청합니다</label><label>희망 지역 또는 실습기관<input name="practicePlace" maxlength="120" required placeholder="예: 성남시 또는 희망 병원명"></label><label>희망 시작일<input name="practiceDate" type="date" required></label><p>실습기관·일정·담당자는 협회와 협의 후 확정됩니다.</p>';
    form.querySelector('div').before(fields);
    const check=fields.querySelector('[name="practice"]');if(kind==='practice'){check.disabled=true;check.parentElement.hidden=true}
    check.addEventListener('change',()=>{for(const field of fields.querySelectorAll('input:not([type="checkbox"])')){field.disabled=!check.checked;field.required=check.checked}});
  }
  const status=form.querySelector('[role="status"]'),send=form.querySelector('[data-send]'),confirmButton=form.querySelector('[data-confirm]');let saved=null;
  const key=`care24CertificateApplication-${kind}-${track}`;
  form.addEventListener('input',()=>{saved=null;send.disabled=true;confirmButton.disabled=true;status.textContent='변경한 내용을 저장해 주세요.'});
  form.addEventListener('submit',event=>{event.preventDefault();if(!certificateApplicationEligible(track,kind)){status.textContent='발급 요건을 먼저 확인해 주세요.';return}const name=form.elements.candidate.value.trim();if(!name){status.textContent='성명을 입력해 주세요.';return}const record={kind,track,name,level:form.elements.level?.value||'',practice:Boolean(form.elements.practice?.checked),practicePlace:form.elements.practice?.checked?form.elements.practicePlace.value.trim():'',practiceDate:form.elements.practice?.checked?form.elements.practiceDate.value:'',score:(kind==='qualification'||kind==='practice')?actualExamSubmissions[track].score:undefined,savedAt:new Date().toISOString(),status:'local-draft'};try{localStorage.setItem(key,JSON.stringify(record));saved=record;send.disabled=false;confirmButton.disabled=true;status.textContent='이 기기에 저장했습니다. 보내기를 눌러 협회에 전달해 주세요.'}catch{status.textContent='저장하지 못했습니다. 기기의 저장 공간과 설정을 확인해 주세요.'}});
  send.addEventListener('click',async()=>{if(!saved||!certificateApplicationEligible(track,kind))return;const text=`[협회(간병24) ${kind==='practice'?'실습 신청':saved.practice?'합격증 발급·실습 동시 신청':'발급 신청'}]\n과정: ${examTrackNames[track]||'투석환자 돌봄'}\n성명: ${saved.name}\n신청: ${kind==='practice'?'실습':saved.level||'전문과정 수료·인증서'}${saved.score===undefined?'':`\n시험점수: ${saved.score}점`}${saved.practice?`\n실습 희망 지역·기관: ${saved.practicePlace}\n실습 희망 시작일: ${saved.practiceDate}\n총 120시간(5일 × 24시간) 실습 배정을 요청드립니다.`:''}\n신청 요건 확인을 요청드립니다.`;try{if(navigator.share){await navigator.share({title:kind==='practice'?'실습 신청':'발급·실습 신청',text});status.textContent='공유 화면을 이용했습니다. 협회에 전달되었는지 직접 확인해 주세요.'}else if(navigator.clipboard){await navigator.clipboard.writeText(text);status.textContent='신청 문구를 복사했습니다. 협회 담당자에게 붙여넣어 보내 주세요. 아직 접수된 것은 아닙니다.'}else{status.textContent='공유를 지원하지 않는 환경입니다. 협회 담당자에게 문의해 주세요.';return}confirmButton.disabled=false}catch(error){status.textContent=error.name==='AbortError'?'보내기를 취소했습니다.':'보내지 못했습니다. 다시 시도해 주세요.'}});
  confirmButton.addEventListener('click',()=>{status.textContent='안내를 확인했습니다. 실제 접수·승인·발급 여부는 협회(간병24)에 확인해 주세요.'});
  parent.append(form);form.scrollIntoView({block:'center'});
}
const submitExamWithGuidance=submitExam;
submitExam=function(timedOut){const exam=currentExam,wasVisible=!examWorkspace.hidden;submitExamWithGuidance(timedOut);if(exam&&wasVisible&&examWorkspace.hidden){const passed=exam.isActual?Boolean(actualExamSubmissions[exam.track]?.passed):Boolean(examResults[`${exam.track}-${exam.seed}`]?.passed);appendExamGuidance(examResultPanel,{passed,track:exam.track,kind:exam.isActual?'qualification':'mock'});examResultPanel.scrollIntoView({block:'start'})}};
const finishDialysisWithGuidance=finishDialysisMock;
finishDialysisMock=function(){const wasVisible=!dialysisQuiz.hidden;finishDialysisWithGuidance();if(wasVisible)appendExamGuidance(document.getElementById('dialysisMockResult'),{passed:Boolean(dialysisMockResults[activeDialysisMock]?.passed),track:'dialysis',kind:'course'})};
const outcomeStyle=document.createElement('style');outcomeStyle.textContent='.exam-outcome-guidance{width:100%;padding:18px;border:1px solid #99c8bd;border-radius:12px;background:#effaf6;line-height:1.7}.exam-outcome-guidance h3{margin:0 0 10px;color:#173f5f}.exam-outcome-guidance button{padding:12px;border:0;border-radius:8px;background:#173f5f;color:white;font-weight:bold}.exam-outcome-guidance button:disabled{background:#77848b;cursor:not-allowed}.certificate-application label{display:block;margin:12px 0}.certificate-application input,.certificate-application select{display:block;width:100%;padding:12px;border:1px solid #99b7b0;border-radius:8px}.certificate-application input[type=checkbox]{display:inline-block;width:auto}.certificate-application fieldset{margin:14px 0;border:1px solid #99b7b0;border-radius:8px}.exam-outcome-guidance>button{margin:4px}.certificate-application>div{display:flex;gap:8px;flex-wrap:wrap}';document.head.append(outcomeStyle);
