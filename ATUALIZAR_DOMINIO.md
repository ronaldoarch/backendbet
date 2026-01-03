# 🌐 Atualizar Configurações Após Mudança de Domínio

## 📋 Situação Atual

- **Banco de Dados**: PostgreSQL no Railway ✅ (não precisa mudar)
- **Backend**: Node.js no Colify
- **Frontend**: React na Hostinger

## 🔧 O Que Precisa Ser Atualizado

Após mudar o domínio do site, você precisa atualizar as seguintes variáveis de ambiente:

### 1. No Colify (Backend)

Acesse o painel do **Colify** → Sua aplicação → **Environment Variables** e atualize:

```env
# URL do Backend (novo domínio)
APP_URL=https://seu-novo-backend.colify.app

# CORS - URL do Frontend (novo domínio na Hostinger)
CORS_ORIGIN=https://seu-novo-dominio.com

# Database (Railway - NÃO MUDAR)
DATABASE_URL=postgresql://... (mantém igual)
DB_SSL=true

# Outras variáveis (manter como estão)
NODE_ENV=production
PORT=3001
JWT_SECRET=... (mantém igual)
```

**⚠️ IMPORTANTE:**
- Se o frontend aceita múltiplos domínios, você pode usar: `CORS_ORIGIN=https://dominio1.com,https://dominio2.com`
- Certifique-se de usar `https://` (não `http://`)
- Não inclua barra no final (`/`)

### 2. Na Hostinger (Frontend)

No painel da **Hostinger**, você precisa atualizar as variáveis de ambiente do frontend:

#### Opção A: Se usar arquivo `.env` no build

Crie ou edite o arquivo `.env` na raiz do projeto frontend:

```env
# URL da API (novo domínio do backend no Colify)
VITE_API_URL=https://seu-novo-backend.colify.app/api

# Nome da aplicação
VITE_APP_NAME=BetGenius

# WebSocket (se usar)
VITE_WEBSOCKET_URL=wss://seu-novo-backend.colify.app
```

Depois, faça um novo build:

```bash
cd frontend
npm run build
# Faça upload da pasta dist/ para a Hostinger
```

#### Opção B: Se usar variáveis de ambiente na Hostinger

No painel da Hostinger, configure:

```env
VITE_API_URL=https://seu-novo-backend.colify.app/api
VITE_APP_NAME=BetGenius
```

### 3. Verificar Configuração de CORS no Backend

Se o backend tiver configuração de CORS no código, verifique se está usando a variável `CORS_ORIGIN`:

```javascript
// Exemplo de configuração CORS
const cors = require('cors');

app.use(cors({
  origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

## ✅ Checklist de Atualização

### Backend (Colify)
- [ ] Atualizar `APP_URL` com novo domínio do backend
- [ ] Atualizar `CORS_ORIGIN` com novo domínio do frontend
- [ ] Verificar se `DATABASE_URL` está correto (Railway - não mudar)
- [ ] Fazer redeploy/restart da aplicação

### Frontend (Hostinger)
- [ ] Atualizar `VITE_API_URL` com novo domínio do backend
- [ ] Fazer novo build do frontend (se necessário)
- [ ] Fazer upload do novo build para Hostinger

### Testes
- [ ] Testar acesso ao frontend no novo domínio
- [ ] Testar login/registro (verificar se API responde)
- [ ] Verificar console do navegador (F12) para erros de CORS
- [ ] Testar requisições à API

## 🧪 Como Testar

### 1. Testar Backend

```bash
# Testar se o backend está respondendo
curl https://seu-novo-backend.colify.app/api/health

# Testar settings
curl https://seu-novo-backend.colify.app/api/settings/data
```

### 2. Testar Frontend

1. Acesse o novo domínio no navegador
2. Abra o Console do Desenvolvedor (F12)
3. Vá na aba **Network**
4. Tente fazer login ou carregar jogos
5. Verifique se as requisições estão indo para o novo backend
6. Verifique se não há erros de CORS

### 3. Verificar CORS

Se aparecer erro de CORS no console:

```
Access to fetch at 'https://backend...' from origin 'https://frontend...' 
has been blocked by CORS policy
```

**Solução:**
1. Verifique se `CORS_ORIGIN` no Colify está com o domínio correto do frontend
2. Certifique-se de que não há `www.` ou barra no final
3. Faça redeploy do backend após atualizar

## 🐛 Problemas Comuns

### Erro: "CORS policy blocked"

**Causa:** `CORS_ORIGIN` não está configurado corretamente

**Solução:**
1. Verifique o domínio exato no navegador (com ou sem `www.`)
2. Atualize `CORS_ORIGIN` no Colify com o domínio exato
3. Se usar múltiplos domínios: `CORS_ORIGIN=https://dominio1.com,https://www.dominio1.com`
4. Faça redeploy

### Erro: "Network Error" ou "Failed to fetch"

**Causa:** `VITE_API_URL` no frontend está incorreto

**Solução:**
1. Verifique se `VITE_API_URL` está com o domínio correto do backend
2. Certifique-se de incluir `/api` no final
3. Faça novo build do frontend
4. Faça upload do novo build

### Erro: "404 Not Found" nas rotas da API

**Causa:** `APP_URL` pode estar incorreto ou rotas não configuradas

**Solução:**
1. Verifique se `APP_URL` está correto no Colify
2. Verifique se as rotas estão configuradas no backend
3. Teste diretamente: `curl https://seu-backend.colify.app/api/health`

### Frontend não carrega dados

**Causa:** Frontend ainda está usando URL antiga

**Solução:**
1. Limpe o cache do navegador (Ctrl+Shift+Delete)
2. Verifique se fez novo build com `VITE_API_URL` atualizado
3. Verifique se fez upload do novo build para Hostinger

## 📝 Exemplo Completo de Variáveis

### Backend (Colify)
```env
# App
NODE_ENV=production
APP_ENV=production
PORT=3001
APP_URL=https://api.betgenius.com

# CORS
CORS_ORIGIN=https://betgenius.com,https://www.betgenius.com

# Database (Railway)
DATABASE_URL=postgresql://postgres:senha@containers-us-west-xxx.railway.app:5432/railway
DB_SSL=true

# JWT
JWT_SECRET=sua_chave_secreta_aqui

# Outras APIs (se usar)
PLAYFIVER_API_KEY=...
CARTWAVE_API_KEY=...
```

### Frontend (Hostinger)
```env
VITE_API_URL=https://api.betgenius.com/api
VITE_APP_NAME=BetGenius
VITE_WEBSOCKET_URL=wss://api.betgenius.com
```

## 🔄 Processo de Atualização Rápido

1. **Colify (Backend):**
   - Acesse Environment Variables
   - Atualize `APP_URL` e `CORS_ORIGIN`
   - Clique em "Save" e "Redeploy"

2. **Hostinger (Frontend):**
   - Atualize `VITE_API_URL` no `.env`
   - Execute `npm run build`
   - Faça upload da pasta `dist/` para Hostinger

3. **Teste:**
   - Acesse o novo domínio
   - Verifique console do navegador
   - Teste login e funcionalidades

## ✅ Verificação Final

Após atualizar tudo, verifique:

- [ ] Frontend carrega no novo domínio
- [ ] Backend responde no novo domínio
- [ ] Login funciona
- [ ] Jogos carregam
- [ ] Não há erros de CORS no console
- [ ] Requisições vão para o novo backend

---

**💡 Dica:** Mantenha um backup das variáveis antigas antes de atualizar, caso precise reverter.

