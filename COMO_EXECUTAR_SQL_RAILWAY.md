# 🗄️ Como Executar SQL no Railway

## Opção 1: Via Query Tab (Mais Fácil) ✅

1. **Acesse o Railway Dashboard:**
   - Vá para: https://railway.app/dashboard
   - Faça login

2. **Selecione seu projeto:**
   - Clique no projeto que contém o banco MySQL

3. **Acesse o banco:**
   - Clique no serviço MySQL
   - Procure pela aba **"Query"** ou **"Data"** no topo

4. **Execute o SQL:**
   - Cole o SQL abaixo na área de query
   - Clique em **"Run"** ou **"Execute"**

```sql
ALTER TABLE games_keys ADD COLUMN IF NOT EXISTS callback_url VARCHAR(500) NULL;
```

## Opção 2: Via Terminal (Railway CLI)

1. **Instalar Railway CLI:**
```bash
npm install -g @railway/cli
```

2. **Fazer login:**
```bash
railway login
```

3. **Conectar ao banco:**
```bash
railway connect mysql
```

4. **Executar SQL:**
```sql
ALTER TABLE games_keys ADD COLUMN IF NOT EXISTS callback_url VARCHAR(500) NULL;
```

## Opção 3: Via Script Node.js (Mais Prático) ✅

Crie um script para executar o SQL automaticamente:

```bash
cd backend-api
node -e "
import('mysql2/promise').then(async (mysql) => {
  const pool = mysql.default.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'betgenius',
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  });
  
  try {
    await pool.execute('ALTER TABLE games_keys ADD COLUMN IF NOT EXISTS callback_url VARCHAR(500) NULL');
    console.log('✅ Coluna callback_url adicionada com sucesso!');
  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
  process.exit(0);
});
"
```

## Opção 4: Via phpMyAdmin (Se tiver acesso)

1. Acesse o phpMyAdmin da Hostinger
2. Selecione o banco do Railway (se estiver acessível)
3. Vá em "SQL"
4. Execute o comando

## ✅ Recomendação

**Use a Opção 1 (Query Tab)** - É a mais fácil e direta!

Se não encontrar a aba "Query", procure por:
- **"Data"**
- **"Query"**
- **"SQL"**
- **"Database"**

## 📝 SQL Completo (Se precisar recriar a coluna)

```sql
-- Verificar se a coluna existe
SHOW COLUMNS FROM games_keys LIKE 'callback_url';

-- Se não existir, adicionar
ALTER TABLE games_keys ADD COLUMN callback_url VARCHAR(500) NULL;

-- Verificar novamente
SHOW COLUMNS FROM games_keys;
```

