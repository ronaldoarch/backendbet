-- Script para adicionar campos à tabela games_keys
-- Execute: mysql -u root -p betgenius < update_games_keys_final.sql

-- Adicionar campos se não existirem (MySQL não suporta IF NOT EXISTS em ALTER TABLE, então usamos procedimento)
DELIMITER $$

DROP PROCEDURE IF EXISTS AddColumnIfNotExists$$
CREATE PROCEDURE AddColumnIfNotExists(
    IN tableName VARCHAR(128),
    IN columnName VARCHAR(128),
    IN columnDefinition TEXT
)
BEGIN
    DECLARE columnExists INT DEFAULT 0;
    
    SELECT COUNT(*) INTO columnExists
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = tableName
      AND COLUMN_NAME = columnName;
    
    IF columnExists = 0 THEN
        SET @sql = CONCAT('ALTER TABLE ', tableName, ' ADD COLUMN ', columnName, ' ', columnDefinition);
        PREPARE stmt FROM @sql;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
    END IF;
END$$

DELIMITER ;

-- Adicionar campos
CALL AddColumnIfNotExists('games_keys', 'rtp', 'DECIMAL(5,2) DEFAULT 93.00');
CALL AddColumnIfNotExists('games_keys', 'limit_amount', 'DECIMAL(10,2) DEFAULT 100.00');
CALL AddColumnIfNotExists('games_keys', 'limit_hours', 'INT DEFAULT 1');
CALL AddColumnIfNotExists('games_keys', 'limit_enable', 'BOOLEAN DEFAULT FALSE');
CALL AddColumnIfNotExists('games_keys', 'bonus_enable', 'BOOLEAN DEFAULT FALSE');

-- Limpar procedimento
DROP PROCEDURE IF EXISTS AddColumnIfNotExists;


