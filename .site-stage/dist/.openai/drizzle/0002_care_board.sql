CREATE TABLE care_board_requests (
 reference TEXT PRIMARY KEY NOT NULL,
 message_id TEXT NOT NULL UNIQUE REFERENCES secure_messages(id),
 hospital_id TEXT NOT NULL,
 building TEXT NOT NULL,
 floor TEXT NOT NULL,
 room TEXT NOT NULL,
 bed TEXT NOT NULL DEFAULT '',
 start_date TEXT NOT NULL,
 start_time TEXT NOT NULL
);
CREATE INDEX idx_care_board_hospital ON care_board_requests(hospital_id, start_date, start_time);
