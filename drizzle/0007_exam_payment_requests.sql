CREATE TABLE exam_payment_requests (
  id TEXT PRIMARY KEY,
  hospital_id TEXT NOT NULL,
  applicant_name TEXT NOT NULL,
  depositor_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  amount INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT '입금 확인 대기',
  created_at TEXT NOT NULL,
  confirmed_at TEXT,
  confirmed_by TEXT
);

CREATE INDEX idx_exam_payment_requests_status_created
  ON exam_payment_requests (status, created_at DESC);
