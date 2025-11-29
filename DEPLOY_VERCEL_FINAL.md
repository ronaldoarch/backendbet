# 🚀 Deploy no Vercel - Guia Completo

## ⚠️ IMPORTANTE: MySQL na Hostinger

O MySQL na Hostinger provavelmente **não aceita conexões externas** (só localhost). 

**Opções:**
1. **Manter backend na Hostinger** (mais simples)
2. **Migrar banco para Supabase/PlanetScale** (funciona com Vercel)
3. **Tentar conectar Vercel → MySQL Hostinger** (pode não funcionar)

## Passo a Passo para Vercel

### 1. Preparar Código

✅ `vercel.json` - Já criado
✅ `server.js` - Já exporta o app
✅ `package.json` - Já configurado

### 2. Criar Conta no Vercel

1. Acesse: https://vercel.com
2. Clique em **"Sign Up"**
3. Faça login com **GitHub**

### 3. Importar Projeto

1. No painel do Vercel, clique em **"Add New"** → **"Project"**
2. **Import Git Repository**:
   - Se o código estiver no GitHub, selecione o repositório
   - Ou faça **upload** da pasta `backend-api`

### 4. Configurar Variáveis de Ambiente

No painel do Vercel, vá em **Settings** → **Environment Variables** e adicione:

```env
PORT=3001
APP_URL=https://seu-projeto.vercel.app
CORS_ORIGIN=https://betgeniusbr.com
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=u127271520_betgenius
DB_PASSWORD=2403Auror@
DB_NAME=u127271520_betgenius
NODE_ENV=production
APP_ENV=production
```

**⚠️ PROBLEMA:** `DB_HOST=127.0.0.1` não vai funcionar do Vercel!

### 5. Solução: Usar IP Público do MySQL

Se o MySQL da Hostinger tiver um IP público:

1. No painel da Hostinger, encontre o **IP público do MySQL**
2. Use esse IP no `DB_HOST`:
   ```env
   DB_HOST=IP_PUBLICO_DO_MYSQL
   ```

### 6. Se Não Tiver IP Público

Nesse caso, você tem 3 opções:

#### Opção A: Manter Backend na Hostinger (Recomendado)
- Backend na Hostinger com PM2
- Frontend na Hostinger
- MySQL na Hostinger
- Tudo funciona localmente

#### Opção B: Migrar para Supabase
- Backend no Vercel
- Banco no Supabase
- Frontend na Hostinger
- Precisa resolver conexão Supabase primeiro

#### Opção C: Usar PlanetScale
- Backend no Vercel
- Banco no PlanetScale (gratuito, MySQL compatível)
- Frontend na Hostinger
- Mais fácil que Supabase

## Recomendação

**Por enquanto, mantenha o backend na Hostinger** até resolvermos a conexão com o banco.

Se quiser mesmo usar Vercel, vamos com **PlanetScale** (mais fácil que Supabase).

Qual opção você prefere?

