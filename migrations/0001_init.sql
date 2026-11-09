CREATE TABLE accounts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL UNIQUE COLLATE NOCASE,
  email TEXT NOT NULL UNIQUE COLLATE NOCASE,
  pass_hash TEXT NOT NULL,
  terms_at INTEGER NOT NULL,
  created_at INTEGER NOT NULL
);
CREATE TABLE sessions (
  token_hash TEXT PRIMARY KEY,
  account_id INTEGER NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  expires_at INTEGER NOT NULL,
  created_at INTEGER NOT NULL
);
CREATE INDEX idx_sessions_account ON sessions(account_id);
CREATE TABLE rate_limits (
  key TEXT PRIMARY KEY,
  count INTEGER NOT NULL,
  window_start INTEGER NOT NULL
);
CREATE TABLE characters (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  account_id INTEGER NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  name TEXT NOT NULL UNIQUE COLLATE NOCASE,
  class TEXT NOT NULL,
  hair_color INTEGER NOT NULL,
  hair_style INTEGER NOT NULL,
  level INTEGER NOT NULL DEFAULT 1,
  xp INTEGER NOT NULL DEFAULT 0 CHECK (xp >= 0),
  points INTEGER NOT NULL DEFAULT 0 CHECK (points >= 0),
  str INTEGER NOT NULL, agi INTEGER NOT NULL, vit INTEGER NOT NULL, ene INTEGER NOT NULL,
  hp INTEGER NOT NULL, mp INTEGER NOT NULL,
  gold INTEGER NOT NULL DEFAULT 0 CHECK (gold >= 0),
  map TEXT NOT NULL, x REAL NOT NULL, y REAL NOT NULL,
  created_at INTEGER NOT NULL
);
CREATE INDEX idx_characters_account ON characters(account_id);
CREATE TABLE items (
  id TEXT PRIMARY KEY,
  char_id INTEGER NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  item_key TEXT NOT NULL,
  qty INTEGER NOT NULL CHECK (qty > 0),
  slot INTEGER NOT NULL,
  equip TEXT,
  rarity INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX idx_items_char ON items(char_id);
CREATE UNIQUE INDEX idx_items_slot ON items(char_id, slot) WHERE equip IS NULL;
CREATE UNIQUE INDEX idx_items_equip ON items(char_id, equip) WHERE equip IS NOT NULL;
CREATE TABLE item_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  char_id INTEGER NOT NULL,
  action TEXT NOT NULL,
  item_id TEXT,
  item_key TEXT,
  qty INTEGER NOT NULL DEFAULT 0,
  gold_delta INTEGER NOT NULL DEFAULT 0,
  at INTEGER NOT NULL
);
CREATE INDEX idx_item_log_char ON item_log(char_id);
