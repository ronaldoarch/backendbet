# Testar Depósito Diretamente

## Problema:
Os logs não estão aparecendo. Vamos testar o endpoint diretamente.

## Solução:

### 1. Fazer Login e Obter Token:

No terminal do Coolify:

```bash
# Fazer login (substitua email e senha por um usuário válido)
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"seu_email@exemplo.com","password":"sua_senha"}' \
  -s
```

**Copie o `access_token` da resposta.**

### 2. Testar Depósito com Token:

```bash
# Substitua TOKEN_AQUI pelo token obtido acima
TOKEN="TOKEN_AQUI"

curl -X POST http://localhost:3001/api/payments/deposit \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"amount": 20, "gateway": "arkama"}' \
  -v
```

### 3. Ver Resposta Completa:

A resposta deve mostrar:
- Status code (422)
- Body com os erros detalhados
- Headers da resposta

### 4. Alternativa: Ver Logs do Coolify via Interface:

1. No painel do Coolify, vá na aba **"Logs"**
2. Tente fazer um depósito no site
3. Os logs devem aparecer na interface

### 5. Ou Ver Logs via PM2:

```bash
# Verificar se PM2 está rodando
pm2 list

# Ver logs do PM2
pm2 logs

# Ou ver logs de um processo específico
pm2 logs 0
```

### 6. Testar Diretamente no Código:

Crie um script de teste:

```bash
node -e "
const mysql = require('mysql2/promise');
const axios = require('axios');

(async () => {
  try {
    // Conectar ao banco
    const conn = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '3306'),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
    });
    
    // Buscar credenciais Arkama
    const [rows] = await conn.execute(
      'SELECT setting_key, setting_value FROM app_settings WHERE setting_key LIKE \"arkama%\"'
    );
    
    const credentials = {};
    rows.forEach(row => {
      credentials[row.setting_key] = row.setting_value;
    });
    
    console.log('📋 Credenciais:', {
      token: credentials.arkama_api_token ? credentials.arkama_api_token.substring(0, 20) + '...' : 'NÃO CONFIGURADO',
      baseUrl: credentials.arkama_base_url || 'NÃO CONFIGURADO',
      environment: credentials.arkama_environment || 'NÃO CONFIGURADO'
    });
    
    // Testar requisição para Arkama
    const baseUrl = credentials.arkama_base_url || 'https://sandbox.arkama.com.br/api/v1';
    const apiToken = credentials.arkama_api_token;
    
    const requestBody = {
      value: '20.00',
      payment_method: 'pix',
      customer: {
        name: 'Teste User',
        email: 'teste@teste.com'
      },
      user_email: 'teste@teste.com',
      user_name: 'Teste User',
      description: 'Depósito de teste',
      callback_url: 'https://qoo8wgogo4ow4gsg0k0wk4g4.agenciamidas.com/api/payments/arkama-webhook',
      return_url: 'https://qoo8wgogo4ow4gsg0k0wk4g4.agenciamidas.com/wallet?payment=success'
    };
    
    console.log('\\n📤 Enviando requisição para:', baseUrl + '/orders');
    console.log('📋 Body:', JSON.stringify(requestBody, null, 2));
    
    try {
      const response = await axios.post(baseUrl + '/orders', requestBody, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': \`Bearer \${apiToken}\`
        },
        timeout: 30000
      });
      
      console.log('\\n✅ Sucesso!');
      console.log('📊 Resposta:', JSON.stringify(response.data, null, 2));
    } catch (error) {
      console.log('\\n❌ Erro na requisição:');
      console.log('Status:', error.response?.status);
      console.log('Status Text:', error.response?.statusText);
      console.log('Data:', JSON.stringify(error.response?.data, null, 2));
    }
    
    await conn.end();
  } catch (e) {
    console.error('❌ Erro:', e.message);
    console.error('Stack:', e.stack);
  }
})();
"
```

Este script vai:
1. Buscar credenciais do banco
2. Fazer uma requisição direta para a API Arkama
3. Mostrar a resposta completa (sucesso ou erro)

