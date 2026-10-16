CREATE TABLE admin_accounts (
 id INTEGER PRIMARY KEY CHECK(id = 1),
 username TEXT NOT NULL UNIQUE,
 password_hash TEXT NOT NULL,
 salt TEXT NOT NULL,
 created_at TEXT NOT NULL
);
--> statement-breakpoint
CREATE TABLE admin_sessions (
 token_hash TEXT PRIMARY KEY NOT NULL,
 expires_at INTEGER NOT NULL
);
--> statement-breakpoint
CREATE INDEX idx_admin_sessions_expiry ON admin_sessions(expires_at);
--> statement-breakpoint
CREATE TABLE admin_login_attempts (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 client_key TEXT NOT NULL,
 attempted_at INTEGER NOT NULL
);
--> statement-breakpoint
CREATE INDEX idx_admin_attempts_client_time ON admin_login_attempts(client_key, attempted_at);
