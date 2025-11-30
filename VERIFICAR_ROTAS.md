# Verificar Rotas no Coolify

## O problema:
A rota `/api/payments/deposit` está retornando 404 "Rota não encontrada", mesmo estando definida no código.

## Possíveis causas:
1. Servidor não foi reiniciado após mudanças
2. Ordem das rotas está incorreta
3. Problema com o prefixo `/api`

## Solução:

### 1. Reiniciar a aplicação no Coolify:
- Vá na aba **"Deployments"**
- Clique em **"Redeploy"** ou **"Restart"**
- Aguarde o build completar

### 2. Verificar se as rotas estão sendo registradas:

No terminal do Coolify, execute:

```bash
# Verificar se o arquivo paymentRoutes.js existe
ls -la src/routes/paymentRoutes.js

# Verificar conteúdo do arquivo
cat src/routes/paymentRoutes.js

# Verificar se está sendo importado em index.js
cat src/routes/index.js | grep payment
```

### 3. Testar a rota sem autenticação (temporariamente):

Para testar, podemos temporariamente remover a autenticação. Mas primeiro, vamos verificar se o problema é o token:

```bash
# Testar sem token (deve retornar 401, não 404)
curl -X POST http://localhost:3001/api/payments/deposit \
  -H "Content-Type: application/json" \
  -d '{"amount": 20, "gateway": "arkama"}'

# Se retornar 401, a rota existe! O problema é o token.
# Se retornar 404, a rota não está registrada.
```

### 4. Verificar logs do servidor:

Na aba **"Logs"** do Coolify, procure por:
- `🚀 Servidor rodando na porta 3001`
- Erros de importação de módulos
- Erros de registro de rotas

### 5. Verificar variáveis de ambiente:

```bash
echo $JWT_SECRET
```

Se estiver vazio, o middleware pode estar falhando silenciosamente.

## Próximos passos:

1. **Reinicie a aplicação no Coolify**
2. **Teste sem token** para ver se retorna 401 (rota existe) ou 404 (rota não existe)
3. **Verifique os logs** para ver se há erros de inicialização

