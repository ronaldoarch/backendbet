-- ============================================
-- Migração iGameWin para Railway MySQL
-- ============================================
-- Execute este SQL no Railway Dashboard > Query Editor
-- Ou via MySQL CLI conectando ao Railway

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
-- Nota: Se receber erro "Duplicate column name", significa que já existem
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

-- Ver estrutura completa da tabela (opcional)
-- DESCRIBE games_keys;

