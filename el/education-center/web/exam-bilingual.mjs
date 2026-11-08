export function appendVi(parent,text) {
  if(!text)return;
  const span=document.createElement('span');span.className='vi-translation';span.lang='vi';span.textContent=text;parent.append(span);return span;
}
export function bilingualLabel(input,ko,vi){
  input.dataset.labelKo=ko;input.dataset.labelVi=vi;
  input.setAttribute('aria-label',document.documentElement.dataset.examLanguage==='ko'?ko:`${ko}. ${vi}`);
}
export function mountLanguageControl(before){
  let mode='both';try{mode=localStorage.getItem('care-exam-language')==='ko'?'ko':'both';}catch{}
  const box=document.createElement('section');box.className='exam-language';box.setAttribute('aria-label','시험 표시 언어 / Ngôn ngữ');
  const title=document.createElement('strong');title.textContent='표시 언어 / Ngôn ngữ';box.append(title);
  const buttons=[];
  for(const [value,text] of [['both','한국어 + Tiếng Việt'],['ko','한국어만']]){const button=document.createElement('button');button.type='button';button.textContent=text;button.onclick=()=>{mode=value;try{localStorage.setItem('care-exam-language',mode);}catch{}apply();};box.append(button);buttons.push([value,button]);}
  const note=document.createElement('p');note.textContent='베트남어는 한국어 문항의 이해를 돕는 번역입니다. / Bản tiếng Việt hỗ trợ hiểu nội dung tiếng Hàn.';box.append(note);
  before.before(box);
  function apply(){document.documentElement.dataset.examLanguage=mode;for(const [value,b] of buttons)b.setAttribute('aria-pressed',String(value===mode));for(const el of document.querySelectorAll('[data-label-ko]'))el.setAttribute('aria-label',mode==='ko'?el.dataset.labelKo:`${el.dataset.labelKo}. ${el.dataset.labelVi}`);}
  apply();
}
