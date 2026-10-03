import {encryptText,decryptText} from './data-crypto.mjs';
export async function ensureWorkflow(db){await db.execute('CREATE TABLE IF NOT EXISTS care_workflows(request_id INTEGER PRIMARY KEY,payload TEXT NOT NULL,updated_at TEXT NOT NULL)')}
export const emptyWorkflow=()=>({applications:[],selected:null,patientContract:'',caregiverContract:'',patientSigned:'',caregiverSigned:'',scheduledAt:'',notifiedAt:'',uniformAt:'',startedAt:'',audit:[]});
export async function readWorkflow(db,id){await ensureWorkflow(db);const r=await db.execute({sql:'SELECT payload FROM care_workflows WHERE request_id=?',args:[id]});return r.rows.length?JSON.parse(decryptText(r.rows[0].payload,'care_workflows.'+id)):emptyWorkflow()}
export function transition(w,b,actor,context,now=new Date()){
 const admin=actor.role==='admin',action=b.action,stamp=now.toISOString();const fail=m=>{throw Error(m)};
 const adminOnly=()=>{if(!admin)fail('협회 관리자만 처리할 수 있습니다.')};
 if(['save_application','send_application'].includes(action)){
  if(w.selected||!['requesting','matching'].includes(context.status))fail('협회 선정을 마친 의뢰입니다.');
  if(!context.profile||(!admin&&context.profile.ownerUserId!==actor.id))fail('본인 간병인 프로필을 선택하세요.');
  const id=context.profile.id;let a=w.applications.find(x=>x.profileId===id);if(a&&a.ownerId!==actor.id&&!admin)fail('본인 신청만 변경할 수 있습니다.');if(!a){a={profileId:id,ownerId:context.profile.ownerUserId||actor.id,name:context.profile.applicantName,note:'',status:'draft'};w.applications.push(a)}
  if(a.status==='sent'&&action==='save_application')fail('이미 협회에 보낸 신청입니다.');a.note=String(b.note||'').slice(0,2000);a.status=action==='send_application'?'sent':'draft';a.updatedAt=stamp;
 }else if(action==='select'){
  adminOnly();if(w.selected)fail('이미 선정했습니다.');const a=w.applications.find(x=>x.profileId===Number(b.profileId)&&x.status==='sent');if(!a)fail('협회에 보낸 신청 중에서 선정하세요.');w.selected=a.profileId;
  }else if(['save_contract','send_contract'].includes(action)){
 const party=b.party,selected=w.applications.find(x=>x.profileId===w.selected);
 if(!['patient','caregiver'].includes(party))fail('계약서 종류를 선택하세요.');
 if(!admin&&!(party==='patient'?context.requestOwner===actor.id:selected?.ownerId===actor.id))fail('본인 계약서만 작성할 수 있습니다.');
 if(w.notifiedAt)fail('통보한 계약은 협회에 변경을 요청하세요.');
 const content=String(b.content||'').trim();if(!content||content.length>12000)fail('계약 내용을 12000자 이내로 작성하세요.');
 w.submissions??={};w.submissions[party]={content,status:action==='send_contract'?'sent':'draft',authorId:actor.id,updatedAt:stamp};
 w.patientSigned='';w.caregiverSigned='';
 }else if(action==='contracts'){
  adminOnly();if(!w.selected||w.notifiedAt)fail('선정 후 통보 전 단계에서 작성하세요.');
  for(const key of ['patientContract','caregiverContract','patientSigned','caregiverSigned']){if(typeof b[key]!=='string'||!b[key].trim()||b[key].length>12000)fail('양쪽 계약 내용과 실제 서명 확인 내역을 입력하세요.');w[key]=b[key].trim()}
  if(b.signedConfirmed!==true)fail('당사자별 실제 서명 확인이 필요합니다.');const t=new Date(b.scheduledAt);if(!Number.isFinite(t.getTime())||t.getTime()<=now.getTime())fail('앞으로의 근무 일자와 시간을 정해 주세요.');w.scheduledAt=t.toISOString();
 }else if(action==='notify'){
  adminOnly();if(!w.patientSigned||!w.caregiverSigned||!w.scheduledAt)fail('양쪽 계약과 근무 일정을 먼저 저장하세요.');if(!context.requestOwner)fail('환자·보호자 계정 소속을 먼저 연결해야 앱으로 통보할 수 있습니다.');if(w.notifiedAt)fail('이미 통보했습니다.');w.notifiedAt=stamp;
 }else if(action==='uniform'||action==='start'){
  const selected=w.applications.find(x=>x.profileId===w.selected);if(!admin&&selected?.ownerId!==actor.id)fail('선정된 간병인 또는 협회 관리자만 처리할 수 있습니다.');
  if(!w.notifiedAt)fail('계약·일정 통보가 먼저 필요합니다.');if(action==='uniform'){if(b.confirmed!==true)fail('실제 유니폼 수령을 확인하세요.');if(w.uniformAt)fail('이미 수령 확인했습니다.');w.uniformAt=stamp}else{if(!w.uniformAt)fail('유니폼 수령 확인이 필요합니다.');if(now.getTime()<new Date(w.scheduledAt).getTime())fail('약속한 시작 시간 이후에 근무를 시작할 수 있습니다.');if(w.startedAt)fail('이미 근무를 시작했습니다.');if(b.confirmed!==true)fail('실제 근무 시작을 확인하세요.');w.startedAt=stamp}
 }else if(action==='save_diary'){
  const selected=w.applications.find(x=>x.profileId===w.selected);
  if(actor.role!=='caregiver'||selected?.ownerId!==actor.id)fail('선정된 담당 간병인만 간병일지를 작성할 수 있습니다.');
  const started=new Date(w.startedAt).getTime();
  if(!w.startedAt||!Number.isFinite(started)||started>now.getTime())fail('근무 시작 확인 후 간병일지를 작성할 수 있습니다.');
  const fields={};for(const key of ['condition','care','meals','elimination','mobility','notes']){fields[key]=String(b[key]||'').trim();if(fields[key].length>4000)fail('각 항목은 4000자 이내로 작성하세요.')}
  if(!fields.condition||!fields.care)fail('환자 상태와 간병 내용을 입력하세요.');
  w.diary??=[];w.diary.push({id:w.diary.length+1,authorId:actor.id,authorName:selected.name,recordedAt:stamp,...fields});
 }else if(['review_diary','instruct_diary','ack_instruction'].includes(action)){
  const entry=w.diary?.find(x=>x.id===Number(b.diaryId));if(!entry)fail('간병일지를 찾을 수 없습니다.');
  if(action==='ack_instruction'){
   const selected=w.applications.find(x=>x.profileId===w.selected);
   if(actor.role!=='caregiver'||selected?.ownerId!==actor.id||entry.authorId!==actor.id)fail('담당 간병인만 지시를 확인할 수 있습니다.');
   const instruction=entry.instructions?.find(x=>x.id===Number(b.instructionId));if(!instruction)fail('지시를 찾을 수 없습니다.');
   if(instruction.acknowledgedAt)fail('이미 확인한 지시입니다.');instruction.acknowledgedAt=stamp;instruction.acknowledgedBy=actor.id;
  }else{
   adminOnly();
   if(action==='review_diary'){if(entry.reviewedAt)fail('이미 확인한 일지입니다.');entry.reviewedAt=stamp;entry.reviewerId=actor.id;entry.reviewerName=actor.name||actor.username||'관리자';}
   else {const content=String(b.content||'').trim();if(!content||content.length>4000)fail('업무 지시를 4000자 이내로 입력하세요.');entry.instructions??=[];entry.instructions.push({id:entry.instructions.length+1,content,authorId:actor.id,authorName:actor.name||actor.username||'관리자',createdAt:stamp,acknowledgedAt:''});if(!entry.reviewedAt){entry.reviewedAt=stamp;entry.reviewerId=actor.id;entry.reviewerName=actor.name||actor.username||'관리자';}}
  }
 }else fail('처리 방법을 확인해 주세요.');
 w.audit.push({action,actorId:actor.id,at:stamp});return w;
}
export async function changeWorkflow(db,id,b,actor,context){await ensureWorkflow(db);const tx=await db.transaction('write');try{const r=await tx.execute({sql:'SELECT payload FROM care_workflows WHERE request_id=?',args:[id]});const w=r.rows.length?JSON.parse(decryptText(r.rows[0].payload,'care_workflows.'+id)):emptyWorkflow();transition(w,b,actor,context);await tx.execute({sql:'INSERT INTO care_workflows(request_id,payload,updated_at) VALUES(?,?,?) ON CONFLICT(request_id) DO UPDATE SET payload=excluded.payload,updated_at=excluded.updated_at',args:[id,encryptText(JSON.stringify(w),'care_workflows.'+id),new Date().toISOString()]});if(b.action==='send_application'||b.action==='select')await tx.execute({sql:"UPDATE care_requests SET status='matching' WHERE id=? AND status IN ('requesting','matching')",args:[id]});if(b.action==='notify')await tx.execute({sql:"UPDATE care_requests SET status='matched',matched_at=? WHERE id=?",args:[w.notifiedAt,id]});await tx.commit();return w}catch(e){await tx.rollback();throw e}finally{tx.close()}}

export function diaryForActor(w,actor){const selected=w.applications.find(x=>x.profileId===w.selected);return actor.role==='admin'||selected?.ownerId===actor.id?(w.diary||[]):undefined;}
