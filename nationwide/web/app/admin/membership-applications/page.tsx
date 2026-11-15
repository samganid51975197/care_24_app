import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { currentActor } from "@/lib/auth";
import MembershipInbox from "./membership-inbox";

export const dynamic = "force-dynamic";

export default async function MembershipApplicationsPage() {
  const incoming = await headers();
  const actor = await currentActor(new Request("http://care24.internal/admin/membership-applications", { headers: { cookie: incoming.get("cookie") || "" } }));
  if (!actor) redirect("/login?next=%2Fadmin%2Fmembership-applications");
  if (actor.status !== "active" || actor.role !== "admin") return <main className="auth-card"><h1>접근할 수 없습니다</h1><p>회원 신청 접수함은 관리자만 조회할 수 있습니다.</p><a href="/">업무 화면으로 돌아가기</a></main>;
  return <MembershipInbox />;
}
