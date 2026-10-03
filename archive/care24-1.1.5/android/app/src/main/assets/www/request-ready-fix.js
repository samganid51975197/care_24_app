const requestSubmitGuide=document.createElement('small');
requestSubmitGuide.className='request-submit-guide';
requestSubmit.before(requestSubmitGuide);

const associationSignTitle=document.querySelector('#requestAssociationSign')?.closest('.contract-sign')?.querySelector('.sign-title strong');
if(associationSignTitle)associationSignTitle.textContent='을 · 협회 확인 서명 (접수 후 선택)';
const associationSignStatus=document.getElementById('requestAssociationSignStatus');
if(associationSignStatus)associationSignStatus.textContent='보호자 제출 후 협회 담당자가 확인합니다.';

updateRequestReady=function(){
  if(requestSubmit.dataset.completed==='true'){
    requestSubmit.disabled=true;
    requestSubmitGuide.textContent='돌봄 의뢰계약서가 저장·전송되었습니다.';
    requestSubmitGuide.classList.add('ready');
    return;
  }
  const relationReady=requesterRole.value==='환자 본인'||Boolean(requesterRelation.value.trim());
  const requirements=[
    [Boolean(requesterName.value.trim()),'의뢰인 성명'],
    [Boolean(requesterPhone.value.trim()),'연락처'],
    [relationReady,'환자와의 관계'],
    [requestConsent.checked,'개인정보 동의'],
    [requestContractAgree.checked,'계약 조항 동의'],
    [requestContractSigned.requesterContractSign,'환자·보호자 서명']
  ];
  const missing=requirements.filter(item=>!item[0]).map(item=>item[1]);
  requestSubmit.disabled=false;
  requestSubmitGuide.textContent=missing.length?`버튼을 누르면 확인할 항목: ${missing.join(' · ')}`:'모든 필수 항목이 완료되었습니다. 저장 후 보내기를 누르세요.';
  requestSubmitGuide.classList.toggle('ready',missing.length===0);
};

['input','change','pointerup'].forEach(type=>document.addEventListener(type,event=>{
  if(event.target.closest('#request'))setTimeout(updateRequestReady,0);
},true));

updateRequestReady();

requestSubmit.addEventListener('click',event=>{
  const relationReady=requesterRole.value==='환자 본인'||Boolean(requesterRelation.value.trim());
  const requirements=[
    [Boolean(requesterName.value.trim()),'의뢰인 성명'],
    [Boolean(requesterPhone.value.trim()),'연락처'],
    [relationReady,'환자와의 관계'],
    [requestConsent.checked,'개인정보 수집·이용 동의'],
    [requestContractAgree.checked,'계약 조항 동의'],
    [requestContractSigned.requesterContractSign,'환자·보호자 전자서명']
  ];
  const missing=requirements.filter(item=>!item[0]).map(item=>item[1]);
  if(missing.length){
    event.preventDefault();
    event.stopImmediatePropagation();
    showModal('계약서의 필수 항목을 확인해 주세요',`완료하지 않은 항목: ${missing.join(', ')}`);
  }
},true);

const requesterSignCanvas=document.getElementById('requesterContractSign');
['pointerdown','touchstart'].forEach(type=>requesterSignCanvas.addEventListener(type,()=>{
  requestContractSigned.requesterContractSign=true;
  document.getElementById('requesterContractSignStatus').textContent='전자서명이 입력되었습니다.';
  setTimeout(updateRequestReady,0);
},{passive:true}));
