import {requiresPrivateAdmin,nonAdminResponse} from "./admin-privacy.mjs";
import { and, eq } from "drizzle-orm";
import {recordScope} from './hospital-scope.mjs';
export {hospitalFilter} from './hospital-scope.mjs';
import { getClient } from "../db";
import { tokenHash } from "./auth-crypto.mjs";
export type Actor = { id: string; username: string; name: string; role: "admin" | "hospital" | "caregiver"; hospitalId: string | null; contextHospitalId?:string; legacyHospital?:boolean; status: string };
export const cookieName = "care24_session";
export class AccessError extends Error { constructor(public status: number, message: string) { super(message); } }
export function requireOrigin(req: Request) {
  if (!process.env.CARE24_ORIGIN || req.headers.get("origin") !== process.env.CARE24_ORIGIN) throw new AccessError(403, "잘못된 요청 출처입니다.");
}
export function sessionCookie(token: string, clear = false) {
  return `${cookieName}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${clear ? 0 : 28800}${process.env.CARE24_ORIGIN?.startsWith("https:") ? "; Secure" : ""}`;
}
export function readToken(req: Request) { return (req.headers.get("cookie") || "").split(";").map(x => x.trim()).find(x => x.startsWith(`${cookieName}=`))?.slice(cookieName.length + 1) || ""; }
export async function currentActor(req: Request): Promise<Actor | null> {
  const token = readToken(req);
  if (!/^[A-Za-z0-9_-]{43}$/.test(token)) return null;
  const result = await getClient().execute({ sql: `SELECT u.id,u.username,u.name,u.role,u.hospital_id AS hospitalId,u.status FROM auth_sessions s JOIN auth_users u ON u.id=s.user_id WHERE s.token_hash=? AND s.expires_at>?`, args: [tokenHash(token), Date.now()] });
  return result.rows[0] as unknown as Actor || null;
}
export function privateJson(data: unknown, status = 200, headers: Record<string,string> = {}) { return Response.json(data, {status, headers: {"Cache-Control":"no-store", ...headers}}); }
export async function withActor(req: Request, handler: (actor: Actor) => Promise<Response>, admin = false) {
  try {
    if (req.method !== "GET") requireOrigin(req);
    const actor = await currentActor(req);
    if (!actor) throw new AccessError(401, "로그인이 필요합니다.");
    if (actor.status !== "active") throw new AccessError(403, "관리자 승인 후 이용할 수 있습니다.");
    if (admin && actor.role !== "admin") throw new AccessError(403, "관리자만 이용할 수 있습니다.");
    const privacyPath=decodeURIComponent(new URL(req.url).pathname).toLowerCase().replace(/\/$/,'');
    if(actor.role!=='admin'){
      const privacyBody=['/api/care-workflow','/api/care-requests'].includes(privacyPath)&&req.method!=='GET'?await req.clone().json():{};
      if(requiresPrivateAdmin(privacyPath,req.method,privacyBody))throw new AccessError(403,'개인정보·간병비·계약서는 관리자만 작성·조회·수정할 수 있습니다.');
    }
    const hospital=new URL(req.url).searchParams.get('hospital');
    if(hospital){const {resolveHospital}=await import('./hospital-context');actor.contextHospitalId=await resolveHospital(hospital,actor,req.method!=='GET');actor.legacyHospital=hospital==='snubh';}
    let response = await handler(actor);
    if(actor.role!=="admin"&&req.method==="GET"&&response.ok&&["/api/care-requests","/api/care-workflow","/api/hospital-registrations"].includes(privacyPath)){response=privateJson(nonAdminResponse(privacyPath,await response.json()),response.status);}
    response.headers.set("Cache-Control", "no-store");
    return response;
  } catch(e) { return privateJson({error: e instanceof AccessError ? e.message : "요청을 처리하지 못했습니다."}, e instanceof AccessError ? e.status : 500); }
}
export function scope(table: any, actor: Actor) {
  return recordScope(table,actor);
}
export function scopedId(table: any, id: number, actor: Actor) { return and(eq(table.id,id),scope(table,actor)); }
export function ownership(actor: Actor) { return {ownerUserId: actor.id, hospitalId: actor.contextHospitalId||actor.hospitalId}; }
export async function workflowGuard(req: Request, actor: Actor) {
  if (req.method === "GET" || actor.role !== "caregiver") return;
  const body = req.headers.get("content-type")?.includes("multipart/form-data") ? Object.fromEntries(await req.clone().formData()) : await req.clone().json();
  if (["confirm","complete"].includes(String(body.action))) throw new AccessError(403, "담당자 확인은 병원 담당자 또는 관리자만 할 수 있습니다.");
}
export async function rateLimit(key: string, max: number, windowMs = 900000) {
  const start = Math.floor(Date.now()/windowMs)*windowMs;
  const result = await getClient().execute({sql: `INSERT INTO auth_limits (key,window_start,count) VALUES(?,?,1) ON CONFLICT(key) DO UPDATE SET count=CASE WHEN window_start=excluded.window_start THEN count+1 ELSE 1 END,window_start=excluded.window_start RETURNING count`,args:[key,start]});
  if (Number(result.rows[0].count)>max) throw new AccessError(429,"요청이 많습니다. 잠시 후 다시 시도해 주세요.");
}
