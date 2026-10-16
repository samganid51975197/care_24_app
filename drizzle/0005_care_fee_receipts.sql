CREATE TABLE care_fee_receipts (
 id TEXT PRIMARY KEY NOT NULL,
 hospital_id TEXT NOT NULL,
 hospital_name TEXT NOT NULL,
 amount INTEGER NOT NULL CHECK(amount > 0),
 reference TEXT NOT NULL DEFAULT '',
 recorded_by TEXT NOT NULL,
 recorded_at TEXT NOT NULL
);
--> statement-breakpoint
CREATE INDEX idx_care_fee_receipts_hospital_time ON care_fee_receipts(hospital_id, recorded_at DESC);