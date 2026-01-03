-- Script para adicionar colunas de imagem na tabela settings
-- Execute: mysql -u root -p betgenius < add_settings_columns.sql

-- Adicionar coluna software_favicon se não existir
ALTER TABLE settings 
ADD COLUMN IF NOT EXISTS software_favicon MEDIUMTEXT NULL;

-- Alterar colunas existentes para MEDIUMTEXT se já existirem
ALTER TABLE settings 
MODIFY COLUMN software_logo_white MEDIUMTEXT NULL;

ALTER TABLE settings 
MODIFY COLUMN software_logo_black MEDIUMTEXT NULL;

