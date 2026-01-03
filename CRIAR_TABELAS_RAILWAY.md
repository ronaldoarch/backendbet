# 🗄️ Criar Tabelas no Railway - Passo a Passo

## Método 1: Via Console MySQL (Recomendado)

### 1. Acessar Console

No Railway:
1. Clique no serviço **MySQL**
2. Vá na aba **"Query"** ou **"Data"**
3. Ou procure por **"Open MySQL Console"** ou **"Query"**

### 2. Executar Script

1. Abra o arquivo `database_completo.sql` (na pasta `backend-api`)
2. **Copie TODO o conteúdo** do arquivo
3. **Cole** no console do Railway
4. Clique em **"Run"** ou **"Execute"** ou pressione `Ctrl+Enter`

### 3. Verificar

Execute esta query para verificar se as tabelas foram criadas:

```sql
SHOW TABLES;
```

Deve mostrar:
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

### 4. Verificar Dados Iniciais

```sql
SELECT * FROM games_keys;
SELECT * FROM settings;
SELECT * FROM custom_layouts;
```

Deve retornar os registros iniciais.

## Método 2: Via Script Node.js

Se o console não funcionar, você pode executar via script:

1. Atualize o `.env` local com as credenciais do Railway:
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

## Depois de Criar as Tabelas

Teste a API:

```bash
# Banners
curl https://backendbet.vercel.app/api/banners

# Settings
curl https://backendbet.vercel.app/api/settings/data
```

## Pronto! 🎉

Agora a API deve funcionar completamente!

