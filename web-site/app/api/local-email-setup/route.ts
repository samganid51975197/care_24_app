import {readFile,writeFile} from "node:fs/promises";
import {join} from "node:path";
import {AccessError,privateJson,requireOrigin} from "@/lib/auth";

export const runtime="nodejs";
const configuredKeys=["CARE24_EMAIL_API_KEY","CARE24_EMAIL_FROM","CARE24_ADMIN_RECOVERY_EMAIL"];
export async function POST(req:Request){try{
  requireOrigin(req);
  if(!["127.0.0.1","localhost"].includes(new URL(req.url).hostname))throw new AccessError(403,"로컬 설정 화면에서만 사용할 수 있습니다.");
  const body=await req.json(),apiKey=String(body.apiKey||"").trim(),from=String(body.from||"").trim(),email=String(body.email||"").trim();
  if(!apiKey||!from||!/^.+@.+\..+$/.test(email))throw new AccessError(400,"API 키, 발신 이메일, 관리자 이메일을 모두 입력해 주세요.");
  const envPath=join(process.cwd(),".env.local");
  let existing="";try{existing=await readFile(envPath,"utf8");}catch{}
  const kept=existing.split(/\r?\n/).filter(line=>!configuredKeys.some(key=>line.startsWith(`${key}=`)));
  const content=[...kept.filter(Boolean),"# Resend 이메일 인증 설정",`CARE24_EMAIL_API_KEY=${apiKey}`,`CARE24_EMAIL_FROM=${from}`,`CARE24_ADMIN_RECOVERY_EMAIL=${email}`,""].join("\n");
  await writeFile(envPath,content,{encoding:"utf8",mode:0o600});
  process.env.CARE24_EMAIL_API_KEY=apiKey;process.env.CARE24_EMAIL_FROM=from;process.env.CARE24_ADMIN_RECOVERY_EMAIL=email;
  return privateJson({ok:true});
}catch(e){return privateJson({error:e instanceof AccessError?e.message:"이메일 설정을 저장하지 못했습니다."},e instanceof AccessError?e.status:500);}}