import {orientations} from './orientation-data.mjs?v=resident-ai-2';
const $=id=>document.getElementById(id);
const requested=new URLSearchParams(location.search).get('course');
const course=orientations.find(c=>c.id===requested)||orientations[0];
$('room-label').textContent='대한노인돌봄서비스협회(중앙회) 전임 AI 강사 · '+course.room;
$('title').textContent=course.title+' 강의';
$('course-title').textContent=course.title;
$('room-sign').textContent=course.room;
document.title=course.title+' · 강의 안내';
$('manual').href=course.manual;$('mockLink').href=`mock-exam.html?exam=${encodeURIComponent(course.id)}`;$('examLink').href=`exam-orientation.html?exam=${encodeURIComponent(course.id)}`;$('print').onclick=()=>window.print();
for(const [title,text] of course.sections){const h=document.createElement('h3');h.textContent=title;const p=document.createElement('p');p.textContent=text;$('script').append(h,p);}
if(course.id==='respiratory'){const li=document.createElement('li');const a=document.createElement('a');a.href='lung-health-ko-vi.html';a.textContent='폐 건강 · 한국어 + 베트남어 / Sức khỏe phổi';li.append(a);$('references').append(li);}
for(const url of course.sources){const li=document.createElement('li');const a=document.createElement('a');a.href=url;a.target='_blank';a.rel='noopener';a.textContent=new URL(url).hostname+' · 공식 참고자료';li.append(a);$('references').append(li);}
$('status').textContent='과정별 강의안 준비 완료 · 영상 제작 상태 확인 중';
try{const r=await fetch('orientation-videos.json',{cache:'no-store'});if(!r.ok)throw Error('status');const jobs=await r.json();const job=jobs[course.id];if(job?.localVideo){const video=document.createElement('video');video.controls=true;video.preload='metadata';video.src=job.localVideo;video.poster='assets/virtual-nurse-lecturer-v1.png';$('video-area').append(video);$('poster').hidden=true;$('status').textContent='실제 영상 재생 가능 · 재생 시간은 플레이어에서 확인하세요.';}else{$('status').textContent=job?.status==='waiting'||job?.videoId?'실제 강의 영상은 아직 제작 대기 중입니다. 화면의 인물은 공통 강사 시안이며, 표지판만 현재 과정에 맞춰 표시했습니다.':job?.error?'영상 제작 보류 · 강의안은 아래에서 확인할 수 있습니다.':'강의안 준비 완료 · 실제 영상 파일은 아직 연결되지 않았습니다.';}}catch{$('status').textContent='실제 강의 영상 파일은 아직 연결되지 않았습니다. 화면의 인물은 공통 강사 시안이며, 표지판은 선택 과정에 맞춰 표시했습니다.';}
