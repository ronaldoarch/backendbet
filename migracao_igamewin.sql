-- ============================================
-- Migração: Adicionar suporte ao iGameWin
-- ============================================
-- Execute este script no seu banco de dados MySQL
-- Pode ser executado via MySQL CLI, phpMyAdmin, Adminer, ou qualquer cliente SQL

-- Verificar se as colunas já existem
SELECT 
    COLUMN_NAME,
    DATA_TYPE,
    IS_NULLABLE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'games_keys'
  AND COLUMN_NAME IN ('igamewin_agent_code', 'igamewin_agent_token');

-- Adicionar colunas (se não existirem)
-- Nota: MySQL não suporta IF NOT EXISTS no ALTER TABLE ADD COLUMN
-- Execute manualmente se as colunas não existirem

ALTER TABLE games_keys
ADD COLUMN igamewin_agent_code VARCHAR(255) NULL,
ADD COLUMN igamewin_agent_token VARCHAR(255) NULL;

-- Verificar novamente após adicionar
SELECT 
    COLUMN_NAME,
    DATA_TYPE,
    IS_NULLABLE,
    COLUMN_DEFAULT
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'games_keys'
  AND COLUMN_NAME IN ('igamewin_agent_code', 'igamewin_agent_token');

-- Se você receber erro "Duplicate column name", significa que as colunas já existem
-- Isso é normal e significa que a migração já foi executada anteriormente

