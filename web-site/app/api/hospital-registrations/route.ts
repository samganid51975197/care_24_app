import {getClient} from '@/db';
import {AccessError,withActor,privateJson} from '@/lib/auth';
import {listRegistrations,changeRegistration,RegistrationError} from '@/lib/hospital-registration.mjs';
export const GET=(req:Request)=>withActor(req,async actor=>{
 const db=getClient();const registrations=await listRegistrations(db,actor);
 const hospitals=await db.execute(actor.role==='hospital'?{sql:'SELECT id,name FROM auth_hospitals WHERE id=? ORDER BY name',args:[actor.hospitalId||'']}:'SELECT id,name FROM auth_hospitals ORDER BY name');
 return privateJson({registrations,hospitals:hospitals.rows,role:actor.role});
});
export const POST=(req:Request)=>withActor(req,async actor=>{
 try{return privateJson({ok:true,...await changeRegistration(getClient(),actor,await req.json())});}
 catch(e){if(e instanceof RegistrationError)throw new AccessError(e.status,e.message);throw e;}
});
