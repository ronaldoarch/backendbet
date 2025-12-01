-- ============================================
-- EXECUTE ESTE SQL DIRETAMENTE NO SEU BANCO DE DADOS
-- ============================================
-- Acesse seu banco MySQL (Railway, Hostinger, phpMyAdmin, etc.)
-- Copie e cole todo este conteúdo e execute

-- Remover tabela antiga se existir (CUIDADO: isso apaga dados existentes!)
DROP TABLE IF EXISTS transactions;

-- Criar tabela de transações
CREATE TABLE transactions (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL,
  type ENUM('deposit', 'withdrawal', 'bonus', 'win', 'bet', 'refund') NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'BRL',
  gateway VARCHAR(50) NOT NULL DEFAULT 'arkama',
  status ENUM('pending', 'completed', 'failed', 'canceled', 'refunded', 'processing') DEFAULT 'pending',
  payment_id VARCHAR(255) NULL UNIQUE,
  description TEXT NULL,
  metadata JSON NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_user_id (user_id),
  INDEX idx_status (status),
  INDEX idx_payment_id (payment_id),
  INDEX idx_type (type),
  INDEX idx_created_at (created_at),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Verificar se foi criada
SELECT '✅ Tabela transactions criada com sucesso!' as resultado;
SELECT COUNT(*) as total_tabelas FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'transactions';

