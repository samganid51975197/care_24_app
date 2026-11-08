import {courses,getCourse,aliases,canonicalId} from './specialty-families.mjs?v=ortho-infection-20261019';
import {respiratoryGroups,respiratoryBlocks} from './respiratory-bank.mjs';
import {commonRows} from './specialty-common.mjs';
import {scabiesQuestions,scabiesTreatmentQuestions} from './scabies-questions.mjs?v=2';
export {courses,getCourse,canonicalId};
export const specialtyTitles=Object.fromEntries([...courses.map(c=>[c.id,c.title]),...Object.entries(aliases).map(([alias,id])=>[alias,getCourse(id).title])]);
function build(groups,blocks){
 const positions=Array.from({length:80},(_,i)=>i%4);let seed=20261010;
 for(let i=79;i>0;i--){seed=(Math.imul(seed,1664525)+1013904223)>>>0;const j=seed%(i+1);[positions[i],positions[j]]=[positions[j],positions[i]];}
 const questions=[];
 blocks.forEach((block,gi)=>block.forEach(row=>{const cells=Array.isArray(row)?row:row.split('|');if(cells.length!==6)throw Error('문항 필드 오류');const [prompt,correct,...tail]=cells;const explanation=tail.pop();const answer=positions[questions.length];tail.splice(answer,0,correct);questions.push({id:questions.length+1,group:groups[gi][0],prompt,options:tail,answer,explanation,lesson:groups[gi][2],kind:'분야별 사례·역량'});}));
 if(questions.length!==80)throw Error(`80문항 필요: ${questions.length}`);
 return {groups,questions,grade(answers){const details=questions.map(q=>({id:q.id,group:q.group,answered:Number.isInteger(answers[q.id])&&answers[q.id]>=0&&answers[q.id]<4,correct:answers[q.id]===q.answer}));const correct=details.filter(q=>q.correct).length;return {correct,total:80,unanswered:details.filter(q=>!q.answered).length,score:Math.round(correct/80*1000)/10,details};}};
}
const caregiverSafetyQuestions = {
  'M-02': [
    "병동에는 일반 시트만 있다. 여러 침대의 시트를 갈던 중 한쪽 모서리에 남은 천이 짧아 손끝으로 힘껏 당겨야 한다. 가장 적절한 대응은?",
    "시트를 가운데로 다시 맞춰 네 귀의 여유를 확인하고, 그래도 짧으면 맞는 크기의 시트를 요청한다",
    "이미 묶은 모서리는 그대로 두고, 짧은 쪽만 두 사람이 힘껏 당긴다",
    "시트 끝을 검지에 감아 미끄러지지 않게 한 뒤 당긴다",
    "이번에는 반대 손으로 세게 당겨 묶고 다음 침대에서 다시 손을 바꾼다",
    "침대 시트를 갈 때도 간병사의 손을 살펴보세요. 일반 시트의 네 귀를 손끝으로 세게 당겨 묶는 작업을 여러 침대에서 반복하면 손가락에 부담이 쌓입니다. 매트리스 규격에 맞는 네 귀 고무줄형 커버가 있으면 묶는 동작을 줄일 수 있습니다. 일반 시트만 있다면 먼저 크기와 놓인 위치를 확인하세요. 천이 모자라면 억지로 당기지 말고 알맞은 시트를 요청하세요. 손가락이 휘어 보이거나 펴기 어려워지면 어떤 작업을 얼마나 반복했는지 알리고 진료를 받으세요.",
  ],
  'M-06': [
    "체위 변경 전, 낮은 침대 너머로 팔을 뻗어 환자를 당겨야 하는 위치에 서 있다. 간병사의 허리 부담을 줄일 첫 행동은?",
    "작업을 멈추고 침대 높이와 접근 공간을 조정한 뒤 계획된 보조기구와 인력을 확인한다",
    "무릎만 조금 굽히고 같은 위치에서 당긴다",
    "허리보호대를 착용하고 먼 쪽에서 한 번에 당긴다",
    "환자에게 침대 난간을 붙잡게 한 뒤 시트 모서리를 힘껏 당긴다",
    "몸에서 먼 곳의 하중을 허리를 굽히거나 비튼 채 당기면 허리 부담이 커집니다. 환자의 척추 보호 계획을 먼저 확인하고, 침대 높이와 작업 위치를 맞춘 다음 정해진 이동 보조기구와 인력을 확보합니다.",
  ],
  'M-13': [
    "평소와 달리 환자가 다리에 체중을 싣지 못한다. 휠체어 이동을 앞둔 간병사는 어떻게 해야 하는가?",
    "환자를 안전하게 지지한 상태에서 이동을 보류하고 담당팀에 알려 이동 방법과 리프트·인력을 다시 확인한다",
    "동료 한 명이 오면 두 사람이 겨드랑이를 받쳐 들어 옮긴다",
    "이동벨트를 단단히 매고 손잡이로 환자의 전신을 들어 올린다",
    "휠체어를 더 가까이 붙이고 이전 이동 방법을 그대로 쓴다",
    "환자가 지탱하지 못하는 체중을 간병사가 대신 들어 올리면 환자가 떨어지거나 간병사가 허리를 다칠 수 있습니다. 체중 지지 능력이 달라졌다면 기존 이동 계획을 재확인하고 평가에 맞는 장비를 교육받은 인력과 사용합니다.",
  ],
  'M-18': [
    "간병사가 며칠째 세면 수건을 손으로 비튼 뒤 손목이 아프고 손가락이 저리다고 한다. 다음 근무에서 적절한 대응은?",
    "통증을 유발하는 작업을 조정하고 증상과 발생 작업을 담당자에게 알려 평가를 받는다",
    "손목에 보호대를 하고 같은 횟수만큼 수건을 비튼다",
    "손목터널증후군으로 단정하고 동료의 치료법을 따른다",
    "교대 후 증상이 줄면 반복 횟수와 작업 방법을 유지한다",
    "수건을 세게 비틀면 손목이 꺾인 상태에서 반복해 힘을 쓰게 됩니다. 짜지 않아도 되는 준비 방식이나 탈수 도구를 사용하고 손목을 전완과 나란히 두세요. 통증·저림이 반복되면 어떤 작업에서 시작됐는지 일찍 보고하고 보건담당자나 의료진에게 평가를 받으세요.",
  ],
};
function caseRows(c,u,i){
 if(u.id==='skin-treatment')return scabiesTreatmentQuestions;
 if(c.id==='skin'&&u.name==='옴 의심 상황')return scabiesQuestions;
 const label=`[${c.title} · ${u.name}] ${u.scenario}`;
 const pool=c.examUnits||c.units;const distractors=[1,3,6].map(n=>pool[(i+n)%pool.length].focus);
 return [
 [label+' 가장 직접적으로 다루어야 할 문제는?',u.focus,...distractors,`${u.focus}. ${u.reason}`],
 [label+' 간병사의 우선 대응으로 적절한 것은?',u.action,'추가 증상이 확실해질 때까지 현재 일과를 그대로 계속한다','가족에게만 알리고 담당자 확인은 다음 교대로 미룬다','유사 환자의 방법을 먼저 적용하고 개별 지시는 나중에 확인한다',`${u.reason} 권장 대응: ${u.action}`],
 (c.id==='musculoskeletal' && caregiverSafetyQuestions[u.id]) || [label+' 인계 기록에 적절한 원칙은?',`“${u.scenario}”라는 관찰·호소와 시각·대응을 확인한 범위에서 구분해 기록한다`,'진단 원인을 간병사가 확정해 관찰 대신 적는다','빠진 측정값은 정상 수치로 채운다','새 변화는 가족이 불안해하므로 생략한다','확인되지 않은 원인·수치·효과를 만들어 기록하지 않는다. 환자 호소와 직접 관찰을 구분한다.'],
 [label+' 대응 후 확인할 사항으로 적절한 것은?',u.followup,'대응했으므로 효과 확인은 생략한다','계획된 효과를 관찰 없이 실제 결과로 적는다','이전 인계를 그대로 복사하고 변화는 확인하지 않는다',`${u.reason} 후속 확인: ${u.followup}`]
 ];
}
export function specialtyBank(id){
 const c=getCourse(id);if(!c)return null;
 const lesson=u=>`specialty-courses.html?course=${c.id}#${u}`;
 if(c.bankType==='respiratory')return build(respiratoryGroups.map(([id,name])=>[id,name,lesson(id)]),respiratoryBlocks.map(b=>b.trim().split('\n')));
 const units=c.examUnits||c.units;
 const groups=units.map(u=>[u.id,u.name,lesson(u.id)]);
 const blocks=units.map((u,i)=>c.bankType==='classic'?[...caseRows(c,u,i),...commonRows.slice(i*4,i*4+4)]:caseRows(c,u,i));
 const bank=build(groups,blocks);
 if(c.bankType==='classic')bank.questions.forEach((q,i)=>{q.kind=i%8<4?'질환별 사례':'공통 돌봄역량';});
 return bank;
}
