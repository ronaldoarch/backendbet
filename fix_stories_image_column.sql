-- Script SQL para corrigir a coluna image da tabela stories
-- Execute este comando diretamente no banco de dados

ALTER TABLE stories 
MODIFY COLUMN image MEDIUMTEXT NULL COMMENT 'Imagem do story (base64 ou URL)';

