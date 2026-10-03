import {getDb,getClient} from '@/db';
import {careRequests} from '@/db/schema';
import {withActor,privateJson,scope} from '@/lib/auth';
import {readWorkflow} from '@/lib/care-workflow.mjs';
export async function GET(req:Request){return withActor(req,async actor=>{
  const records=await getDb().select().from(careRequests).where(scope(careRequests,actor));
  const entries=await Promise.all(records.map(async r=>{
    const w=await readWorkflow(getClient(),r.id);
    const caregiver=w.applications.find((a:any)=>a.profileId===w.selected);
    return {id:r.id,building:r.building,floor:r.floorName,ward:r.ward,room:r.room,patient:r.patientName,caregiver:caregiver?.name||'미배정'};
  }));
  return privateJson({entries});
});}
