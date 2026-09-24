import {publicCareText,maskPatientName} from "@/lib/admin-privacy.mjs";
import {requestBoardStatus} from "@/lib/request-board-status.mjs";
import {withActor,hospitalFilter,scope,scopedId,ownership,workflowGuard,type Actor} from "../../../lib/auth";
import { and, asc, desc, eq, inArray } from "drizzle-orm";
import { getDb, getClient } from "../../../db";
import { applications, careRequests } from "../../../db/schema";

import {ensureWorkflow} from "../../../lib/care-workflow.mjs";
const maskName = (name: string) => name.length < 2 ? "비공개" : `${name[0]}${"○".repeat(Math.max(1, name.length - 1))}`;
const contractNumber = (id: number, createdAt: string) => `CR-${createdAt.slice(0, 10).replaceAll("-", "")}-${String(id).padStart(5, "0")}`;

async function handleGET(req:Request, actor:Actor) {
  try {
    const db = getDb();
    const [allRequests, profiles] = await Promise.all([
      db.select().from(careRequests).where(actor.role==='caregiver'?and(eq(careRequests.publicConsent,"동의"),hospitalFilter(careRequests,actor)):scope(careRequests,actor)).orderBy(asc(careRequests.id)).limit(1000),
      db.select({ id: applications.id, applicantName: applications.applicantName, applicantGender: applications.applicantGender, careerYears: applications.careerYears, qualification: applications.qualification, preferredDate: applications.preferredDate, status: applications.status }).from(applications).where(scope(applications,actor)).orderBy(desc(applications.id)).limit(100),
    ]);
    const now = new Date(), dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime(), day = 86400000;
    const starts: Record<string, number> = { day: dayStart, week: dayStart - 6 * day, month: new Date(now.getFullYear(), now.getMonth(), 1).getTime(), year: new Date(now.getFullYear(), 0, 1).getTime() };
    await ensureWorkflow(getClient());
    const workflowRows=await getClient().execute('SELECT request_id,payload FROM care_workflows');
    const {decryptText}=await import('../../../lib/data-crypto.mjs');
    const workflows=new Map(workflowRows.rows.map(row=>[Number(row.request_id),JSON.parse(decryptText(row.payload,'care_workflows.'+row.request_id))]));
    const boardStatus=(item:typeof allRequests[number])=>requestBoardStatus(item,workflows.get(item.id));
    const stats = Object.fromEntries(Object.entries(starts).map(([key, start]) => {
      const rows = allRequests.filter((item) => new Date(item.createdAt.replace(" ", "T") + "Z").getTime() >= start);
      return [key, { total: rows.length, matched: rows.filter((item) => boardStatus(item) === "matched").length }];
    }));
    const progress=workflowRows.rows.filter(row=>{
      if(actor.contextHospitalId&&!allRequests.some(r=>r.id===Number(row.request_id)))return false;
      if(actor.role==='admin'||allRequests.some(r=>r.id===Number(row.request_id)&&r.ownerUserId===actor.id))return true;
      const w=JSON.parse(decryptText(row.payload,'care_workflows.'+row.request_id));
      return w.applications.some((a:any)=>a.ownerId===actor.id);
    }).map(row=>({id:Number(row.request_id),status:'진행'}));
    return Response.json({progress,
      requests: allRequests.map((item) => ({
        id: item.id,
        contractNumber: contractNumber(item.id, item.createdAt),
        canPrepareContract: actor.role==='admin'||item.ownerUserId===actor.id,
        building: actor.role==="admin"?item.building:publicCareText(item.building,[item.patientName,item.requesterName,item.requesterPhone,item.room]),
        floorName: item.floorName || "미입력",
        ward: actor.role==="admin"?item.ward:publicCareText(item.ward,[item.patientName,item.requesterName,item.requesterPhone,item.room]),
        patientGender: item.patientGender,
        patientAge: item.patientAge,
        patientWeight: item.patientWeight,
        patientName: maskPatientName(item.patientName),
        diagnosis: actor.role==="admin"?item.diagnosis:publicCareText(item.diagnosis,[item.patientName,item.requesterName,item.requesterPhone,item.room]),
        patientCondition: [actor.role==="admin"?item.patientCondition:publicCareText(item.patientCondition,[item.patientName,item.requesterName,item.requesterPhone,item.room]), item.patientAge && `${item.patientAge}세`, item.patientWeight && `${item.patientWeight}kg`].filter(Boolean).join(" · "),
        precautions: actor.role==="admin"?item.precautions:publicCareText(item.precautions,[item.patientName,item.requesterName,item.requesterPhone,item.room]),
        specialNotes: actor.role==="admin"?item.specialNotes:publicCareText(item.specialNotes,[item.patientName,item.requesterName,item.requesterPhone,item.room]),
        desiredGender: item.desiredGender,
        desiredNationality: item.desiredNationality,
        desiredExpertise: actor.role==="admin"?item.desiredExpertise:publicCareText(item.desiredExpertise,[item.patientName,item.requesterName,item.requesterPhone,item.room]),
        desiredAge: item.desiredAge,
        desiredPersonality: actor.role==="admin"?item.desiredPersonality:publicCareText(item.desiredPersonality,[item.patientName,item.requesterName,item.requesterPhone,item.room]),
        desiredOther: actor.role==="admin"?item.desiredOther:publicCareText(item.desiredOther,[item.patientName,item.requesterName,item.requesterPhone,item.room]),
        status: boardStatus(item),
      })),
      profiles: profiles.map((profile) => ({
        id: profile.id,
        applicantName: maskName(profile.applicantName),
        applicantGender: profile.applicantGender,
        careerYears: profile.careerYears,
        qualification: profile.qualification,
        preferredDate: profile.preferredDate,
      })), stats,
    });
  } catch {
    return Response.json({ error: "실시간 간병 매칭 현황을 불러올 수 없습니다." }, { status: 500 });
  }
}

