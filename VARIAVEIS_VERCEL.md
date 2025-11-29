# 🔧 Variáveis de Ambiente para Vercel

## Variáveis Obrigatórias

Configure estas variáveis no Vercel: **Settings** → **Environment Variables**

### 1. Configuração do Servidor

```env
PORT=3001
NODE_ENV=production
APP_ENV=production
```

### 2. URLs e CORS

```env
APP_URL=https://seu-projeto.vercel.app
CORS_ORIGIN=https://betgeniusbr.com
```

**⚠️ IMPORTANTE:**
- `APP_URL` - Substitua `seu-projeto` pelo nome real do seu projeto no Vercel
- `CORS_ORIGIN` - URL do seu frontend (Hostinger)

### 3. Banco de Dados (Railway)

**Depois de criar o MySQL no Railway, copie as credenciais:**

```env
DB_HOST=MYSQLHOST_DO_RAILWAY
DB_PORT=3306
DB_USER=MYSQLUSER_DO_RAILWAY
DB_PASSWORD=MYSQLPASSWORD_DO_RAILWAY
DB_NAME=MYSQLDATABASE_DO_RAILWAY
DB_SSL=false
```

**Onde encontrar no Railway:**
1. Clique no serviço **MySQL**
2. Vá na aba **"Variables"**
3. Copie os valores de:
   - `MYSQLHOST` → `DB_HOST`
   - `MYSQLPORT` → `DB_PORT` (geralmente 3306)
   - `MYSQLUSER` → `DB_USER`
   - `MYSQLPASSWORD` → `DB_PASSWORD`
   - `MYSQLDATABASE` → `DB_NAME`

## Exemplo Completo

```env
PORT=3001
NODE_ENV=production
APP_ENV=production
APP_URL=https://backendbet.vercel.app
CORS_ORIGIN=https://betgeniusbr.com
DB_HOST=containers-us-west-xxx.railway.app
DB_PORT=3306
DB_USER=root
DB_PASSWORD=senha_do_railway
DB_NAME=railway
DB_SSL=false
```

## Como Adicionar no Vercel

1. Acesse: https://vercel.com
2. Selecione seu projeto
3. Vá em **Settings** → **Environment Variables**
4. Clique em **"Add New"**
5. Adicione cada variável:
   - **Key:** `PORT`
   - **Value:** `3001`
   - **Environment:** Selecione `Production`, `Preview` e `Development`
6. Repita para todas as variáveis

## Verificar

Após adicionar, faça um novo deploy:
- Vercel vai fazer deploy automático após push
- Ou clique em **"Redeploy"** manualmente

## Testar

```bash
curl https://seu-projeto.vercel.app/api/health
```

Deve retornar:
```json
{"status":"ok","timestamp":"..."}
```

