# 🔧 Variáveis Vercel - Com Credenciais do Railway

## ⚠️ IMPORTANTE: Host Público

O `MYSQLHOST` que você vê (`mysql.railway.internal`) é **interno** e não funciona do Vercel.

Você precisa encontrar o **host público** do Railway.

## Como Encontrar o Host Público

### Opção 1: Verificar Connection String Pública

No Railway:
1. Clique no serviço **MySQL**
2. Vá na aba **"Connect"** ou **"Public Networking"**
3. Procure por **"Public URL"** ou **"External Connection"**
4. O host público geralmente é algo como: `containers-us-west-xxx.railway.app`

### Opção 2: Usar MYSQL_PUBLIC_URL

Se houver uma variável `MYSQL_PUBLIC_URL`, use ela. Ela contém a connection string pública.

### Opção 3: Habilitar Public Networking

1. No Railway, clique no MySQL
2. Vá em **"Settings"** ou **"Networking"**
3. Procure por **"Public Networking"** ou **"Generate Public URL"**
4. Habilite e copie o host público

## Variáveis para o Vercel

Baseado nas credenciais que você viu:

```env
PORT=3001
NODE_ENV=production
APP_ENV=production
APP_URL=https://seu-projeto.vercel.app
CORS_ORIGIN=https://betgeniusbr.com
DB_HOST=HOST_PUBLICO_DO_RAILWAY
DB_PORT=3306
DB_USER=root
DB_PASSWORD=XNtNSnKSwGddVKdrHMcUrGhMUgrvKXSj
DB_NAME=railway
DB_SSL=false
```

**Substitua:**
- `HOST_PUBLICO_DO_RAILWAY` - Host público (não `mysql.railway.internal`)
- `seu-projeto` - Nome do seu projeto no Vercel

## Se Não Encontrar Host Público

O Railway pode não permitir conexões externas diretas. Nesse caso:

1. **Criar um serviço Node.js no Railway** também
2. Conectar o MySQL ao serviço Node.js (ambos no Railway)
3. O Node.js no Railway pode usar `mysql.railway.internal`
4. Deploy do backend no Railway ao invés do Vercel

## Próximos Passos

1. Encontrar o host público no Railway
2. Configurar variáveis no Vercel
3. Fazer deploy
4. Testar

Avise quando encontrar o host público!

