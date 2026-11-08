import {getCourse,canonicalId} from './specialty-bank.mjs?v=ortho-infection-20261019';
import {classroomLabel} from './classrooms.mjs';

const params=new URLSearchParams(location.search);
const requested=params.get('course');
const id=canonicalId(requested);
const course=getCourse(id);
const error=document.getElementById('error');

document.getElementById('print').addEventListener('click',()=>window.print());

if(!course){
  document.getElementById('script').hidden=true;
  error.hidden=false;
  error.textContent='과정을 확인할 수 없습니다. 교육과정 목록에서 과목을 다시 선택해 주세요.';
}else{
  document.title=`${course.title} · 보충 설명 강의`;
  document.getElementById('title').textContent=`${classroomLabel(id)} · ${course.title}`;
  document.getElementById('scope').textContent=course.scope;
  try{
    const response=await fetch(`assets/lecture-drafts/${encodeURIComponent(id)}.txt`);
    if(!response.ok)throw new Error(`HTTP ${response.status}`);
    const text=await response.text();
    document.getElementById('script').textContent=text;
    document.getElementById('meta').textContent=`${text.length.toLocaleString('ko-KR')}자 · 검토용 대본 초안`;
  }catch{
    document.getElementById('script').hidden=true;
    error.hidden=false;
    error.textContent='이 과정의 강의 대본을 불러오지 못했습니다. 교육과정 목록에서 다시 열어 주세요.';
  }
}
