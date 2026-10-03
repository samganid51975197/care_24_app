function syncVisibleExamAnswer(){
  if(!currentExam||examWorkspace.hidden)return;
  const checked=examOptions.querySelector('input[name="examAnswer"]:checked');
  if(checked)currentAnswers[currentExamIndex]=Number(checked.value);
}

document.addEventListener('click',event=>{
  const option=event.target.closest('#examOptions label');
  if(option&&currentExam&&!examWorkspace.hidden){
    const input=option.querySelector('input[name="examAnswer"]');
    if(input&&!input.disabled)currentAnswers[currentExamIndex]=Number(input.value);
  }
  if(event.target.closest('#examPrevious, #examNext, #examQuestionNav button, #examSubmit'))syncVisibleExamAnswer();
},true);

document.addEventListener('change',event=>{
  if(event.target.matches('#examOptions input[name="examAnswer"]')){
    currentAnswers[currentExamIndex]=Number(event.target.value);
  }
},true);
