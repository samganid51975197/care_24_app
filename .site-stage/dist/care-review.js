function enableCareReview(form,getHospital){
 const submitApplication=form.onsubmit;
 const formButton=form.querySelector('[type="submit"]');
 formButton.textContent='내용 확인';
 form.insertAdjacentHTML('afterend',`<dialog class="care-review-dialog" aria-labelledby="careReviewTitle"><h2 id="careReviewTitle">간병의뢰 진행</h2><div class="care-review-content"></div><p id="careReviewStatus" role="status">입력 내용을 확인한 뒤 저장해 주세요.</p><div class="care-review-actions"><button class="secondary" type="button" data-review-edit>수정하기</button><button class="primary" type="button" data-review-save>저장</button><button class="primary" type="button" data-review-send>보내기</button><button class="primary" type="button" data-review-confirm>상황판 공개 완료</button></div></dialog>`);
 const dialog=document.querySelector('.care-review-dialog');
 const status=dialog.querySelector('#careReviewStatus');
 const saveButton=dialog.querySelector('[data-review-save]');
 const sendButton=dialog.querySelector('[data-review-send]');
 const confirmButton=dialog.querySelector('[data-review-confirm]');
 const result=document.querySelector('#result');
 const consent=form.querySelector('input[type="checkbox"][required]');
 const updateReviewButton=()=>{formButton.disabled=Boolean(consent&&!consent.checked)};
 if(consent){consent.addEventListener('change',updateReviewButton);updateReviewButton()}
 result.setAttribute('role','status');result.setAttribute('aria-live','polite');result.tabIndex=-1;
 let saving=false;
 const draftKey=()=>`care24-request-draft-${location.hash.split('?')[0].split('/')[1]||form.elements.namedItem('hospital')?.value||getHospital(new FormData(form))?.id||'new'}`;
 const drafts=window.__care24Drafts||(window.__care24Drafts={});
 const phoneInput=form.elements.namedItem('phone'),phoneHistoryKey='care24-recent-contact-phones';
 const recentPhones=()=>{try{return JSON.parse(localStorage.getItem(phoneHistoryKey)||'[]').filter(x=>typeof x==='string')}catch{return[]}};
 const phoneOptions=document.createElement('datalist');phoneOptions.id='care24RecentPhones';document.body.append(phoneOptions);
 const drawRecentPhones=()=>{phoneOptions.innerHTML=recentPhones().map(phone=>`<option value="${escapeHtml(phone)}">`).join('')};
 if(phoneInput){phoneInput.setAttribute('list',phoneOptions.id);drawRecentPhones()}
 const rememberPhone=()=>{if(!phoneInput?.value)return;try{localStorage.setItem(phoneHistoryKey,JSON.stringify([phoneInput.value,...recentPhones().filter(phone=>phone!==phoneInput.value)].slice(0,5)));drawRecentPhones()}catch{}};
 const saveDraft=()=>{const draft=Object.fromEntries(new FormData(form));drafts[draftKey()]=draft;sessionStorage.setItem(draftKey(),JSON.stringify(draft));rememberPhone()};
 const restoreDraft=()=>{try{const draft=drafts[draftKey()]||JSON.parse(sessionStorage.getItem(draftKey())||'null');if(!draft)return;for(const name of ['phone','building','floor','room','bed','date','time','endDate','endTime','memo','disease','caregiver']){const field=form.elements.namedItem(name);if(field&&typeof draft[name]==='string')field.value=draft[name]}}catch{}};
 restoreDraft();
 const resetSteps=()=>{saveButton.disabled=false;saveButton.textContent='저장';sendButton.disabled=true;sendButton.textContent='보내기';confirmButton.disabled=true;confirmButton.hidden=false;confirmButton.textContent='상황판 공개 완료';status.textContent='저장 → 보내기 → 상황판 공개 완료 순서로 진행하세요.'};
 dialog.querySelector('[data-review-edit]').onclick=()=>dialog.close();
 form.onsubmit=e=>{e.preventDefault();if(saving||!form.reportValidity())return;const values=new FormData(form),h=getHospital(values);if(!h){result.textContent='병원을 선택해 주세요.';result.focus();return}const labels={building:'건물',floor:'층',room:'병실',bed:'침상',date:'간병 시작일',time:'시작 시간 (한국 시간)',endDate:'간병 종료일',endTime:'종료 시간 (한국 시간)',phone:'연락처',disease:'질환 구분',caregiver:'간병인 유형',memo:'주의사항'};dialog.querySelector('.care-review-content').innerHTML='<dl><div><dt>병원</dt><dd>'+escapeHtml(h.name)+'</dd></div>'+Object.entries(labels).filter(([key])=>values.get(key)).map(([key,label])=>'<div><dt>'+label+'</dt><dd>'+escapeHtml(values.get(key))+'</dd></div>').join('')+'</dl>';resetSteps();dialog.showModal()};
 saveButton.onclick=()=>{saveDraft();saveButton.disabled=true;saveButton.textContent='저장 완료';sendButton.disabled=false;sendButton.textContent='보내기';status.textContent='저장되었습니다. 다음 단계인 보내기를 누르세요.';sendButton.scrollIntoView({block:'nearest',inline:'nearest'});sendButton.focus()};
 sendButton.onclick=()=>{saveDraft();sendButton.disabled=true;sendButton.textContent='보내기 완료';confirmButton.disabled=false;confirmButton.textContent='상황판 공개 완료';status.textContent='보내기 완료. 상황판 공개 완료를 누르세요.';confirmButton.scrollIntoView({block:'nearest',inline:'nearest'});confirmButton.focus()};
 confirmButton.onclick=async()=>{if(saving)return;if(consent&&!consent.checked){status.textContent='개인정보 수집·이용에 동의한 뒤 상황판 공개를 진행할 수 있습니다.';dialog.close();consent.focus();return}saving=true;confirmButton.disabled=true;form.dataset.awaitingCompletion='true';result.textContent='상황판에 공개하는 중입니다…';const submitted=await submitApplication({preventDefault(){}});saving=false;if(submitted===false){delete form.dataset.awaitingCompletion;confirmButton.disabled=false;status.textContent=result.textContent||'공개하지 못했습니다. 입력 내용을 확인한 뒤 다시 누르세요.';return}const target=form.dataset.publishedTarget;delete form.dataset.awaitingCompletion;delete form.dataset.publishedTarget;dialog.close();if(target)location.hash=target};
}
