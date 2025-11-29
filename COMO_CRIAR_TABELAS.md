# 🗄️ Como Criar Tabelas no Railway

## Passo a Passo Rápido

### 1. Acessar Console MySQL

No Railway:
1. Clique no serviço **MySQL**
2. Procure por uma aba chamada:
   - **"Query"**
   - **"Data"**
   - **"MySQL Console"**
   - **"Open Console"**

### 2. Abrir Arquivo SQL

1. Abra o arquivo `database_completo.sql` (na pasta `backend-api`)
2. **Selecione TODO o conteúdo** (Ctrl+A ou Cmd+A)
3. **Copie** (Ctrl+C ou Cmd+C)

### 3. Colar e Executar

1. **Cole** o conteúdo no console do Railway
2. Clique em **"Run"** ou **"Execute"**
   - Ou pressione `Ctrl+Enter` (Windows/Linux)
   - Ou `Cmd+Enter` (Mac)

### 4. Verificar

Execute esta query:

```sql
SHOW TABLES;
```

Deve mostrar 13 tabelas:
- providers
- categories
- games
- category_games
- users
- wallets
- games_keys
- orders
- game_favorites
- game_likes
- settings
- custom_layouts
- banners

## Se Não Encontrar o Console

### Opção Alternativa: Via Terminal Local

1. Atualize o `.env` local:
   ```env
   DB_HOST=nozomi.proxy.rlwy.net
   DB_PORT=40823
   DB_USER=root
   DB_PASSWORD=XNtNSnKSwGddVKdrHMcUrGhMUgrvKXSj
   DB_NAME=railway
   ```

2. Execute:
   ```bash
   cd backend-api
   npm run migrate
   ```

## Depois de Criar

Teste a API:

```bash
curl https://backendbet.vercel.app/api/banners
curl https://backendbet.vercel.app/api/settings/data
```

## Pronto! 🎉

Agora a API deve funcionar completamente!

