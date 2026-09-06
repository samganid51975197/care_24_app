CREATE TABLE secure_messages (
  id TEXT PRIMARY KEY NOT NULL,
  reference TEXT NOT NULL UNIQUE,
  sender_user_id TEXT NOT NULL,
  sender_email TEXT NOT NULL,
  hospital_id TEXT NOT NULL,
  hospital_name TEXT NOT NULL,
  recipient TEXT NOT NULL CHECK (recipient IN ('association', 'care24', 'both')),
  category TEXT NOT NULL CHECK (category IN ('건의', '요청', '시정', '개선', '요구', '병원매매', '기타')),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  contact TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT '접수',
  created_at TEXT NOT NULL
);

CREATE INDEX idx_secure_messages_sender_created
ON secure_messages(sender_user_id, created_at DESC);

CREATE TABLE secure_message_audit (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  message_id TEXT NOT NULL,
  actor_user_id TEXT NOT NULL,
  action TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (message_id) REFERENCES secure_messages(id)
);

CREATE INDEX idx_secure_message_audit_message
ON secure_message_audit(message_id, created_at DESC);

PRAGMA optimize;
