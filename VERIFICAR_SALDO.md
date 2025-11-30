# Verificar Saldo do Usuário

## Problema:
O saldo no banco está R$ 10.000,00 mas o site mostra R$ 0,00.

## Verificar:

### 1. Verificar Saldo no Banco:

No terminal do Coolify:

```bash
node -e "
const mysql = require('mysql2/promise');
(async () => {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
  });
  
  // Verificar wallet do user_id = 1
  const [wallets] = await conn.execute('SELECT * FROM wallets WHERE user_id = 1');
  console.log('📊 Wallet no banco:');
  if (wallets.length > 0) {
    console.log('  Balance:', wallets[0].balance);
    console.log('  Balance Bonus:', wallets[0].balance_bonus);
    console.log('  Balance Withdrawal:', wallets[0].balance_withdrawal);
  } else {
    console.log('  ❌ Wallet não encontrada!');
  }
  
  // Verificar usuário
  const [users] = await conn.execute('SELECT id, email, name FROM users WHERE id = 1');
  if (users.length > 0) {
    console.log('\\n👤 Usuário:');
    console.log('  ID:', users[0].id);
    console.log('  Email:', users[0].email);
    console.log('  Nome:', users[0].name);
  }
  
  await conn.end();
})();
"
```

### 2. Testar Endpoint de Wallet:

Primeiro, faça login para obter um token:

```bash
# Fazer login (substitua email e senha)
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"seu_email@exemplo.com","password":"sua_senha"}' \
  -s | jq -r '.access_token'
```

Depois, teste o endpoint de wallet:

```bash
# Substitua TOKEN pelo token obtido acima
TOKEN="seu_token_aqui"

curl http://localhost:3001/api/profile/wallet \
  -H "Authorization: Bearer $TOKEN" \
  -s | jq
```

### 3. Verificar se o Frontend está Chamando o Endpoint Correto:

No console do navegador (F12), verifique:
- Se há erros de rede
- Se o endpoint `/api/profile/wallet` está sendo chamado
- Qual é a resposta do endpoint

### 4. Limpar Cache do Navegador:

- Pressione Ctrl+Shift+R (Windows/Linux) ou Cmd+Shift+R (Mac)
- Ou limpe o cache do navegador completamente

### 5. Verificar se o Token está Válido:

O saldo pode não aparecer se:
- O token expirou
- O token não está sendo enviado corretamente
- O user_id do token não corresponde ao user_id da wallet

## Solução Rápida:

Se o problema persistir, tente fazer logout e login novamente no site.

