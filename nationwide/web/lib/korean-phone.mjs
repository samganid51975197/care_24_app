export function normalizeKoreanPhone(value){
  let phone=String(value||'').replace(/\D/g,'');
  if(phone.startsWith('0082'))phone=`0${phone.slice(4)}`;
  else if(phone.startsWith('82'))phone=`0${phone.slice(2)}`;
  if(!/^(?:01[016789]\d{7,8}|02\d{7,8}|0[3-6]\d{8,9}|070\d{8})$/.test(phone)){
    throw Error('연락처를 확인해 주세요. 휴대전화 또는 지역번호가 포함된 유선전화 번호를 입력해 주세요.');
  }
  return phone;
}

export function isValidKoreanPhone(value){
  try{normalizeKoreanPhone(value);return true;}catch{return false;}
}
