CREATE TABLE parties (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  leader_char INTEGER NOT NULL,
  mode INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL
);
CREATE TABLE party_members (
  char_id INTEGER PRIMARY KEY REFERENCES characters(id) ON DELETE CASCADE,
  party_id INTEGER NOT NULL REFERENCES parties(id) ON DELETE CASCADE,
  name TEXT NOT NULL
);
CREATE INDEX idx_party_members_party ON party_members(party_id);
