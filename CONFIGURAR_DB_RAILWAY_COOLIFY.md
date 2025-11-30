# Configurar Banco de Dados Railway no Coolify

## Problema:
O banco de dados está no **Railway**, mas o Coolify está tentando conectar em `localhost`.

## Solução:

### 1. Obter Credenciais do Railway:

1. Acesse o **Railway** (https://railway.app)
2. Clique no projeto que contém o MySQL
3. Clique no serviço **MySQL**
4. Vá na aba **"Variables"** ou **"Connect"**
5. Copie as seguintes variáveis:
   - `MYSQLHOST` (ou host público)
   - `MYSQLPORT` (geralmente 3306)
   - `MYSQLUSER` (geralmente `root`)
   - `MYSQLPASSWORD` (senha)
   - `MYSQLDATABASE` (nome do banco, geralmente `railway`)

**⚠️ IMPORTANTE:** 
- Se você vir `MYSQLHOST=mysql.railway.internal`, isso é **interno** e não funciona do Coolify
- Procure por um host **público** como `nozomi.proxy.rlwy.net` ou `containers-us-west-xxx.railway.app`
- Ou procure por `MYSQL_PUBLIC_URL` que contém a connection string pública

### 2. Configurar Variáveis no Coolify:

1. Acesse o painel do **Coolify**
2. Vá na sua aplicação Node.js
3. Clique na aba **"Configuration"** ou **"Environment Variables"**
4. Adicione/atualize as seguintes variáveis:

```env
DB_HOST=nozomi.proxy.rlwy.net
DB_PORT=3306
DB_USER=root
DB_PASSWORD=XNtNSnKSwGddVKdrHMcUrGhMUgrvKXSj
DB_NAME=railway
DB_SSL=true
```

**Substitua pelos valores reais do seu Railway!**

### 3. Verificar Variáveis no Terminal:

No terminal do Coolify, execute:

```bash
# Verificar variáveis DB
env | grep -E "DB_|MYSQL"

# Deve mostrar:
# DB_HOST=nozomi.proxy.rlwy.net (ou seu host público)
# DB_PORT=3306
# DB_USER=root
# DB_PASSWORD=***
# DB_NAME=railway
```

### 4. Testar Conexão:

No terminal do Coolify, execute:

```bash
# Testar conexão via Node.js
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

### 5. Redeploy:

Após configurar as variáveis:

1. Salve as configurações no Coolify
2. Clique em **"Redeploy"**
3. Aguarde o build completar
4. Verifique os logs para confirmar que conectou ao banco

## Credenciais Comuns do Railway:

Se você já tem um projeto Railway configurado, as credenciais podem ser:

```env
DB_HOST=nozomi.proxy.rlwy.net
DB_PORT=3306
DB_USER=root
DB_PASSWORD=XNtNSnKSwGddVKdrHMcUrGhMUgrvKXSj
DB_NAME=railway
DB_SSL=true
```

**⚠️ IMPORTANTE:** Use as credenciais do **SEU** projeto Railway, não essas!

## Verificar se Funcionou:

Após o redeploy, teste:

```bash
# Testar health check
curl http://localhost:3001/api/health

# Testar settings (não deve mais dar erro 500)
curl http://localhost:3001/api/settings/data

# Testar login (não deve mais dar erro 500)
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"teste@teste.com","password":"123456"}'
```

## Troubleshooting:

### Erro: "Access denied"
- Verifique se `DB_USER` e `DB_PASSWORD` estão corretos
- Verifique se o host está correto (deve ser público, não `mysql.railway.internal`)

### Erro: "Connection timeout"
- Verifique se `DB_HOST` está correto
- Verifique se `DB_PORT` está correto (geralmente 3306)
- Verifique se o Railway permite conexões externas

### Erro: "Unknown database"
- Verifique se `DB_NAME` está correto (geralmente `railway`)

