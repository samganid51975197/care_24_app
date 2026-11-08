export function makeBank(groups, blocks) {
  // 보기 번호의 단순 반복을 피하면서 각 정답 위치의 수는 동일하게 유지한다.
  const positions=Array.from({length:80},(_,i)=>i%4);let seed=20261006;
  for(let i=positions.length-1;i>0;i--){seed=(Math.imul(seed,1664525)+1013904223)>>>0;const j=seed%(i+1);[positions[i],positions[j]]=[positions[j],positions[i]];}
  const questions=blocks.flatMap((block,gi)=>block.trim().split('\n').map((line,qi)=>{
    const cells=line.split('|');
    if(cells.length!==6)throw new Error(`Invalid question ${gi}:${qi}`);
    const [prompt,correct,a,b,c,explanation]=cells;
    const answer=positions[gi*8+qi],options=[a,b,c];options.splice(answer,0,correct);
    return {id:gi*8+qi+1,group:groups[gi][0],prompt,options,answer,explanation,lesson:groups[gi][2]};
  }));
  function grade(answers){
    const details=questions.map(q=>({id:q.id,group:q.group,answered:Number.isInteger(answers[q.id])&&answers[q.id]>=0&&answers[q.id]<4,correct:answers[q.id]===q.answer}));
    const correct=details.filter(q=>q.correct).length;
    return {correct,total:questions.length,unanswered:details.filter(q=>!q.answered).length,score:Math.round(correct/questions.length*1000)/10,details};
  }
  return {groups,questions,grade};
}
