# 🔗 Usar Subdomínio Temporário do Coolify

## ✅ Subdomínio do Coolify

O Coolify gerou um subdomínio temporário:
```
https://qoo8wgogo4ow4gsg0k0wk4g4.agenciamidas.com/
```

## 🧪 Testar Backend

### 1. Testar Health Check

Abra no navegador:
```
https://qoo8wgogo4ow4gsg0k0wk4g4.agenciamidas.com/api/health
```

**Resposta esperada:**
```json
{
  "status": "ok",
  "timestamp": "2024-11-29T..."
}
```

### 2. Testar Outros Endpoints

```bash
# Banners
curl https://qoo8wgogo4ow4gsg0k0wk4g4.agenciamidas.com/api/banners

# Jogos
curl https://qoo8wgogo4ow4gsg0k0wk4g4.agenciamidas.com/api/casinos/games?page=1&per_page=12

# Categorias
curl https://qoo8wgogo4ow4gsg0k0wk4g4.agenciamidas.com/api/categories
```

## 🔧 Atualizar Frontend (Temporário)

Enquanto o DNS do `api.betgeniusbr.com` não está configurado, você pode usar o subdomínio do Coolify:

### 1. Atualizar .env.local

No frontend:

```bash
cd frontend-standalone
nano .env.local
```

Conteúdo:

```env
VITE_API_URL=https://qoo8wgogo4ow4gsg0k0wk4g4.agenciamidas.com/api
```

### 2. Rebuild do Frontend

```bash
npm run build
```

### 3. Fazer Upload

Faça upload do `dist` atualizado para o servidor do frontend.

## ⚠️ Importante

1. **Temporário:** Este subdomínio é temporário, use apenas para testes
2. **DNS:** Configure o DNS do `api.betgeniusbr.com` para usar em produção
3. **CORS:** Certifique-se de que o `CORS_ORIGIN` no Coolify inclui o domínio do frontend

## 🔄 Depois de Configurar DNS

Quando o DNS do `api.betgeniusbr.com` estiver funcionando:

1. Atualize o `.env.local` do frontend:
   ```env
   VITE_API_URL=https://api.betgeniusbr.com/api
   ```

2. Rebuild e faça upload novamente

## 📋 Checklist

- [ ] Testar health check: `https://qoo8wgogo4ow4gsg0k0wk4g4.agenciamidas.com/api/health`
- [ ] Testar outros endpoints
- [ ] Atualizar frontend para usar o subdomínio temporário
- [ ] Configurar DNS do `api.betgeniusbr.com` (para produção)
- [ ] Obter IP da VPS para whitelist da PlayFiver

