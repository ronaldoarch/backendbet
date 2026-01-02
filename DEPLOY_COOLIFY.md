# 🚀 Deploy do Backend no Coolify (Contabo VPS)

## ✅ Vantagens do Coolify

- ✅ **Deploy Automático:** Sem configurar PM2, Nginx manualmente
- ✅ **SSL Automático:** Let's Encrypt configurado automaticamente
- ✅ **Git Integration:** Deploy automático ao fazer push
- ✅ **Logs Centralizados:** Fácil de ver logs
- ✅ **IP Fixo:** VPS da Contabo tem IP fixo

## 📋 Pré-requisitos

- ✅ VPS da Contabo com Coolify instalado
- ✅ Acesso ao painel do Coolify
- ✅ Repositório Git do backend (GitHub, GitLab, etc.)
- ✅ Banco de dados Railway configurado

## 🏗️ Arquitetura

```
Frontend (betgeniusbr.com)
    ↓
Coolify (Proxy Reverso + SSL)
    ↓
Node.js (Gerenciado pelo Coolify)
    ↓
Railway MySQL
```

## 📦 Passo 1: Preparar o Backend para Coolify

### 1.1 Verificar se tem `vercel.json` ou criar `coolify.json`

O Coolify pode usar configurações similares ao Vercel. Vamos verificar:

```bash
cd backend-api
cat vercel.json
```

Se não existir, podemos criar um arquivo de configuração (opcional, o Coolify detecta automaticamente Node.js).

### 1.2 Verificar `package.json`

Certifique-se de que tem o script `start`:

```json
{
  "scripts": {
    "start": "node src/server.js"
  }
}
```

## 🌐 Passo 2: Configurar no Coolify

### 2.1 Criar Novo Projeto

1. Acesse o painel do Coolify: `http://seu-ip-coolify:8000` ou seu domínio
2. Clique em **"New Resource"** ou **"Novo Recurso"**
3. Selecione **"Application"** ou **"Aplicação"**

### 2.2 Configurar Git Repository

1. **Source:** Selecione seu repositório Git (GitHub, GitLab, etc.)
2. **Branch:** `main` ou `master`
3. **Build Pack:** Deixe como **"Nixpacks"** (detecta automaticamente Node.js)
   - Ou selecione **"Node.js"** se disponível

### 2.3 Configurar Build Settings

1. **Build Command:** (geralmente não precisa, mas se necessário):
   ```bash
   npm install --production
   ```

2. **Start Command:** (geralmente detecta automaticamente):
   ```bash
   npm start
   ```
   Ou:
   ```bash
   node src/server.js
   ```

3. **Port:** `3001` (ou a porta que você configurou no `.env`)

### 2.4 Configurar Environment Variables

No Coolify, adicione as variáveis de ambiente:

```env
# Banco de Dados Railway
DB_HOST=containers-us-west-XXX.railway.app
DB_PORT=3306
DB_USER=root
DB_PASSWORD=sua_senha_do_railway
DB_NAME=railway
DB_SSL=true

# Servidor
NODE_ENV=production
PORT=3001

# JWT
JWT_SECRET=sua_jwt_secret_super_segura_aqui

# CORS
CORS_ORIGIN=https://betgeniusbr.com,http://betgeniusbr.com

# Coolify (opcional)
COOLIFY=true
```

**Como adicionar:**
1. No painel do Coolify, vá em **"Environment Variables"** ou **"Variáveis de Ambiente"**
2. Clique em **"Add Variable"** ou **"Adicionar Variável"**
3. Adicione cada variável uma por uma

### 2.5 Configurar Domínio

1. **Domain:** Adicione seu domínio (ex: `api.betgeniusbr.com`)
2. **SSL:** O Coolify configura automaticamente com Let's Encrypt
3. **Force HTTPS:** Ative esta opção

### 2.6 Configurar Health Check (Opcional)

1. **Health Check Path:** `/api/health`
2. **Health Check Port:** `3001`

## 🚀 Passo 3: Fazer Deploy

1. Clique em **"Deploy"** ou **"Fazer Deploy"**
2. O Coolify vai:
   - Clonar o repositório
   - Instalar dependências
   - Fazer build (se necessário)
   - Iniciar a aplicação
   - Configurar proxy reverso
   - Configurar SSL

3. Aguarde o deploy terminar (pode levar alguns minutos)

## ✅ Passo 4: Verificar Deploy

### 4.1 Verificar Logs

No painel do Coolify:
1. Vá em **"Logs"** ou **"Logs"**
2. Verifique se não há erros
3. Procure por: `🚀 Servidor rodando na porta 3001`

### 4.2 Testar Endpoints

```bash
# Testar health check
curl https://api.betgeniusbr.com/api/health

# Ou se não configurou domínio ainda
curl http://seu-ip-coolify/api/health
```

### 4.3 Verificar Status

