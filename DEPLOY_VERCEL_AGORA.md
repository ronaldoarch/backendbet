# 🚀 Deploy no Vercel - Passo a Passo

## ⚠️ IMPORTANTE: Banco de Dados

O MySQL na Hostinger **não aceita conexões externas**. Você tem 2 opções:

### Opção 1: Manter MySQL na Hostinger (Recomendado por enquanto)
- Backend no Vercel
- MySQL na Hostinger (precisa de IP público ou túnel)
- Pode não funcionar se MySQL só aceita localhost

### Opção 2: Usar PlanetScale (Recomendado)
- Backend no Vercel
- Banco no PlanetScale (gratuito, MySQL compatível)
- Funciona perfeitamente
- Migração fácil

## Deploy no Vercel

### 1. Criar Conta

1. Acesse: https://vercel.com
2. **Sign Up** com GitHub
3. Faça login

### 2. Importar Projeto

**Opção A: Via GitHub (Recomendado)**
1. Faça push do código para GitHub
2. No Vercel: **Add New** → **Project**
3. Selecione o repositório
4. Configure:
   - **Framework Preset:** Other
   - **Root Directory:** `backend-api` (se o repositório tiver frontend também)
   - **Build Command:** (deixe vazio)
   - **Output Directory:** (deixe vazio)

**Opção B: Upload Manual**
1. No Vercel: **Add New** → **Project**
2. Clique em **"Browse"** ou arraste a pasta `backend-api`
3. Configure as mesmas opções acima

### 3. Configurar Variáveis de Ambiente

No painel do Vercel, vá em **Settings** → **Environment Variables**:

**Se usar MySQL na Hostinger:**
```env
PORT=3001
APP_URL=https://seu-projeto.vercel.app
CORS_ORIGIN=https://betgeniusbr.com
DB_HOST=IP_PUBLICO_MYSQL_HOSTINGER
DB_PORT=3306
DB_USER=u127271520_betgenius
DB_PASSWORD=2403Auror@
DB_NAME=u127271520_betgenius
NODE_ENV=production
APP_ENV=production
```

**Se usar PlanetScale (recomendado):**
```env
PORT=3001
APP_URL=https://seu-projeto.vercel.app
CORS_ORIGIN=https://betgeniusbr.com
DB_HOST=aws.connect.psdb.cloud
DB_PORT=3306
DB_USER=seu_usuario
DB_PASSWORD=sua_senha
DB_NAME=seu_banco
DB_SSL=true
NODE_ENV=production
APP_ENV=production
```

### 4. Deploy

1. Clique em **"Deploy"**
2. Aguarde o build (1-2 minutos)
3. Você receberá uma URL: `https://seu-projeto.vercel.app`

### 5. Testar

```bash
curl https://seu-projeto.vercel.app/api/health
```

### 6. Atualizar Frontend

No `frontend-standalone/.env.production`:

```env
VITE_API_URL=https://seu-projeto.vercel.app/api
```

Rebuild e upload do frontend.

## Próximos Passos

1. ✅ Deploy no Vercel
2. ⏭️ Configurar banco (MySQL Hostinger ou PlanetScale)
3. ⏭️ Atualizar frontend
4. ⏭️ Testar tudo

## Recomendação

**Use PlanetScale** - É mais fácil e funciona perfeitamente com Vercel!

Quer que eu prepare a migração para PlanetScale?

