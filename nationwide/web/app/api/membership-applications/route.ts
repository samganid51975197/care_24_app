import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import { desc, eq } from "drizzle-orm";
import { getClient, getDb } from "@/db";
import { membershipApplications } from "@/db/schema";
import { AccessError, privateJson, rateLimit, requireOrigin, withActor } from "@/lib/auth";
import { MEMBERSHIP_PRIVACY_NOTICE, MEMBERSHIP_TERMS, MEMBERSHIP_TERMS_VERSION } from "@/lib/membership-terms";
import { clientRateKey, trustedClientIp } from "@/lib/public-care-request-access.mjs";

export const runtime = "nodejs";
const tableReady = `CREATE TABLE IF NOT EXISTS membership_applications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  member_type TEXT NOT NULL,
  application_payload TEXT NOT NULL,
  signature_image TEXT NOT NULL,
  signer_name TEXT NOT NULL,
  terms_version TEXT NOT NULL,
  signed_at TEXT NOT NULL,
  draft_token_hash TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'saved',
  sent_at TEXT,
  completed_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
)`;
const sha256 = (value: string) => createHash("sha256").update(value).digest("hex");
const maxBodyLength = 300_000;

async function ensureTable() {
  await getClient().execute(tableReady);
}

function fail(message: string, status = 400): never {
  throw new AccessError(status, message);
}

function clean(value: unknown, max: number) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function validatedPayload(body: Record<string, unknown>) {
  const memberType = body.memberType === "provider" || body.memberType === "caregiver" ? body.memberType : "";
  if (!memberType) fail("회원 유형을 선택해 주세요.");
  const input = (body.payload && typeof body.payload === "object" ? body.payload : {}) as Record<string, unknown>;
  const payload = {
    memberType,
    organizationName: clean(input.organizationName, 120),
    applicantName: clean(input.applicantName, 80),
    phone: clean(input.phone, 24),
    email: clean(input.email, 254).toLowerCase(),
    serviceArea: clean(input.serviceArea, 120),
    note: clean(input.note, 1000),
    privacyAccepted: input.privacyAccepted === true,
    termsAccepted: input.termsAccepted === true,
  };
  if (memberType === "provider" && !payload.organizationName) fail("간병업체·협회명을 입력해 주세요.");
  if (!payload.applicantName || payload.applicantName.length < 2) fail("대표자 또는 간병인 성명을 입력해 주세요.");
  if (!/^[0-9+()\-\s]{8,24}$/.test(payload.phone)) fail("연락처를 확인해 주세요.");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)) fail("회신받을 이메일 주소를 확인해 주세요.");
  if (!payload.serviceArea) fail("주요 활동 지역을 입력해 주세요.");
  if (!payload.privacyAccepted) fail("개인정보 수집·이용 안내를 확인하고 동의해 주세요.");
  if (!payload.termsAccepted) fail("회원 안내와 회비 의무 확인에 동의해 주세요.");
  return payload;
}

function validatedSignature(body: Record<string, unknown>, applicantName: string) {
  const signerName = clean(body.signerName, 80);
  const signatureImage = typeof body.signatureImage === "string" ? body.signatureImage : "";
  if (signerName !== applicantName) fail("서명자 성명은 신청인 성명과 같아야 합니다.");
  if (!/^data:image\/png;base64,[A-Za-z0-9+/=]{80,180000}$/.test(signatureImage)) fail("서명란에 전자서명을 작성해 주세요.");
  return { signerName, signatureImage };
}

