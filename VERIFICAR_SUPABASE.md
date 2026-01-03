# 🔍 Verificar Configuração do Supabase

## Problema: Connection Timeout

Se a conexão está dando timeout, verifique:

### 1. Projeto Ativo

No painel do Supabase:
- Verifique se o projeto está **ativo** (não pausado)
- Projetos gratuitos podem pausar após inatividade

### 2. Connection Pooling

O Supabase oferece duas formas de conexão:

**a) Direct Connection (porta 5432):**
- Host: `db.xxxxx.supabase.co` ou `xxxxx.supabase.co`
- Porta: `5432`
- SSL: Obrigatório

**b) Connection Pooler (porta 6543):**
- Host: `db.xxxxx.supabase.co` ou `xxxxx.supabase.co`
- Porta: `6543`
- SSL: Obrigatório
- Melhor para serverless (Vercel)

### 3. Verificar no Painel

1. Acesse: **Settings** → **Database**
2. Procure por **Connection string** ou **Connection pooling**
3. Verifique:
   - **Host** correto
   - **Port** (5432 ou 6543)
   - **Database name** (geralmente `postgres`)
   - **User** (geralmente `postgres`)
   - **Password** (a que você criou)

### 4. Testar com Connection Pooler

Tente usar a porta `6543` (Connection Pooler):

```env
DB_HOST=slrkerlrcvntxynfjbyh.supabase.co
DB_PORT=6543
DB_USER=postgres
DB_PASSWORD=sua_senha
DB_NAME=postgres
DB_SSL=true
```

### 5. Verificar IP Restrictions

No painel do Supabase:
- **Settings** → **Database** → **Connection Pooling**
- Verifique se há restrições de IP
- Para desenvolvimento local, pode precisar permitir todos os IPs

### 6. Testar Conexão Direta

Você pode testar a conexão usando `psql` (se tiver instalado):

```bash
psql "postgresql://postgres:SUA_SENHA@slrkerlrcvntxynfjbyh.supabase.co:5432/postgres?sslmode=require"
```

Ou usando a connection string completa do painel do Supabase.

