# 🚀 Migração Completa para Supabase

## Passo a Passo Completo

### 1. Criar Projeto no Supabase

1. Acesse: https://supabase.com
2. Faça login com GitHub
3. Clique em "New Project"
4. Preencha:
   - **Name**: betgenius
   - **Database Password**: (escolha uma senha forte - salve!)
   - **Region**: South America (São Paulo)
5. Clique em "Create new project"
6. Aguarde 2-3 minutos

### 2. Criar Schema no Supabase

1. No painel do Supabase, vá em **SQL Editor**
2. Clique em **New query**
3. Cole o conteúdo do arquivo `database_supabase.sql`
4. Clique em **Run** (ou Ctrl+Enter)
5. Aguarde a execução (pode levar alguns segundos)

### 3. Obter Credenciais

No painel do Supabase:

1. Vá em **Settings** → **Database**
2. Copie:
   - **Host**: `db.xxxxx.supabase.co`
   - **Database name**: `postgres`
   - **Port**: `5432`
   - **User**: `postgres`
   - **Password**: (a senha que você criou)

### 4. Atualizar Backend Localmente

```bash
cd backend-api

# Instalar PostgreSQL client
npm install pg
npm uninstall mysql2

# Renomear arquivo de configuração
mv src/config/database.js src/config/database.mysql.js
mv src/config/database.postgres-wrapper.js src/config/database.js
```

### 5. Atualizar package.json

Adicione no `package.json`:

```json
{
  "dependencies": {
    "pg": "^8.11.3"
  }
}
```

### 6. Testar Localmente

Crie um arquivo `.env` local:

```env
DB_HOST=db.xxxxx.supabase.co
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=sua_senha_aqui
DB_NAME=postgres
DB_SSL=true
```

Teste:

```bash
npm run dev
```

### 7. Deploy no Vercel

1. Acesse: https://vercel.com
2. Importe o repositório do backend
3. Configure variáveis de ambiente:
   ```
   PORT=3001
   APP_URL=https://seu-projeto.vercel.app
   CORS_ORIGIN=https://betgeniusbr.com
   DB_HOST=db.xxxxx.supabase.co
   DB_PORT=5432
   DB_USER=postgres
   DB_PASSWORD=sua_senha_aqui
   DB_NAME=postgres
   DB_SSL=true
   NODE_ENV=production
   APP_ENV=production
   ```
4. Deploy automático

### 8. Atualizar Frontend

No arquivo `frontend-standalone/.env.production`:

```env
VITE_API_URL=https://seu-projeto.vercel.app/api
```

Rebuild e upload:

```bash
cd frontend-standalone
npm run build
# Upload dist/ para public_html na Hostinger
```

## Migrar Dados Existentes (Opcional)

Se você já tem dados na Hostinger:

1. **Exportar do phpMyAdmin:**
   - Acesse phpMyAdmin na Hostinger
   - Selecione o banco `u127271520_betgenius`
   - Clique em "Exportar"
   - Escolha "SQL"
   - Clique em "Executar"

2. **Converter para PostgreSQL:**
   - Use um conversor online: https://www.sqlines.com/online
   - Ou ajuste manualmente (veja diferenças abaixo)

3. **Importar no Supabase:**
   - Vá em SQL Editor
   - Cole o SQL convertido
   - Execute

## Diferenças Principais

| MySQL | PostgreSQL |
|-------|------------|
| `AUTO_INCREMENT` | `SERIAL` ou `BIGSERIAL` |
| `TINYINT(1)` | `BOOLEAN` |
| `INT UNSIGNED` | `INTEGER` |
| `BIGINT UNSIGNED` | `BIGINT` |
| `DECIMAL(15,2)` | `NUMERIC(15,2)` |
| `MEDIUMTEXT` | `TEXT` |
| `ENUM(...)` | `CREATE TYPE ... AS ENUM(...)` |
| `NOW()` | `NOW()` (igual) |
| `?` placeholders | `$1, $2, $3...` |
| `ON DUPLICATE KEY UPDATE` | `ON CONFLICT ... DO UPDATE` |

## Verificar se Funcionou

1. Teste a API:
```bash
curl https://seu-projeto.vercel.app/api/health
```

2. Teste banners:
```bash
curl https://seu-projeto.vercel.app/api/banners
```

3. Acesse o frontend:
   - https://betgeniusbr.com
   - Verifique se os jogos e banners aparecem

## Problemas Comuns

### Erro: "relation does not exist"
- O schema não foi criado corretamente
- Execute `database_supabase.sql` novamente

### Erro: "password authentication failed"
- Verifique a senha no `.env`
- A senha do Supabase é a que você criou ao criar o projeto

### Erro: "SSL connection required"
- Adicione `DB_SSL=true` no `.env`

### Erro: "syntax error at or near $1"
- O wrapper de placeholders pode ter problemas
- Verifique se a query está correta

## Pronto! 🎉

Agora você tem:
- ✅ Backend no Vercel
- ✅ Banco no Supabase
- ✅ Frontend na Hostinger
- ✅ Tudo funcionando!

