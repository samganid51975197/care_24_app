export function renderLessonQA(parent,unit={}){
 const section=document.createElement('section');section.className='lesson-qa';section.style.cssText='margin:24px 0;padding:20px;border:1px solid #b9ccd8;border-radius:12px;background:#f3f8fa';parent.append(section);
 const add=(tag,text,root=section)=>{const n=document.createElement(tag);n.textContent=text;root.append(n);return n;};
 add('h4','학생 ↔ 강사 질문과 답변 · 권장 3~5분');
 add('p','진행: 질문 생각하기 1분 → 강사 해설 2분 → 학생이 다시 설명하기 1~2분. 아래는 학습용 예상 문답이며 실시간 상담이 아닙니다.');
 const pairs=[
 ['이 상황에서는 무엇부터 해야 하나요?',unit.action?`이 사례에서는 ${unit.action} 관찰 초점은 ${unit.focus}입니다. ${unit.followup}`:'환자의 상태와 개별 돌봄 계획을 확인하고 새 피부 변화는 담당 간호사에게 보고합니다.'],
 ['약을 먹은 뒤 평소와 다른 증상이 생기면 부작용인가요?','약물 관련 가능성은 있지만 질환 악화 등 다른 원인도 있어 간병사가 확정하지 않습니다. 약명·실제 복용 시각·증상 시작 시각·관찰 내용을 전달합니다. 심한 숨참·의식 저하·심한 출혈은 기록보다 응급 호출이 먼저입니다.'],
 ['약을 먹었는지 모르거나 토했다면 다시 먹여도 되나요?','임의로 재복용시키지 않습니다. 복약 기록과 담당자에게 확인하고, 누락·구토 상황 및 시각을 알려 의료진·약사의 지시를 받습니다.'],
 ['강사님, 제가 제대로 이해했는지 어떻게 확인하나요?',`“${unit.name||'이 단원'}에서 먼저 확인할 것, 내가 도울 수 있는 것, 즉시 보고할 것”을 자신의 말로 하나씩 설명해 보세요. 확인한 사실과 추측을 나누어 말하는지도 점검합니다.`]
 ];
 for(const [q,a] of pairs){const d=add('details','');add('summary','학생 질문: '+q,d);add('p','강사 답변: '+a,d);}
 const label=add('label','나의 질문 작성 — 현재 화면에서만 유지됩니다.');const input=document.createElement('textarea');input.rows=3;input.placeholder='실제 환자의 이름·연락처 등 개인정보는 적지 마세요.';input.style.cssText='display:block;width:100%;box-sizing:border-box;margin:8px 0;font:inherit;padding:12px';label.append(input);
 const copy=add('button','질문 복사');copy.type='button';const status=add('p','전송·DB 저장 기능은 연결되어 있지 않습니다. 복사한 질문은 교육 담당자에게 전달하세요.');status.setAttribute('role','status');
 copy.onclick=async()=>{if(!input.value.trim()){status.textContent='질문을 먼저 작성해 주세요.';return;}try{await navigator.clipboard.writeText((unit.name||'욕창 단원')+' 질문: '+input.value.trim());status.textContent='질문을 복사했습니다. 교육 담당자에게 직접 전달하세요.';}catch{input.focus();input.select();status.textContent='자동 복사가 되지 않았습니다. 선택된 내용을 복사해 주세요.';}};
}
