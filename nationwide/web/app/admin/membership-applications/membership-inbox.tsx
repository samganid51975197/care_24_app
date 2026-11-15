"use client";

import { useEffect, useState } from "react";

type Application = {
  id: number;
  memberType: "provider" | "caregiver";
  signatureImage: string;
  signerName: string;
  termsVersion: string;
  signedAt: string;
  status: string;
  sentAt: string | null;
  completedAt: string | null;
  payload: { organizationName: string; applicantName: string; phone: string; email: string; serviceArea: string; note: string; termsSnapshot: { title: string; dues: string; points: readonly string[] }; termsAccepted: boolean; privacyAccepted: boolean };
};

const labels: Record<string, string> = { saved: "저장 · 미전송", sent: "협회 접수", completed: "신청자 확인 완료" };

export default function MembershipInbox() {
  const [items, setItems] = useState<Application[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetch("/api/membership-applications", { cache: "no-store" }).then(async (response) => {
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "접수함을 불러오지 못했습니다.");
      setItems(data.applications);
    }).catch((reason) => setError(reason instanceof Error ? reason.message : "접수함을 불러오지 못했습니다.")).finally(() => setLoading(false));
  }, []);
  return <main className="membership-inbox">
    <a href="/admin/central">중앙관리로 돌아가기</a>
    <h1>회원가입 신청 접수함</h1>
    <p>협회 회원 신청서와 전자서명 확인 화면입니다. 이곳의 접수·완료 표시는 회원 승인이나 증명서 발급을 뜻하지 않습니다.</p>
    {loading && <p>신청 내역을 불러오는 중…</p>}
    {error && <p role="alert">{error}</p>}
    {!loading && !error && !items.length && <p>접수된 회원 신청이 없습니다.</p>}
    {items.map((item) => <article className="membership-inbox-card" key={item.id}>
      <header><div><span className="membership-inbox-tag">{item.memberType === "provider" ? "간병업체 회원" : "간병인 회원"}</span><h2>회원-{item.id} · {item.payload.applicantName}</h2><p>{labels[item.status] || item.status} · 안내문 {item.termsVersion}</p></div><time dateTime={item.sentAt || item.signedAt}>{new Date(item.sentAt || item.signedAt).toLocaleString("ko-KR", { timeZone: "Asia/Seoul" })}</time></header>
      <dl><div><dt>업체명</dt><dd>{item.payload.organizationName || "해당 없음"}</dd></div><div><dt>연락처</dt><dd>{item.payload.phone}</dd></div><div><dt>이메일</dt><dd>{item.payload.email}</dd></div><div><dt>활동 지역</dt><dd>{item.payload.serviceArea}</dd></div><div><dt>회비 안내</dt><dd>{item.payload.termsSnapshot.dues}</dd></div><div><dt>추가 전달 사항</dt><dd>{item.payload.note || "없음"}</dd></div></dl>
      <details><summary>서명 및 동의 기록 보기</summary><p>전자서명자: {item.signerName} · 서명 시각: {new Date(item.signedAt).toLocaleString("ko-KR", { timeZone: "Asia/Seoul" })}</p><img className="membership-inbox-signature" src={item.signatureImage} alt={`회원-${item.id} 전자서명`} /><h3>{item.payload.termsSnapshot.title}</h3><ul>{item.payload.termsSnapshot.points.map((point) => <li key={point}>{point}</li>)}</ul><p>개인정보 안내 확인: {item.payload.privacyAccepted ? "동의" : "미확인"} · 회원 안내 확인: {item.payload.termsAccepted ? "동의" : "미확인"}</p></details>
    </article>)}
  </main>;
}
