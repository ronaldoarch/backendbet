# 🔍 Verificar Configuração do .env

## Formato Correto do DB_HOST

O `DB_HOST` do Supabase deve ser **apenas o hostname**, sem protocolo:

✅ **CORRETO:**
```
DB_HOST=db.xxxxx.supabase.co
```

❌ **ERRADO:**
```
DB_HOST=https://db.xxxxx.supabase.co
DB_HOST=db.xxxxx.supabase.co/
DB_HOST=https://slrkerlrcvntxynfjbyh.supabase.co
```

## Exemplo Completo do .env

```env
PORT=3001
APP_URL=http://localhost:3001
CORS_ORIGIN=http://localhost:3000
DB_HOST=db.xxxxx.supabase.co
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=sua_senha_aqui
DB_NAME=postgres
DB_SSL=true
NODE_ENV=development
APP_ENV=development
```

## Como Obter o Host Correto

1. Acesse o painel do Supabase
2. Vá em **Settings** → **Database**
3. Procure por **Connection string** ou **Host**
4. O host será algo como: `db.xxxxx.supabase.co`
5. **NÃO inclua** `https://` ou `/` no final

## Testar Conexão

Após corrigir o `.env`, execute:

```bash
node test_connection.js
```

Se ainda der erro, verifique:
- ✅ O host está correto (sem https://)
- ✅ A senha está correta
- ✅ O projeto Supabase está ativo
- ✅ O schema foi criado (execute `database_supabase.sql`)

