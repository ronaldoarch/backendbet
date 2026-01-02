# ✅ Resumo: Configuração Railway

## O que foi feito:

1. ✅ `database.js` atualizado para MySQL
2. ✅ `package.json` atualizado (mysql2 ao invés de pg)
3. ✅ Queries INSERT removidas `RETURNING id` (MySQL não usa)
4. ✅ Uso de `result.insertId` corrigido

## Próximos Passos:

### 1. Atualizar Dependências Localmente

```bash
cd backend-api
npm install mysql2
npm uninstall pg
```

### 2. Criar Projeto no Railway

1. Acesse: https://railway.app
2. **"Start a New Project"** → **Login with GitHub**
3. **"New Project"** → **"Provision MySQL"**
4. Aguarde criação

### 3. Obter Credenciais

No Railway, clique no MySQL → **"Variables"**:
- `MYSQLHOST` → `DB_HOST`
- `MYSQLPORT` → `DB_PORT`
- `MYSQLUSER` → `DB_USER`
- `MYSQLPASSWORD` → `DB_PASSWORD`
- `MYSQLDATABASE` → `DB_NAME`

### 4. Criar Schema

No Railway: MySQL → **"Query"** → Cole `database_completo.sql` → Execute

### 5. Commit e Push

```bash
git add .
git commit -m "Atualizar para MySQL (Railway)"
git push
```

### 6. Configurar Vercel

No Vercel: **Settings** → **Environment Variables**:

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

### 7. Deploy Automático

O Vercel vai fazer deploy automaticamente após o push!

## Pronto! 🎉

