-- ============================================
-- BANCO DE DADOS COMPLETO - BETGENIUS
-- ============================================
-- Importe este arquivo no phpMyAdmin da Hostinger
-- ============================================

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";

-- ============================================
-- TABELA: providers
-- ============================================
CREATE TABLE IF NOT EXISTS `providers` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `code` VARCHAR(50) NOT NULL UNIQUE,
  `name` VARCHAR(255) NOT NULL,
  `rtp` BIGINT DEFAULT 0,
  `cover` VARCHAR(255) NULL,
  `status` TINYINT(1) DEFAULT 1,
  `distribution` VARCHAR(50) NULL,
  `views` BIGINT DEFAULT 0,
  `created_at` TIMESTAMP NULL,
  `updated_at` TIMESTAMP NULL,
  INDEX `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABELA: categories
-- ============================================
CREATE TABLE IF NOT EXISTS `categories` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `slug` VARCHAR(255) NOT NULL UNIQUE,
  `description` TEXT NULL,
  `status` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP NULL,
  `updated_at` TIMESTAMP NULL,
  INDEX `idx_status` (`status`),
  INDEX `idx_slug` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABELA: games
-- ============================================
CREATE TABLE IF NOT EXISTS `games` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `provider_id` INT UNSIGNED NOT NULL,
  `game_server_url` VARCHAR(255) NULL,
  `game_id` VARCHAR(255) NOT NULL COMMENT 'ID do jogo no provedor',
  `game_name` VARCHAR(255) NOT NULL,
  `game_code` VARCHAR(255) NOT NULL UNIQUE,
  `game_type` VARCHAR(100) NULL,
  `description` TEXT NULL,
  `cover` TEXT NULL COMMENT 'Caminho da imagem ou base64',
  `status` TINYINT(1) DEFAULT 1 COMMENT '1=ativo, 0=inativo',
  `technology` VARCHAR(50) NULL,
  `has_lobby` TINYINT(1) DEFAULT 0,
  `is_mobile` TINYINT(1) DEFAULT 0,
  `has_freespins` TINYINT(1) DEFAULT 0,
  `has_tables` TINYINT(1) DEFAULT 0,
  `only_demo` TINYINT(1) DEFAULT 0,
  `rtp` BIGINT DEFAULT 0 COMMENT 'RTP em porcentagem',
  `distribution` VARCHAR(50) NOT NULL COMMENT 'Nome do provedor',
  `views` BIGINT DEFAULT 0,
  `is_featured` BOOLEAN DEFAULT FALSE,
  `show_home` BOOLEAN DEFAULT FALSE,
  `original` TINYINT(1) DEFAULT 0,
  `created_at` TIMESTAMP NULL,
  `updated_at` TIMESTAMP NULL,
  FOREIGN KEY (`provider_id`) REFERENCES `providers`(`id`) ON DELETE CASCADE,
  INDEX `idx_status` (`status`),
  INDEX `idx_provider` (`provider_id`),
  INDEX `idx_featured` (`is_featured`),
  INDEX `idx_distribution` (`distribution`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABELA: category_games (Pivot)
-- ============================================
CREATE TABLE IF NOT EXISTS `category_games` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `category_id` INT UNSIGNED NOT NULL,
  `game_id` BIGINT UNSIGNED NOT NULL,
  `created_at` TIMESTAMP NULL,
  `updated_at` TIMESTAMP NULL,
  FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`game_id`) REFERENCES `games`(`id`) ON DELETE CASCADE,
  UNIQUE KEY `unique_category_game` (`category_id`, `game_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABELA: users
