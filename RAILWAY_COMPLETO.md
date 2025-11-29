# 🚂 Railway - Guia Completo

## Vantagens do Railway

✅ **Gratuito** - Plano free generoso
✅ **MySQL** - Compatível com seu código atual
✅ **Fácil de usar** - Interface simples
✅ **Funciona com Vercel** - Sem problemas de conexão
✅ **Backup automático** - Dados seguros

## Passo a Passo Completo

### 1. Criar Conta e Projeto

1. Acesse: https://railway.app
2. **"Start a New Project"** → **Login with GitHub**
3. Clique em **"New Project"**
4. Selecione **"Provision MySQL"**
5. Aguarde 1-2 minutos

### 2. Obter Credenciais

1. Clique no serviço **MySQL** criado
2. Vá na aba **"Variables"** (ou **"Connect"**)
3. Anote as variáveis:
   - `MYSQLHOST` → Use no `DB_HOST`
   - `MYSQLPORT` → Geralmente `3306`
   - `MYSQLUSER` → Use no `DB_USER`
   - `MYSQLPASSWORD` → Use no `DB_PASSWORD`
   - `MYSQLDATABASE` → Use no `DB_NAME`

### 3. Criar Schema

**Opção A: Via Console do Railway**
1. No Railway, clique no MySQL
2. Vá em **"Data"** ou **"Query"**
3. Cole o conteúdo de `database_completo.sql`
4. Execute

**Opção B: Via Script Node.js**
1. Atualize o `.env` local com as credenciais do Railway
2. Execute: `npm run migrate`

### 4. Atualizar Backend para MySQL

Como o Railway usa MySQL, precisamos voltar para `mysql2`:

```bash
cd backend-api
npm install mysql2
npm uninstall pg
```

E trocar o arquivo de configuração:

```bash
mv src/config/database.js src/config/database.postgres.js
mv src/config/database.mysql.js src/config/database.js
```

### 5. Configurar Vercel

No Vercel: **Settings** → **Environment Variables**

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

### 6. Deploy no Vercel

1. Vá no Vercel
2. O deploy deve acontecer automaticamente após o push
3. Ou clique em **"Redeploy"**

### 7. Testar

```bash
curl https://seu-projeto.vercel.app/api/health
```

## Migrar Dados (Opcional)

Se você já tem dados na Hostinger:

1. Exporte do phpMyAdmin (SQL)
2. Importe no Railway via console ou script

## Pronto! 🎉

Agora você tem:
- ✅ Backend no Vercel
- ✅ Banco no Railway
- ✅ Frontend na Hostinger
- ✅ Tudo funcionando!

