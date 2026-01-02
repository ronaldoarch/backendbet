# ⚡ Deploy Rápido no Vercel

## ✅ Arquivos Prontos

- ✅ `vercel.json` - Configurado
- ✅ `server.js` - Exporta o app corretamente
- ✅ `package.json` - Dependências instaladas

## 🚀 Passo a Passo (5 minutos)

### 1. Criar Conta no Vercel

1. Acesse: https://vercel.com
2. **Sign Up** com GitHub
3. Faça login

### 2. Importar Projeto

**Opção A: GitHub (Recomendado)**
1. Faça push do código para GitHub
2. No Vercel: **Add New** → **Project**
3. Selecione o repositório
4. Configure:
   - **Root Directory:** `backend-api` (se necessário)
   - **Framework Preset:** Other
   - **Build Command:** (vazio)
   - **Output Directory:** (vazio)

**Opção B: Upload Manual**
1. No Vercel: **Add New** → **Project**
2. Arraste a pasta `backend-api` ou clique em **Browse**
3. Configure as mesmas opções

### 3. Variáveis de Ambiente

No Vercel: **Settings** → **Environment Variables**

**⚠️ PROBLEMA:** MySQL na Hostinger não aceita conexões externas!

**Solução:** Use PlanetScale (gratuito, MySQL compatível)

```env
PORT=3001
APP_URL=https://seu-projeto.vercel.app
CORS_ORIGIN=https://betgeniusbr.com
DB_HOST=aws.connect.psdb.cloud
DB_PORT=3306
DB_USER=seu_usuario_planetscale
DB_PASSWORD=sua_senha_planetscale
DB_NAME=seu_banco_planetscale
DB_SSL=true
NODE_ENV=production
APP_ENV=production
```

### 4. Deploy

1. Clique em **"Deploy"**
2. Aguarde 1-2 minutos
3. URL: `https://seu-projeto.vercel.app`

### 5. Testar

```bash
curl https://seu-projeto.vercel.app/api/health
```

## ⚠️ Banco de Dados

O MySQL na Hostinger **não vai funcionar** do Vercel (só aceita localhost).

**Opções:**

1. **PlanetScale** (Recomendado)
   - Gratuito
   - MySQL compatível
   - Funciona perfeitamente com Vercel
   - Migração fácil

2. **Manter Backend na Hostinger**
   - Backend na Hostinger com PM2
   - MySQL na Hostinger
   - Funciona, mas precisa corrigir proxy reverso

## Recomendação

**Use PlanetScale!** É mais fácil e funciona perfeitamente.

Quer que eu prepare a migração para PlanetScale agora?

