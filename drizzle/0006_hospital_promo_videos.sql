CREATE TABLE hospital_promo_videos (
  id TEXT PRIMARY KEY,
  hospital_id TEXT NOT NULL,
  hospital_name TEXT NOT NULL,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  created_by TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE INDEX idx_hospital_promo_videos_hospital_created
  ON hospital_promo_videos (hospital_id, created_at DESC);
