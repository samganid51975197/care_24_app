import {renderMedicationCare} from './medication-care.mjs';
import {renderLessonQA} from './lesson-qa.mjs';
for(const section of document.querySelectorAll('section[id^="P"]')){renderMedicationCare(section,'pressure');renderLessonQA(section,{name:section.querySelector('h2')?.textContent});}
