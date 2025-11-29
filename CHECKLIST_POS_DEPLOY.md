# ✅ Checklist Pós-Deploy Coolify

## 🎉 Status Atual

- ✅ **Status:** Running (verde)
- ✅ **Domínio:** `api.betgeniusbr.com`
- ⚠️ **Aviso:** Há um ícone de aviso amarelo (verificar)

## 📋 Checklist de Verificação

### 1. Verificar Logs

1. No Coolify, clique na aba **"Logs"**
2. Procure por:
   - ✅ `🚀 Servidor rodando na porta 3001`
   - ✅ Sem erros de conexão com banco
   - ✅ Sem erros de módulos não encontrados
   - ⚠️ Se houver erros, anote-os

### 2. Verificar Variáveis de Ambiente

1. No Coolify, clique em **"Environment Variables"** (no menu lateral)
2. Verifique se todas estão configuradas:

```
✅ DB_HOST=containers-us-west-XXX.railway.app
✅ DB_PORT=3306
✅ DB_USER=root
✅ DB_PASSWORD=sua_senha_do_railway
✅ DB_NAME=railway
✅ DB_SSL=true
✅ NODE_ENV=production
✅ PORT=3001
✅ JWT_SECRET=5b08a53ceb004e5cb7cb704ca635d0e62bc5ad65cc932164516ea3991a50c170d3cbbf943739f658f1e8a8a0629b1daf33b8d82c54cc71dacab93b91890fe398
✅ CORS_ORIGIN=https://betgeniusbr.com,http://betgeniusbr.com
```

### 3. Testar Health Check

Abra no navegador ou use curl:

```bash
curl https://api.betgeniusbr.com/api/health
```

**Resposta esperada:**
```json
{
  "status": "ok",
  "timestamp": "2024-11-29T..."
}
```

### 4. Testar Outros Endpoints

```bash
# Banners
curl https://api.betgeniusbr.com/api/banners

# Jogos
curl https://api.betgeniusbr.com/api/casinos/games?page=1&per_page=12

# Categorias
curl https://api.betgeniusbr.com/api/categories
```

### 5. Verificar Aviso Amarelo

O ícone de aviso pode indicar:
- ⚠️ Health check falhando
- ⚠️ Algum recurso não configurado
- ⚠️ Porta não acessível

**Como verificar:**
1. Clique no ícone de aviso (se clicável)
2. Ou vá em **"Healthcheck"** no menu lateral
3. Verifique se o health check está configurado: `/api/health`

### 6. Obter IP da VPS

Para adicionar à whitelist da PlayFiver:

```bash
# Via SSH na VPS
curl ifconfig.me
```

**Anote este IP!** Você vai precisar adicionar à whitelist da PlayFiver.

### 7. Verificar SSL

1. Acesse: `https://api.betgeniusbr.com/api/health`
2. Verifique se o certificado SSL está válido (cadeado verde no navegador)
3. Se não estiver, o Coolify pode estar configurando (pode levar alguns minutos)

## 🐛 Problemas Comuns

### Aviso Amarelo Aparece

**Possíveis causas:**
1. Health check não configurado
2. Health check falhando
3. Porta não acessível

**Solução:**
1. Vá em **"Healthcheck"** no menu lateral
2. Configure:
   - **Path:** `/api/health`
   - **Port:** `3001`
   - **Interval:** `30` segundos

### Health Check Não Funciona

**Solução:**
1. Verifique os logs
2. Teste diretamente: `curl https://api.betgeniusbr.com/api/health`
3. Verifique se o backend está rodando na porta 3001

### Erro de Conexão com Banco

**Solução:**
1. Verifique as variáveis de ambiente do banco
2. No Railway, adicione o IP da VPS à whitelist
3. Verifique se `DB_SSL=true` está configurado

## 📝 Próximos Passos

1. ✅ Verificar logs
2. ✅ Verificar variáveis de ambiente
3. ✅ Testar health check
4. ✅ Obter IP da VPS
5. ✅ Adicionar IP à whitelist da PlayFiver
6. ✅ Atualizar frontend para usar `https://api.betgeniusbr.com/api`
7. ✅ Testar abrir jogos

## 🔗 URLs

- **API Backend:** `https://api.betgeniusbr.com/api`
- **Health Check:** `https://api.betgeniusbr.com/api/health`
- **Painel Coolify:** `http://seu-ip-coolify:8000`


