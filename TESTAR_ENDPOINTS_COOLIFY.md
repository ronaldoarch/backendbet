# Testar Endpoints Após Configuração

## ✅ Status Atual:
- Variáveis de ambiente configuradas corretamente
- Health check funcionando: `{"status":"ok"}`

## Próximos Testes:

### 1. Testar Settings (que estava dando erro 500):

```bash
curl http://localhost:3001/api/settings/data
```

**Resultado esperado:**
- ✅ Deve retornar JSON com configurações (não erro 500)
- ✅ Pode retornar valores padrão se as tabelas não existirem

### 2. Testar Login (que estava dando erro 500):

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"teste@teste.com","password":"123456"}'
```

**Resultado esperado:**
- ✅ Se usuário não existir: `{"error":"Check credentials","status":false}`
- ✅ Se usuário existir: `{"access_token":"...","token_type":"bearer","expires_in":3600}`
- ❌ Não deve retornar erro 500

### 3. Testar Conexão com Banco:

```bash
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
    console.log('✅ Conexão com Railway OK!');
    const [rows] = await conn.execute('SHOW TABLES');
    console.log('📊 Tabelas encontradas:', rows.length);
    if (rows.length > 0) {
      console.log('📋 Primeiras tabelas:', rows.slice(0, 5).map(r => Object.values(r)[0]).join(', '));
    }
    await conn.end();
  } catch (e) {
    console.error('❌ Erro:', e.message);
    console.error('Stack:', e.stack);
    process.exit(1);
  }
})();
"
```

**Resultado esperado:**
- ✅ Deve conectar ao banco Railway
- ✅ Deve listar as tabelas existentes

### 4. Verificar Tabelas Necessárias:

```bash
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
    
    const tables = ['users', 'settings', 'custom_layouts', 'transactions', 'app_settings'];
    
    for (const table of tables) {
      try {
        const [rows] = await conn.execute(\`SHOW TABLES LIKE '\${table}'\`);
        if (rows.length > 0) {
          console.log(\`✅ Tabela '\${table}' existe\`);
        } else {
          console.log(\`⚠️  Tabela '\${table}' NÃO existe\`);
        }
      } catch (e) {
        console.log(\`❌ Erro ao verificar '\${table}':\`, e.message);
      }
    }
    
    await conn.end();
  } catch (e) {
    console.error('❌ Erro de conexão:', e.message);
  }
})();
"
```

## Se os Endpoints Ainda Derem Erro 500:

1. **Verificar logs do Coolify:**
   - Vá na aba "Logs"
   - Procure por erros relacionados a banco de dados
   - Procure por erros de tabelas não encontradas

2. **Verificar se as tabelas existem:**
   - Execute o script acima para verificar tabelas
   - Se não existirem, crie-as usando os scripts de migration

3. **Verificar conexão:**
   - Execute o teste de conexão acima
   - Se falhar, verifique as credenciais do Railway

