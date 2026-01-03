# 🔧 Configurar Conexão com Supabase

## Informações da Página de Database

Baseado na sua página de Database Settings:

### 1. Verificar/Resetar Senha

- Se não souber a senha, clique em **"Reset database password"**
- Anote a nova senha (você precisará dela)

### 2. Connection String

A connection string geralmente aparece em outra seção. Procure por:
- **Connection string** ou **Connection info**
- Ou vá em **Settings** → **API** → **Database**

### 3. Configuração do .env

Como o SSL está **OFF**, vamos testar sem SSL primeiro:

```env
DB_HOST=db.slrkerlrcvntxynfjbyh.supabase.co
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=sua_senha_aqui
DB_NAME=postgres
DB_SSL=false
```

**OU use Connection Pooler (porta 6543):**

```env
DB_HOST=db.slrkerlrcvntxynfjbyh.supabase.co
DB_PORT=6543
DB_USER=postgres
DB_PASSWORD=sua_senha_aqui
DB_NAME=postgres
DB_SSL=false
```

### 4. Encontrar Connection String

Para encontrar a connection string completa:

1. No menu lateral, vá em **Settings** → **API**
2. Procure por **"Database"** ou **"Connection string"**
3. Ou na página atual, procure por um botão/link que mostre a connection string

### 5. Testar

Após configurar o `.env`:

```bash
node test_connection.js
```

## Importante

- Se resetar a senha, atualize o `.env` com a nova senha
- O host pode ser `db.slrkerlrcvntxynfjbyh.supabase.co` ou `slrkerlrcvntxynfjbyh.supabase.co`
- Tente primeiro a porta `5432`, depois `6543` se não funcionar

