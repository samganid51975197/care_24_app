// Keep rehabilitation guidance with the existing encrypted, consented special notes.
const marker = '\n\n[재활치료 안내]\n';
export const rehabilitationFields = {
  rehabStatus: '재활치료 여부', rehabType: '치료 종류', rehabSchedule: '치료 일정·장소',
  rehabAssistance: '이동·동행 도움', rehabPrecautions: '재활 관련 주의사항',
};
export function splitRehabilitationNotes(value = '') {
  const heading = value.startsWith(marker.trimStart()) ? marker.trimStart() : marker;
  const index = value.lastIndexOf(heading);
  if (index < 0) return { specialNotes: value };
  const lines = value.slice(index + heading.length).split('\n');
  const entries = Object.entries(rehabilitationFields);
  if (lines.length !== entries.length || lines.some((line, i) => line !== entries[i][1] + ':' && !line.startsWith(entries[i][1] + ': '))) return { specialNotes: value };
  return { specialNotes: value.slice(0, index), ...Object.fromEntries(entries.map(([key, label], i) => [key, lines[i].slice(label.length + 1).trimStart()])) };
}
export function joinRehabilitationNotes(fields) {
  const specialNotes = String(fields.specialNotes || '');
  if (!fields.rehabStatus) return specialNotes;
  return specialNotes + marker + Object.entries(rehabilitationFields).map(([key, label]) => {
    const value = fields.rehabStatus === '없음' && key !== 'rehabStatus' ? '' : String(fields[key] || '').replace(/[\r\n]+/g, ' ').trim();
    return `${label}: ${value}`;
  }).join('\n');
}
