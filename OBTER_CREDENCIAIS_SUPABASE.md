# 🔑 Como Obter Credenciais do Supabase

## Passo a Passo

### 1. Acessar Database Settings

No painel do Supabase:
- Menu lateral esquerdo → **CONFIGURATION** → **Database**

### 2. Encontrar Connection String

Na página de Database, você verá:

**a) Connection String (URI):**
```
postgresql://postgres:[YOUR-PASSWORD]@db.slrkerlrcvntxynfjbyh.supabase.co:5432/postgres
```

**b) Connection Pooling:**
```
postgresql://postgres:[YOUR-PASSWORD]@db.slrkerlrcvntxynfjbyh.supabase.co:6543/postgres?pgbouncer=true
```

### 3. Extrair Informações

Da connection string, extraia:

- **Host:** `db.slrkerlrcvntxynfjbyh.supabase.co` (ou `slrkerlrcvntxynfjbyh.supabase.co`)
- **Port:** `5432` (direct) ou `6543` (pooler)
- **Database:** `postgres`
- **User:** `postgres`
- **Password:** (a senha que você criou ao criar o projeto)

### 4. Configurar .env

```env
DB_HOST=db.slrkerlrcvntxynfjbyh.supabase.co
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=sua_senha_aqui
DB_NAME=postgres
DB_SSL=true
```

**OU use Connection Pooler (recomendado para produção):**

```env
DB_HOST=db.slrkerlrcvntxynfjbyh.supabase.co
DB_PORT=6543
DB_USER=postgres
DB_PASSWORD=sua_senha_aqui
DB_NAME=postgres
DB_SSL=true
```

### 5. Testar

```bash
node test_connection.js
```

## Dica

Se a conexão direta (5432) não funcionar, tente o Connection Pooler (6543), que é mais adequado para conexões externas.

