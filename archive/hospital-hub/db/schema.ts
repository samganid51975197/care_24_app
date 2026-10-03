// Production schema contract for the secure hospital message service.
// The corresponding immutable D1 migration is drizzle/0001_secure_messages.sql.
export type SecureMessage = {
  id: string;
  reference: string;
  senderUserId: string;
  senderEmail: string;
  hospitalId: string;
  hospitalName: string;
  recipient: "association" | "care24" | "both";
  category: "건의" | "요청" | "시정" | "개선" | "요구" | "병원매매" | "기타";
  title: string;
  body: string;
  contact: string;
  status: "접수" | "검토중" | "완료";
  createdAt: string;
};

export type CareBoardSchedule = { start_date: string; start_time: string; end_date: string | null; end_time: string | null };

export type AdminAccount = { id: 1; username: string; password_hash: string; salt: string; created_at: string };
export type AdminSession = { token_hash: string; expires_at: number };
