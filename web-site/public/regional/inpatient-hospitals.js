const inpatientSejong = [
['엔케이세종병원','종합병원','나성동',200,'한누리대로 161','JDQ4MTYyMiM2MSMkMSMkMiMkODkkMzgxMzUxIzExIyQyIyQzIyQwMCQ0NjEwMDIjNTEjJDEjJDYjJDgz'],
['세종충남대학교병원','대학병원','도담동',354,'보듬7로 20','JDQ4MTYyMiM2MSMkMSMkMiMkODkkMzgxMzUxIzExIyQxIyQzIyQ2MiQyNjEwMDIjNjEjJDEjJDQjJDgz'],
['서울현병원','일반병원','나성동',73,'나성북로 15','JDQ4MTYyMiM2MSMkMSMkMiMkOTkkMzgxMzUxIzIxIyQyIyQ1IyQwMCQ0NjEwMDIjNzEjJDEjJDgjJDgz'],
['트리니움여성병원','일반병원','반곡동',73,'한누리대로 1934','JDQ4MTYyMiM2MSMkMSMkMiMkOTkkMzgxMzUxIzIxIyQxIyQ1IyQ4OSQzNjE0ODEjNDEjJDEjJDgjJDgz'],
['강남세종한방병원','한방병원','대평동',99,'한누리대로 2275','JDQ4MTYyMiM2MSMkMSMkMiMkMTMkMzgxMTkxIzExIyQxIyQzIyQxMyQyNjE4MzIjNjEjJDEjJDQjJDgz'],
['세종하이한방병원','한방병원','대평동',60,'갈매로 58','JDQ4MTYyMiM2MSMkMSMkMiMkMTMkMzgxMTkxIzExIyQxIyQzIyQwMyQzNjEyMjIjNTEjJDEjJDIjJDgz'],
['세종경희한방병원','한방병원','대평동',46,'대평4길 17','JDQ4MTYyMiM2MSMkMSMkMiMkMTMkMzgxMTkxIzExIyQxIyQzIyQ4MiQ0NjE0ODEjNjEjJDEjJDAjJDgz'],
['오케이한방병원','한방병원','나성동',74,'한누리대로 331','JDQ4MTYyMiM2MSMkMSMkMiMkMTMkMzgxMTkxIzExIyQxIyQzIyQ4MiQzNjE4MzIjNjEjJDEjJDgjJDgz']
];
inpatientSejong.forEach(([name,type,city,beds,address,key],i)=>{
 let h=hospitals.find(h=>h.region==='세종'&&h.name===name);
 if(!h){h={id:'sejong-inpatient-'+(i+1),region:'세종',name};hospitals.push(h)}
 Object.assign(h,{type,city,address:'세종특별자치시 '+address,inpatientBeds:beds,inpatientVerified:true,verifiedAt:'2026-09-18',source:'https://www.hira.or.kr/ra/hosp/hospInfoAjax.do?ykiho='+key,legalType:name==='세종충남대학교병원'?'종합병원':type==='일반병원'?'병원':type});
});
const specialtyInpatients=[
 ['plastic-view','서울','강남구 논현동','뷰성형외과의원','성형외과',28,'서울특별시 강남구 봉은사로 107','https://www.hira.or.kr/ra/hosp/hospInfoAjax.do?ykiho=JDQ4MTg4MSM1MSMkMiMkNCMkMDAkMzgxMTkxIzIxIyQxIyQ1IyQ2MiQzNjEyMjIjNTEjJDEjJDIjJDgz'],
 ['ortho-modeutop-nowon','서울','노원구 상계동','모두탑365정형외과의원','정형외과',1,'서울특별시 노원구 동일로 1380, 3층','https://www.hira.or.kr/ra/hosp/hospInfoAjax.do?ykiho=JDQ4MTg4MSM1MSMkMiMkNCMkMDAkNTgxOTYxIzUxIyQxIyQxIyQ4OSQzNjEyMjIjNDEjJDEjJDgjJDgz'],
 ['ortho-sejong-faith','세종','고운동','세종365믿음정형외과의원','정형외과',29,'세종특별자치시 세종로 1229','https://eolith.co.kr/medical_hos/169299/'],
 ['ortho-sejong-with','세종','나성동','세종위드정형외과의원','정형외과',3,'세종특별자치시 한누리대로 265, 7층','https://eolith.co.kr/medical_hos/169374/'],
 ['ortho-sejong-banseok','세종','나성동','세종반석정형외과의원','정형외과',21,'세종특별자치시 한누리대로 157, 601-609호','https://eolith.co.kr/medical_hos/169330/'],
 ['ortho-sejong-medicatch','세종','고운동','메디캐치 정형외과의원','정형외과',2,'세종특별자치시 마음로 272-17, 4층','https://eolith.co.kr/medical_hos/151612/']
];
specialtyInpatients.forEach(([id,region,city,name,specialty,inpatientBeds,address,source])=>{
 hospitals.push({id,region,city,name,type:specialty,specialty,inpatientBeds,address,source,legalType:'의원',inpatientVerified:true,verifiedAt:'2026-09-18',sourceLabel:source.includes('hira.or.kr')?'심평원 입원병상 확인 자료':'심평원 신고자료 재게시 자료 (병원에 재확인)'});
});
const seoulHyun=hospitals.find(h=>h.id==='sejong-inpatient-3');
if(seoulHyun)seoulHyun.specialty='정형외과';
// Keep old IDs intact; unverified Sejong entries are not presented as inpatient hospitals.
const directoryHospitals=[...new Map([
 ...hospitals.filter(h=>h.region!=='세종'||h.inpatientVerified).map(h=>[h.id,h]),
 ...careFacilities.filter(h=>!h.directoryHidden).map(h=>[h.id,{...h,type:h.kind}])
]).values()];
const directoryCategories=['종합병원','대학병원','일반병원','한방병원','요양병원','재활병원','의원','성형외과','정형외과','전문병원','호스피스','보훈병원'];
const directoryCategory=h=>['요양병원','재활병원','성형외과','정형외과'].includes(h.type)?h.type:hospitalCategory(h)==='상급·대학병원'?'대학병원':hospitalCategory(h);
