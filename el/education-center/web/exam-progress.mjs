import {appendVi} from './exam-bilingual.mjs?v=1';
export function answerProgress(questions,answers){
  const done=[],remaining=[];
  for(const q of questions)(Number.isInteger(answers[q.id])&&answers[q.id]>=0&&answers[q.id]<4?done:remaining).push(q.id);
  return {done,remaining,total:questions.length};
}
export function numberRanges(numbers){
  const parts=[];for(let i=0;i<numbers.length;i++){const start=numbers[i];let end=start;while(numbers[i+1]===end+1)end=numbers[++i];parts.push(start===end?`${start}번`:`${start}번부터 ${end}번`);}return parts.join(', ');
}
export function progressMessage(state){return `전체 ${state.total}문제 중 ${state.done.length}문제를 풀었고, ${state.remaining.length}문제가 남았습니다. `+(state.remaining.length?`안 푼 문제는 ${numberRanges(state.remaining)}입니다.`:'모든 문제를 풀었습니다. 채점 결과를 확인해 주세요.');}
export function createProgressPanel({questions,host,onGo,bilingual=false}){
  const el=(tag,text,parent)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=text;parent?.append(n);return n;};
  el('h2','푼 문제 · 안 푼 문제',host);
  el('p','답을 선택하면 ‘푼 문제’로 표시됩니다. 정답·오답 여부와는 다릅니다. 번호를 누르면 해당 문제로 이동합니다.',host).className='hint';
  const summary=el('p','',host);summary.id='question-progress-summary';
  const actions=el('div',undefined,host);actions.className='actions';
  const next=el('button','안 푼 문제로 이동',actions);next.type='button';
  const listen=el('button','진행 상황 듣기',actions);listen.type='button';
  const stop=el('button','음성 멈추기',actions);stop.type='button';
  const label=el('label',undefined,host);label.className='voice-option';const auto=el('input',undefined,label);auto.type='checkbox';auto.checked=true;el('span','답 선택·채점 시 음성 안내',label);
  const voiceNote=el('p','',host);voiceNote.className='hint';voiceNote.id='voice-status';voiceNote.setAttribute('role','status');
  const grid=el('nav',undefined,host);grid.className='question-map';grid.setAttribute('aria-label','문제별 풀이 현황');
  const buttons=new Map();for(const q of questions){const button=el('button','',grid);button.type='button';button.onclick=()=>onGo(q.id);buttons.set(q.id,button);}
  if(bilingual){appendVi(host.querySelector('h2'),'Đã trả lời · Chưa trả lời');appendVi(next,'Đến câu chưa trả lời');appendVi(listen,'Nghe tiến độ bằng tiếng Hàn');appendVi(stop,'Dừng đọc');appendVi(label.querySelector('span'),'Thông báo bằng tiếng Hàn khi chọn đáp án hoặc chấm bài');}
  let state=answerProgress(questions,{}),utterance,callbacks;
  const supported='speechSynthesis' in window&&'SpeechSynthesisUtterance' in window;
  if(!supported){auto.checked=false;auto.disabled=true;listen.disabled=true;stop.disabled=true;voiceNote.textContent='이 브라우저는 음성 읽기를 지원하지 않습니다. 화면의 풀이 현황을 확인하거나 음성을 지원하는 브라우저를 이용해 주세요.';}
  else voiceNote.textContent='한국어 음성으로 읽어 줍니다. 소리가 들리지 않으면 기기의 음량과 한국어 음성 설정을 확인해 주세요.';
  function speak(text,options={}){
    if(!supported){options.onError?.();return;}
    cancel();callbacks=options;
    utterance=new SpeechSynthesisUtterance(text);utterance.lang=options.lang||'ko-KR';utterance.rate=options.rate||1;
    const voices=window.speechSynthesis.getVoices().filter(v=>v.lang.toLowerCase().startsWith((options.lang||'ko-KR').slice(0,2)));
    if(options.lang==='vi-VN'&&!voices.length){callbacks=null;options.onError?.();return;}
    const voice=voices.find(v=>v.localService)||voices[0];if(voice)utterance.voice=voice;
    const current=utterance;
    utterance.onstart=()=>{if(utterance===current){voiceNote.textContent=options.lang==='vi-VN'?'베트남어 음성을 재생하고 있습니다. / Đang đọc tiếng Việt.':'한국어 음성을 재생하고 있습니다.';options.onStart?.();}};
    utterance.onend=()=>{if(utterance===current){voiceNote.textContent='음성 안내가 끝났습니다.';callbacks=null;options.onFinish?.();}};
    utterance.onerror=e=>{if(utterance===current&&!['canceled','interrupted'].includes(e.error)){voiceNote.textContent='음성을 재생하지 못했습니다. 기기의 한국어 음성 설정을 확인해 주세요.';callbacks=null;options.onError?.();}};
    window.speechSynthesis.speak(utterance);
  }
  function cancel(){utterance=null;const previous=callbacks;callbacks=null;if(supported)window.speechSynthesis.cancel();previous?.onStop?.();}
  next.onclick=()=>{if(state.remaining.length)onGo(state.remaining[0]);};
  listen.onclick=()=>speak(progressMessage(state));
  stop.onclick=()=>{cancel();voiceNote.textContent='음성 안내를 멈췄습니다.';};
  auto.onchange=()=>{if(!auto.checked)cancel();};window.addEventListener('pagehide',cancel);
  return {
    supported,
    readExplanation:speak,
    update(answers){state=answerProgress(questions,answers);summary.textContent=`푼 문제 ${state.done.length}개 · 안 푼 문제 ${state.remaining.length}개`;if(bilingual)appendVi(summary,`Đã trả lời ${state.done.length} · Chưa trả lời ${state.remaining.length}`);next.disabled=!state.remaining.length;
      for(const q of questions){const done=state.done.includes(q.id),button=buttons.get(q.id);button.className=done?'question-done':'question-pending';button.textContent=`${q.id}번 ${done?'풀었음':'안 품'}`;if(bilingual)appendVi(button,done?'Đã trả lời':'Chưa trả lời');button.setAttribute('aria-label',`${q.id}번 · ${done?'푼 문제':'안 푼 문제'}로 이동`);const badge=document.getElementById(`question-state-${q.id}`);if(badge){badge.textContent=done?'푼 문제':'안 푼 문제';badge.className='question-state '+(done?'done':'pending');if(bilingual)appendVi(badge,done?'Đã trả lời':'Chưa trả lời');}}
    },
    announceAnswer(id){if(auto.checked)speak(`${id}번 답을 선택했습니다. 푼 문제 ${state.done.length}개, 남은 문제 ${state.remaining.length}개입니다.`);},
    announceResult(correct){if(auto.checked)speak(`채점했습니다. ${correct}문제를 맞혔습니다. ${progressMessage(state)}`);},
    cancel
  };
}
