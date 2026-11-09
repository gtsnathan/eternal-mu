ALTER TABLE characters ADD COLUMN resets INTEGER NOT NULL DEFAULT 0;
ALTER TABLE characters ADD COLUMN master_level INTEGER NOT NULL DEFAULT 0;
ALTER TABLE characters ADD COLUMN master_xp INTEGER NOT NULL DEFAULT 0;
ALTER TABLE characters ADD COLUMN master_points INTEGER NOT NULL DEFAULT 0;
ALTER TABLE characters ADD COLUMN master_tree TEXT;
CREATE INDEX idx_characters_rank ON characters(resets DESC, master_level DESC, level DESC);
