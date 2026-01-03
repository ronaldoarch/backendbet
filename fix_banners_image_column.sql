-- Script para alterar a coluna image da tabela banners para TEXT
-- Execute: mysql -u root -p betgenius < fix_banners_image_column.sql

ALTER TABLE banners MODIFY COLUMN image TEXT NOT NULL;


