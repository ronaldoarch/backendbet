# ✅ Verificar Deploy no Coolify

## 🔍 Passo 1: Verificar Status no Coolify

1. No painel do Coolify, verifique:
   - ✅ Status: **Running** ou **Rodando**
   - ✅ Porta: **3001**
   - ✅ Sem erros nos logs

## 🧪 Passo 2: Testar Health Check

### Se configurou domínio:

```bash
curl https://api.betgeniusbr.com/api/health
```

### Se não configurou domínio ainda:

```bash
# Use o IP ou domínio do Coolify
curl http://seu-ip-coolify/api/health
```

**Resposta esperada:**
```json
{
  "status": "ok",
  "timestamp": "2024-11-29T..."
}
```

## 📋 Passo 3: Verificar Logs

No painel do Coolify:
1. Vá em **"Logs"** ou **"Logs"**
2. Procure por:
   - ✅ `🚀 Servidor rodando na porta 3001`
   - ✅ Sem erros de conexão com banco
   - ✅ Sem erros de módulos não encontrados

## 🔍 Passo 4: Testar Outros Endpoints

```bash
# Testar banners
curl https://api.betgeniusbr.com/api/banners

# Testar jogos
curl https://api.betgeniusbr.com/api/casinos/games?page=1&per_page=12

# Testar categorias
curl https://api.betgeniusbr.com/api/categories
```

## 🌐 Passo 5: Obter IP da VPS

Para adicionar à whitelist da PlayFiver:

```bash
# Via SSH na VPS
curl ifconfig.me

# Ou
curl ipinfo.io/ip
```

**Anote este IP!** Você vai precisar adicionar à whitelist da PlayFiver.

## 🔧 Passo 6: Verificar Variáveis de Ambiente

No painel do Coolify, verifique se todas as variáveis estão configuradas:

- [ ] `DB_HOST`
- [ ] `DB_PORT`
- [ ] `DB_USER`
- [ ] `DB_PASSWORD`
- [ ] `DB_NAME`
- [ ] `DB_SSL=true`
- [ ] `NODE_ENV=production`
- [ ] `PORT=3001`
- [ ] `JWT_SECRET`
- [ ] `CORS_ORIGIN`

## 🐛 Problemas Comuns

### Erro: "Cannot find module"

**Solução:**
1. Verifique os logs do Coolify
2. Pode ser que o build não instalou as dependências
3. Tente fazer redeploy

### Erro: "Database connection failed"

**Solução:**
1. Verifique as variáveis de ambiente do banco
2. No Railway, adicione o IP da VPS à whitelist
3. Verifique se `DB_SSL=true` está configurado

### Erro: "Port already in use"

**Solução:**
1. Verifique se a porta está correta (3001)
2. Pode haver outra aplicação usando a porta

### Health check não funciona

**Solução:**
1. Verifique se o backend está rodando
2. Verifique os logs
3. Teste diretamente: `curl http://localhost:3001/api/health` (via SSH)

## 📝 Próximos Passos

1. ✅ Verificar se o deploy está funcionando
2. ✅ Obter IP da VPS
3. ✅ Adicionar IP à whitelist da PlayFiver
4. ✅ Atualizar frontend para usar nova URL da API
5. ✅ Testar abrir jogos

## 🔗 URLs Importantes

- **Painel Coolify:** `http://seu-ip-coolify:8000`
- **API Backend:** `https://api.betgeniusbr.com/api` (se configurou domínio)
- **Health Check:** `https://api.betgeniusbr.com/api/health`

