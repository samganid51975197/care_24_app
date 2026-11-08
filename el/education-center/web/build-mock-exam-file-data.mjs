import {writeFileSync} from 'node:fs';
import * as general from './mock-exam-bank.mjs';
import {bank as disease} from './disease-exam-bank.mjs';
import {bank as pressure} from './pressure-exam-bank.mjs';
import {courses} from './specialty-families.mjs';
import {specialtyBank} from './specialty-bank.mjs';

const banks={
  general:{title:'기본 간병교육',groups:general.groups,questions:general.questions},
  disease:{title:'질환별 사례 판단',groups:disease.groups,questions:disease.questions},
  pressure:{title:'욕창 심화',groups:pressure.groups,questions:pressure.questions}
};
for(const course of courses){
  const bank=specialtyBank(course.id);
  if(bank)banks[course.id]={title:course.title,groups:bank.groups,questions:bank.questions};
}
const target=new URL('./mock-exam-file-data.js',import.meta.url);
writeFileSync(target,`window.MOCK_EXAM_FILE_DATA=${JSON.stringify(banks)};\n`,'utf8');
console.log(`Wrote ${Object.keys(banks).length} offline banks to ${target.pathname}`);
