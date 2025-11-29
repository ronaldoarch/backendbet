# 🚂 Railway - Passo a Passo Rápido

## 1. Criar Projeto no Railway

1. Acesse: https://railway.app
2. **"Start a New Project"** → **Login with GitHub**
3. Clique em **"New Project"**
4. Selecione **"Provision MySQL"**
5. Aguarde 1-2 minutos

## 2. Obter Credenciais

1. Clique no serviço **MySQL** criado
2. Vá na aba **"Variables"**
3. Anote:
   - `MYSQLHOST` → `DB_HOST`
   - `MYSQLPORT` → `DB_PORT` (geralmente 3306)
   - `MYSQLUSER` → `DB_USER`
   - `MYSQLPASSWORD` → `DB_PASSWORD`
   - `MYSQLDATABASE` → `DB_NAME`

## 3. Criar Schema

**Opção A: Via Console do Railway**
1. No MySQL, clique em **"Query"** ou **"Data"**
2. Cole o conteúdo de `database_completo.sql`
3. Execute

**Opção B: Via Script**
1. Atualize `.env` local com credenciais do Railway
2. Execute: `npm run migrate`

## 4. Atualizar Dependências

```bash
cd backend-api
npm install mysql2
npm uninstall pg
```

## 5. Configurar Vercel

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

## 6. Commit e Push

```bash
git add .
git commit -m "Atualizar para MySQL (Railway)"
git push
```

## 7. Deploy Automático

O Vercel vai fazer deploy automaticamente após o push!

## 8. Testar

```bash
curl https://seu-projeto.vercel.app/api/health
```

## Pronto! 🎉

Agora você tem:
- ✅ Backend no Vercel
- ✅ Banco no Railway
- ✅ Frontend na Hostinger
- ✅ Tudo funcionando!

