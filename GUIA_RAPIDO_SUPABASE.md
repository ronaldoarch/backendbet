# ⚡ Guia Rápido: Migração para Supabase

## ✅ Arquivos Criados

1. ✅ `database_supabase.sql` - Schema PostgreSQL completo
2. ✅ `database.postgres-wrapper.js` - Wrapper para compatibilidade
3. ✅ `MIGRAR_PARA_SUPABASE.md` - Guia completo
4. ✅ `package.json` - Adicionado `pg`

## 🚀 Passos Rápidos

### 1. Criar Projeto Supabase (2 min)

1. https://supabase.com → Login com GitHub
2. New Project → Name: `betgenius` → Region: São Paulo
3. Aguardar criação

### 2. Criar Schema (1 min)

1. SQL Editor → New query
2. Cole `database_supabase.sql`
3. Run

### 3. Obter Credenciais (1 min)

Settings → Database:
- Host: `db.xxxxx.supabase.co`
- Port: `5432`
- User: `postgres`
- Password: (a que você criou)
- Database: `postgres`

### 4. Atualizar Backend (2 min)

```bash
cd backend-api

# Instalar PostgreSQL
npm install pg

# Trocar configuração
mv src/config/database.js src/config/database.mysql.js
mv src/config/database.postgres-wrapper.js src/config/database.js
```

### 5. Ajustar Queries INSERT (Importante!)

Algumas queries INSERT precisam retornar o ID. Adicione `RETURNING id`:

**Antes (MySQL):**
```javascript
const [result] = await pool.execute(
  'INSERT INTO banners (image, type) VALUES (?, ?)',
  [image, type]
)
const id = result.insertId
```

**Depois (PostgreSQL):**
```javascript
const [result] = await pool.execute(
  'INSERT INTO banners (image, type) VALUES ($1, $2) RETURNING id',
  [image, type]
)
const id = result.insertId || result[0]?.id
```

**Arquivos que precisam ajuste:**
- `src/controllers/bannerController.js` - Linhas ~180, ~240
- `src/controllers/playfiverKeysController.js` - Linha ~152
- `src/controllers/providerController.js` - Linha ~100
- `src/controllers/adminGameController.js` - Linha ~130
- `src/controllers/authController.js` - Linha ~125

### 6. Testar Localmente

Crie `.env`:
```env
DB_HOST=db.xxxxx.supabase.co
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=sua_senha
DB_NAME=postgres
DB_SSL=true
```

Teste:
```bash
npm run dev
```

### 7. Deploy Vercel

1. Importar repositório
2. Adicionar variáveis de ambiente (mesmas do `.env`)
3. Deploy

### 8. Atualizar Frontend

`.env.production`:
```env
VITE_API_URL=https://seu-projeto.vercel.app/api
```

Rebuild e upload.

## ⚠️ Ajustes Necessários nas Queries

O wrapper converte `?` para `$1, $2...` automaticamente, mas você precisa:

1. **Adicionar `RETURNING id` em INSERTs** que usam `result.insertId`
2. **Verificar se funciona** - alguns casos podem precisar de ajustes manuais

## 🎯 Pronto!

Agora você tem:
- ✅ Backend no Vercel
- ✅ Banco no Supabase
- ✅ Frontend na Hostinger