-- ============================================
CREATE TABLE IF NOT EXISTS `users` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `phone` VARCHAR(15) NOT NULL,
  `password` VARCHAR(255) NOT NULL,
  `avatar` VARCHAR(255) NULL,
  `banned` TINYINT(1) DEFAULT 0,
  `inviter_code` VARCHAR(50) NULL,
  `affiliate_code` VARCHAR(50) NULL UNIQUE,
  `created_at` TIMESTAMP NULL,
  `updated_at` TIMESTAMP NULL,
  INDEX `idx_email` (`email`),
  INDEX `idx_affiliate_code` (`affiliate_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABELA: wallets
-- ============================================
CREATE TABLE IF NOT EXISTS `wallets` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `user_id` BIGINT UNSIGNED NOT NULL UNIQUE,
  `balance` DECIMAL(15,2) DEFAULT 0.00 COMMENT 'Saldo principal',
  `balance_bonus` DECIMAL(15,2) DEFAULT 0.00 COMMENT 'Saldo bônus',
  `balance_withdrawal` DECIMAL(15,2) DEFAULT 0.00 COMMENT 'Saldo disponível para saque',
  `created_at` TIMESTAMP NULL,
  `updated_at` TIMESTAMP NULL,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABELA: games_keys
-- ============================================
CREATE TABLE IF NOT EXISTS `games_keys` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `playfiver_token` VARCHAR(255) NULL,
  `playfiver_secret` VARCHAR(255) NULL,
  `playfiver_code` VARCHAR(255) NULL,
  `callback_url` VARCHAR(500) NULL,
  `rtp` DECIMAL(5,2) DEFAULT 93.00,
  `limit_amount` DECIMAL(10,2) DEFAULT 100.00,
  `limit_hours` INT DEFAULT 1,
  `limit_enable` BOOLEAN DEFAULT FALSE,
  `bonus_enable` BOOLEAN DEFAULT FALSE,
  `created_at` TIMESTAMP NULL,
  `updated_at` TIMESTAMP NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABELA: orders
-- ============================================
CREATE TABLE IF NOT EXISTS `orders` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `session_id` VARCHAR(255) NULL,
  `transaction_id` VARCHAR(255) NOT NULL UNIQUE,
  `game` VARCHAR(255) NOT NULL,
  `game_uuid` VARCHAR(255) NULL,
  `type` ENUM('bet', 'win', 'refund') NOT NULL,
  `type_money` ENUM('balance', 'balance_bonus', 'balance_withdrawal') NOT NULL,
  `amount` DECIMAL(15,2) NOT NULL,
  `providers` VARCHAR(50) NOT NULL,
  `refunded` BOOLEAN DEFAULT FALSE,
  `round_id` VARCHAR(255) NULL,
  `status` BOOLEAN DEFAULT TRUE,
  `created_at` TIMESTAMP NULL,
  `updated_at` TIMESTAMP NULL,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  INDEX `idx_user` (`user_id`),
  INDEX `idx_transaction` (`transaction_id`),
  INDEX `idx_round` (`round_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABELA: game_favorites
-- ============================================
CREATE TABLE IF NOT EXISTS `game_favorites` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `game_id` BIGINT UNSIGNED NOT NULL,
  `created_at` TIMESTAMP NULL,
  `updated_at` TIMESTAMP NULL,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`game_id`) REFERENCES `games`(`id`) ON DELETE CASCADE,
  UNIQUE KEY `unique_user_game` (`user_id`, `game_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABELA: game_likes
-- ============================================
CREATE TABLE IF NOT EXISTS `game_likes` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `game_id` BIGINT UNSIGNED NOT NULL,
  `created_at` TIMESTAMP NULL,
  `updated_at` TIMESTAMP NULL,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`game_id`) REFERENCES `games`(`id`) ON DELETE CASCADE,
  UNIQUE KEY `unique_user_game` (`user_id`, `game_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABELA: settings
-- ============================================
CREATE TABLE IF NOT EXISTS `settings` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `software_name` VARCHAR(255) NULL,
  `software_description` TEXT NULL,
  `software_favicon` MEDIUMTEXT NULL,
  `software_logo_white` MEDIUMTEXT NULL,
  `software_logo_black` MEDIUMTEXT NULL,
  `loading_banner` MEDIUMTEXT NULL,
  `created_at` TIMESTAMP NULL,
  `updated_at` TIMESTAMP NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABELA: custom_layouts
-- ============================================
CREATE TABLE IF NOT EXISTS `custom_layouts` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `primary_color` VARCHAR(50) NULL,
  `secondary_color` VARCHAR(50) NULL,
  `created_at` TIMESTAMP NULL,
  `updated_at` TIMESTAMP NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABELA: banners
-- ============================================
CREATE TABLE IF NOT EXISTS `banners` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `link` VARCHAR(255) NULL,
  `image` MEDIUMTEXT NOT NULL,
  `type` VARCHAR(20) DEFAULT 'home',
  `description` TEXT NULL,
  `status` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP NULL,
  `updated_at` TIMESTAMP NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- INSERIR DADOS INICIAIS
-- ============================================

-- Inserir registro inicial em games_keys
INSERT INTO `games_keys` (`playfiver_token`, `playfiver_secret`, `playfiver_code`, `callback_url`, `rtp`, `limit_amount`, `limit_hours`, `limit_enable`, `bonus_enable`, `created_at`, `updated_at`)
VALUES ('test', 'test', 'test', 'https://betgeniusbr.com/playfiver/callback', 93.00, 100.00, 1, FALSE, FALSE, NOW(), NOW())
ON DUPLICATE KEY UPDATE `updated_at` = NOW();

-- Inserir registro inicial em settings
INSERT INTO `settings` (`software_name`, `software_description`, `created_at`, `updated_at`)
VALUES ('BetGenius', 'Plataforma de jogos online', NOW(), NOW())
ON DUPLICATE KEY UPDATE `updated_at` = NOW();

-- Inserir registro inicial em custom_layouts
INSERT INTO `custom_layouts` (`primary_color`, `secondary_color`, `created_at`, `updated_at`)
VALUES ('#6366f1', '#8b5cf6', NOW(), NOW())
ON DUPLICATE KEY UPDATE `updated_at` = NOW();

-- ============================================
-- FIM DO SCRIPT
-- ============================================

