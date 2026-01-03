-- Script para atualizar a tabela games_keys com novos campos
-- Execute este script se a tabela já existir

ALTER TABLE games_keys 
ADD COLUMN IF NOT EXISTS rtp DECIMAL(5,2) DEFAULT 93.00,
ADD COLUMN IF NOT EXISTS limit_amount DECIMAL(10,2) DEFAULT 100.00,
ADD COLUMN IF NOT EXISTS limit_hours INT DEFAULT 1,
ADD COLUMN IF NOT EXISTS limit_enable BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS bonus_enable BOOLEAN DEFAULT FALSE;


