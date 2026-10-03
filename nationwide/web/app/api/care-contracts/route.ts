import {withActor,scope,scopedId,ownership,workflowGuard,type Actor} from "../../../lib/auth";
import { desc, eq, sql } from "drizzle-orm";
import { getDb } from "../../../db";
import { careContracts } from "../../../db/schema";
const required = [
  "contractType",
  "employerName",
  "employerPhone",
  "caregiverName",
  "caregiverPhone",
  "patientName",
  "workplace",
  "workStart",
  "workEnd",
  "workHours",
  "salaryPeriod",
  "payDate",
  "bankName",
  "bankAccount",
  "bankHolder",
  "socialInsurance",
  "retirementPension",
  "employerSignature",
  "caregiverSignature",
  "signedAt",
] as const;
function valid(b: Record<string, any>) {
  const basic = required.every((k) => String(b[k] || "").trim());
  const pay =
    b.contractType === "개인간병 근로계약서"
      ? b.private24Salary || b.privateDay12Salary || b.privateNight12Salary || b.privateHourlySalary
      : b.fullTimeSalary || b.twoShiftSalary || b.threeShiftSalary;
  return basic && String(pay || "").trim();
}
function workflow(action: string) {
  return {
    status:
      action === "complete"
        ? "completed"
        : action === "confirm"
          ? "confirmed"
          : action === "send"
            ? "sent"
            : "saved",
    sentTargets: action === "save" ? "" : "간호사실 · 협회 · 간병24",
    confirmedAt:
      action === "confirm" || action === "complete"
        ? sql`CURRENT_TIMESTAMP`
        : null,
    completedAt: action === "complete" ? sql`CURRENT_TIMESTAMP` : null,
  };
}
function values(b: Record<string, any>) {
  return {
    contractType: b.contractType,
    employerName: b.employerName,
    employerPhone: b.employerPhone,
    employerAddress: b.employerAddress || "",
    caregiverName: b.caregiverName,
    caregiverPhone: b.caregiverPhone,
    caregiverAddress: b.caregiverAddress || "",
    caregiverHandwriting: b.caregiverHandwriting || "",
    patientName: b.patientName,
    workplace: b.workplace,
    workStart: b.workStart,
    workEnd: b.workEnd,
    workHours: b.workHours,
    salaryAmount: b.contractType === "개인간병 근로계약서" ? (b.private24Salary || b.privateDay12Salary || b.privateNight12Salary || b.privateHourlySalary || "") : (b.salaryAmount || ""),
    salaryPeriod: b.salaryPeriod,
    fullTimeSalary: b.fullTimeSalary || "",
    twoShiftSalary: b.twoShiftSalary || "",
    threeShiftSalary: b.threeShiftSalary || "",
    private24Salary: b.private24Salary || "",
    privateDay12Salary: b.privateDay12Salary || "",
    privateNight12Salary: b.privateNight12Salary || "",
    privateHourlySalary: b.privateHourlySalary || "",
    payDate: b.payDate,
    bankName: b.bankName,
    bankAccount: b.bankAccount,
    bankHolder: b.bankHolder,
    socialInsurance: b.socialInsurance,
    retirementPension: b.retirementPension,
    benefitNote: b.benefitNote || "",
    topCount: String(b.topCount || "0"),
    bottomCount: String(b.bottomCount || "0"),
    apronCount: String(b.apronCount || "0"),
    shoesCount: String(b.shoesCount || "0"),
    nameTagCount: String(b.nameTagCount || "0"),
    employerSignature: b.employerSignature,
    caregiverSignature: b.caregiverSignature,
    signedAt: b.signedAt,
    ...workflow(String(b.action || "save")),
  };
}
async function handleGET(req:Request, actor:Actor) {
  try {
    return Response.json({
      contracts: await getDb()
        .select()
        .from(careContracts)
        .where(scope(careContracts,actor))
        .orderBy(desc(careContracts.id))
        .limit(100),
    });
  } catch {
    return Response.json(
      { error: "계약서 접수함을 불러올 수 없습니다." },
      { status: 500 },
    );
  }
}
async function handlePOST(req:Request, actor:Actor) {
  try {
    const b = (await req.json()) as Record<string, any>;
    if (!valid(b))
      return Response.json(
        { error: "필수 계약 항목과 간병비를 작성해주세요." },
        { status: 400 },
      );
    const [x] = await getDb()
      .insert(careContracts)
      .values({...values(b),duties:"",...ownership(actor)})
      .returning();
    return Response.json({ contract: x }, { status: 201 });
  } catch {
    return Response.json(
      { error: "계약서 저장 중 문제가 발생했습니다." },
      { status: 500 },
    );
  }
}
async function handlePATCH(req:Request, actor:Actor) {
  try {
    const b = (await req.json()) as Record<string, any>,
      id = Number(b.id);
    if (!id || !valid(b))
      return Response.json(
        { error: "필수 계약 항목과 간병비를 작성해주세요." },
        { status: 400 },
      );
    const [x] = await getDb()
      .update(careContracts)
      .set(values(b))
      .where(scopedId(careContracts,id,actor))
      .returning();
    return x
      ? Response.json({ contract: x })
      : Response.json({ error: "계약서를 찾을 수 없습니다." }, { status: 404 });
  } catch {
    return Response.json(
      { error: "계약서 처리 중 문제가 발생했습니다." },
      { status: 500 },
    );
  }
}

export const GET=(req:Request)=>withActor(req,async(actor)=>{await workflowGuard(req,actor);return handleGET(req,actor);});
export const POST=(req:Request)=>withActor(req,async(actor)=>{await workflowGuard(req,actor);return handlePOST(req,actor);});
export const PATCH=(req:Request)=>withActor(req,async(actor)=>{await workflowGuard(req,actor);return handlePATCH(req,actor);});
