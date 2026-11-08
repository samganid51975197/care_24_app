// Stable room assignments: keep the numbers independent of catalog ordering.
export const classrooms = Object.freeze({
  dementia: '4-1', musculoskeletal: '401호 근골격계질환 전문간병사', respiratory: '4-3',
  circulatory: '4-4', sensory: '4-5', neurological: '4-6',
  digestive: '4-7', renal: '4-8', hematology: '4-9', skin: '4-10',
  endocrine: '4-11', 'head-neck': '4-12', hospice: '4-13', pressure: '4-14',
  orthopedic: '4-15', infection: '4-16'
});
export const classroomLabel = id => classrooms[id] ? `${classrooms[id]} 강의실` : '전문교육 강의실';
