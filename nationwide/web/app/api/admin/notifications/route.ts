import {withActor,privateJson} from '@/lib/auth';
import {getClient} from '@/db';
import {notificationSettings,saveNotificationSettings,notifyEvent} from '@/lib/notifications.mjs';
export const GET=(req:Request)=>withActor(req,async()=>{const db=getClient(),c=await notificationSettings(db);const logs=await db.execute('SELECT kind,recipient,state,provider_id,created_at FROM notification_outbox ORDER BY created_at DESC LIMIT 50');return privateJson({configured:!!(c.apiKey&&c.apiSecret),enabled:!!c.enabled,participants:!!c.participants,from:c.from||'',manager:c.manager||'',logs:logs.rows});},true);
export const POST=(req:Request)=>withActor(req,async()=>{try{const b=await req.json(),db=getClient();if(b.action==='test')return privateJson(await notifyEvent(db,'test:'+new Date().toISOString().slice(0,16),'test'));await saveNotificationSettings(db,b);return privateJson({ok:true});}catch(e){return privateJson({error:e instanceof Error?e.message:'설정 저장 실패'},400);}},true);
