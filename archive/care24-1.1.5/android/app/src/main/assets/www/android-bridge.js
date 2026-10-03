const browserSaveAndSendContract=saveAndSendContract;
saveAndSendContract=async function(filename,title,content){
  if(window.AndroidBridge&&typeof window.AndroidBridge.saveAndShareContract==='function'){
    try{
      if(title==='돌봄 의뢰계약서'){
        content=content.replace('\n을(협회):',`\n연락처: ${requesterPhone.value.trim()}\n환자와의 관계: ${requesterRole.value==='환자 본인'?'해당 없음':requesterRelation.value.trim()}\n을(협회):`).replace('병원·병동:','병원·병동·병실:').replace('\n돌봄 기간:',` · ${requestRoom.value.trim()||'병실 미입력'}\n돌봄 기간:`);
      }
      return Boolean(window.AndroidBridge.saveAndShareContract(filename,title,content));
    }catch(error){
      console.warn('Android 계약서 저장·전송 실패',error);
    }
  }
  return browserSaveAndSendContract(filename,title,content);
};
