# 🗄️ Executar Migration Localmente

## 1. Atualizar .env

Atualize o arquivo `.env` na pasta `backend-api` com as credenciais do Railway:

```env
PORT=3001
APP_URL=http://localhost:3001
CORS_ORIGIN=http://localhost:3000
DB_HOST=nozomi.proxy.rlwy.net
DB_PORT=40823
DB_USER=root
DB_PASSWORD=XNtNSnKSwGddVKdrHMcUrGhMUgrvKXSj
DB_NAME=railway
DB_SSL=false
NODE_ENV=development
APP_ENV=development
```

## 2. Executar Migration

```bash
cd backend-api
npm run migrate
```

## 3. Verificar

A migration deve criar todas as tabelas e inserir dados iniciais.

## Alternativa: Via Console do Railway

Se preferir, você pode executar o `database_completo.sql` diretamente no console do Railway:

1. No Railway, clique no MySQL
2. Vá em **"Query"** ou **"Data"**
3. Abra o arquivo `database_completo.sql`
4. Copie todo o conteúdo
5. Cole no console
6. Execute

## Pronto! 🎉

Depois de criar as tabelas, teste a API:

```bash
curl https://backendbet.vercel.app/api/banners
curl https://backendbet.vercel.app/api/settings/data
```

