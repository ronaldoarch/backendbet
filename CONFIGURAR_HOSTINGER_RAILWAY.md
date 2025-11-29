# 🚀 Configurar Backend na Hostinger com Banco no Railway

## ✅ Sim, é possível!

Você pode ter:
- **Backend**: Hostinger (servidor Node.js)
- **Banco de Dados**: Railway (MySQL)

## 📋 Passo a Passo

### 1. Obter Credenciais do Railway

1. Acesse: https://railway.app
2. Vá no seu projeto MySQL
3. Clique em "Variables" ou "Connect"
4. Anote as credenciais:
   - `MYSQLHOST` (host)
   - `MYSQLPORT` (porta, geralmente 3306)
   - `MYSQLUSER` (usuário)
   - `MYSQLPASSWORD` (senha)
   - `MYSQLDATABASE` (nome do banco)

### 2. Configurar .env na Hostinger

Conecte via SSH na Hostinger e edite o arquivo `.env`:

```bash
cd ~/backend-api
nano .env
```

Configure assim:

```env
# Banco de Dados Railway
DB_HOST=containers-us-west-XXX.railway.app
DB_PORT=3306
DB_USER=root
DB_PASSWORD=sua_senha_do_railway
DB_NAME=railway

# SSL (Railway geralmente requer SSL)
DB_SSL=true

# Outras configurações
NODE_ENV=production
PORT=3001
JWT_SECRET=sua_jwt_secret_aqui
```

**Importante:**
- Use o `MYSQLHOST` do Railway como `DB_HOST`
- Use o `MYSQLPORT` do Railway como `DB_PORT`
- Use o `MYSQLUSER` do Railway como `DB_USER`
- Use o `MYSQLPASSWORD` do Railway como `DB_PASSWORD`
- Use o `MYSQLDATABASE` do Railway como `DB_NAME`
- **Ative SSL**: `DB_SSL=true` (Railway geralmente requer SSL)

### 3. Testar Conexão

Na Hostinger, teste a conexão:

```bash
cd ~/backend-api
node -e "
const mysql = require('mysql2/promise');
(async () => {
  try {
    const conn = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      ssl: { rejectUnauthorized: false }
    });
    console.log('✅ Conexão OK!');
    await conn.end();
  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
})();
"
```

### 4. Reiniciar o Backend

```bash
pm2 restart backend-api --update-env
```

Ou se não estiver rodando:

```bash
pm2 start ecosystem.config.cjs
```

### 5. Verificar Logs

```bash
pm2 logs backend-api
```

Procure por:
- `✅ Conexão com banco estabelecida`
- Ou erros de conexão

## ⚠️ Possíveis Problemas

### Erro: "Access denied"

**Causa:** O IP da Hostinger não está permitido no Railway.

**Solução:**
1. No Railway, vá em "Settings" → "Network"
2. Adicione o IP da Hostinger à whitelist
3. Ou desative a whitelist (menos seguro)

### Erro: "Connection timeout"

**Causa:** Firewall bloqueando a conexão.

**Solução:**
1. Verifique se o Railway permite conexões externas
2. Verifique se a porta 3306 está aberta
3. Tente usar o host público do Railway

### Erro: "SSL required"

**Causa:** Railway requer SSL, mas não está configurado.

**Solução:**
- Adicione `DB_SSL=true` no `.env`
- O código já está configurado para usar SSL quando `DB_SSL=true`

## 🔒 Segurança

- ✅ Use SSL (`DB_SSL=true`)
- ✅ Mantenha as credenciais seguras no `.env`
- ✅ Não commite o `.env` no Git
- ✅ Use variáveis de ambiente no PM2

## 📊 Vantagens

- ✅ Backend na Hostinger (mais controle)
- ✅ Banco no Railway (gerenciado, backups automáticos)
- ✅ Escalabilidade independente
- ✅ Facilita migrações futuras

## 🆚 Comparação

| Aspecto | Vercel | Hostinger |
|---------|--------|-----------|
| IP Fixo | ❌ Dinâmico | ✅ Fixo |
| Timeout | ⚠️ 10s (free) | ✅ Sem limite |
| Controle | ⚠️ Limitado | ✅ Total |
| Custo | ✅ Grátis | 💰 Pago |

## 💡 Recomendação

Se você já tem a Hostinger, usar o backend lá com o banco no Railway é uma boa opção porque:
- IP fixo (mais fácil para whitelist)
- Sem limite de timeout
- Mais controle sobre o servidor

