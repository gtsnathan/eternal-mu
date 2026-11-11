-- Master Reset: depois de 25 Resets o personagem pode fazer um Master Reset
ALTER TABLE characters ADD COLUMN master_resets INTEGER NOT NULL DEFAULT 0;
DROP INDEX IF EXISTS idx_characters_rank;
CREATE INDEX idx_characters_rank ON characters(master_resets DESC, resets DESC, master_level DESC, level DESC);
