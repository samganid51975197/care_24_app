const baseAnswerSheetRender=renderExamQuestion;
renderExamQuestion=function(){
  baseAnswerSheetRender();
  examSelectedAnswer.hidden=true;
  examSelectedAnswer.innerHTML='';
  examAnswerStatus.textContent=currentAnswers[currentExamIndex]===null?'미응답':'답안표에 기록됨';
  examQuestionNav.innerHTML=`<div class="answer-sheet-head"><span>문제</span><b>답안</b></div>`+currentExam.questions.map((_,i)=>{
    const answer=currentAnswers[i];
    const circleNumbers=['①','②','③','④'];
    return `<button class="${i===currentExamIndex?'active':''} ${answer!==null?'answered':''}" data-exam-q="${i}" aria-label="${i+1}번 문제 ${answer===null?'미응답':`${answer+1}번 선택`}"><span>${i+1}</span><b>${answer===null?'○':circleNumbers[answer]}</b></button>`
  }).join('');
  examQuestionNav.querySelectorAll('button').forEach(button=>button.addEventListener('click',()=>{
    syncVisibleExamAnswer();
    currentExamIndex=Number(button.dataset.examQ);
    renderExamQuestion();
  }));
};
