# ⚡ Setup Rápido no Coolify

## 🚀 Passos Rápidos

### 1. No Painel do Coolify

1. **New Resource** → **Application**
2. **Source:** Selecione seu repositório Git
3. **Branch:** `main`
4. **Build Pack:** `Nixpacks` (detecta automaticamente)

### 2. Configurações de Build

- **Build Command:** (deixe vazio ou `npm install --production`)
- **Start Command:** `npm start` (já está no package.json)
- **Port:** `3001`

### 3. Variáveis de Ambiente

Adicione todas estas variáveis no painel do Coolify:

```env
DB_HOST=containers-us-west-XXX.railway.app
DB_PORT=3306
DB_USER=root
DB_PASSWORD=sua_senha_do_railway
DB_NAME=railway
DB_SSL=true
NODE_ENV=production
PORT=3001
JWT_SECRET=sua_jwt_secret_aqui
CORS_ORIGIN=https://betgeniusbr.com,http://betgeniusbr.com
```

### 4. Domínio (Opcional)

- **Domain:** `api.betgeniusbr.com`
- **SSL:** Automático (Let's Encrypt)
- **Force HTTPS:** ✅

### 5. Deploy

Clique em **"Deploy"** e aguarde!

## ✅ Verificar

```bash
# Health check
curl https://api.betgeniusbr.com/api/health

# Ou se não configurou domínio
curl http://seu-ip-coolify/api/health
```

## 🔍 Obter IP da VPS

```bash
# Via SSH na VPS
curl ifconfig.me
```

Adicione este IP à whitelist da PlayFiver!

## 📝 Checklist

- [ ] Aplicação criada no Coolify
- [ ] Variáveis de ambiente adicionadas
- [ ] Deploy concluído
- [ ] Health check funcionando
- [ ] IP da VPS adicionado à whitelist da PlayFiver
- [ ] Frontend atualizado para usar nova URL

