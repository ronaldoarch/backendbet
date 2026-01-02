# Como Criar a Tabela de Transações

## Opção 1: Via SQL direto (Recomendado para produção)

Execute o arquivo SQL diretamente no banco de dados:

```bash
# Via MySQL CLI
mysql -u SEU_USUARIO -p SEU_BANCO < backend-api/create_transactions_table.sql

# Ou copie e cole o conteúdo do arquivo create_transactions_table.sql no seu cliente MySQL
```

## Opção 2: Via Node.js (Desenvolvimento local)

```bash
cd backend-api
node src/database/create_transactions_table.js
```

## Opção 3: Via Coolify Terminal

1. Acesse o terminal do seu serviço no Coolify
2. Navegue até o diretório do backend
3. Execute:

```bash
# Se estiver usando npm
npm run create-transactions-table

# Ou diretamente
node src/database/create_transactions_table.js
```

## Opção 4: SQL Manual

Execute este SQL diretamente no seu banco de dados:

```sql
DROP TABLE IF EXISTS transactions;

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
```

## Verificar se a tabela foi criada

```sql
SHOW TABLES LIKE 'transactions';
DESCRIBE transactions;
```

