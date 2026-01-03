# 🌐 Atualizar Configurações - Mudança de Domínio do Frontend

## 📋 Situação

- **Banco de Dados**: PostgreSQL no Railway ✅ (não precisa mudar)
- **Backend**: Node.js no Colify ✅ (domínio continua o mesmo)
- **Frontend**: React na Hostinger 🔄 (domínio mudou)

## 🔧 O Que Precisa Ser Atualizado

Como apenas o domínio do **frontend** mudou, você só precisa atualizar:

### 1. No Colify (Backend) - CORS

Acesse o painel do **Colify** → Sua aplicação → **Environment Variables** e atualize apenas:

```env
# CORS - URL do Frontend (NOVO domínio na Hostinger)
CORS_ORIGIN=https://seu-novo-dominio-frontend.com
```

**⚠️ IMPORTANTE:**
- Use o domínio exato do frontend (com ou sem `www.` conforme necessário)
- Se aceitar múltiplos domínios: `CORS_ORIGIN=https://dominio.com,https://www.dominio.com`
- Certifique-se de usar `https://` (não `http://`)
- Não inclua barra no final (`/`)

**Exemplo:**
```env
# Antes
CORS_ORIGIN=https://dominio-antigo.com

# Depois
CORS_ORIGIN=https://novo-dominio.com
```

### 2. Na Hostinger (Frontend) - Verificar API URL

No painel da **Hostinger**, verifique se `VITE_API_URL` está correto:

```env
# URL da API (domínio do backend no Colify - NÃO MUDOU)
VITE_API_URL=https://seu-backend.colify.app/api
```

**Se já estava configurado corretamente, não precisa mudar nada!**

## ✅ Checklist Rápido

### Backend (Colify)
- [ ] Atualizar `CORS_ORIGIN` com novo domínio do frontend
- [ ] Fazer redeploy/restart da aplicação

### Frontend (Hostinger)
- [ ] Verificar se `VITE_API_URL` está correto (provavelmente já está)
- [ ] Se necessário, fazer novo build e upload

### Testes
- [ ] Acessar frontend no novo domínio
- [ ] Verificar console do navegador (F12) para erros de CORS
- [ ] Testar login/registro
- [ ] Verificar se dados carregam corretamente

## 🧪 Como Testar

### 1. Testar se CORS está funcionando

1. Acesse o **novo domínio do frontend** no navegador
2. Abra o Console do Desenvolvedor (F12)
3. Vá na aba **Network**
4. Tente fazer login ou carregar jogos
5. Verifique se **não há erros de CORS**

### 2. Verificar Erro de CORS

Se aparecer erro no console:

```
Access to fetch at 'https://backend...' from origin 'https://novo-frontend...' 
has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present
```

**Solução:**
1. Verifique se `CORS_ORIGIN` no Colify está com o domínio **exato** do frontend
2. Certifique-se de que não há `www.` ou barra no final
3. Faça **redeploy** do backend após atualizar
4. Limpe o cache do navegador (Ctrl+Shift+Delete)

## 🔄 Processo de Atualização (2 minutos)

### Passo 1: Colify (Backend)

1. Acesse o painel do **Colify**
2. Vá na sua aplicação Node.js
3. Clique em **"Environment Variables"** ou **"Configuration"**
4. Encontre a variável `CORS_ORIGIN`
5. Atualize com o novo domínio do frontend:
   ```
   https://seu-novo-dominio.com
   ```
6. Clique em **"Save"**
7. Clique em **"Redeploy"** ou **"Restart"**

### Passo 2: Hostinger (Frontend) - Verificar

1. Verifique se `VITE_API_URL` está correto (deve apontar para o backend no Colify)
2. Se já estava correto, **não precisa fazer nada**
3. Se precisar atualizar, edite o `.env` e faça novo build:
   ```bash
   cd frontend
   npm run build
   # Faça upload da pasta dist/ para Hostinger
   ```

### Passo 3: Testar

1. Acesse o novo domínio do frontend
2. Abra o console (F12)
3. Teste login/cadastro
4. Verifique se não há erros de CORS

## 🐛 Problemas Comuns

### Erro: "CORS policy blocked"

**Causa:** `CORS_ORIGIN` não está configurado com o novo domínio

**Solução:**
1. Verifique o domínio exato no navegador (com ou sem `www.`)
2. Atualize `CORS_ORIGIN` no Colify com o domínio exato
3. Se usar múltiplos domínios: `CORS_ORIGIN=https://dominio.com,https://www.dominio.com`
4. Faça redeploy do backend

### Frontend não carrega dados

**Causa:** Cache do navegador ou CORS ainda não atualizado

**Solução:**
1. Limpe o cache do navegador (Ctrl+Shift+Delete)
2. Verifique se fez redeploy do backend após atualizar `CORS_ORIGIN`
3. Teste em aba anônima/privada

### Erro: "Network Error"

**Causa:** `VITE_API_URL` pode estar incorreto ou backend offline

**Solução:**
1. Verifique se o backend está online
2. Verifique se `VITE_API_URL` está correto
3. Teste acessar a API diretamente: `https://seu-backend.colify.app/api/health`

## 📝 Exemplo de Configuração

### Backend (Colify) - Apenas CORS mudou
```env
# CORS (ATUALIZAR)
CORS_ORIGIN=https://novo-dominio.com

# App (NÃO MUDAR)
APP_URL=https://seu-backend.colify.app
NODE_ENV=production
PORT=3001

# Database (NÃO MUDAR)
DATABASE_URL=postgresql://... (Railway)
DB_SSL=true

# JWT (NÃO MUDAR)
JWT_SECRET=...
```

### Frontend (Hostinger) - Verificar se está correto
```env
# API URL (verificar se está correto - provavelmente já está)
VITE_API_URL=https://seu-backend.colify.app/api

# App
VITE_APP_NAME=BetGenius
```

## ✅ Verificação Final

Após atualizar, verifique:

- [ ] Frontend carrega no novo domínio
- [ ] Não há erros de CORS no console (F12)
- [ ] Login funciona
- [ ] Jogos carregam
- [ ] Requisições à API funcionam

## 🎯 Resumo Ultra-Rápido

1. **Colify**: Atualizar `CORS_ORIGIN` → Redeploy
2. **Hostinger**: Verificar `VITE_API_URL` (provavelmente já está OK)
3. **Testar**: Acessar novo domínio e verificar console

**Tempo estimado: 2-5 minutos**

---

**💡 Dica:** Se o erro de CORS persistir após atualizar, verifique se o domínio no `CORS_ORIGIN` está **exatamente** igual ao que aparece na barra de endereço do navegador (incluindo `www.` se houver).

