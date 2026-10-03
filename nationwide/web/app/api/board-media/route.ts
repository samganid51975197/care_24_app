import {getDb} from '../../../db';
import {boardPosts} from '../../../db/schema';
import {scope,withActor} from '../../../lib/auth';
import {privateBucket} from '../../../lib/private-storage';
export const GET=(req:Request)=>withActor(req,async actor=>{
 const key=new URL(req.url).searchParams.get('key')||'';
 const rows=await getDb().select({attachments:boardPosts.attachments}).from(boardPosts).where(scope(boardPosts,actor));
 if(!rows.some(row=>JSON.parse(row.attachments).some((a:{storageKey:string})=>a.storageKey===key)))return new Response('Not found',{status:404});
 const object=await privateBucket.get(key);if(!object)return new Response('Not found',{status:404});
 const headers=new Headers({'Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Content-Security-Policy':"sandbox; default-src 'none'"});object.writeHttpMetadata(headers);
 if(headers.get('content-type')==='image/svg+xml')headers.set('Content-Disposition','attachment');
 return new Response(new Uint8Array(object.body),{headers});
});
