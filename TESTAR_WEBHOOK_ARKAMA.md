# 🧪 Testar Webhook da Arkama

## 🔍 Verificar se o Endpoint Está Funcionando

### 1. Testar Endpoint Manualmente

Execute no terminal:

```bash
curl -X POST https://qoo8wgogo4ow4gsg0k0wk4g4.agenciamidas.com/api/payments/arkama-webhook \
  -H "Content-Type: application/json" \
  -d '{"test": "webhook"}'
```

**Resposta esperada:**
- Se retornar algo (mesmo erro), o endpoint está acessível
- Se der timeout ou erro de conexão, há problema de rede

### 2. Verificar se a Rota Está Registrada

O endpoint deve estar em:
- Rota: `/api/payments/arkama-webhook`
- Método: `POST`
- Público (sem autenticação)

### 3. Verificar Logs do Coolify

No painel do Coolify:
1. Vá em **"Logs"**
2. Procure por erros relacionados a `/api/payments/arkama-webhook`
3. Verifique se há erros de rota não encontrada

## 🔧 Possíveis Problemas

### Problema 1: Rota Não Encontrada

**Sintoma:** Erro 404 ou "Rota não encontrada"

**Solução:**
1. Verifique se o deploy foi concluído
2. Verifique se a rota está registrada em `src/routes/index.js`
3. Reinicie a aplicação no Coolify

### Problema 2: CORS

**Sintoma:** Erro de CORS no navegador

**Solução:**
- O webhook é chamado pelo servidor da Arkama, não pelo navegador
- CORS não deve ser problema para webhooks

### Problema 3: URL Não Acessível

**Sintoma:** Timeout ou erro de conexão

**Solução:**
1. Verifique se o backend está rodando
2. Verifique se a URL está correta
3. Teste com `curl` primeiro

## 📋 URL Correta

Certifique-se de usar exatamente:

```
https://qoo8wgogo4ow4gsg0k0wk4g4.agenciamidas.com/api/payments/arkama-webhook
```

**Importante:**
- Deve começar com `https://`
- Deve terminar com `/arkama-webhook` (não `/arkalma-webhook`)
- Não deve ter espaços
- Deve ser tudo minúsculas (exceto o protocolo)

## 🧪 Teste Rápido

1. **Teste o health check primeiro:**
   ```bash
   curl https://qoo8wgogo4ow4gsg0k0wk4g4.agenciamidas.com/api/health
   ```
   Se isso funcionar, o backend está acessível.

2. **Teste o endpoint do webhook:**
   ```bash
   curl -X POST https://qoo8wgogo4ow4gsg0k0wk4g4.agenciamidas.com/api/payments/arkama-webhook \
     -H "Content-Type: application/json" \
     -d '{}'
   ```

## 🔄 Se Ainda Não Funcionar

1. **Verifique o deploy:**
   - No Coolify, verifique se o último deploy foi concluído
   - Veja se há erros no deploy

2. **Verifique as rotas:**
   - Confirme que `paymentRoutes` está importado em `src/routes/index.js`
   - Confirme que está usando `/api/payments`

3. **Reinicie a aplicação:**
   - No Coolify, faça um redeploy

4. **Verifique os logs:**
   - Veja se há erros nos logs do Coolify


