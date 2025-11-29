# 🗄️ Criar Schema no Railway

## Passo a Passo

### 1. Acessar Console MySQL

No Railway:
1. Clique no serviço **MySQL**
2. Vá na aba **"Query"** ou **"Data"**
3. Ou clique em **"Open MySQL Console"**

### 2. Executar Script

1. Abra o arquivo `database_completo.sql` (na pasta `backend-api`)
2. Copie **todo o conteúdo**
3. Cole no console do Railway
4. Clique em **"Run"** ou **"Execute"**

### 3. Verificar

Execute uma query para verificar:

```sql
SHOW TABLES;
```

Deve mostrar todas as tabelas criadas:
- providers
- categories
- games
- users
- wallets
- games_keys
- orders
- settings
- banners
- etc.

### 4. Verificar Dados Iniciais

```sql
SELECT * FROM games_keys;
SELECT * FROM settings;
SELECT * FROM custom_layouts;
```

Deve retornar os registros iniciais.

## Pronto! 🎉

Agora você pode testar a API!

