import {courses as originals} from './specialty-cases.mjs';
import {additions} from './specialty-additions.mjs';
import {respiratoryGroups} from './respiratory-bank.mjs';
import {scabiesSource} from './scabies-questions.mjs';
import {dementia,mental,urinary,musculoskeletal,circulatory,sensory,orthopedic,infection} from './specialty-expansion.mjs';
const old=id=>originals.find(c=>c.id===id);
const section=id=>old(id).units.map(u=>({...u,id:`${id}-${u.id}`,track:old(id).title.replace('전문간병사',''),source:old(id).source}));
const extra=(id,title,source)=>additions[id].map((u,i)=>({...u,id:`${id}-E${i+1}`,track:title,source}));
export const aliases={stroke:'neurological',parkinson:'neurological','brain-cancer':'neurological',lung:'respiratory',pancreatic:'digestive',gastric:'digestive',colorectal:'digestive',liver:'digestive',dialysis:'renal','blood-cancer':'hematology','skin-cancer':'skin',thyroid:'endocrine',tongue:'head-neck',laryngeal:'head-neck',orthopedics:'orthopedic','infectious-disease':'infection'};
export const canonicalId=id=>aliases[id]||id;
export const courses=[];
function family(id,title,scope,modules,source){
 const units=modules.flat();const examUnits=[];
 const selection=id==='neurological'?[[0,1,3,4,7],[0,1,3,5,8],[1,2],[0,1,2,3,4,6,7,9]]:id==='renal'?[[0,2,4,6,8],[0,2,4,6,8],[0,1,2,3,4,5,6,7,8,9]]:id==='digestive'?[[1,4,6,8],[1,2,3,6],[0,1,3,4],[1,2,3,7],[1,2,4,8]]:null;
 if(units.length<20)throw Error(id+' requires 20 cases');
 if(selection)modules.forEach((m,i)=>selection[i].forEach(j=>examUnits.push(m[j])));
 else for(let i=0;examUnits.length<20;i++)for(const m of modules){if(m[i])examUnits.push(m[i]);if(examUnits.length===20)break;}
 courses.push({id,title,scope,category:'질환군 자격',source,units,examUnits,bankType:'cases',examSummary:'분야별 20사례 × 4문항 = 80문항',tracks:[...new Set(units.map(u=>u.track))]});
}
family('musculoskeletal','근골격계질환 전문간병사','경추·척수손상 환자(사지마비 등), 요추 추간판탈출증(허리디스크) 환자, 골관절염·류마티스관절염·골다공증·골절·척추관협착증·근감소·수술 후 재활 환자',[musculoskeletal],musculoskeletal[0].source);
family('orthopedic','정형외과질환 전문간병사','고관절·척추·상하지 골절, 관절 치환술·골절 고정술 후 회복, 석고·보조기 관리, 체중부하·이동·재활 안전',[orthopedic],orthopedic[0].source);
family('infection','감염질환 전문간병사','표준주의·손 위생·보호구·격리 안내, 호흡기·접촉 감염, 요로·수술상처 감염 의심, 면역저하 환자 발열, 체액 노출·환경 관리',[infection],infection[0].source);
family('circulatory','순환계질환 전문간병사','심부전·관상동맥질환·부정맥·고혈압·말초혈관질환·항응고 안전·심폐 복합질환',[circulatory],circulatory[0].source);
family('sensory','감각계질환 전문간병사','백내장·녹내장·황반변성·난청·이명·균형장애·후각·미각·감각 저하',[sensory],sensory[0].source);
family('neurological','신경계·정신질환 전문간병사','뇌졸중(뇌경색·뇌출혈)·파킨슨병·뇌종양·우울·불안·정신증·수면·자해 위험. 치매는 독립 과정에서 심화 학습',[section('stroke'),section('parkinson'),section('brain-cancer'),mental],old('stroke').source);
family('digestive','소화기질환 전문간병사','위·장·간·췌장 질환과 위암·대장암·간암·췌장암 심화, 영양·배변·장루 돌봄',[extra('digestive','소화기 공통','https://www.niddk.nih.gov/health-information/digestive-diseases'),section('gastric'),section('colorectal'),section('liver'),section('pancreatic')],old('gastric').source);
family('renal','신장·비뇨기계질환 전문간병사','만성 신장질환·혈액투석·복막투석·이식·요실금·요폐·전립선비대·요로감염·혈뇨·요로결석·신경인성 방광',[extra('renal','신장질환 공통','https://www.niddk.nih.gov/health-information/kidney-disease/chronic-kidney-disease-ckd/managing'),section('dialysis'),urinary],old('dialysis').source);
family('hematology','혈액질환 전문간병사','빈혈·출혈 경향·혈전 의심 변화와 백혈병·림프종·골수종 심화',[extra('hematology','혈액질환 공통','https://www.nhlbi.nih.gov/health/anemia'),section('blood-cancer')],old('blood-cancer').source);
family('skin','피부질환 전문간병사','피부 장벽·습기 손상·감염 의심·가려움·상처와 피부암 심화',[extra('skin','피부질환 공통','https://www.nhs.uk/conditions/cellulitis/'),section('skin-cancer')],old('skin-cancer').source);
family('endocrine','내분비·대사질환 전문간병사','당뇨·혈당 변화·발 관리·갑상선 수술과 갑상선암 심화',[extra('endocrine','당뇨·대사 돌봄','https://www.cdc.gov/diabetes/treatment/index.html'),section('thyroid')],old('thyroid').source);
family('head-neck','두경부암 전문간병사','설암·후두암 통합: 구강·삼킴·기도·발성·영양·재건 후 돌봄',[section('tongue'),section('laryngeal')],old('laryngeal').source);
courses.push({id:'dementia',title:'치매전문간병사',category:'독립 특화 자격',scope:'알츠하이머병·혈관성·혼합·전두측두엽 치매·행동변이·의미 치매·진행성 비유창 실어증·루이소체·파킨슨병 치매·기타 뇌손상·치료 가능한 인지저하 원인·전신 질환·섬망·우울 감별',source:dementia[0].source,units:[...dementia,...old('dementia').units],examUnits:dementia,bankType:'cases',examSummary:'치매 유형·감별·맞춤 돌봄 20영역 × 4문항 = 80문항',tracks:dementia.map(u=>u.name)});
for(const id of ['hospice']){const c=old(id);courses.push({...c,category:'독립 특화 자격',bankType:'classic',tracks:[c.scope],examSummary:'질환별 사례 40 + 공통 돌봄역량 40문항'});}
const theory=[
 ['폐포의 가스 교환, 기도의 공기 통과, 호흡 노력과 의식을 구분해 관찰한다. 산소포화도는 산소화의 한 단서이며 이산화탄소 배출이나 호흡 부담 전체를 보여주지 않는다. 평소와의 차이·발생 시각·활동 조건을 함께 기록한다.','기기가 정상에 가까운 수치를 보이지만 환자는 새로 말을 잇기 어렵고 처진다.','수치와 환자 상태를 함께 평가해야 할 긴급 변화','측정 완료를 기다리지 않고 즉시 도움을 요청한다.'],
 ['산소 장치·설정·목표는 개인별 처방을 확인한다. 간병사는 외부 눌림·당김·점화원을 살피고 설정을 임의로 바꾸지 않는다. 식사·세안·이동은 호흡 부담과 삼킴·동반질환을 고려해 나누어 돕는다. 흡인과 환기 설정은 담당자의 영역이다.','산소 줄이 눌린 상태에서 환자가 답답하다고 유량을 높여 달라고 한다.','산소 공급 환경과 새 증상의 동시 확인','외부 눌림을 안전하게 해소하도록 돕고 즉시 담당자에게 상태를 알린다.'],
 ['폐렴은 감염에 의한 폐 염증으로 호흡·전신 상태를 함께 관찰한다. 고령 환자는 발열이 뚜렷하지 않아도 새 혼돈·기능 저하를 보일 수 있다. 흡인 예방은 삼킴 평가·식이·구강 관리·자세 계획에 따른다. 기침이 없다고 흡인을 배제하지 않는다.','식사 중 기침 뒤 호흡이 힘들고 평소보다 반응이 둔해졌다.','흡인 위험과 급성 호흡·의식 변화','식사 보조를 멈추고 즉시 의료진을 호출한다.'],
 ['COPD 교육에서는 폐기종의 폐조직 손상과 만성기관지염의 기도·분비물 문제를 구분한다. 평소 대비 숨참·가래·기능 변화를 보고한다. 산소는 무조건 금지하거나 최대치로 올리지 않고 개별 처방을 따른다. 호흡·활동 훈련은 전문팀의 교육을 지원한다.','COPD 환자가 평소보다 숨차고 가래가 늘었지만 원래 아픈 병이라며 참는다.','기준 상태와 다른 악화 징후','달라진 증상과 시각을 신속히 보고하고 개인별 계획을 확인한다.'],
 ['천식의 기도 협착, 기관지확장증의 만성 기도·분비물 문제, 간질성 폐질환의 폐조직 변화를 구분한다. 같은 숨참이라도 관리법은 다르다. 천식에서 소리가 줄어도 탈진·말하기 곤란이 커지면 호전이라 단정하지 않는다.','기관지확장증 환자가 새 객혈과 숨참을 보이는데 평소 배출 훈련을 계속하려 한다.','증상 변화 시 기존 훈련의 재평가','훈련을 계속하기보다 즉시 의료진에게 출혈·호흡 변화를 알린다.'],
 ['전염성 폐결핵 의심·확인 시 기관의 공기주의, 호흡보호구, 출입·이동 절차를 따른다. 격리실의 문·환기 장치를 임의 변경하지 않는다. 잠복결핵과 활동성 질환을 구분하며 격리 해제는 증상만으로 정하지 않는다. 치료 지속을 돕되 약 조정은 담당팀에 맡긴다.','기침이 줄어든 결핵 환자가 격리실 문을 열고 공용 공간에 가겠다고 한다.','감염관리 지시와 격리 해제 판단의 구분','담당 의료진·감염관리팀의 현재 이동·격리 지침을 먼저 확인한다.'],
 ['폐암 돌봄은 치료·증상·기능·환자 목표별로 달라진다. 객혈, 얼굴·목 부종과 숨참, 치료 중 새 기침·오한은 신속히 알린다. 흉관 잠금·분리·짜내기를 임의로 하지 않는다. 통증·영양·호흡·정서 지원과 완화돌봄을 연계한다.','폐암 치료 중 환자가 새 기침과 숨참을 보이지만 다음 예약까지 기다리려 한다.','감염·치료 부작용 등을 포함한 새 호흡 변화','치료 정보와 발생 시각을 신속히 담당팀에 전달한다.'],
 ['복합질환에서는 한 질환의 일반 조언을 그대로 적용하지 않는다. 수분·식이·활동·장치 계획을 통합 확인한다. 기록은 호소·관찰·측정·의료진 판단을 구분한다. 악화가 지속되면 재호출하고, 퇴원 교육은 설명·시범으로 이해를 확인한다.','폐렴·COPD·신장질환이 함께 있는 환자에게 가래를 묽게 하려고 물을 많이 주려 한다.','동반질환을 고려한 통합 계획','삼킴과 신장 상태를 반영한 개인별 수분 지시를 확인한다.']
];
const respiratory={id:'respiratory',title:'호흡기질환 전문간병사',category:'질환군 자격',scope:'폐렴·흡인성 폐렴·COPD·폐기종·만성기관지염·천식·기관지확장증·간질성 폐질환·폐결핵·폐암',source:'https://www.who.int/health-topics/lung-health',bankType:'respiratory',examSummary:'호흡기 분야 8영역 · 배분형 80문항',tracks:['호흡기 공통','폐렴·흡인','COPD·폐기종','천식·기타 폐질환','폐결핵','폐암'],units:respiratoryGroups.map(([id,name,count],i)=>({id,name,track:name,source:'https://www.who.int/health-topics/lung-health',reason:theory[i][0],scenario:theory[i][1],focus:theory[i][2],action:theory[i][3],followup:'대응 후 호흡·의식·편안함과 미해결 문제를 확인해 다음 담당자에게 인계한다.',questionCount:count}))};
respiratory.units.push(...section('lung'));
courses.splice(1,0,respiratory);
const patientExamples={
 musculoskeletal:'경추·척수손상 환자(사지마비 등), 요추 추간판탈출증(허리디스크) 환자, 관절염·골다공증·골절 환자, 정형외과 수술 후 재활 환자',
 respiratory:'폐렴·흡인성 폐렴 환자, 폐기종·만성기관지염 등 만성폐쇄성폐질환(COPD) 환자, 천식·기관지확장증·간질성 폐질환·폐결핵·폐암 환자',
 circulatory:'심부전 환자, 관상동맥질환(협심증·심근경색 등) 환자, 부정맥·고혈압·말초혈관질환 환자',
 sensory:'백내장·녹내장·황반변성 등으로 시력이 저하된 환자, 난청·이명 환자, 균형장애·후각·미각 저하 환자',
 neurological:'뇌졸중(뇌경색·뇌출혈) 환자, 파킨슨병·뇌종양 환자, 우울·불안·정신증·수면장애 환자. 치매 환자 돌봄은 별도 치매 과정에서 다룹니다.',
 digestive:'위암·대장암·간암·췌장암 환자, 위·장·간·췌장 질환 환자, 장루(배변을 위한 인공 개구부)가 있거나 영양·배변 도움이 필요한 환자',
 renal:'만성 신장질환 환자, 혈액투석·복막투석 환자, 신장이식 후 환자, 전립선비대·요실금·요폐(소변이 잘 나오지 않음)·요로감염·요로결석·신경인성 방광 환자',
 hematology:'빈혈 환자, 백혈병·림프종·골수종 등 혈액암 환자, 출혈 경향이 있거나 혈전 관련 관찰이 필요한 환자',
 skin:'피부암 환자, 피부 감염·가려움·상처가 있는 환자, 땀·배설물 등 습기로 피부가 손상된 환자',
 endocrine:'당뇨병 환자, 혈당 변화와 발 관리가 필요한 환자, 갑상선암 환자 및 갑상선 수술 후 환자',
 'head-neck':'설암(혀의 암)·후두암 환자, 수술 후 삼킴·말하기·호흡·구강관리·영양 섭취에 도움이 필요한 환자',
 dementia:'알츠하이머병·혈관성·혼합 치매 환자, 전두측두엽 치매(행동변이·의미 치매·진행성 비유창 실어증 등) 환자, 루이소체·파킨슨병 치매 환자, 기타 뇌손상·전신 질환 관련 인지저하 환자. 치료 가능한 인지저하 원인과 섬망·우울의 구분도 학습합니다.',
 hospice:'말기 암 등 생애말기 질환으로 호스피스·완화돌봄을 받는 환자, 통증·숨참·불안 등으로 편안함과 일상생활 지원이 필요한 환자'
};
for(const course of courses)course.patientExamples=patientExamples[course.id];
const skinCourse=courses.find(c=>c.id==='skin');
skinCourse.scope='옴·가피성 옴 환자 돌봄과 접촉·침구·환경관리, '+skinCourse.scope;
skinCourse.patientExamples='옴·가피성 옴 환자, '+skinCourse.patientExamples;
const scabiesUnit=skinCourse.units.find(u=>u.name==='옴 의심 상황');
scabiesUnit.source=scabiesSource;
scabiesUnit.reason='옴은 진드기에 의한 피부 감염성 질환이다. 의심 환자는 의료진에게 보고하고 기관의 장갑·가운 등 접촉 예방 지침을 따른다. 침구·의류는 분리 수거하여 온수 세탁·고온 건조하고, 세탁 불가 물품은 기관이 정한 기간 밀봉 보관한다. 무증상 접촉자도 노출 사실을 보고하여 평가·치료 필요성을 확인한다. 가피성 옴은 가려움이 약하거나 없어도 전파 위험이 높을 수 있다. 진단·약물 처방·격리 해제는 의료진과 감염관리팀이 결정한다. 환자를 낙인찍지 않고 사생활을 보호한다.';
export function getCourse(id){return courses.find(c=>c.id===canonicalId(id));}
const treatmentUnit={id:'skin-treatment',name:'옴 동시 치료·도포·생활관리',track:'옴 환자 돌봄',source:'https://www.cdc.gov/scabies/hcp/clinical-care/index.html',focus:'접촉자 동시 치료와 약제별 도포·세척 일정 확인',scenario:'옴 환자의 가족이 자신은 가렵지 않다며 치료를 미루고, 환자는 연고를 바른 즉시 씻으려 한다.',action:'가족도 의료진에게 연결하여 동시 치료를 조율하고 환자의 약명·농도·도포 범위·세척 시각을 처방과 대조한다.',reason:'동거인·밀접 접촉자는 증상이 없어도 같은 시기에 치료하도록 조율한다. 성인 일반 옴의 퍼메트린 5% 크림은 CDC 지침상 목 아래 전신에 바르고 8~14시간 뒤 씻는 예시가 있으나 국내 제품 설명서와 개인별 처방을 우선한다. 약 1주 후 추가 도포가 필요할 수 있어 처방을 확인한다. 다른 약·소아·고령자·가피성 옴에 동일 일정을 임의 적용하지 않는다. 최근 3일 사용 물품을 세탁·고온 건조하고, 세탁 불가 물품은 최소 72시간~1주 밀봉한다. 피부나 실내에 살충제를 분무하지 않는다. 치료 후 가려움만으로 실패를 단정하지 말고 새 발진이나 지속 증상을 보고한다. 상세 참고자료의 치료·환경관리 절차를 함께 읽는다.',followup:'접촉자 치료 조율, 실제 도포·세척 시각, 세탁·밀봉 처리, 피부 반응과 재평가 지시를 기록한다.'};
skinCourse.units.push(treatmentUnit);
// 총 80문항 유지. 자외선 보호 교안은 유지하고 해당 4문항을 옴 치료 사례로 교체.
skinCourse.examUnits[skinCourse.examUnits.findIndex(u=>u.id==='skin-cancer-U06')]=treatmentUnit;
