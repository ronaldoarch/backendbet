# Como Criar a Tabela app_settings

A tabela `app_settings` é necessária para armazenar as credenciais do Arkama e outras configurações de chave-valor.

## Opção 1: Via Script Node.js (Recomendado)

Se você tem acesso local ao banco de dados:

```bash
cd backend-api
npm run create-app-settings-table
```

Ou diretamente:

```bash
node src/database/create_app_settings_table.js
```

## Opção 2: Via SQL Direto (Railway/phpMyAdmin)

1. **No Railway:**
   - Acesse o painel do Railway
   - Vá em "Query" ou "MySQL"
   - Execute o SQL abaixo

2. **No phpMyAdmin:**
   - Selecione o banco de dados
   - Vá na aba "SQL"
   - Cole e execute o SQL abaixo

### SQL para Executar:

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

## Verificar se a Tabela foi Criada

Execute este SQL para verificar:

```sql
SHOW TABLES LIKE 'app_settings';
```

Ou:

```sql
DESCRIBE app_settings;
```

## Após Criar a Tabela

1. Faça o deploy do backend atualizado (se estiver usando Coolify/Vercel)
2. Teste novamente salvar as credenciais Arkama no painel admin
3. O erro 500 deve estar resolvido!

