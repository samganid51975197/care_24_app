import {getClient,getDb} from '@/db';
import {careRequests} from '@/db/schema';
import {withActor,privateJson} from '@/lib/auth';
import {decryptText} from '@/lib/data-crypto.mjs';
import {changeWorkflow} from '@/lib/care-workflow.mjs';

export async function GET(req:Request){return withActor(req,async()=>{
 try{
  const [workflows,requests]=await Promise.all([
   getClient().execute('SELECT request_id,payload FROM care_workflows'),
   getDb().select({id:careRequests.id,hospitalId:careRequests.hospitalId}).from(careRequests),
  ]);
  const hospitals=new Map(requests.map(r=>[r.id,r.hospitalId]));
  const evaluations=workflows.rows.flatMap(row=>{
   const id=Number(row.request_id),w=JSON.parse(decryptText(String(row.payload),'care_workflows.'+id));
   return (w.evaluations||[]).filter((e:any)=>e.status==='sent'||e.status==='confirmed').map((e:any)=>({requestId:id,hospitalId:hospitals.get(id)||'',...e,evaluationId:e.id}));
  }).sort((a:any,b:any)=>String(b.sentAt||'').localeCompare(String(a.sentAt||'')));
  return privateJson({evaluations});
 }catch{return privateJson({error:'평가 목록을 불러오지 못했습니다.'},500)}
},true)}

export async function POST(req:Request){return withActor(req,async actor=>{
 try{
  const b=await req.json(),id=Number(b.requestId),evaluationId=Number(b.evaluationId);
  if(!Number.isSafeInteger(id)||id<1||!Number.isSafeInteger(evaluationId)||evaluationId<1)return privateJson({error:'의뢰번호와 평가번호를 확인하세요.'},400);
  const changed=await changeWorkflow(getClient(),id,{action:'confirm_evaluation',evaluationId},actor,{});
  const evaluation=changed.evaluations.find((e:any)=>e.id===evaluationId);
  return privateJson({ok:true,evaluation});
 }catch(e){return privateJson({error:e instanceof Error?e.message:'평가 확인을 저장하지 못했습니다.'},400)}
},true)}
