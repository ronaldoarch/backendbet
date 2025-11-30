# Testar Login e Wallet

## Comando Correto para Login:

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"midasreidoblack@gmail.com","password":"12345678"}'
```

**Nota:** Faltava uma aspas após o email no seu comando.

## Testar Login e Wallet:

### 1. Fazer Login e Obter Token:

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"midasreidoblack@gmail.com","password":"12345678"}' \
  -s
```

### 2. Copiar o `access_token` da resposta e testar Wallet:

```bash
# Substitua TOKEN_AQUI pelo access_token obtido acima
TOKEN="TOKEN_AQUI"

curl http://localhost:3001/api/profile/wallet \
  -H "Authorization: Bearer $TOKEN" \
  -s | jq
```

### 3. Ou fazer tudo em um comando:

```bash
# Fazer login e obter token
TOKEN=$(curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"midasreidoblack@gmail.com","password":"12345678"}' \
  -s | jq -r '.access_token')

# Testar wallet
curl http://localhost:3001/api/profile/wallet \
  -H "Authorization: Bearer $TOKEN" \
  -s | jq
```

## O que esperar:

A resposta do `/api/profile/wallet` deve mostrar:
```json
{
  "wallet": {
    "id": 1,
    "user_id": 1,
    "balance": "10000.00",
    "balance_bonus": "0.00",
    "balance_withdrawal": "0.00",
    "total_balance": 10000.00
  }
}
```

Se o `balance` estiver como `"10000.00"`, o backend está funcionando corretamente e o problema é apenas no frontend (cache ou não atualizado).

