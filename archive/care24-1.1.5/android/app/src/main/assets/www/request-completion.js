const requestCompletion=document.createElement('section');
requestCompletion.id='requestCompletion';
requestCompletion.className='request-completion';
requestCompletion.hidden=true;
requestCompletion.innerHTML='<span>✓</span><div><strong>돌봄 의뢰계약서 저장·전송 완료</strong><p id="requestCompletionDetail"></p></div>';
document.querySelector('.request-contract-document footer').before(requestCompletion);

const completionSaveAndSend=saveAndSendContract;
saveAndSendContract=async function(filename,title,content){
  const result=await completionSaveAndSend(filename,title,content);
  if(title==='돌봄 의뢰계약서'){
    const saved=JSON.parse(localStorage.getItem('care24LastRequestContract')||'null');
    requestCompletion.hidden=false;
    document.getElementById('requestCompletionDetail').textContent=`의뢰번호 ${saved?.job||'확인 중'} · ${new Date().toLocaleString('ko-KR')}`;
    requestSubmit.dataset.completed='true';
    requestSubmit.disabled=true;
    requestSubmit.textContent='저장·전송 완료';
    requestCompletion.scrollIntoView({behavior:'smooth',block:'center'});
  }
  return result;
};
