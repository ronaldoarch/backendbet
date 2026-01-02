# 🚂 Configurar Railway para Banco de Dados

## Passo a Passo

### 1. Criar Conta no Railway

1. Acesse: https://railway.app
2. Clique em **"Start a New Project"**
3. Faça login com **GitHub**

### 2. Criar Banco MySQL

1. No painel do Railway, clique em **"New Project"**
2. Selecione **"Provision MySQL"**
3. Aguarde a criação (1-2 minutos)

### 3. Obter Credenciais

1. Clique no serviço MySQL criado
2. Vá na aba **"Variables"** ou **"Connect"**
3. Você verá as variáveis:
   - `MYSQLHOST` - Host do banco
   - `MYSQLPORT` - Porta (geralmente 3306)
   - `MYSQLUSER` - Usuário
   - `MYSQLPASSWORD` - Senha
   - `MYSQLDATABASE` - Nome do banco

### 4. Criar Schema

1. No Railway, vá na aba **"Data"** ou **"MySQL"**
2. Clique em **"Query"** ou **"Open MySQL Console"**
3. Execute o script `database_completo.sql` (vou adaptar para MySQL)

### 5. Configurar Vercel

No Vercel, vá em **Settings** → **Environment Variables**:

```env
PORT=3001
APP_URL=https://seu-projeto.vercel.app
CORS_ORIGIN=https://betgeniusbr.com
DB_HOST=MYSQLHOST_DO_RAILWAY
DB_PORT=3306
DB_USER=MYSQLUSER_DO_RAILWAY
DB_PASSWORD=MYSQLPASSWORD_DO_RAILWAY
DB_NAME=MYSQLDATABASE_DO_RAILWAY
NODE_ENV=production
APP_ENV=production
```

### 6. Atualizar Backend para MySQL

Como o Railway usa MySQL (não PostgreSQL), precisamos voltar para `mysql2`:

```bash
npm install mysql2
npm uninstall pg
```

E usar `database.mysql.js` ao invés de `database.js`.

## Próximos Passos

1. ✅ Criar projeto no Railway
2. ✅ Criar banco MySQL
3. ⏭️ Obter credenciais
4. ⏭️ Criar schema
5. ⏭️ Configurar Vercel
6. ⏭️ Atualizar backend

