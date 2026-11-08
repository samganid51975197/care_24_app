import {exportEdl, MIN_CLIP, clamp, totalDuration, locateTime, clipStart, defaults, validateProject, splitAt, parseVtt, exportCues, stamp} from './editor-core.mjs';
const $=id=>document.getElementById(id), video=$('sourceVideo'), music=$('musicAudio'), canvas=$('preview'), ctx=canvas.getContext('2d');
const lessonId=new URLSearchParams(location.search).get('lesson')||'G01';
const storageKey='care-editor-v1:'+lessonId;
let lesson, asset, project, duration=0, selected=0, current=0, outputTime=0, playing=false, advancing=false, ready=false;
let audioContext, voiceGain, musicGain, audioDestination, recorder, capture, exporting=false, exportCancelled=false, musicUrl, resultUrl;
let loadedMusicName='';
let scene=new Image(), cues={ko:[],vi:[]}, undo=[], redo=[], sourceUrl='', audioWarning='';
const status=(text,error=false)=>{$('status').textContent=text;$('status').classList.toggle('error',error);};
const time=seconds=>stamp(seconds).slice(seconds>=3600?0:3,-4);
function make(tag,text,parent){const node=document.createElement(tag);if(text!==undefined)node.textContent=text;if(parent)parent.append(node);return node;}
function save(){try{localStorage.setItem(storageKey,JSON.stringify(project));$('saveState').textContent='이 브라우저에 저장됨';}catch{$('saveState').textContent='저장 공간 부족 · 프로젝트 파일을 저장하세요';}}
function remember(){undo.push(JSON.stringify(project));if(undo.length>50)undo.shift();redo=[];}
function commit(action){
  if(!ready||exporting)return;stop();const before=JSON.stringify(project);
  try{action();project=validateProject(project,lessonId,duration);undo.push(before);if(undo.length>50)undo.shift();redo=[];selected=clamp(selected,0,project.clips.length-1);outputTime=clamp(outputTime,0,totalDuration(project.clips));save();renderControls();void seek(outputTime).catch(error=>status(error.message,true));status('편집 내용을 저장했습니다.');}
  catch(error){project=JSON.parse(before);renderControls();status(error.message,true);}
}
function setLocked(locked){
  $('controls').disabled=locked;for(const id of ['lessonSelect','saveProject','importProject','useVideo','play','restart','fullscreen','playhead','resetProject','exportResolution','exportVideo'])$(id).disabled=locked;
  $('useScene').disabled=locked||!scene.complete||!scene.naturalWidth;
  $('undo').disabled=locked||!undo.length;$('redo').disabled=locked||!redo.length;
  document.querySelectorAll('.clip').forEach(button=>button.disabled=locked);
  document.querySelectorAll('.studio-pages button').forEach(button=>button.disabled=locked);
  const edl=$('downloadEdl');if(edl)edl.disabled=locked;
}
function renderControls(){
  const clip=project.clips[selected];$('selectedClip').textContent=`컷 ${selected+1} / ${project.clips.length}`;
  $('clipIn').value=clip.in.toFixed(2);$('clipOut').value=clip.out.toFixed(2);$('clipIn').max=duration;$('clipOut').max=duration;
  $('voiceVolume').value=project.audio.voice*100;$('voiceValue').textContent=Math.round(project.audio.voice*100)+'%';
  $('musicVolume').value=project.audio.music*100;$('musicValue').textContent=Math.round(project.audio.music*100)+'%';$('audioFade').value=project.audio.fade;
  $('musicName').textContent=project.audio.musicName?((musicUrl&&loadedMusicName===project.audio.musicName)?project.audio.musicName:project.audio.musicName+' · 파일을 다시 선택하세요'):'배경음 없음';
  $('musicTrack').textContent=project.audio.musicName||'배경음 없음';
  $('titleEnabled').checked=project.motion.enabled;$('titleText').value=project.motion.text;$('motionStyle').value=project.motion.style;
  $('titlePosition').value=project.motion.position;$('titleDuration').value=project.motion.duration;$('imageZoom').checked=project.motion.zoom;
  $('captionsEnabled').checked=project.subtitles.enabled;$('captionLanguage').value=project.subtitles.language;$('captionSize').value=project.subtitles.size;
  $('exportResolution').value=project.resolution;
  if(canvas.width!==project.resolution){canvas.width=project.resolution;canvas.height=project.resolution*9/16;}
  $('resolutionBadge').textContent=canvas.width+' × '+canvas.height;
  $('nodeList').replaceChildren();const labels={brightness:'노출·밝기',contrast:'명암 대비',saturate:'색의 선명도'};
  project.nodes.forEach((node,index)=>{
    const box=make('div',undefined,$('nodeList'));box.className='node';const header=make('div',undefined,box);header.className='node-header';
    const label=make('label',undefined,header);label.className='check';const check=make('input',undefined,label);check.type='checkbox';check.checked=node.enabled;check.setAttribute('aria-label',labels[node.type]+' 노드 사용');label.append(document.createTextNode(`${index+1}. ${labels[node.type]}`));check.onchange=()=>commit(()=>{project.nodes[index].enabled=check.checked;});
    const shift=make('button','↑',header);shift.setAttribute('aria-label',labels[node.type]+' 노드 앞으로');shift.disabled=index===0;shift.onclick=()=>commit(()=>{[project.nodes[index-1],project.nodes[index]]=[project.nodes[index],project.nodes[index-1]];});
    const range=make('input',undefined,box);range.type='range';range.min=0;range.max=200;range.value=node.value*100;range.setAttribute('aria-label',labels[node.type]);
    const value=make('output',Math.round(node.value*100)+'%',box);range.oninput=()=>{value.textContent=range.value+'%';};range.onchange=()=>commit(()=>{project.nodes[index].value=Number(range.value)/100;});
  });
  $('clipList').replaceChildren();const length=totalDuration(project.clips);
  project.clips.forEach((clip,index)=>{
    const button=make('button',undefined,$('clipList'));button.className='clip '+clip.visual;button.draggable=true;button.style.width=clamp((clip.out-clip.in)/length*850,125,330)+'px';button.setAttribute('aria-pressed',String(index===selected));button.setAttribute('aria-label',`컷 ${index+1} 선택`);
    make('strong',`${String(index+1).padStart(2,'0')} · ${clip.visual==='video'?'강의 영상':'교육 그림'}`,button);make('small',`${time(clip.in)} → ${time(clip.out)}`,button);make('small',(clip.out-clip.in).toFixed(1)+'초',button);const bar=make('span',undefined,button);bar.className='clip-position';
    button.onclick=()=>{if(exporting)return;stop();selected=index;outputTime=clipStart(project.clips,index);renderControls();void seek(outputTime).catch(error=>status(error.message,true));};
    button.ondragstart=event=>{if(exporting){event.preventDefault();return;}event.dataTransfer.setData('text/plain',String(index));};
    button.ondragover=event=>event.preventDefault();button.ondrop=event=>{event.preventDefault();const from=Number(event.dataTransfer.getData('text/plain'));if(!Number.isInteger(from)||from<0||from>=project.clips.length||from===index)return;commit(()=>{const [moved]=project.clips.splice(from,1);project.clips.splice(index,0,moved);selected=index;outputTime=clipStart(project.clips,index);});};
  });
  $('timelineDuration').textContent=`${project.clips.length}컷 · ${time(length)}`;$('playhead').max=length;setLocked(exporting);draw();updateTransport();
}
function updateTransport(){
  const length=totalDuration(project.clips);$('playhead').value=outputTime;$('timeLabel').textContent=time(outputTime)+' / '+time(length);
  document.querySelectorAll('.clip-position').forEach((bar,index)=>{const start=clipStart(project.clips,index);bar.style.width=clamp((outputTime-start)/(project.clips[index].out-project.clips[index].in)*100,0,100)+'%';});
  if(exporting)$('exportProgress').value=length?outputTime/length:0;
}
function wrap(text,maxWidth,size,maxLines=4){
  ctx.font=`600 ${size}px "Malgun Gothic",sans-serif`;const lines=[];let line='';
  for(const char of text){if(ctx.measureText(line+char).width>maxWidth&&line){lines.push(line.trim());line=char;}else line+=char;}
  if(line)lines.push(line.trim());if(lines.length>maxLines){lines.length=maxLines;lines[maxLines-1]=lines[maxLines-1].slice(0,-1)+'…';}return lines;
}
function draw(){
  if(!project)return;const w=canvas.width,h=canvas.height,scale=w/1280;ctx.clearRect(0,0,w,h);ctx.fillStyle='#0c1727';ctx.fillRect(0,0,w,h);
  const position=locateTime(project.clips,outputTime),clip=project.clips[position.index];
  const useImage=clip.visual==='illustration'&&scene.naturalWidth,source=useImage?scene:video;
  const sw=useImage?scene.naturalWidth:video.videoWidth,sh=useImage?scene.naturalHeight:video.videoHeight;
  if(sw&&sh){
    ctx.save();ctx.filter=project.nodes.filter(node=>node.enabled).map(node=>`${node.type}(${node.value})`).join(' ')||'none';
    const ratio=Math.min(w/sw,h/sh),zoom=useImage&&project.motion.zoom?1+0.04*position.offset/(clip.out-clip.in):1;
    const dw=sw*ratio*zoom,dh=sh*ratio*zoom;ctx.drawImage(source,(w-dw)/2,(h-dh)/2,dw,dh);ctx.restore();
  }
  const motion=project.motion;
  if(motion.enabled&&motion.text&&outputTime<motion.duration){
    const fade=Math.min(0.6,motion.duration/3),alpha=clamp(Math.min(outputTime/fade,(motion.duration-outputTime)/fade),0,1);
    const lines=wrap(motion.text,w-150*scale,37*scale,3),height=lines.length*49*scale+36*scale;
    const x=48*scale+(motion.style==='slide'?(1-alpha)*-80*scale:0),y=motion.position==='lower'?h-height-190*scale:42*scale;
    ctx.save();ctx.globalAlpha=alpha;ctx.fillStyle='rgba(13,40,61,.9)';ctx.fillRect(x,y,w-96*scale,height);ctx.fillStyle='#66dfcf';ctx.fillRect(x,y,5*scale,height);ctx.fillStyle='#fff';ctx.font=`700 ${37*scale}px "Malgun Gothic",sans-serif`;lines.forEach((line,i)=>ctx.fillText(line,x+24*scale,y+(48+i*49)*scale));ctx.restore();
  }
  const cue=(cues[project.subtitles.language]||[]).find(cue=>position.sourceTime>=cue.start&&position.sourceTime<cue.end);
  $('subtitlePreview').textContent=cue?cue.text:'이 구간에 표시할 자막이 없습니다.';
  if(project.subtitles.enabled&&cue){
    const size=project.subtitles.size*scale,lines=wrap(cue.text,w-130*scale,size,4),height=lines.length*size*1.4+24*scale,y=h-height-28*scale;
    ctx.fillStyle='rgba(0,0,0,.82)';ctx.fillRect(45*scale,y,w-90*scale,height);ctx.fillStyle='white';ctx.font=`600 ${size}px "Malgun Gothic",sans-serif`;ctx.textAlign='center';lines.forEach((line,i)=>ctx.fillText(line,w/2,y+18*scale+size+i*size*1.4));ctx.textAlign='left';
  }
}
async function ensureAudio(){
  if(!audioContext){
    const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio)throw new Error('이 브라우저는 오디오 편집을 지원하지 않습니다. 최신 Chrome 또는 Edge에서 열어 주세요.');
    audioContext=new Audio();voiceGain=audioContext.createGain();musicGain=audioContext.createGain();audioDestination=audioContext.createMediaStreamDestination();
    audioContext.createMediaElementSource(video).connect(voiceGain);audioContext.createMediaElementSource(music).connect(musicGain);
    voiceGain.connect(audioContext.destination);voiceGain.connect(audioDestination);musicGain.connect(audioContext.destination);musicGain.connect(audioDestination);
  }
  await audioContext.resume();updateGains();
}
function updateGains(){if(!audioContext||!project)return;const length=totalDuration(project.clips),fade=project.audio.fade;const edge=fade?clamp(Math.min(outputTime/fade,(length-outputTime)/fade),0,1):1;voiceGain.gain.setTargetAtTime(project.audio.voice*edge,audioContext.currentTime,0.015);musicGain.gain.setTargetAtTime((loadedMusicName===project.audio.musicName?project.audio.music:0)*edge,audioContext.currentTime,0.015);}
function waitFor(element,event,timeout=15000){return new Promise((resolve,reject)=>{const clear=()=>{clearTimeout(timer);element.removeEventListener(event,done);element.removeEventListener('error',error);};const done=()=>{clear();resolve();};const error=()=>{clear();reject(new Error('미디어 파일을 읽지 못했습니다.'));};const timer=setTimeout(()=>{clear();reject(new Error('영상 읽기 시간이 초과되었습니다. 다시 시도하세요.'));},timeout);element.addEventListener(event,done,{once:true});element.addEventListener('error',error,{once:true});});}
let seekQueue=Promise.resolve();
function seek(value){seekQueue=seekQueue.catch(()=>{}).then(()=>seekNow(value));return seekQueue;}
async function seekNow(value){
  outputTime=clamp(value,0,totalDuration(project.clips));const position=locateTime(project.clips,outputTime);current=position.index;
  if(Math.abs(video.currentTime-position.sourceTime)>0.015){const pending=waitFor(video,'seeked');video.currentTime=position.sourceTime;await pending;}
  if(musicUrl&&Number.isFinite(music.duration)&&music.duration>0)music.currentTime=outputTime%music.duration;
  updateGains();updateTransport();draw();
}
function stop(){playing=false;video.pause();music.pause();$('play').textContent='▶ 미리보기';}
async function play(){
  if(!ready)return;if(playing){stop();return;}
  try{await ensureAudio();if(outputTime>=totalDuration(project.clips)-0.05)await seek(0);await seek(outputTime);playing=true;$('play').textContent='❚❚ 일시정지';await video.play();if(musicUrl)await music.play();}
  catch(error){stop();status(error.message,true);if(exporting)finishExport(true);}
}
async function advance(){
  if(advancing)return;advancing=true;
  if(current>=project.clips.length-1){outputTime=totalDuration(project.clips);stop();draw();updateTransport();if(exporting)finishExport(false);advancing=false;return;}
  try{if(recorder?.state==='recording')recorder.pause();video.pause();const next=current+1;await seek(clipStart(project.clips,next));if(!playing)return;await video.play();if(recorder?.state==='paused')recorder.resume();}
  catch(error){stop();status(error.message,true);if(exporting)finishExport(true);}
  finally{advancing=false;}
}
function tick(){
  if(ready&&playing&&!advancing){const clip=project.clips[current];outputTime=clipStart(project.clips,current)+clamp(video.currentTime-clip.in,0,clip.out-clip.in);updateGains();updateTransport();draw();if(video.currentTime>=clip.out-0.025||video.ended)void advance();}
  requestAnimationFrame(tick);
}
function download(blob,name){const url=URL.createObjectURL(blob),link=make('a');link.href=url;link.download=name;document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),30000);}
function finishExport(cancelled){
  if(!exporting)return;exportCancelled=cancelled;stop();if(recorder&&recorder.state!=='inactive')recorder.stop();else{capture?.getTracks().forEach(track=>track.stop());capture=null;exporting=false;setLocked(false);$('cancelExport').hidden=true;$('exportProgress').hidden=true;}
}
async function exportVideo(){
  if(exporting)return;
  if(project.audio.musicName&&(!musicUrl||loadedMusicName!==project.audio.musicName)&&project.audio.music>0){status('저장했던 배경음 파일을 다시 선택하거나 배경음을 제거한 뒤 제작하세요.',true);return;}
  const mime=['video/webm;codecs=vp9,opus','video/webm;codecs=vp8,opus','video/webm'].find(type=>window.MediaRecorder?.isTypeSupported(type));
  if(!mime||!canvas.captureStream){status('이 브라우저에서는 영상 저장을 지원하지 않습니다. 최신 Chrome 또는 Edge에서 열어 주세요.',true);return;}
  stop();exporting=true;exportCancelled=false;setLocked(true);$('downloadVideo').hidden=true;if(resultUrl){URL.revokeObjectURL(resultUrl);resultUrl=null;}
  try{
    await ensureAudio();await seek(0);exporting=true;exportCancelled=false;setLocked(true);$('cancelExport').hidden=false;$('exportProgress').hidden=false;$('exportProgress').value=0;
    const stream=canvas.captureStream(30);capture=stream;for(const track of audioDestination.stream.getAudioTracks())stream.addTrack(track.clone());
    recorder=new MediaRecorder(stream,{mimeType:mime,videoBitsPerSecond:project.resolution===1920?7000000:4000000,audioBitsPerSecond:160000});const chunks=[];
    recorder.ondataavailable=event=>{if(event.data.size)chunks.push(event.data);};
    recorder.onerror=()=>{status('영상 제작 중 오류가 발생했습니다. 다시 시도하세요.',true);finishExport(true);};
    recorder.onstop=()=>{
      capture?.getTracks().forEach(track=>track.stop());capture=null;exporting=false;setLocked(false);$('cancelExport').hidden=true;$('exportProgress').hidden=true;
      if(exportCancelled){status('영상 제작을 취소했습니다. 편집 내용은 저장되어 있습니다.');return;}
      const blob=new Blob(chunks,{type:mime});if(!blob.size){status('생성된 영상 데이터가 없습니다. 다시 시도하세요.',true);return;}
      resultUrl=URL.createObjectURL(blob);const link=$('downloadVideo');link.href=resultUrl;link.download=`${lessonId}-강의-편집본.webm`;link.hidden=false;status('영상 제작이 완료되었습니다. 완성 영상 내려받기를 누르세요.');
    };
    recorder.start(500);status(`영상 제작 중 · 약 ${time(totalDuration(project.clips))} 소요 · 이 탭을 열어 두세요.`);await play();
  }catch(error){status(error.message,true);if(exporting)finishExport(true);else setLocked(false);}
}
function bindRange(id,apply){$(id).onchange=()=>commit(()=>apply(Number($(id).value)));}
function activateTab(name){document.querySelectorAll('[data-panel]').forEach(button=>{const active=button.dataset.panel===name;button.setAttribute('aria-selected',String(active));button.tabIndex=active?0:-1;$('panel-'+button.dataset.panel).hidden=!active;});}
function setup(){
  activateTab('cut');
  $('originalMp4').href=asset.video;
  $('downloadEdl').onclick=()=>download(new Blob([exportEdl(project.clips,lessonId)],{type:'text/plain'}),lessonId+'-cuts.edl');
  document.querySelectorAll('[data-stage]').forEach(button=>button.onclick=()=>{const stage=button.dataset.stage;if(['cut','motion','nodes','audio'].includes(stage)){activateTab(stage);document.querySelector('.inspector').scrollIntoView({block:'center',behavior:'smooth'});}else document.querySelector('.'+stage).scrollIntoView({block:'center',behavior:'smooth'});});
  document.querySelectorAll('[data-panel]').forEach(button=>{button.onclick=()=>activateTab(button.dataset.panel);button.onkeydown=event=>{if(!['ArrowLeft','ArrowRight'].includes(event.key))return;event.preventDefault();const tabs=[...document.querySelectorAll('[data-panel]')],index=tabs.indexOf(button),next=tabs[(index+(event.key==='ArrowRight'?1:tabs.length-1))%tabs.length];activateTab(next.dataset.panel);next.focus();};});
  $('play').onclick=()=>void play();$('restart').onclick=()=>{stop();void seek(0).catch(error=>status(error.message,true));};
  $('playhead').oninput=()=>{if(exporting)return;stop();outputTime=Number($('playhead').value);updateTransport();};$('playhead').onchange=()=>void seek(Number($('playhead').value)).catch(error=>status(error.message,true));
  $('fullscreen').onclick=()=>{const box=document.querySelector('.canvas-wrap');if(box.requestFullscreen)void box.requestFullscreen().catch(()=>status('이 브라우저에서 전체 화면을 열 수 없습니다.',true));};
  $('applyTrim').onclick=()=>commit(()=>{project.clips[selected].in=Number($('clipIn').value);project.clips[selected].out=Number($('clipOut').value);outputTime=clipStart(project.clips,selected);});
  $('split').onclick=()=>commit(()=>{selected=splitAt(project,outputTime);});
  $('deleteClip').onclick=()=>commit(()=>{if(project.clips.length===1)throw new Error('마지막 컷은 삭제할 수 없습니다. 시작과 끝을 조절하세요.');project.clips.splice(selected,1);selected=Math.min(selected,project.clips.length-1);outputTime=clipStart(project.clips,selected);});
  for(const [id,offset] of [['moveLeft',-1],['moveRight',1]])$(id).onclick=()=>commit(()=>{const next=selected+offset;if(next<0||next>=project.clips.length)throw new Error('더 이상 이동할 수 없습니다.');[project.clips[selected],project.clips[next]]=[project.clips[next],project.clips[selected]];selected=next;outputTime=clipStart(project.clips,selected);});
  $('useVideo').onclick=()=>commit(()=>{project.clips[selected].visual='video';});$('useScene').onclick=()=>commit(()=>{project.clips[selected].visual='illustration';});
  bindRange('voiceVolume',value=>project.audio.voice=value/100);bindRange('musicVolume',value=>project.audio.music=value/100);bindRange('audioFade',value=>project.audio.fade=value);
  $('voiceVolume').oninput=()=>{$('voiceValue').textContent=$('voiceVolume').value+'%';};$('musicVolume').oninput=()=>{$('musicValue').textContent=$('musicVolume').value+'%';};
  $('musicFile').onchange=async()=>{
    const file=$('musicFile').files[0];if(!file)return;if(file.size>100*1024*1024){status('배경음 파일은 100MB 이하로 선택하세요.',true);return;}
    stop();const nextUrl=URL.createObjectURL(file),previousUrl=musicUrl;music.src=nextUrl;
    try{await waitFor(music,'loadedmetadata');if(!Number.isFinite(music.duration)||music.duration<=0)throw new Error('재생할 수 있는 오디오 파일을 선택하세요.');musicUrl=nextUrl;loadedMusicName=file.name;music.loop=true;commit(()=>{project.audio.musicName=file.name;});if(previousUrl)URL.revokeObjectURL(previousUrl);}
    catch(error){URL.revokeObjectURL(nextUrl);music.src=previousUrl||'';status(error.message,true);}
  };
  $('removeMusic').onclick=()=>{stop();if(musicUrl)URL.revokeObjectURL(musicUrl);musicUrl=null;music.removeAttribute('src');music.load();commit(()=>{project.audio.musicName='';});};
  $('resetGrade').onclick=()=>commit(()=>{project.nodes=defaults(lessonId,lesson.title,duration).nodes;});
  for(const [id,key] of [['titleEnabled','enabled'],['imageZoom','zoom']])$(id).onchange=()=>commit(()=>{project.motion[key]=$(id).checked;});
  for(const [id,key] of [['titleText','text'],['motionStyle','style'],['titlePosition','position']])$(id).onchange=()=>commit(()=>{project.motion[key]=$(id).value;});bindRange('titleDuration',value=>project.motion.duration=value);
  $('captionsEnabled').onchange=()=>commit(()=>{project.subtitles.enabled=$('captionsEnabled').checked;});$('captionLanguage').onchange=()=>commit(()=>{project.subtitles.language=$('captionLanguage').value;});bindRange('captionSize',value=>project.subtitles.size=value);bindRange('exportResolution',value=>project.resolution=value);
  $('downloadCaptions').onclick=()=>{const adjusted=exportCues(project.clips,cues[project.subtitles.language]);const text=adjusted.map((cue,index)=>`${index+1}\n${stamp(cue.start,',')} --> ${stamp(cue.end,',')}\n${cue.text}\n`).join('\n');download(new Blob(['\uFEFF'+text],{type:'text/plain;charset=utf-8'}),`${lessonId}-편집자막.${project.subtitles.language}.srt`);};
  $('saveProject').onclick=()=>download(new Blob([JSON.stringify(project,null,2)],{type:'application/json'}),`${lessonId}-영상편집.json`);
  $('importProject').onchange=async()=>{const file=$('importProject').files[0];if(!file)return;try{if(file.size>1000000)throw new Error('프로젝트 파일이 너무 큽니다.');const parsed=validateProject(JSON.parse(await file.text()),lessonId,duration);commit(()=>{project=parsed;selected=0;outputTime=0;});}catch(error){status(error.message,true);}finally{$('importProject').value='';}};
  $('undo').onclick=()=>{if(!undo.length||exporting)return;stop();redo.push(JSON.stringify(project));project=JSON.parse(undo.pop());selected=0;outputTime=0;save();renderControls();void seek(0).catch(error=>status(error.message,true));};
  $('redo').onclick=()=>{if(!redo.length||exporting)return;stop();undo.push(JSON.stringify(project));project=JSON.parse(redo.pop());selected=0;outputTime=0;save();renderControls();void seek(0).catch(error=>status(error.message,true));};
  $('resetProject').onclick=()=>commit(()=>{project=defaults(lessonId,lesson.title,duration);selected=0;outputTime=0;});
  $('lessonSelect').onchange=()=>{location.href='editor.html?lesson='+encodeURIComponent($('lessonSelect').value);};$('exportVideo').onclick=()=>void exportVideo();$('cancelExport').onclick=()=>finishExport(true);
  document.addEventListener('visibilitychange',()=>{if(document.hidden&&exporting){finishExport(true);status('탭을 벗어나 제작을 중단했습니다. 이 탭을 열어 둔 상태에서 다시 제작하세요.',true);}});
  video.addEventListener('error',()=>{stop();if(exporting)finishExport(true);status('원본 영상을 읽지 못했습니다. 파일과 서버 연결을 확인하세요.',true);});
  window.addEventListener('beforeunload',event=>{if(exporting){event.preventDefault();event.returnValue='';}});
}
async function start(){
  try{
    const [course,media,visuals]=await Promise.all(['course.json','media.json','realistic-visuals.json'].map(async file=>{const response=await fetch(file,{cache:'no-store'});if(!response.ok)throw new Error('과목 자료를 불러올 수 없습니다.');return response.json();}));
    lesson=course.lessons.find(item=>item.id===lessonId);asset=media[lessonId];if(!lesson||!asset)throw new Error('편집 가능한 과목을 찾을 수 없습니다. 교육 목차에서 다시 선택하세요.');
    document.title=lesson.title+' · 영상 편집';$('lessonTitle').textContent=lessonId+'. '+lesson.title;$('backLink').href='index.html#lesson-'+lessonId;$('backLink').textContent='← 과목으로 돌아가기';
    for(const item of course.lessons){if(!media[item.id])continue;const option=make('option',`${item.group==='한국어'?'한국어교육':item.group} · ${item.title}`,$('lessonSelect'));option.value=item.id;} $('lessonSelect').value=lessonId;
    $('sourcePoster').src=`media/${lessonId}.jpg`;sourceUrl=asset.webVideo&&video.canPlayType('video/webm')?asset.webVideo:asset.video;
    status('정확한 컷 편집을 위해 원본 영상을 준비하고 있습니다.');
    const sourceResponse=await fetch(sourceUrl);if(!sourceResponse.ok)throw new Error('원본 영상을 불러오지 못했습니다.');
    const sourceBlobUrl=URL.createObjectURL(await sourceResponse.blob());
    const pending=waitFor(video,'loadedmetadata',30000);video.src=sourceBlobUrl;video.load();await pending;duration=Number.isFinite(video.duration)?video.duration:asset.durationSeconds;if(!(duration>0))throw new Error('영상 길이를 확인할 수 없습니다.');
    const scenePath=visuals[lessonId]?.image||`media/${lessonId}.jpg`;scene.src=scenePath;$('sceneImage').src=scenePath;await scene.decode();
    for(const language of ['ko','vi']){const response=await fetch(`media/${lessonId}.${language}.vtt`);if(response.ok)cues[language]=parseVtt(await response.text());}
    project=defaults(lessonId,lesson.title,duration);try{const stored=localStorage.getItem(storageKey);if(stored)project=validateProject(JSON.parse(stored),lessonId,duration);}catch{audioWarning='이전 편집 내용을 읽지 못해 원본으로 시작했습니다. ';}
    $('sourceInfo').textContent=`원본 길이 ${time(duration)} · ${video.videoWidth} × ${video.videoHeight}`;
    if(video.readyState<2)await waitFor(video,'loadeddata');await seek(0);ready=true;setup();renderControls();save();$('studio').setAttribute('aria-busy','false');tick();status(audioWarning+'컷을 선택해 편집하세요. 변경 사항은 과목별로 자동 저장됩니다.');
  }catch(error){status(error.message,true);$('studio').setAttribute('aria-busy','false');}
}
void start();