async function handlePost(req: Request) {
  requireOrigin(req);
  const raw = await req.text();
  if (raw.length > maxBodyLength) fail("신청서가 너무 큽니다.", 413);
  const body = JSON.parse(raw) as Record<string, unknown>;
  await ensureTable();
  const rateKey = clientRateKey(trustedClientIp(req), process.env.CARE24_REQUEST_ACCESS_PEPPER || "");
  await rateLimit(`membership-applications:${rateKey}`, 20, 60 * 60 * 1000);

  if (body.action === "save") {
    const payload = validatedPayload(body);
    const { signerName, signatureImage } = validatedSignature(body, payload.applicantName);
    const signedAt = new Date().toISOString();
    const terms = MEMBERSHIP_TERMS[payload.memberType];
    const applicationPayload = JSON.stringify({
      ...payload,
      termsSnapshot: { version: MEMBERSHIP_TERMS_VERSION, ...terms },
      privacySnapshot: MEMBERSHIP_PRIVACY_NOTICE,
    });
    const existingId = Number(body.id || 0);
    const existingToken = clean(body.draftToken, 128);
    if (existingId) {
      if (!Number.isSafeInteger(existingId) || existingId <= 0 || !/^[A-Za-z0-9_-]{40,60}$/.test(existingToken)) fail("저장한 신청서 정보를 확인해 주세요.");
      const [existing] = await getDb().select().from(membershipApplications).where(eq(membershipApplications.id, existingId)).limit(1);
      if (!existing || !timingSafeEqual(Buffer.from(existing.draftTokenHash), Buffer.from(sha256(existingToken)))) fail("신청서를 찾을 수 없거나 접근 정보가 올바르지 않습니다.", 404);
      if (existing.status !== "saved") fail("전송 또는 완료한 신청서는 수정할 수 없습니다.", 409);
      const [updated] = await getDb().update(membershipApplications).set({ memberType: payload.memberType, applicationPayload, signatureImage, signerName, termsVersion: MEMBERSHIP_TERMS_VERSION, signedAt }).where(eq(membershipApplications.id, existingId)).returning({ id: membershipApplications.id, status: membershipApplications.status, signedAt: membershipApplications.signedAt });
      return privateJson({ application: updated, draftToken: existingToken, message: "수정한 신청서와 새 전자서명을 저장했습니다." });
    }
    const draftToken = randomBytes(32).toString("base64url");
    const [application] = await getDb().insert(membershipApplications).values({
      memberType: payload.memberType,
      applicationPayload,
      signatureImage,
      signerName,
      termsVersion: MEMBERSHIP_TERMS_VERSION,
      signedAt,
      draftTokenHash: sha256(draftToken),
      status: "saved",
    }).returning({ id: membershipApplications.id, status: membershipApplications.status, signedAt: membershipApplications.signedAt });
    return privateJson({ application, draftToken, message: "서명한 신청서를 임시 저장했습니다. 내용을 확인한 뒤 협회(간병24)에 보내 주세요." }, 201);
  }

  const id = Number(body.id);
  const draftToken = clean(body.draftToken, 128);
  if (!Number.isSafeInteger(id) || id <= 0 || !/^[A-Za-z0-9_-]{40,60}$/.test(draftToken)) fail("저장한 신청서 정보를 확인해 주세요.");
  const [application] = await getDb().select().from(membershipApplications).where(eq(membershipApplications.id, id)).limit(1);
  if (!application || !timingSafeEqual(Buffer.from(application.draftTokenHash), Buffer.from(sha256(draftToken)))) fail("신청서를 찾을 수 없거나 접근 정보가 올바르지 않습니다.", 404);
  if (body.action === "send") {
    if (application.status !== "saved") fail("이미 협회(간병24)에 전송했거나 완료한 신청서입니다.", 409);
    const sentAt = new Date().toISOString();
    await getDb().update(membershipApplications).set({ status: "sent", sentAt }).where(eq(membershipApplications.id, id));
    return privateJson({ applicationId: id, status: "sent", sentAt, message: "신청서를 협회(간병24) 관리 접수함에 보냈습니다." });
  }
  if (body.action === "confirm") {
    if (application.status !== "sent") fail("전송 완료 상태의 신청서만 확인할 수 있습니다.", 409);
    const completedAt = new Date().toISOString();
    await getDb().update(membershipApplications).set({ status: "completed", completedAt }).where(eq(membershipApplications.id, id));
    return privateJson({ applicationId: id, status: "completed", completedAt, message: "제출 완료를 확인했습니다. 회원 승인 결과는 협회(간병24)의 별도 심사 후 안내됩니다." });
  }
  fail("지원하지 않는 처리입니다.");
}

async function adminList(req: Request) {
  return withActor(req, async () => {
    await ensureTable();
    const applications = await getDb().select().from(membershipApplications).orderBy(desc(membershipApplications.id)).limit(200);
    return privateJson({ applications: applications.map((item) => {
      const { applicationPayload, draftTokenHash, ...record } = item;
      return { ...record, payload: JSON.parse(applicationPayload) };
    }) });
  }, true);
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const id = Number(url.searchParams.get("id"));
  const token = url.searchParams.get("token") || "";
  if (url.searchParams.has("id") || url.searchParams.has("token")) {
    try {
      if (!Number.isSafeInteger(id) || id <= 0 || !/^[A-Za-z0-9_-]{40,60}$/.test(token)) fail("저장한 신청서 정보를 확인해 주세요.");
      await ensureTable();
      const rateKey = clientRateKey(trustedClientIp(req), process.env.CARE24_REQUEST_ACCESS_PEPPER || "");
      await rateLimit(`membership-application-draft-read:${rateKey}`, 120, 60 * 60 * 1000);
      const [application] = await getDb().select().from(membershipApplications).where(eq(membershipApplications.id, id)).limit(1);
      if (!application || !timingSafeEqual(Buffer.from(application.draftTokenHash), Buffer.from(sha256(token)))) fail("신청서를 찾을 수 없습니다.", 404);
      return privateJson({ application: { id: application.id, memberType: application.memberType, payload: JSON.parse(application.applicationPayload), signatureImage: application.signatureImage, signerName: application.signerName, termsVersion: application.termsVersion, signedAt: application.signedAt, status: application.status, sentAt: application.sentAt, completedAt: application.completedAt } });
    } catch (error) {
      return privateJson({ error: error instanceof AccessError ? error.message : "저장한 신청서를 불러오지 못했습니다." }, error instanceof AccessError ? error.status : 500);
    }
  }
  return adminList(req);
}

export async function POST(req: Request) {
  try {
    return await handlePost(req);
  } catch (error) {
    return privateJson({ error: error instanceof AccessError ? error.message : "회원 신청서를 처리하지 못했습니다." }, error instanceof AccessError ? error.status : 500);
  }
}
