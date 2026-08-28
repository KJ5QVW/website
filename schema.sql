CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    excerpt TEXT,
    content TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    published INTEGER NOT NULL DEFAULT 1
);

CREATE INDEX IF NOT EXISTS idx_posts_created_at
ON posts(created_at);
