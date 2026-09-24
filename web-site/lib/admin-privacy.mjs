export function maskPatientName(value){const name=Array.from(String(value||'').trim());if(name.length<2)return '○';if(name.length===2)return name[0]+'○';return name[0]+'○'.repeat(name.length-2)+name[name.length-1];}
const privateRoutes=new Set(['/api/applications','/api/submissions','/api/documents','/api/consents','/api/care-contracts','/api/document-media','/api/ward-board','/api/ward-assignments','/api/contribution']);
export function requiresPrivateAdmin(path,method,body={}) {
 if(privateRoutes.has(path)||/^\/api\/care-requests\/[^/]+$/.test(path))return true;
 if(path==='/api/care-requests')return !['GET','POST'].includes(method)||(method==='POST'&&['careFee','feePeriod','paymentMethod','paymentDue','contractNote','contractVersion','contractSignedAt'].some(key=>String(body[key]||'').trim()));
 if(path==='/api/care-workflow'&&method!=='GET')return !['save_application','send_application','uniform','start'].includes(body.action)||(['save_application','send_application'].includes(body.action)&&!!String(body.note||'').trim());
 return false;
}
const statusKeys=['requesting','matching','matched'];
export function publicCareText(value,privateValues=[]) {
 let text=String(value||'');
 for(const secret of privateValues.filter(Boolean).sort((a,b)=>String(b).length-String(a).length))text=text.split(String(secret)).join('[비공개]');
 return text.replace(/(?:\+?82[- .]?)?0?1[016789][- .]?\d{3,4}[- .]?\d{4}|0\d{1,2}[- .]\d{3,4}[- .]\d{4}/g,'[연락처 비공개]')
  .replace(/[\w.+-]+@[\w.-]+\.[a-z]{2,}/gi,'[연락처 비공개]')
  .replace(/(?:₩|\$)\s*[\d,.]+|[\d,.]+\s*(?:천|만|억)?\s*(?:원|달러)|[일이삼사오육칠팔구십백천만억]+원/g,'[금액 비공개]')
  .replace(/\d+[A-Za-z가-힣]?\s*호(?:실)?/g,'[병실 비공개]');
}
export function nonAdminResponse(path,data) {
 if(path==='/api/care-requests')return {
  restricted:true,admin:false,
  requests:(data.requests||[]).map(r=>({id:r.id,status:statusKeys.includes(r.status)?r.status:'requesting',canPrepareContract:false,patientName:maskPatientName(r.patientName),...Object.fromEntries(['building','floorName','ward','patientGender','patientAge','patientBirthYear','patientWeight','diagnosis','patientCondition','precautions','specialNotes','desiredGender','desiredNationality','desiredExpertise','desiredAge','desiredPersonality','desiredOther'].map(key=>[key,publicCareText(r[key])]))})),
  profiles:(data.profiles||[]).map(p=>({id:p.id,applicantName:`본인 프로필 ${p.id}`,careerYears:'비공개'})),
  progress:(data.progress||[]).map(p=>({id:p.id,status:'진행'})),
  stats:Object.fromEntries(['day','week','month','year'].map(k=>[k,{total:Number(data.stats?.[k]?.total)||0,matched:Number(data.stats?.[k]?.matched)||0}]))
 };
 if(path==='/api/care-workflow')return {
  id:data.id,admin:false,restricted:true,ownPatient:false,ownSelected:!!data.ownSelected,
  applications:(data.applications||[]).map(a=>({profileId:a.profileId,status:a.status==='sent'?'sent':'draft',name:'비공개'})),
  selected:data.selected,notifiedAt:data.notifiedAt,uniformAt:data.uniformAt,startedAt:data.startedAt,
  canWriteDiary:false,diary:[],submissions:{}
 };
 if(path==='/api/hospital-registrations')return {
  role:data.role,hospitals:data.hospitals,
  registrations:(data.registrations||[]).map(r=>({id:r.id,hospital_id:r.hospital_id,hospital_name:r.hospital_name,caregiver_name:'관리자만 확인 가능',status:r.status,association_approved_at:r.association_approved_at,hospital_approved_at:r.hospital_approved_at,closed_action:r.closed_action}))
 };
 return data;
}
