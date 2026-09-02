CREATE TABLE IF NOT EXISTS reservations (
  gift_key TEXT PRIMARY KEY,
  cancel_token_hash TEXT NOT NULL UNIQUE,
  created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS anonymous_messages (
  id TEXT PRIMARY KEY,
  body TEXT NOT NULL CHECK (length(body) BETWEEN 1 AND 1200),
  reply_code_hash TEXT NOT NULL UNIQUE,
  reply TEXT,
  created_at INTEGER NOT NULL,
  replied_at INTEGER
);

CREATE INDEX IF NOT EXISTS idx_messages_created_at
ON anonymous_messages(created_at);

PRAGMA optimize;
