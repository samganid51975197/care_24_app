import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';
const elements=new Map(),get=key=>{if(!elements.has(key))elements.set(key,{innerHTML:'',textContent:'',value:'',isConnected:true,querySelector:()=>null,querySelectorAll:()=>[],scrollIntoView(){}});return elements.get(key)};
const context={enableCareReview(){},document:{querySelector:get,querySelectorAll:()=>[],visibilityState:'visible'},location:{hash:'#caregiver-apply/seoul-top'},URLSearchParams,window:{},localStorage:{getItem:()=>null},addEventListener(){},scrollTo(){},setInterval:()=>1,clearInterval(){},fetch:async()=>({ok:true,json:async()=>({items:[],admin:false})})};vm.createContext(context);
for(const file of ['hospitals.js','care-facilities.js','ward-config.js','ward-board.js','admin-login.js','app.js'])vm.runInContext(fs.readFileSync(file,'utf8'),context);
const ids=vm.runInContext('[...hospitals,...careFacilities].map(h=>h.id)',context);assert.equal(new Set(ids).size,ids.length);
for(const id of ids){context.id=id;vm.runInContext('hospitalLanding(id)',context);const html=get('#app').innerHTML;assert(html.includes('id="hospitalHomeBoard"'));assert(html.includes('찾아오는 길'));assert(html.includes('map.naver.com'));assert(html.includes('map.kakao.com'));}
vm.runInContext("hospitalLanding('seoul-top')",context);assert(get('#app').innerHTML.includes('정릉천동로 102'));assert(get('#app').innerHTML.includes('02-2088-0580'));assert.deepEqual(Array.from(vm.runInContext("wardBuildings['seoul-top'][0].floors",context)),['1층','2층','3층','4층']);
const card=vm.runInContext("renderWardJob({reference:'TEST <unsafe>',building:'병원 건물',floor:'3층',room:'테스트',date:'2026-09-25',time:'13:45'},'seoul-top')",context);assert(card.includes('#caregiver-apply/seoul-top?job=TEST%20%3Cunsafe%3E'));assert(card.includes('TEST &lt;unsafe&gt;'));
assert(fs.readFileSync('app.js','utf8').includes("+'?submitted='+encodeURIComponent(data.reference)"));
console.log('PASS: '+ids.length+' unique hospital home routes, shared board and directions, Seoul Top facts, safe request-number links and post-submission return');

context.FormData=class{constructor(form){this.values=form.values}entries(){return this.values.entries()}get(key){return this.values.get(key)}};
vm.runInContext("location.hash='#request/seoul-top';request('seoul-top')",context);
const form=get('#requestForm');form.querySelector=()=>({textContent:'접수',disabled:false});form.reset=()=>{};form.values=new Map([['hospital','seoul-top'],['building','병원 건물'],['floor','3층'],['room','테스트 병실'],['bed','1번'],['date','2026-09-25'],['time','09:30'],['endDate','2026-09-26'],['endTime','09:30'],['phone','TEST']]);
let sent;context.fetch=async(url,options)=>{sent=JSON.parse(options.body);return {ok:true,json:async()=>({reference:'TEST-NEW'})}};
await form.onsubmit({preventDefault(){}});assert.equal(sent.hospitalId,'seoul-top');assert.equal(sent.board.floor,'3층');assert.equal(context.location.hash,'hospital/seoul-top?submitted=TEST-NEW');
console.log('PASS: submitted request preserves hospital location and redirects to the matching hospital first-screen board');

for(const id of ids){context.id=id;vm.runInContext('caregiverApply(id)',context);for(const name of ['time','endDate','endTime'])assert(get('#app').innerHTML.includes('name="'+name+'" type="'+(name==='endDate'?'date':'time')+'"'));}
assert.equal(sent.board.endTime,'09:30');console.log('PASS: all hospitals share caregiver start/end fields and request end time is sent');
