import {getDb} from '../../../db';
import {documentBundles} from '../../../db/schema';
import {scopedId,withActor} from '../../../lib/auth';
import {privateBucket} from '../../../lib/private-storage';
export const GET=(req:Request)=>withActor(req,async actor=>{
 const url=new URL(req.url),id=Number(url.searchParams.get('id')),key=url.searchParams.get('key')||'';
 const [row]=await getDb().select().from(documentBundles).where(scopedId(documentBundles,id,actor)).limit(1);
 if(!row||!JSON.parse(row.attachments).some((a:{storageKey:string})=>a.storageKey===key))return new Response('Not found',{status:404});
 const object=await privateBucket.get(key);if(!object)return new Response('Not found',{status:404});
 return new Response(new Uint8Array(object.body),{headers:{'Content-Type':'application/octet-stream','Content-Disposition':'attachment','X-Content-Type-Options':'nosniff','Cache-Control':'no-store'}});
});
