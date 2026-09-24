import {getClient} from '@/db';
import {withActor,privateJson} from '@/lib/auth';
import {listNotices,changeNotice} from '@/lib/payment-notices.mjs';
export const GET=(req:Request)=>withActor(req,async actor=>privateJson(await listNotices(getClient(),actor)),true);
export const POST=(req:Request)=>withActor(req,async actor=>{try{return privateJson(await changeNotice(getClient(),actor,await req.json()));}catch(e){return privateJson({error:e instanceof Error?e.message:'입금 통보 처리 실패'},400);}},true);
