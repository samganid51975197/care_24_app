import {appendVi} from './exam-bilingual.mjs?v=1';
export function explanationModel(question,selected){
  const answered=Number.isInteger(selected)&&selected>=0&&selected<question.options.length;
  const correctText=`${question.answer+1}번. ${question.options[question.answer]}`;
  const chosen=answered?`${selected+1}번. ${question.options[selected]}`:'아직 답을 선택하지 않았습니다.';
  const steps=[{title:'문제 상황',text:question.prompt},{title:'판단 근거',text:question.explanation},{title:'정답 정리',text:correctText}];
  return {steps,chosen,answered,correctText,narration:`${question.id}번 문제 해설입니다. ${steps.map(s=>`${s.title}. ${s.text}`).join(' ')} ${answered?`내가 선택한 답은 ${chosen}입니다. ${selected===question.answer?'정답입니다.':'정답과 판단 근거를 비교해 보세요.'}`:'아직 답을 선택하지 않았습니다.'}`};
}
export function renderExplanation({question,selected,target,voice}){
  const model=explanationModel(question,selected);
  const el=(tag,text,parent)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=text;parent?.append(n);return n;};
  const panel=el('div',undefined,target);panel.className='av-explanation';panel.setAttribute('aria-label',`${question.id}번 시청각 해설`);
  const panelTitle=el('h4','눈으로 보고, 음성으로 듣는 해설',panel);if(question.vi)appendVi(panelTitle,'Giải thích bằng sơ đồ và giọng đọc');
  const comparison=el('div',undefined,panel);comparison.className='answer-comparison';
  for(const [title,text] of [['내가 고른 답',model.chosen],['정답',model.correctText]]){const cell=el('div',undefined,comparison);el('strong',title,cell);el('p',text,cell);if(question.vi)appendVi(cell,title==='정답'?`Đáp án đúng: ${question.answer+1}. ${question.vi.options[question.answer]}`:`Bạn đã chọn: ${model.answered?(selected+1)+'. '+question.vi.options[selected]:'Chưa trả lời'}`);}
  const flow=el('ol',undefined,panel);flow.className='explanation-flow';flow.setAttribute('aria-label','상황에서 정답까지의 판단 과정');
  const cards=model.steps.map((step,index)=>{const card=el('li',undefined,flow);const number=el('span',String(index+1).padStart(2,'0'),card);number.className='step-number';el('h5',step.title,card);el('p',step.text,card);if(question.vi)appendVi(card,[`Tình huống: ${question.vi.prompt}`,`Cơ sở nhận định: ${question.vi.explanation}`,`Đáp án đúng: ${question.answer+1}. ${question.vi.options[question.answer]}`][index]);return card;});
  const controls=el('div',undefined,panel);controls.className='actions';
  const play=el('button','해설 듣기',controls);play.type='button';play.setAttribute('aria-label',`${question.id}번 해설 듣기`);
  const slow=el('button','천천히 듣기',controls);slow.type='button';slow.setAttribute('aria-label',`${question.id}번 해설 천천히 듣기`);
  const stop=el('button','해설 멈추기',controls);stop.type='button';stop.setAttribute('aria-label',`${question.id}번 해설 멈추기`);
  const status=el('p','채점 후 공개되는 해설입니다. 도식의 내용과 내 답·정답 비교를 한국어 음성으로 들을 수 있습니다.',panel);status.className='hint';status.setAttribute('role','status');
  const reset=()=>cards.forEach(card=>card.classList.remove('speaking'));
  function read(rate,lang='ko-KR'){const narration=lang==='vi-VN'?`Giải thích câu ${question.id}. ${question.vi.prompt} ${question.vi.explanation} Đáp án đúng là ${question.answer+1}. ${question.vi.options[question.answer]}`:model.narration;voice.readExplanation(narration,{rate,lang,onStart:()=>{reset();flow.classList.add('speaking-flow');status.textContent='해설을 읽고 있습니다. 위 도식에서 같은 내용을 확인하세요.';},onFinish:()=>{flow.classList.remove('speaking-flow');status.textContent='해설 듣기를 마쳤습니다.';},onStop:()=>{flow.classList.remove('speaking-flow');status.textContent='해설 듣기를 멈췄습니다.';},onError:()=>{flow.classList.remove('speaking-flow');status.textContent=lang==='vi-VN'?'베트남어 음성을 사용할 수 없습니다. 기기의 베트남어 음성 설정을 확인해 주세요. / Không có giọng đọc tiếng Việt. Vui lòng kiểm tra cài đặt giọng nói; vẫn có thể đọc phần giải thích.':'음성을 재생할 수 없습니다. 기기의 한국어 음성 설정을 확인해 주세요. 도식과 글 해설은 그대로 볼 수 있습니다.';}});}
  if(question.vi){const viButton=el('button','베트남어 해설 듣기 · Nghe tiếng Việt',controls);viButton.type='button';viButton.setAttribute('aria-label',`${question.id}번 베트남어 해설 듣기`);viButton.onclick=()=>read(.9,'vi-VN');viButton.disabled=!voice.supported;appendVi(stop,'Dừng đọc');}
  play.onclick=()=>read(1);slow.onclick=()=>read(.8);stop.onclick=()=>voice.cancel();
  if(!voice.supported){play.disabled=true;slow.disabled=true;stop.disabled=true;status.textContent='이 브라우저에서는 음성 읽기를 지원하지 않습니다. 도식과 글 해설을 확인해 주세요.';}
}
