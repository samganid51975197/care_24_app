import {getClient} from '@/db';
import {AccessError,withActor,privateJson} from '@/lib/auth';
import {ensureWardAssignments,unpackWard,saveWardBed,WardError} from '@/lib/ward-assignments.mjs';
export const GET=(req:Request)=>withActor(req,async actor=>{
 if(!['admin','hospital'].includes(actor.role))throw new AccessError(403,'침상 배정은 관리자와 해당 병원 담당자만 이용할 수 있습니다.');
 const db=getClient(),q=new URL(req.url).searchParams;
 const hospitals=await db.execute(actor.role==='admin'?'SELECT id,name FROM auth_hospitals ORDER BY name':{sql:'SELECT id,name FROM auth_hospitals WHERE id=?',args:[actor.hospitalId||'']});
 if(q.get("hospitalName"))hospitals.rows=hospitals.rows.filter(h=>h.name===q.get("hospitalName"));
 const hospitalId=q.get('hospitalId')||String(hospitals.rows[0]?.id||'');
 if(!hospitals.rows.some(h=>h.id===hospitalId))return privateJson({hospitals:hospitals.rows,rooms:[],hospitalId:''});
 await ensureWardAssignments(db);
 const rows=await db.execute({sql:'SELECT * FROM ward_assignments WHERE hospital_id=? AND building=? AND ward=? ORDER BY room',args:[hospitalId,q.get('building')||'',q.get('ward')||'']});
 return privateJson({hospitals:hospitals.rows,hospitalId,rooms:rows.rows.map(unpackWard)});
});
export const POST=(req:Request)=>withActor(req,async actor=>{
 try{return privateJson({room:await saveWardBed(getClient(),actor,await req.json())});}
 catch(e){if(e instanceof WardError)throw new AccessError(e.status,e.message);throw e;}
});

