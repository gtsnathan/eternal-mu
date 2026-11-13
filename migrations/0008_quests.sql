-- Missões da Capitã Lyra: guarda a missão ativa do personagem ({"id":"q_...","have":N})
ALTER TABLE characters ADD COLUMN quest TEXT NOT NULL DEFAULT '';
