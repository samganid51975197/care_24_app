import {getDb} from '@/db';
import {careRequests} from '@/db/schema';
import {and,eq} from 'drizzle-orm';
import {withActor,privateJson} from '@/lib/auth';
import {canEditRequest,requestForEditor,requestEditChanges} from '@/lib/care-request-edit.mjs';
type Context={params:Promise<{id:string}>};
export async function GET(req:Request,c:Context){return withActor(req,async actor=>{
 const id=Number((await c.params).id);if(!Number.isSafeInteger(id)||id<=0)return privateJson({error:'의뢰번호를 확인하세요.'},400);
 const [row]=await getDb().select().from(careRequests).where(eq(careRequests.id,id));
 if(!row)return privateJson({error:'의뢰를 찾을 수 없습니다.'},404);
 if(!canEditRequest(actor,row))return privateJson({error:'작성자와 협회 관리자만 수정할 수 있습니다.'},403);
 return privateJson({id,request:requestForEditor(row,actor),contactHidden:actor.role!=='admin'});
})}
export async function PATCH(req:Request,c:Context){return withActor(req,async actor=>{
 const id=Number((await c.params).id);if(!Number.isSafeInteger(id)||id<=0)return privateJson({error:'의뢰번호를 확인하세요.'},400);
 const db=getDb(),[row]=await db.select().from(careRequests).where(eq(careRequests.id,id));
 if(!row)return privateJson({error:'의뢰를 찾을 수 없습니다.'},404);
 if(!canEditRequest(actor,row))return privateJson({error:'작성자와 협회 관리자만 수정할 수 있습니다.'},403);
 let changes;try{changes=requestEditChanges(await req.json(),row,actor)}catch(e){return privateJson({error:e instanceof Error?e.message:'입력 내용을 확인하세요.'},400)}
 const result=await db.update(careRequests).set(changes).where(and(eq(careRequests.id,id),actor.role==='admin'?undefined:eq(careRequests.ownerUserId,actor.id))).returning({id:careRequests.id});
 if(!result.length)return privateJson({error:'수정 권한이 변경되었습니다.'},403);
 return privateJson({id,publicStatus:'수정·공개 완료'});
})}
