# Redeploy no Coolify - Solução para Rota 404

## Problema:
A rota `/api/payments/deposit` está retornando 404, mesmo estando no código.

## Solução:

### Opção 1: Redeploy pelo Painel (Recomendado)
1. Acesse o painel do Coolify
2. Vá na aba **"Deployments"**
3. Clique em **"Redeploy"** ou **"Restart"**
4. Aguarde o build completar (pode levar 1-2 minutos)
5. Verifique os logs para confirmar que iniciou corretamente

### Opção 2: Forçar Deploy via Git
Se o Coolify está conectado ao repositório Git:

```bash
# Fazer um commit vazio para forçar deploy
git commit --allow-empty -m "Force redeploy - fix payment routes"
git push origin main
```

### Opção 3: Reiniciar Container
No terminal do Coolify:

```bash
# Ver processos
ps aux | grep node

# Matar processo Node.js (se houver)
pkill -f "node src/server.js"

# O Coolify deve reiniciar automaticamente
# Ou reinicie manualmente pelo painel
```

## Após o Redeploy:

### 1. Verificar se o servidor iniciou:
```bash
curl http://localhost:3001/api/health
# Deve retornar: {"status":"ok","timestamp":"..."}
```

### 2. Testar a rota de depósito:
```bash
# Sem token (deve retornar 401, não 404)
curl -X POST http://localhost:3001/api/payments/deposit \
  -H "Content-Type: application/json" \
  -d '{"amount": 20, "gateway": "arkama"}'
```

**Se retornar 401:** ✅ Rota está funcionando! O problema era o servidor não atualizado.
**Se retornar 404:** ❌ Ainda há problema. Verifique os logs de build.

### 3. Verificar logs:
Na aba **"Logs"** do Coolify, procure por:
- `🚀 Servidor rodando na porta 3001`
- Erros de importação
- Erros de registro de rotas

## Verificar se o código está atualizado:

No terminal do Coolify:
```bash
# Verificar se paymentRoutes.js existe
ls -la src/routes/paymentRoutes.js

# Verificar conteúdo
cat src/routes/paymentRoutes.js | head -10

# Verificar se está sendo importado
cat src/routes/index.js | grep payment
```

