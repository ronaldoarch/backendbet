-- Script para alterar as colunas de imagem da tabela settings para MEDIUMTEXT
-- Execute: mysql -u root -p betgenius < fix_settings_columns.sql

ALTER TABLE settings MODIFY COLUMN software_favicon MEDIUMTEXT NULL;
ALTER TABLE settings MODIFY COLUMN software_logo_white MEDIUMTEXT NULL;
ALTER TABLE settings MODIFY COLUMN software_logo_black MEDIUMTEXT NULL;

