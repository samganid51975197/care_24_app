import {getDb,getClient} from '@/db';
import {careRequests} from '@/db/schema';
import {withActor,privateJson} from '@/lib/auth';
import {ensureWorkflow} from '@/lib/care-workflow.mjs';
import {decryptText} from '@/lib/data-crypto.mjs';
import {centralSummary} from '@/lib/central-summary.mjs';
import catalog from '@/lib/hospital-catalog.json';
export async function GET(req:Request){return withActor(req,async()=>{
 const client=getClient();await ensureWorkflow(client);
 const [requests,workflows,hospitals]=await Promise.all([
 getDb().select({id:careRequests.id,hospitalId:careRequests.hospitalId,status:careRequests.status,careFee:careRequests.careFee,feePeriod:careRequests.feePeriod}).from(careRequests),
 client.execute('SELECT request_id,payload FROM care_workflows'),client.execute('SELECT id,name FROM auth_hospitals')]);
 const byId=new Map(workflows.rows.map(w=>[Number(w.request_id),JSON.parse(decryptText(w.payload,'care_workflows.'+w.request_id))]));
 return privateJson({...centralSummary(requests,byId,hospitals.rows,catalog),updatedAt:new Date().toISOString(),banks:[{label:"협회 중앙회 계좌",bank:"우리은행",account:"1005-804-669803",holder:"대한노인돌봄서비스협회(중앙회)"},{label:"간병24 계좌",bank:"우리은행",account:"1005-304-803945",holder:"간병24"}]});
 },true);}