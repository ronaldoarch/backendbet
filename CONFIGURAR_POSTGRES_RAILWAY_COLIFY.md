# 🚂 Configurar PostgreSQL Railway no Colify

## Arquitetura do Projeto

- **Banco de Dados**: PostgreSQL no Railway
- **Backend**: Node.js no Colify
- **Frontend**: React na Hostinger

## 📋 Passo a Passo

### 1. Obter Credenciais do Railway

1. Acesse o **Railway** (https://railway.app)
2. Clique no projeto que contém o PostgreSQL
3. Clique no serviço **PostgreSQL**
4. Vá na aba **"Variables"** ou **"Connect"**
5. Copie as seguintes variáveis:

#### Opção A: DATABASE_URL (Recomendado)
- `DATABASE_URL` - Connection string completa (ex: `postgresql://user:password@host:port/database`)

#### Opção B: Variáveis Individuais
- `PGHOST` ou host público (ex: `containers-us-west-xxx.railway.app`)
- `PGPORT` (geralmente `5432`)
- `PGUSER` (geralmente `postgres`)
- `PGPASSWORD` (senha)
- `PGDATABASE` (nome do banco)

**⚠️ IMPORTANTE:** 
- Se você vir `PGHOST=postgres.railway.internal`, isso é **interno** e não funciona do Colify
- Procure por um host **público** como `containers-us-west-xxx.railway.app` ou `xxx.proxy.rlwy.net`
- Ou use `DATABASE_URL` que já contém todas as informações

### 2. Configurar Variáveis no Colify

1. Acesse o painel do **Colify**
2. Vá na sua aplicação Node.js
3. Clique na aba **"Environment Variables"** ou **"Configuration"**
4. Adicione/atualize as seguintes variáveis:

#### Se usar DATABASE_URL (Recomendado):
```env
DATABASE_URL=postgresql://postgres:senha@containers-us-west-xxx.railway.app:5432/railway
DB_SSL=true
NODE_ENV=production
```

#### Se usar variáveis individuais:
```env
PGHOST=containers-us-west-xxx.railway.app
PGPORT=5432
PGUSER=postgres
PGPASSWORD=sua_senha_aqui
PGDATABASE=railway
DB_SSL=true
NODE_ENV=production
```

**Substitua pelos valores reais do seu Railway!**

### 3. Verificar Variáveis no Terminal

No terminal do Colify, execute:

```bash
# Verificar variáveis DB
env | grep -E "DB_|PG|DATABASE"

# Deve mostrar:
# DATABASE_URL=postgresql://... (ou variáveis PGHOST, PGPORT, etc.)
# DB_SSL=true
```

### 4. Testar Conexão

No terminal do Colify, execute:

```bash
# Testar conexão via Node.js
node -e "
import('pg').then(({ default: pkg }) => {
  const { Pool } = pkg;
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  pool.query('SELECT NOW()').then((res) => {
    console.log('✅ Conexão com Railway PostgreSQL OK!');
    console.log('📊 Data/Hora do servidor:', res.rows[0].now);
    pool.end();
  }).catch((e) => {
    console.error('❌ Erro:', e.message);
    process.exit(1);
  });
});
"
```

### 5. Atualizar Backend para Usar PostgreSQL

Se o backend ainda estiver usando MySQL, você precisa:

1. **Atualizar imports** nos arquivos que usam o banco:
   ```javascript
   // Trocar de:
   import pool from '../config/database.js'
   
   // Para:
   import pool from '../config/database.postgres.js'
   ```

2. **Ajustar queries** (PostgreSQL usa sintaxe diferente):
   - `?` placeholders → `$1, $2, $3...`
   - `pool.execute()` → `pool.query()`
   - Algumas funções SQL podem ser diferentes

### 6. Redeploy

Após configurar as variáveis:

1. Salve as configurações no Colify
2. Clique em **"Redeploy"** ou **"Restart"**
3. Aguarde o build completar
4. Verifique os logs para confirmar que conectou ao banco:
   ```
   ✅ Conectado ao PostgreSQL
   ```

## 🔍 Verificar se Funcionou

Após o redeploy, teste:

```bash
# Testar health check
curl https://seu-backend.colify.app/api/health

# Testar settings
curl https://seu-backend.colify.app/api/settings/data

# Testar login
curl -X POST https://seu-backend.colify.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"teste@teste.com","password":"123456"}'
```

## 🐛 Troubleshooting

### Erro: "Access denied" ou "password authentication failed"
- Verifique se `PGUSER` e `PGPASSWORD` estão corretos
- Verifique se o host está correto (deve ser público, não `postgres.railway.internal`)

### Erro: "Connection timeout"
- Verifique se `PGHOST` está correto
- Verifique se `PGPORT` está correto (geralmente 5432)
- Verifique se o Railway permite conexões externas
- Verifique se há firewall bloqueando a conexão

### Erro: "Unknown database" ou "database does not exist"
- Verifique se `PGDATABASE` está correto
- Verifique se o banco foi criado no Railway

### Erro: "SSL required"
- Certifique-se de que `DB_SSL=true` está configurado
- O Railway PostgreSQL requer SSL para conexões externas

### Erro: "syntax error" nas queries
- PostgreSQL usa `$1, $2, $3` ao invés de `?`
- Verifique se as queries foram adaptadas para PostgreSQL

## 📝 Exemplo de Variáveis de Ambiente Completas

```env
# Database (Railway PostgreSQL)
DATABASE_URL=postgresql://postgres:senha@containers-us-west-xxx.railway.app:5432/railway
DB_SSL=true

# App
NODE_ENV=production
APP_ENV=production
PORT=3001
APP_URL=https://seu-backend.colify.app

# CORS (URL do frontend na Hostinger)
CORS_ORIGIN=https://seu-frontend.hostinger.com

# JWT
JWT_SECRET=sua_chave_secreta_aqui

# Outras variáveis necessárias...
```

## ✅ Checklist

- [ ] Credenciais do Railway obtidas
- [ ] Variáveis configuradas no Colify
- [ ] Teste de conexão executado com sucesso
- [ ] Backend atualizado para usar `database.postgres.js`
- [ ] Queries adaptadas para PostgreSQL (se necessário)
- [ ] Redeploy realizado
- [ ] Logs verificados (deve aparecer "✅ Conectado ao PostgreSQL")
- [ ] API testada e funcionando

---

**Desenvolvido para funcionar com Railway PostgreSQL + Colify + Hostinger**

