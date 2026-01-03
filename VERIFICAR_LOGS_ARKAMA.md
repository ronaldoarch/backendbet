# Verificar Logs da API Arkama

## Credenciais Encontradas:
- ✅ `arkama_api_token`: Configurado
- ⚠️ `arkama_base_url`: `https://sandbox.arkama.com.br/api/v1` (sandbox)
- ⚠️ `arkama_environment`: `production` (inconsistente!)

## Problema:
O `environment` está como `production` mas a `base_url` está apontando para `sandbox`. Isso pode causar problemas.

## Solução:

### 1. Verificar Logs em Tempo Real:

No terminal do Coolify, execute:

```bash
# Ver todos os logs (sem filtro)
tail -f /proc/1/fd/1
```

Depois, **tente fazer um depósito no site** e veja os logs aparecerem.

### 2. Ou ver logs recentes:

```bash
# Ver últimas 100 linhas dos logs
tail -n 100 /proc/1/fd/1 | grep -E "Arkama|PaymentController"
```

### 3. Testar Depósito Diretamente:

No terminal do Coolify:

```bash
# Primeiro, faça login (substitua email e senha)
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"seu_email@exemplo.com","password":"sua_senha"}' \
  -s | jq -r '.access_token'

# Copie o token e use no próximo comando
TOKEN="cole_o_token_aqui"

# Testar depósito
curl -X POST http://localhost:3001/api/payments/deposit \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"amount": 20, "gateway": "arkama"}' \
  -v
```

### 4. Corrigir Inconsistência (se necessário):

Se você quiser usar **production**, atualize no admin:
- Vá em `/admin/gateway`
- Altere `arkama_environment` para `production`
- A `base_url` será atualizada automaticamente para `https://app.arkama.com.br/api/v1`

Se você quiser usar **sandbox** (para testes), atualize:
- Altere `arkama_environment` para `sandbox`
- A `base_url` será atualizada automaticamente para `https://sandbox.arkama.com.br/api/v1`

## O que procurar nos logs:

Quando você tentar fazer um depósito, procure por:

1. `[Arkama] Enviando requisição:` - Mostra o que está sendo enviado
2. `[Arkama] Erro ao criar compra:` - Mostra o erro completo
3. `errors:` - Mostra quais campos estão faltando

## Exemplo de log esperado:

```
[PaymentController] Chamando Arkama API...
[Arkama] Criando compra: { amount: '20.00', user_email: '...' }
[Arkama] Enviando requisição: { value: '20.00', payment_method: 'pix', ... }
[Arkama] Erro ao criar compra: { message: '...', status: 422, data: { errors: { ... } } }
```

