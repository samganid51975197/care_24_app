"use client";

import { useEffect, useRef, useState } from "react";
import { MEMBERSHIP_PRIVACY_NOTICE, MEMBERSHIP_TERMS, MEMBERSHIP_TERMS_VERSION } from "@/lib/membership-terms";

type MemberType = "provider" | "caregiver";
type Stage = "write" | "saved" | "sent" | "complete";
type Fields = { organizationName: string; applicantName: string; phone: string; email: string; serviceArea: string; note: string };
type Saved = { id: number; draftToken: string; status: "saved" | "sent" | "completed"; signatureImage: string; signedAt: string; sentAt?: string | null; completedAt?: string | null };

const STORAGE_KEY = "care24-membership-draft-v1";
const initialFields: Fields = { organizationName: "", applicantName: "", phone: "", email: "", serviceArea: "", note: "" };
const steps = ["안내 확인", "신청서 작성", "전자서명·저장", "협회 보내기", "완료 확인"];

function SignaturePad({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const hasInk = useRef(false);
  useEffect(() => {
    if (!canvas.current) return;
    if (!value) {
      canvas.current.getContext("2d")!.clearRect(0, 0, 900, 220);
      hasInk.current = false;
      return;
    }
    const image = new Image();
    image.onload = () => {
      const context = canvas.current?.getContext("2d");
      if (context) context.drawImage(image, 0, 0, 900, 220);
      hasInk.current = true;
    };
    image.src = value;
  }, [value]);
  function point(event: React.PointerEvent<HTMLCanvasElement>) {
    const element = canvas.current!;
    const rect = element.getBoundingClientRect();
    return { x: (event.clientX - rect.left) * element.width / rect.width, y: (event.clientY - rect.top) * element.height / rect.height };
  }
  function start(event: React.PointerEvent<HTMLCanvasElement>) {
    const element = canvas.current!;
    const context = element.getContext("2d")!;
    const p = point(event);
    drawing.current = true;
    element.setPointerCapture(event.pointerId);
    context.beginPath();
    context.moveTo(p.x, p.y);
  }
  function move(event: React.PointerEvent<HTMLCanvasElement>) {
    if (!drawing.current) return;
    const context = canvas.current!.getContext("2d")!;
    const p = point(event);
    context.lineWidth = 4;
    context.lineCap = "round";
    context.lineJoin = "round";
    context.strokeStyle = "#172531";
    context.lineTo(p.x, p.y);
    context.stroke();
    hasInk.current = true;
  }
  function finish() {
    drawing.current = false;
    if (hasInk.current && canvas.current) onChange(canvas.current.toDataURL("image/png"));
  }
  function clear() {
    const element = canvas.current!;
    element.getContext("2d")!.clearRect(0, 0, element.width, element.height);
    hasInk.current = false;
    onChange("");
  }
  return <div className="membership-signature-pad">
    <canvas ref={canvas} width={900} height={220} aria-label="전자서명 입력란. 손가락, 마우스 또는 펜으로 서명하세요." onPointerDown={start} onPointerMove={move} onPointerUp={finish} onPointerCancel={finish} />
    <div><span>{value ? "전자서명을 입력했습니다." : "이 칸에 직접 서명해 주세요."}</span><button type="button" className="membership-secondary" onClick={clear}>서명 지우기</button></div>
  </div>;
}

export default function MembershipApplication() {
  const [memberType, setMemberType] = useState<MemberType>("provider");
  const [fields, setFields] = useState<Fields>(initialFields);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [signatureImage, setSignatureImage] = useState("");
  const [saved, setSaved] = useState<Saved | null>(null);
  const [stage, setStage] = useState<Stage>("write");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const form = useRef<HTMLFormElement>(null);
  const terms = MEMBERSHIP_TERMS[memberType];

  useEffect(() => {
    let active = true;
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (!stored) return;
    try {
      const credentials = JSON.parse(stored) as { id: number; draftToken: string };
      fetch(`/api/membership-applications?id=${credentials.id}&token=${encodeURIComponent(credentials.draftToken)}`, { cache: "no-store" })
        .then(async (response) => {
          const data = await response.json();
          if (!response.ok) throw new Error(data.error);
          if (!active) return;
          const application = data.application;
          const payload = application.payload;
          setMemberType(application.memberType);
          setFields({ organizationName: payload.organizationName || "", applicantName: payload.applicantName || "", phone: payload.phone || "", email: payload.email || "", serviceArea: payload.serviceArea || "", note: payload.note || "" });
          setPrivacyAccepted(Boolean(payload.privacyAccepted));
          setTermsAccepted(Boolean(payload.termsAccepted));
          setSignatureImage(application.signatureImage);
          setSaved({ id: application.id, draftToken: credentials.draftToken, status: application.status, signatureImage: application.signatureImage, signedAt: application.signedAt, sentAt: application.sentAt, completedAt: application.completedAt });
          setStage(application.status === "saved" ? "saved" : application.status === "sent" ? "sent" : "complete");
        }).catch(() => { if (active) setMessage("저장한 신청서를 불러오지 못했습니다. 협회(간병24) 1600-5197로 문의해 주세요."); });
    } catch {
      sessionStorage.removeItem(STORAGE_KEY);
    }
    return () => { active = false; };
  }, []);

  function update(name: keyof Fields, value: string) {
    setFields((current) => ({ ...current, [name]: value }));
    setSignatureImage("");
  }

  async function saveAndSign() {
    if (!form.current?.reportValidity()) return;
    if (!privacyAccepted || !termsAccepted) { setMessage("개인정보 안내와 회원 의무에 동의해 주세요."); return; }
    if (!signatureImage) { setMessage("전자서명란에 서명해 주세요."); return; }
    setBusy(true); setMessage("");
    try {
      const response = await fetch("/api/membership-applications", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "save", id: saved?.id, draftToken: saved?.draftToken, memberType, payload: { ...fields, privacyAccepted, termsAccepted }, signerName: fields.applicantName, signatureImage }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "신청서를 저장하지 못했습니다.");
      const next: Saved = { id: data.application.id, draftToken: data.draftToken, status: "saved", signatureImage, signedAt: data.application.signedAt };
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ id: next.id, draftToken: next.draftToken }));
      setSaved(next); setStage("saved"); setMessage(data.message);
    } catch (error) { setMessage(error instanceof Error ? error.message : "저장하지 못했습니다."); }
    finally { setBusy(false); }
  }

  async function transition(action: "send" | "confirm") {
    if (!saved) return;
    setBusy(true); setMessage("");
    try {
      const response = await fetch("/api/membership-applications", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action, id: saved.id, draftToken: saved.draftToken }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "처리하지 못했습니다.");
      const next = { ...saved, status: action === "send" ? "sent" as const : "completed" as const, sentAt: action === "send" ? data.sentAt : saved.sentAt, completedAt: action === "confirm" ? data.completedAt : saved.completedAt };
      setSaved(next); setStage(action === "send" ? "sent" : "complete"); setMessage(data.message);
    } catch (error) { setMessage(error instanceof Error ? error.message : "처리하지 못했습니다."); }
    finally { setBusy(false); }
  }

  const activeStep = stage === "write" ? 1 : stage === "saved" ? 2 : stage === "sent" ? 3 : 4;

  return <main className="membership-page">
    <header className="membership-heading"><a href="/login" aria-label="간병24 로그인으로">간병24</a><span>대한노인돌봄서비스협회 회원 신청</span><h1>안내 확인부터 신청 제출까지</h1><p>회원 안내를 읽고 신청서를 작성한 뒤, 전자서명과 전송을 마치면 접수 번호와 완료 확인을 받습니다.</p></header>
    <ol className="membership-progress" aria-label="신청 진행 단계">{steps.map((item, index) => <li key={item} className={index <= activeStep ? "is-current" : ""}><span>{index + 1}</span>{item}</li>)}</ol>
    {stage === "write" && <>
      <section className="membership-type-select" aria-label="회원 유형 선택"><button type="button" className={memberType === "provider" ? "selected" : ""} onClick={() => { setMemberType("provider"); setTermsAccepted(false); setSignatureImage(""); setMessage(""); }}>간병업체·협회 회원</button><button type="button" className={memberType === "caregiver" ? "selected" : ""} onClick={() => { setMemberType("caregiver"); setTermsAccepted(false); setSignatureImage(""); setMessage(""); }}>간병인 회원</button></section>
      <section className="membership-card"><p className="membership-eyebrow">회원 안내</p><h2>{terms.title}</h2><ul>{terms.points.map((point) => <li key={point}>{point}</li>)}</ul><p className="membership-dues"><strong>회비·의무 안내</strong><br/>{terms.dues}</p></section>
      <form className="membership-form" ref={form} onSubmit={(event) => event.preventDefault()}>
        <section className="membership-card"><p className="membership-eyebrow">신청서 작성</p><h2>{memberType === "provider" ? "간병업체 회원가입 신청서" : "간병인 회원가입 신청서"}</h2>
          {memberType === "provider" && <label>간병업체·협회명<input value={fields.organizationName} onChange={(event) => update("organizationName", event.target.value)} maxLength={120} required autoComplete="organization"/></label>}
          <label>{memberType === "provider" ? "대표자 성명" : "간병인 성명"}<input value={fields.applicantName} onChange={(event) => update("applicantName", event.target.value)} maxLength={80} required autoComplete="name"/></label>
          <div className="membership-field-grid"><label>연락처<input type="tel" value={fields.phone} onChange={(event) => update("phone", event.target.value)} maxLength={24} required autoComplete="tel"/></label><label>이메일<input type="email" value={fields.email} onChange={(event) => update("email", event.target.value)} maxLength={254} required autoComplete="email"/></label></div>
          <label>주요 활동 지역<input value={fields.serviceArea} onChange={(event) => update("serviceArea", event.target.value)} maxLength={120} required placeholder="예: 서울특별시, 경기 남부"/></label>
          <label>추가 전달 사항 <span className="membership-optional">선택</span><textarea value={fields.note} onChange={(event) => update("note", event.target.value)} maxLength={1000} rows={3}/></label>
        </section>
        <section className="membership-card"><p className="membership-eyebrow">개인정보 및 회비 확인</p><h2>안내 내용을 확인해 주세요</h2>
          <dl className="membership-privacy"><div><dt>이용 목적</dt><dd>{MEMBERSHIP_PRIVACY_NOTICE.purpose}</dd></div><div><dt>수집 항목</dt><dd>{MEMBERSHIP_PRIVACY_NOTICE.items}</dd></div><div><dt>보관 및 파기</dt><dd>{MEMBERSHIP_PRIVACY_NOTICE.retention}</dd></div><div><dt>문의</dt><dd>대한노인돌봄서비스협회(간병24) · 1600-5197</dd></div></dl>
          <label className="membership-check"><input type="checkbox" checked={privacyAccepted} onChange={(event) => setPrivacyAccepted(event.target.checked)} required/><span>개인정보 수집·이용 안내를 읽었으며, 회원 신청 처리와 연락에 필요한 범위의 수집·이용에 동의합니다.</span></label>
          <label className="membership-check"><input type="checkbox" checked={termsAccepted} onChange={(event) => setTermsAccepted(event.target.checked)} required/><span>{terms.acknowledgement}</span></label>
          <p className="membership-version">안내문 버전 {MEMBERSHIP_TERMS_VERSION} · 회원 신청은 심사 접수이며 승인 완료를 의미하지 않습니다.</p>
        </section>
        <section className="membership-card"><p className="membership-eyebrow">전자서명</p><h2>신청 내용을 확인하고 서명하세요</h2><p>서명자 성명은 신청서 성명과 일치해야 합니다. 서명 이미지, 서명 시각, 안내문 버전이 신청 기록에 함께 저장됩니다.</p><label>전자서명자<input value={fields.applicantName} readOnly aria-readonly="true"/></label><SignaturePad value={signatureImage} onChange={setSignatureImage}/></section>
        {message && <p className="membership-message" role="status">{message}</p>}
        <div className="membership-actions"><button type="button" disabled={busy} onClick={saveAndSign}>{busy ? "저장 중…" : "전자서명하고 저장"}</button><a className="membership-secondary" href="/signup">계정 가입 신청으로 이동</a></div>
      </form>
    </>}
    {stage === "saved" && saved && <section className="membership-card membership-receipt"><p className="membership-eyebrow">전자서명 저장 완료</p><h2>신청서를 확인한 뒤 보내 주세요</h2><p>접수 준비 번호 <strong>회원-{saved.id}</strong></p><dl className="membership-review"><div><dt>회원 유형</dt><dd>{memberType === "provider" ? "간병업체·협회 회원" : "간병인 회원"}</dd></div>{memberType === "provider" && <div><dt>업체명</dt><dd>{fields.organizationName}</dd></div>}<div><dt>신청인</dt><dd>{fields.applicantName}</dd></div><div><dt>연락처·이메일</dt><dd>{fields.phone} · {fields.email}</dd></div><div><dt>활동 지역</dt><dd>{fields.serviceArea}</dd></div><div><dt>회비 안내</dt><dd>{terms.dues}</dd></div></dl><img className="membership-signature-preview" src={saved.signatureImage} alt="저장된 전자서명 미리보기"/><p>서명 시각 {new Date(saved.signedAt).toLocaleString("ko-KR", { timeZone: "Asia/Seoul" })}</p><p>아직 협회(간병24)에 제출되지 않았습니다.</p><div className="membership-actions"><button type="button" disabled={busy} onClick={() => transition("send")}>{busy ? "보내는 중…" : "협회(간병24) 보내기"}</button><button type="button" className="membership-secondary" disabled={busy} onClick={() => { setStage("write"); setMessage("수정 후 전자서명하고 다시 저장해 주세요."); }}>수정하기</button></div>{message && <p role="status">{message}</p>}</section>}
    {stage === "sent" && saved && <section className="membership-card membership-receipt" role="status"><p className="membership-success-mark">✓</p><p className="membership-eyebrow">협회 전송 완료</p><h2>회원 신청이 접수되었습니다</h2><p>접수 번호 <strong>회원-{saved.id}</strong></p><p>{message || "협회(간병24) 관리 접수함으로 전송했습니다."}</p><p>회원 승인은 협회 심사 후 별도로 안내합니다.</p><button type="button" disabled={busy} onClick={() => transition("confirm")}>{busy ? "확인 중…" : "완료 확인"}</button></section>}
    {stage === "complete" && saved && <section className="membership-card membership-receipt" role="status"><p className="membership-success-mark">✓</p><p className="membership-eyebrow">신청 절차 완료</p><h2>접수 확인이 완료되었습니다</h2><p>접수 번호 <strong>회원-{saved.id}</strong></p><p>현재 상태는 회원 승인 대기입니다. 회비 납부와 회원 자격은 협회 심사 후 안내에 따라 진행해 주세요.</p><div className="membership-actions"><a className="membership-secondary" href="/login">로그인 화면으로</a><button type="button" className="membership-secondary" onClick={() => { sessionStorage.removeItem(STORAGE_KEY); setSaved(null); setSignatureImage(""); setFields(initialFields); setPrivacyAccepted(false); setTermsAccepted(false); setStage("write"); setMessage(""); }}>새 신청서 작성</button></div></section>}
    <footer className="membership-footer"><a href="/privacy">개인정보 처리방침</a><span>문의 1600-5197</span></footer>
  </main>;
}
