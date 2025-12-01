# Como Criar a Tabela de Transações no Coolify

## Opção 1: Via Terminal do Coolify (Recomendado)

1. Acesse o terminal do seu serviço no Coolify
2. Execute o comando npm:

```bash
npm run create-transactions-table
```

## Opção 2: Executar SQL Diretamente no Banco

1. Acesse o banco de dados MySQL (Railway, Hostinger, etc.)
2. Execute este SQL:

```sql
-- Verificar se a tabela já existe
SHOW TABLES LIKE 'transactions';

-- Se não existir, criar a tabela
CREATE TABLE IF NOT EXISTS transactions (
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
```

## Opção 3: Via Terminal do Coolify com Caminho Absoluto

Se o npm run não funcionar, tente:

```bash
# Navegar até o diretório do projeto
cd /app
# ou
cd /var/www/html
# ou o caminho que o Coolify usa

# Executar o script
node backend-api/src/database/create_transactions_table.js
```

## Verificar se Funcionou

Execute no banco de dados:

```sql
SHOW TABLES LIKE 'transactions';
DESCRIBE transactions;
SELECT COUNT(*) FROM transactions;
```

