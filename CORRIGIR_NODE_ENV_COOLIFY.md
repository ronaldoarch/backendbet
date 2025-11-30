# Corrigir NODE_ENV no Coolify

## Problema:
O `NODE_ENV=production` está marcado como "Available at Buildtime", o que pode causar problemas no build (skips devDependencies).

## Solução:

### Opção 1: Desmarcar "Available at Buildtime" para NODE_ENV (Recomendado)

1. No Coolify, vá em **"Environment Variables"**
2. Encontre a variável `NODE_ENV`
3. Clique em **"Update"**
4. **Desmarque** a opção **"Available at Buildtime"**
5. Mantenha **"Available at Runtime"** marcado
6. Salve

Isso permite que o build use `development` (com devDependencies), mas a aplicação roda em `production`.

### Opção 2: Criar NODE_ENV separado para Build e Runtime

1. Adicione uma nova variável `NODE_ENV_BUILD=development`
2. Marque apenas **"Available at Buildtime"**
3. Mantenha `NODE_ENV=production` apenas para **"Available at Runtime"**

### Opção 3: Usar NIXPACKS_NODE_VERSION

Se você já tem `NIXPACKS_NODE_VERSION=22`, isso deve ser suficiente para o build.

## Após Corrigir:

1. **Salve** as alterações
2. **Redeploy** a aplicação
3. Verifique os logs para confirmar que o build funcionou

## Verificar se Funcionou:

No terminal do Coolify, após o redeploy:

```bash
# Verificar NODE_ENV
echo $NODE_ENV

# Deve mostrar: production

# Testar conexão com banco
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
    await conn.end();
  } catch (e) {
    console.error('❌ Erro:', e.message);
    process.exit(1);
  }
})();
"
```

## Testar Endpoints:

```bash
# Health check
curl http://localhost:3001/api/health

# Settings (não deve mais dar erro 500)
curl http://localhost:3001/api/settings/data

# Login (não deve mais dar erro 500)
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"teste@teste.com","password":"123456"}'
```

