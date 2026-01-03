-- Script simples para atualizar a tabela games_keys
-- Execute: mysql -u root -p betgenius < update_games_keys_simple.sql

ALTER TABLE games_keys 
ADD COLUMN IF NOT EXISTS rtp DECIMAL(5,2) DEFAULT 93.00,
ADD COLUMN IF NOT EXISTS limit_amount DECIMAL(10,2) DEFAULT 100.00,
ADD COLUMN IF NOT EXISTS limit_hours INT DEFAULT 1,
ADD COLUMN IF NOT EXISTS limit_enable BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS bonus_enable BOOLEAN DEFAULT FALSE;


