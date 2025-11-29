-- ============================================
-- BANCO DE DADOS COMPLETO - BETGENIUS (PostgreSQL)
-- ============================================
-- Execute este script no SQL Editor do Supabase
-- ============================================

-- Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABELA: providers
-- ============================================
CREATE TABLE IF NOT EXISTS providers (
  id SERIAL PRIMARY KEY,
  code VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  rtp BIGINT DEFAULT 0,
  cover VARCHAR(255) NULL,
  status BOOLEAN DEFAULT TRUE,
  distribution VARCHAR(50) NULL,
  views BIGINT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_providers_status ON providers(status);

-- ============================================
-- TABELA: categories
-- ============================================
CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  description TEXT NULL,
  status BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_categories_status ON categories(status);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);

-- ============================================
-- TABELA: games
-- ============================================
CREATE TABLE IF NOT EXISTS games (
  id BIGSERIAL PRIMARY KEY,
  provider_id INTEGER NOT NULL,
  game_server_url VARCHAR(255) NULL,
  game_id VARCHAR(255) NOT NULL,
  game_name VARCHAR(255) NOT NULL,
  game_code VARCHAR(255) NOT NULL UNIQUE,
  game_type VARCHAR(100) NULL,
  description TEXT NULL,
  cover TEXT NULL,
  status BOOLEAN DEFAULT TRUE,
  technology VARCHAR(50) NULL,
  has_lobby BOOLEAN DEFAULT FALSE,
  is_mobile BOOLEAN DEFAULT FALSE,
  has_freespins BOOLEAN DEFAULT FALSE,
  has_tables BOOLEAN DEFAULT FALSE,
  only_demo BOOLEAN DEFAULT FALSE,
  rtp BIGINT DEFAULT 0,
  distribution VARCHAR(50) NOT NULL,
  views BIGINT DEFAULT 0,
  is_featured BOOLEAN DEFAULT FALSE,
  show_home BOOLEAN DEFAULT FALSE,
  original BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_games_provider FOREIGN KEY (provider_id) REFERENCES providers(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_games_status ON games(status);
CREATE INDEX IF NOT EXISTS idx_games_provider ON games(provider_id);
CREATE INDEX IF NOT EXISTS idx_games_featured ON games(is_featured);
CREATE INDEX IF NOT EXISTS idx_games_distribution ON games(distribution);

-- ============================================
-- TABELA: category_games (Pivot)
-- ============================================
CREATE TABLE IF NOT EXISTS category_games (
  id BIGSERIAL PRIMARY KEY,
  category_id INTEGER NOT NULL,
  game_id BIGINT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_category_games_category FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
  CONSTRAINT fk_category_games_game FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE,
  CONSTRAINT unique_category_game UNIQUE (category_id, game_id)
);

-- ============================================
-- TABELA: users
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  phone VARCHAR(15) NOT NULL,
  password VARCHAR(255) NOT NULL,
  avatar VARCHAR(255) NULL,
  banned BOOLEAN DEFAULT FALSE,
  inviter_code VARCHAR(50) NULL,
  affiliate_code VARCHAR(50) NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_affiliate_code ON users(affiliate_code);

-- ============================================
-- TABELA: wallets
-- ============================================
CREATE TABLE IF NOT EXISTS wallets (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL UNIQUE,
  balance NUMERIC(15,2) DEFAULT 0.00,
  balance_bonus NUMERIC(15,2) DEFAULT 0.00,
  balance_withdrawal NUMERIC(15,2) DEFAULT 0.00,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_wallets_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================
-- TABELA: games_keys
-- ============================================
CREATE TABLE IF NOT EXISTS games_keys (
  id SERIAL PRIMARY KEY,
  playfiver_token VARCHAR(255) NULL,
  playfiver_secret VARCHAR(255) NULL,
  playfiver_code VARCHAR(255) NULL,
  callback_url VARCHAR(500) NULL,
  rtp NUMERIC(5,2) DEFAULT 93.00,
  limit_amount NUMERIC(10,2) DEFAULT 100.00,
  limit_hours INTEGER DEFAULT 1,
  limit_enable BOOLEAN DEFAULT FALSE,
  bonus_enable BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TABELA: orders
-- ============================================
CREATE TYPE order_type AS ENUM ('bet', 'win', 'refund');
CREATE TYPE money_type AS ENUM ('balance', 'balance_bonus', 'balance_withdrawal');

CREATE TABLE IF NOT EXISTS orders (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL,
  session_id VARCHAR(255) NULL,
  transaction_id VARCHAR(255) NOT NULL UNIQUE,
  game VARCHAR(255) NOT NULL,
  game_uuid VARCHAR(255) NULL,
  type order_type NOT NULL,
  type_money money_type NOT NULL,
  amount NUMERIC(15,2) NOT NULL,
  providers VARCHAR(50) NOT NULL,
  refunded BOOLEAN DEFAULT FALSE,
  round_id VARCHAR(255) NULL,
  status BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_orders_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_transaction ON orders(transaction_id);
CREATE INDEX IF NOT EXISTS idx_orders_round ON orders(round_id);

-- ============================================
-- TABELA: game_favorites
-- ============================================
CREATE TABLE IF NOT EXISTS game_favorites (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL,
  game_id BIGINT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_game_favorites_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_game_favorites_game FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE,
  CONSTRAINT unique_user_game_favorite UNIQUE (user_id, game_id)
);

-- ============================================
-- TABELA: game_likes
-- ============================================
CREATE TABLE IF NOT EXISTS game_likes (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL,
  game_id BIGINT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_game_likes_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_game_likes_game FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE,
  CONSTRAINT unique_user_game_like UNIQUE (user_id, game_id)
);

-- ============================================
-- TABELA: settings
-- ============================================
CREATE TABLE IF NOT EXISTS settings (
  id SERIAL PRIMARY KEY,
  software_name VARCHAR(255) NULL,
  software_description TEXT NULL,
  software_favicon TEXT NULL,
  software_logo_white TEXT NULL,
  software_logo_black TEXT NULL,
  loading_banner TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TABELA: custom_layouts
-- ============================================
CREATE TABLE IF NOT EXISTS custom_layouts (
  id SERIAL PRIMARY KEY,
  primary_color VARCHAR(50) NULL,
  secondary_color VARCHAR(50) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TABELA: banners
-- ============================================
CREATE TABLE IF NOT EXISTS banners (
  id SERIAL PRIMARY KEY,
  link VARCHAR(255) NULL,
  image TEXT NOT NULL,
  type VARCHAR(20) DEFAULT 'home',
  description TEXT NULL,
  status BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- INSERIR DADOS INICIAIS
-- ============================================

-- Inserir registro inicial em games_keys
INSERT INTO games_keys (playfiver_token, playfiver_secret, playfiver_code, callback_url, rtp, limit_amount, limit_hours, limit_enable, bonus_enable, created_at, updated_at)
VALUES ('test', 'test', 'test', 'https://betgeniusbr.com/playfiver/callback', 93.00, 100.00, 1, FALSE, FALSE, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET updated_at = NOW();

-- Inserir registro inicial em settings
INSERT INTO settings (software_name, software_description, created_at, updated_at)
VALUES ('BetGenius', 'Plataforma de jogos online', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET updated_at = NOW();

-- Inserir registro inicial em custom_layouts
INSERT INTO custom_layouts (primary_color, secondary_color, created_at, updated_at)
VALUES ('#6366f1', '#8b5cf6', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET updated_at = NOW();

-- ============================================
-- FUNÇÃO: Atualizar updated_at automaticamente
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para atualizar updated_at automaticamente
CREATE TRIGGER update_providers_updated_at BEFORE UPDATE ON providers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_games_updated_at BEFORE UPDATE ON games FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_category_games_updated_at BEFORE UPDATE ON category_games FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_wallets_updated_at BEFORE UPDATE ON wallets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_games_keys_updated_at BEFORE UPDATE ON games_keys FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_game_favorites_updated_at BEFORE UPDATE ON game_favorites FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_game_likes_updated_at BEFORE UPDATE ON game_likes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_custom_layouts_updated_at BEFORE UPDATE ON custom_layouts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_banners_updated_at BEFORE UPDATE ON banners FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- FIM DO SCRIPT
-- ============================================

