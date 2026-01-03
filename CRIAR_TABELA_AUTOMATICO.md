# Criar Tabela app_settings Automaticamente

## Opção 1: Via Script Node.js (Recomendado)

Execute este comando no diretório do backend:

```bash
cd backend-api
npm run create-app-settings-table
```

Este comando:
- Verifica se a tabela já existe
- Cria a tabela se não existir
- Usa as credenciais do banco de dados do arquivo `.env`

## Opção 2: Via SSH no Servidor (Coolify/VPS)

Se você tem acesso SSH ao servidor onde o backend está rodando:

```bash
# Conectar ao servidor via SSH
ssh usuario@seu-servidor

# Navegar até o diretório do backend
cd ~/backend-api  # ou o caminho onde está o backend

# Executar o script
npm run create-app-settings-table
```

## Opção 3: Via Terminal do Railway

1. Acesse o Railway
2. Vá no seu projeto MySQL
3. Clique em "Query" ou "MySQL"
4. Execute o SQL abaixo:

```sql
CREATE TABLE IF NOT EXISTS `app_settings` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `setting_key` VARCHAR(255) NOT NULL UNIQUE,
  `setting_value` TEXT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_setting_key` (`setting_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

## Opção 4: Via Coolify Terminal

1. Acesse o Coolify
2. Vá no seu aplicativo backend
3. Clique em "Terminal" ou "Console"
4. Execute:

```bash
npm run create-app-settings-table
```

## Verificar se Funcionou

Após executar, verifique se a tabela foi criada:

```sql
SHOW TABLES LIKE 'app_settings';
```

Ou:

```sql
DESCRIBE app_settings;
```

