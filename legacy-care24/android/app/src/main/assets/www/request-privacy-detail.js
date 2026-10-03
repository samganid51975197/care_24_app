const requestPrivacyCheck=document.getElementById('requestConsent')?.closest('.privacy-check');
if(requestPrivacyCheck){
  const privacyDetail=document.createElement('section');
  privacyDetail.className='request-privacy-detail';
  privacyDetail.innerHTML=`<header><span>필수 동의</span><h3>개인정보 수집·이용 안내</h3></header><dl><div><dt>수집 항목</dt><dd>의뢰인 구분, 성명, 연락처, 환자와의 관계, 병원·동·병동·병실, 돌봄 기간, 필요한 돌봄 내용, 전자서명 및 계약·접수 일시</dd></div><div><dt>이용 목적</dt><dd>돌봄 상담, 돌봄인 모집·매칭, 본인 확인, 계약 체결·이행, 연락, 민원 및 분쟁 처리</dd></div><div><dt>보유 기간</dt><dd>계약과 상담 목적 달성 후 지체 없이 파기합니다. 다만 관계 법령에 보존 의무가 있는 자료는 해당 기간 동안 별도로 안전하게 보관합니다.</dd></div><div><dt>동의 거부</dt><dd>동의를 거부할 수 있으나, 필수정보 수집에 동의하지 않으면 돌봄 의뢰·매칭·계약 서비스를 이용할 수 없습니다.</dd></div></dl><p>※ 질병명·진단내용 등 건강정보가 필요한 경우에는 수집 목적과 항목을 안내하고 별도의 민감정보 동의를 받습니다.</p>`;
  const contractConsent=document.getElementById('requestContractAgree')?.closest('.contract-consent');
  if(contractConsent)contractConsent.before(privacyDetail);else requestPrivacyCheck.before(privacyDetail);
  const labelText=requestPrivacyCheck.querySelector('span');
  if(labelText)labelText.textContent='위 개인정보 수집·이용 내용을 확인했으며 이에 동의합니다.';
  requestPrivacyCheck.classList.add('contract-privacy-check');
  privacyDetail.after(requestPrivacyCheck);
}
