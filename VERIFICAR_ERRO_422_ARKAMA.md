# Verificar Erro 422 da API Arkama

## Problema:
Erro 422: "O campo payment method é obrigatório" (e mais 2 erros)

## Solução:

### 1. Verificar Logs do Coolify:

No terminal do Coolify, execute:

```bash
# Ver logs em tempo real
tail -f /proc/1/fd/1 | grep -E "Arkama|PaymentController"

# Ou ver todos os logs
tail -f /proc/1/fd/1
```

Procure por:
- `[Arkama] Enviando requisição:`
- `[Arkama] Erro ao criar compra:`
- `[PaymentController] Erro na Arkama:`

### 2. Verificar o que está sendo enviado:

Os logs devem mostrar o `requestBody` completo que está sendo enviado para a Arkama.

### 3. Verificar Credenciais Arkama:

No terminal do Coolify:

```bash
# Verificar se as credenciais estão no banco
node -e "
const mysql = require('mysql2/promise');
(async () => {
  try {
    const conn = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '3306'),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
    });
    
    const [rows] = await conn.execute(
      'SELECT setting_key, setting_value FROM app_settings WHERE setting_key LIKE \"arkama%\"'
    );
    
    console.log('📋 Credenciais Arkama:');
    rows.forEach(row => {
      if (row.setting_key === 'arkama_api_token') {
        console.log(\`  \${row.setting_key}: \${row.setting_value ? row.setting_value.substring(0, 20) + '...' : 'NÃO CONFIGURADO'}\`);
      } else {
        console.log(\`  \${row.setting_key}: \${row.setting_value || 'NÃO CONFIGURADO'}\`);
      }
    });
    
    await conn.end();
  } catch (e) {
    console.error('❌ Erro:', e.message);
  }
})();
"
```

### 4. Testar Endpoint de Depósito:

No terminal do Coolify, teste diretamente:

```bash
# Primeiro, faça login para obter um token
TOKEN=$(curl -s -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"seu_email@exemplo.com","password":"sua_senha"}' | jq -r '.access_token')

# Testar depósito
curl -X POST http://localhost:3001/api/payments/deposit \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"amount": 20, "gateway": "arkama"}' \
  -v
```

### 5. Verificar Resposta Completa:

O erro 422 deve retornar um JSON com os campos faltantes. Verifique a resposta completa no console do navegador ou nos logs.

## Possíveis Causas:

1. **Credenciais Arkama não configuradas:**
   - Verifique se `arkama_api_token` está no banco
   - Verifique se `arkama_environment` está configurado

2. **Campos faltando na requisição:**
   - A API Arkama pode exigir campos adicionais
   - Verifique a documentação da Arkama

3. **Formato incorreto:**
   - A API pode esperar `paymentMethod` (camelCase) ao invés de `payment_method` (snake_case)
   - Ou vice-versa

## Próximos Passos:

1. **Verifique os logs** para ver exatamente o que está sendo enviado
2. **Verifique as credenciais** Arkama no banco
3. **Teste o endpoint** diretamente no terminal
4. **Envie os logs** para análise

