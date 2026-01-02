# Corrigir Host do Railway

## Problema:
- ❌ Conexão com banco: `ETIMEDOUT`
- ❌ Login: Erro 500 (provavelmente por não conectar ao banco)

O `DB_HOST=containers-us-west-XXX.railway.app` não está funcionando.

## Solução:

### 1. Obter Host Correto do Railway:

1. Acesse **Railway** (https://railway.app)
2. Clique no projeto que contém o MySQL
3. Clique no serviço **MySQL**
4. Vá em **"Variables"** ou **"Connect"**
5. Procure por:
   - `MYSQLHOST` (pode ser `mysql.railway.internal` - não funciona externamente)
   - `MYSQL_PUBLIC_URL` (connection string pública)
   - Ou procure por um host público como `*.proxy.rlwy.net` ou `*.railway.app`

### 2. Hosts Comuns do Railway:

O Railway pode usar diferentes formatos de host:

**Opção 1: Host Proxy (Recomendado)**
```
DB_HOST=nozomi.proxy.rlwy.net
DB_PORT=3306
```

**Opção 2: Host Público Railway**
```
DB_HOST=containers-us-west-XXX.railway.app
DB_PORT=3306
```

**Opção 3: Connection String Pública**
Se houver `MYSQL_PUBLIC_URL`, extraia o host dela.

### 3. Verificar no Railway:

No Railway, vá em **MySQL → Connect** e procure por:
- **Public Networking** (deve estar habilitado)
- **Connection URL** ou **Public URL**

### 4. Atualizar no Coolify:

1. No Coolify, vá em **"Environment Variables"**
2. Encontre `DB_HOST`
3. Clique em **"Update"**
4. Substitua pelo host correto do Railway
5. Salve
6. **Redeploy** ou **Restart** a aplicação

### 5. Testar Conexão:

Após atualizar, teste:

```bash
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
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
      connectTimeout: 10000
    });
    console.log('✅ Conexão OK!');
    const [rows] = await conn.execute('SHOW TABLES');
    console.log('📊 Tabelas:', rows.length);
    await conn.end();
  } catch (e) {
    console.error('❌ Erro:', e.message);
    console.error('Host tentado:', process.env.DB_HOST);
  }
})();
"
```

### 6. Verificar Logs do Login:

Se ainda der erro 500 no login, verifique os logs:

No Coolify, vá em **"Logs"** e procure por:
- `[AuthController] Erro no login:`
- Erros de conexão com banco
- Stack traces

## Alternativa: Usar MYSQL_PUBLIC_URL

Se o Railway fornecer `MYSQL_PUBLIC_URL`, você pode usar ela diretamente:

```env
MYSQL_PUBLIC_URL=mysql://root:senha@host:porta/railway
```

E modificar o `database.js` para usar essa URL.

## Troubleshooting:

### Erro: ETIMEDOUT
- Verifique se o host está correto
- Verifique se o Railway permite conexões externas
- Verifique se a porta está correta (geralmente 3306)
- Verifique firewall/rede

### Erro: Access denied
- Verifique `DB_USER` e `DB_PASSWORD`
- Verifique se o usuário tem permissão para conectar externamente

### Erro: Unknown database
- Verifique `DB_NAME` (geralmente `railway`)

