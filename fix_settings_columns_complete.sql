-- Script completo para adicionar/alterar colunas de imagem na tabela settings
-- Execute: mysql -u root -p betgenius < fix_settings_columns_complete.sql

-- Verificar e adicionar software_favicon se não existir
SET @dbname = DATABASE();
SET @tablename = 'settings';
SET @columnname = 'software_favicon';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (TABLE_SCHEMA = @dbname)
      AND (TABLE_NAME = @tablename)
      AND (COLUMN_NAME = @columnname)
  ) > 0,
  'SELECT 1',
  CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN ', @columnname, ' MEDIUMTEXT NULL')
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Alterar colunas existentes para MEDIUMTEXT
ALTER TABLE settings MODIFY COLUMN software_logo_white MEDIUMTEXT NULL;
ALTER TABLE settings MODIFY COLUMN software_logo_black MEDIUMTEXT NULL;

