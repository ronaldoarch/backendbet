# Forçar Rebuild no Coolify

## Problema:
O Coolify pulou o build porque detectou que não houve mudanças:
```
No configuration changed & image found with the same Git Commit SHA. Build step skipped.
```

## Solução:

### Opção 1: Forçar Rebuild (Recomendado)

1. No Coolify, vá na aba **"Deployments"**
2. Clique no botão **"Redeploy"** (ícone de refresh)
3. **OU** clique em **"Advanced"** → **"Force Rebuild"** (se disponível)

### Opção 2: Fazer Commit Vazio para Forçar Build

Se o Redeploy não funcionar, faça um commit vazio:

```bash
cd backend-api
git commit --allow-empty -m "Force rebuild - update environment variables"
git push origin main
```

Isso vai forçar o Coolify a detectar uma mudança e fazer rebuild.

### Opção 3: Limpar Cache do Coolify

1. No Coolify, vá em **"Configuration"**
2. Procure por opções de **"Clear Cache"** ou **"Force Rebuild"**
3. Ou delete a imagem antiga e faça redeploy

### Opção 4: Verificar se as Variáveis Foram Aplicadas

Mesmo sem rebuild, as variáveis de ambiente devem estar ativas. Teste:

No terminal do Coolify:
```bash
# Verificar variáveis
env | grep DB_

# Testar conexão
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
    console.log('✅ Conexão OK!');
    const [rows] = await conn.execute('SHOW TABLES');
    console.log('📊 Tabelas:', rows.length);
    await conn.end();
  } catch (e) {
    console.error('❌ Erro:', e.message);
  }
})();
"
```

## Após Forçar Rebuild:

1. Aguarde o build completar
2. Verifique os logs para confirmar que o build foi executado
3. Teste os endpoints:

```bash
# Health check
curl http://localhost:3001/api/health

# Settings
curl http://localhost:3001/api/settings/data

# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"teste@teste.com","password":"123456"}'
```

## Nota Importante:

**Variáveis de ambiente não requerem rebuild!** Elas são aplicadas em runtime. O problema pode ser:
- A aplicação não foi reiniciada após mudar as variáveis
- As variáveis não foram salvas corretamente
- Há um erro de conexão com o banco

Teste primeiro se as variáveis estão ativas antes de forçar rebuild.