async function handlePOST(req:Request, actor:Actor) {
  try {
    const body = await req.json() as Record<string, unknown>;
    if(actor.role!=="admin"&&["careFee","feePeriod","paymentMethod","paymentDue","contractNote","contractVersion","contractSignedAt"].some(key=>String(body[key]||"").trim()))return Response.json({error:"간병비·계약금액은 관리자만 입력할 수 있습니다."},{status:403});
    const required = ["requesterName", "requesterPhone", "patientName", "patientGender", "patientAge", "patientWeight", "diagnosis", "patientCondition", "building", "floorName", "ward", "careType", "startDate"];
    if (!required.every((key) => String(body[key] || "").trim())) return Response.json({ error: "필수 의뢰 항목을 모두 작성해 주세요." }, { status: 400 });
    if (String(body.publicConsent) !== "동의") return Response.json({ error: "민감정보 공개 동의가 필요합니다." }, { status: 400 });

    if(body.patientBirthYear && (!/^\d{4}$/.test(String(body.patientBirthYear)) || Number(body.patientBirthYear)>new Date().getFullYear() || Number(body.patientBirthYear)<new Date().getFullYear()-120)) return Response.json({error:"출생연도를 확인하세요."},{status:400});
    const room = String(body.roomStatus) === "emergency_waiting" ? "응급실 대기 중 (병실 미배정·간병인 미지정)" : String(body.room || "");
    if (!room.trim()) return Response.json({ error: "병실을 입력하거나 응급실 대기 중을 선택해 주세요." }, { status: 400 });
    const [request] = await getDb().insert(careRequests).values({
      ...ownership(actor), requesterName: String(body.requesterName), requesterPhone: String(body.requesterPhone), patientName: String(body.patientName), patientGender: String(body.patientGender), patientAge: String(body.patientAge), patientBirthYear: String(body.patientBirthYear || ""), patientWeight: String(body.patientWeight), diagnosis: String(body.diagnosis), patientCondition: String(body.patientCondition), precautions: String(body.precautions || ""), specialNotes: String(body.specialNotes || ""), publicConsent: "동의", building: String(body.building), floorName: String(body.floorName), ward: String(body.ward), room, careType: String(body.careType), startDate: String(body.startDate), requestNote: String(body.requestNote || ""), serviceSchedule: String(body.serviceSchedule || ""), serviceStartTime: String(body.serviceStartTime || ""), serviceEndTime: String(body.serviceEndTime || ""), restTime: String(body.restTime || "상호 협의"), holidayTerms: String(body.holidayTerms || "상호 협의"), careFee: String(body.careFee || ""), feePeriod: String(body.feePeriod || ""), paymentMethod: String(body.paymentMethod || ""), paymentDue: String(body.paymentDue || ""), serviceScope: String(body.serviceScope || ""), cancellationTerms: String(body.cancellationTerms || ""), contractNote: String(body.contractNote || ""), requesterSignature: String(body.requesterSignature || ""), contractConsent: "미동의", contractVersion: "", contractSignedAt: "", desiredGender: String(body.desiredGender || "무관"), desiredNationality: String(body.desiredNationality || "무관"), desiredExpertise: String(body.desiredExpertise || "무관"), desiredAge: String(body.desiredAge || "무관"), desiredPersonality: String(body.desiredPersonality || "무관"), desiredOther: String(body.desiredOther || ""), status: "requesting",
    }).returning();
    return Response.json({id:request.id, publicStatus:"공개 완료"}, { status: 201 });
  } catch {
    return Response.json({ error: "간병 의뢰를 저장하지 못했습니다." }, { status: 500 });
  }
}

async function handlePATCH(req:Request, actor:Actor){return Response.json({error:"의뢰번호를 클릭하고 신청서 저장·보내기와 협회 진행 화면을 이용하세요."},{status:409})}

export const GET=(req:Request)=>withActor(req,async(actor)=>{await workflowGuard(req,actor);return handleGET(req,actor);});
export const POST=(req:Request)=>withActor(req,async(actor)=>{await workflowGuard(req,actor);return handlePOST(req,actor);});
export const PATCH=(req:Request)=>withActor(req,async(actor)=>{await workflowGuard(req,actor);return handlePATCH(req,actor);});
