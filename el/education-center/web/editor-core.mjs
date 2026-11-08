export const MIN_CLIP = 0.2;
export function exportEdl(clips,lessonId){
  const tc=frames=>{const f=Math.max(0,Math.round(frames));return [Math.floor(f/108000),Math.floor(f/1800)%60,Math.floor(f/30)%60,f%30].map(n=>String(n).padStart(2,'0')).join(':');};
  let record=0;const lines=['TITLE: CARE_'+lessonId,'FCM: NON-DROP FRAME',''];
  clips.forEach((clip,index)=>{const start=Math.round(clip.in*30),end=Math.round(clip.out*30),length=end-start;lines.push(`${String(index+1).padStart(3,'0')}  ${lessonId.padEnd(8)} V     C        ${tc(start)} ${tc(end)} ${tc(record)} ${tc(record+length)}`,`* FROM CLIP NAME: ${lessonId}.mp4`,'');record+=length;});
  return lines.join('\r\n');
}
export const clamp = (n, min, max) => Math.min(max, Math.max(min, n));
export const totalDuration = clips => clips.reduce((sum, clip) => sum + clip.out - clip.in, 0);
export function locateTime(clips, time) {
  let start = 0;
  for (let index = 0; index < clips.length; index++) {
    const length = clips[index].out - clips[index].in;
    if (time < start + length || index === clips.length - 1) {
      const offset = clamp(time - start, 0, length);
      return { index, offset, sourceTime: clips[index].in + offset, start };
    }
    start += length;
  }
  throw new Error('타임라인에 컷이 없습니다.');
}
export const clipStart = (clips, index) => totalDuration(clips.slice(0, index));
export function defaults(lessonId, title, duration) {
  return { schemaVersion: 1, lessonId,
    clips: [{ id: 'clip-1', in: 0, out: duration, visual: 'video' }],
    audio: { voice: 1, music: 0.15, fade: 0.4, musicName: '' },
    nodes: [{ type: 'brightness', enabled: true, value: 1 }, { type: 'contrast', enabled: true, value: 1 }, { type: 'saturate', enabled: true, value: 1 }],
    motion: { enabled: true, text: title, style: 'fade', duration: 4, position: 'top', zoom: false },
    subtitles: { language: 'ko', enabled: true, size: 28 }, resolution: 1280 };
}
function number(value, min, max, label) {
  if (typeof value !== 'number' || !Number.isFinite(value)) throw new Error(label + ' 값이 올바르지 않습니다.');
  return clamp(value, min, max);
}
export function validateProject(value, lessonId, duration) {
  if (!value || value.schemaVersion !== 1 || value.lessonId !== lessonId) throw new Error('현재 과목의 편집 프로젝트 파일을 선택하세요.');
  if (!Array.isArray(value.clips) || !value.clips.length || value.clips.length > 80) throw new Error('컷은 1개부터 80개까지 사용할 수 있습니다.');
  const result = defaults(lessonId, '', duration);
  result.clips = value.clips.map((clip, index) => {
    const start = number(clip.in, 0, duration, '컷 시작'), end = number(clip.out, 0, duration, '컷 끝');
    if (end - start < MIN_CLIP - 0.001) throw new Error('각 컷의 길이는 0.2초 이상이어야 합니다.');
    return { id: 'clip-' + index, in: start, out: end, visual: clip.visual === 'illustration' ? 'illustration' : 'video' };
  });
  for (const key of ['voice', 'music', 'fade']) result.audio[key] = number(value.audio?.[key], 0, key === 'fade' ? 3 : 1.5, '오디오');
  result.audio.musicName = String(value.audio?.musicName || '').slice(0, 160);
  if (!Array.isArray(value.nodes) || value.nodes.length !== 3 || new Set(value.nodes.map(n => n.type)).size !== 3) throw new Error('색보정 노드 구성이 올바르지 않습니다.');
  result.nodes = value.nodes.map(node => {
    if (!['brightness', 'contrast', 'saturate'].includes(node.type)) throw new Error('지원하지 않는 보정 노드입니다.');
    return { type: node.type, enabled: Boolean(node.enabled), value: number(node.value, 0, 2, '보정') };
  });
  result.motion = { enabled: Boolean(value.motion?.enabled), text: String(value.motion?.text || '').slice(0, 120),
    style: value.motion?.style === 'slide' ? 'slide' : 'fade', duration: number(value.motion?.duration, 0.5, 20, '제목 시간'),
    position: value.motion?.position === 'lower' ? 'lower' : 'top', zoom: Boolean(value.motion?.zoom) };
  result.subtitles = { enabled: Boolean(value.subtitles?.enabled), language: value.subtitles?.language === 'vi' ? 'vi' : 'ko', size: number(value.subtitles?.size, 20, 46, '자막 크기') };
  result.resolution = value.resolution === 1920 ? 1920 : 1280;
  return result;
}
export function splitAt(project, outputTime) {
  const { index, sourceTime } = locateTime(project.clips, outputTime);
  const clip = project.clips[index];
  if (sourceTime - clip.in < MIN_CLIP || clip.out - sourceTime < MIN_CLIP) throw new Error('컷 양쪽에 0.2초 이상 남는 위치에서 나누세요.');
  project.clips.splice(index, 1, { ...clip, out: sourceTime }, { ...clip, in: sourceTime, id: clip.id + '-split' });
  return index + 1;
}
export function parseVtt(text) {
  const seconds = value => value.split(':').reduce((sum, part) => sum * 60 + Number(part), 0);
  return text.replace(/\r/g, '').split(/\n\s*\n/).flatMap(block => {
    const lines = block.split('\n'), index = lines.findIndex(line => line.includes('-->'));
    if (index < 0) return [];
    const match = lines[index].match(/([\d:.]+)\s*-->\s*([\d:.]+)/);
    if (!match) return [];
    const start = seconds(match[1]), end = seconds(match[2]);
    if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) return [];
    return [{ start, end, text: lines.slice(index + 1).join(' ').replace(/<[^>]*>/g, '') }];
  });
}
export function exportCues(clips, cues) {
  let cursor = 0; const result = [];
  for (const clip of clips) {
    for (const cue of cues) {
      const start = Math.max(cue.start, clip.in), end = Math.min(cue.end, clip.out);
      if (end > start) result.push({ start: cursor + start - clip.in, end: cursor + end - clip.in, text: cue.text });
    }
    cursor += clip.out - clip.in;
  }
  return result;
}
export function stamp(seconds, separator = '.') {
  const ms = Math.max(0, Math.round(seconds * 1000));
  return [Math.floor(ms / 3600000), Math.floor(ms / 60000) % 60, Math.floor(ms / 1000) % 60].map(n => String(n).padStart(2, '0')).join(':') + separator + String(ms % 1000).padStart(3, '0');
}
