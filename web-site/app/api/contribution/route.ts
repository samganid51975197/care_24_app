import {getClient} from '@/db';
import {withActor,privateJson} from '@/lib/auth';
import {paymentSummary,recordPayment} from '@/lib/contribution-ledger.mjs';
export async function GET(req:Request){return withActor(req,async actor=>{if(actor.role!=='admin')return privateJson({admin:false,restricted:true});const db=getClient();const summary=await paymentSummary(db);const entries=actor.role==='admin'?(await db.execute('SELECT id,reference,kind,amount,payment_id,paid_on FROM care_payments ORDER BY created_at DESC')).rows:undefined;return privateJson({...summary,admin:actor.role==='admin',entries});})}
export async function POST(req:Request){return withActor(req,async actor=>{try{const input=await req.json();if(input.confirmed!==true)return privateJson({error:'실제 입금·환불 확인이 필요합니다.'},400);await recordPayment(getClient(),input,actor.id);return privateJson({ok:true},201)}catch(e){return privateJson({error:e instanceof Error?e.message:'등록하지 못했습니다.'},400)}},true)}