No painel do Coolify, verifique:
- ✅ Status: **Running** ou **Rodando**
- ✅ Porta: **3001**
- ✅ SSL: **Ativo** (se configurou domínio)

## 🔧 Passo 5: Configurar CORS (Se Necessário)

Se o frontend estiver em outro domínio, certifique-se de que o CORS está configurado no backend.

No Coolify, adicione a variável de ambiente:

```env
CORS_ORIGIN=https://betgeniusbr.com,http://betgeniusbr.com,https://www.betgeniusbr.com
```

E reinicie a aplicação.

## 🔄 Passo 6: Configurar Deploy Automático (Opcional)

### 6.1 Webhook do GitHub

1. No Coolify, vá em **"Settings"** → **"Webhooks"**
2. Copie a URL do webhook
3. No GitHub:
   - Vá em **Settings** → **Webhooks**
   - Adicione a URL do Coolify
   - Eventos: **Push**

Agora, cada `git push` vai fazer deploy automático!

## 🐛 Troubleshooting

### Erro: "Cannot find module"

**Causa:** Dependências não instaladas.

**Solução:**
1. Verifique se o `package.json` está correto
2. No Coolify, vá em **"Build Settings"**
3. Adicione: `npm install --production` no build command

### Erro: "Port already in use"

**Causa:** Porta já está em uso.

**Solução:**
1. No Coolify, mude a porta para outra (ex: `3002`)
2. Ou verifique se há outra aplicação usando a porta

### Erro: "Database connection failed"

**Causa:** Credenciais do banco incorretas ou IP não permitido.

**Solução:**
1. Verifique as variáveis de ambiente no Coolify
2. No Railway, adicione o IP da VPS Contabo à whitelist
3. Verifique se `DB_SSL=true` está configurado

### Erro: "CORS policy"

**Causa:** CORS não configurado corretamente.

**Solução:**
1. Adicione `CORS_ORIGIN` nas variáveis de ambiente
2. Reinicie a aplicação no Coolify

### Aplicação não inicia

**Solução:**
1. Verifique os logs no Coolify
2. Verifique se o `package.json` tem o script `start`
3. Verifique se a porta está correta
4. Verifique as variáveis de ambiente

## 📊 Verificar IP da VPS

Para adicionar à whitelist da PlayFiver, você precisa do IP da VPS:

```bash
# No servidor VPS (via SSH)
curl ifconfig.me

# Ou
curl ipinfo.io/ip
```

Adicione este IP à whitelist da PlayFiver.

## 🔄 Atualizar Aplicação

### Opção 1: Deploy Automático (Recomendado)

Se configurou webhook, basta fazer:

```bash
git add .
git commit -m "Atualização"
git push
```

O Coolify faz deploy automaticamente!

### Opção 2: Deploy Manual

No painel do Coolify:
1. Vá na aplicação
2. Clique em **"Redeploy"** ou **"Refazer Deploy"**

## 📝 Checklist Final

- [ ] Backend deployado no Coolify
- [ ] Variáveis de ambiente configuradas
- [ ] Domínio configurado (opcional)
- [ ] SSL ativo (se usou domínio)
- [ ] Health check funcionando: `/api/health`
- [ ] Logs sem erros
- [ ] IP da VPS adicionado à whitelist da PlayFiver
- [ ] Frontend atualizado para usar nova URL da API

## 🔗 URLs Importantes

- **Painel Coolify:** `http://seu-ip-coolify:8000` ou seu domínio
- **API Backend:** `https://api.betgeniusbr.com/api` (se configurou domínio)
- **Health Check:** `https://api.betgeniusbr.com/api/health`

## 💡 Dicas

1. **Logs:** Use os logs do Coolify para debugar problemas
2. **Variáveis de Ambiente:** Sempre adicione no painel do Coolify, não no código
3. **SSL:** O Coolify configura automaticamente, mas pode levar alguns minutos
4. **Deploy Automático:** Configure webhook para facilitar atualizações
5. **Backup:** O Coolify pode fazer backup automático (verifique nas configurações)

## 🆚 Coolify vs Configuração Manual

| Aspecto | Coolify | Manual |
|---------|---------|--------|
| Configuração | ✅ Fácil | ⚠️ Complexa |
| PM2 | ✅ Automático | ⚠️ Manual |
| Nginx | ✅ Automático | ⚠️ Manual |
| SSL | ✅ Automático | ⚠️ Manual |
| Deploy | ✅ Git Push | ⚠️ SCP/Git |
| Logs | ✅ Centralizados | ⚠️ Dispersos |
| Controle | ⚠️ Limitado | ✅ Total |

## 🎯 Próximos Passos

1. ✅ Fazer deploy no Coolify
2. ✅ Configurar variáveis de ambiente
3. ✅ Testar endpoints
4. ✅ Adicionar IP da VPS à whitelist da PlayFiver
5. ✅ Atualizar frontend para usar nova URL
6. ✅ Testar abrir jogos

