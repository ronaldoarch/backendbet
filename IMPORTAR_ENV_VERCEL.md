# 📥 Como Importar .env no Vercel

## Arquivo Criado

Criei o arquivo `.env.vercel` com todas as variáveis necessárias.

## Como Importar

1. No Vercel, vá em **Settings** → **Environment Variables**
2. Clique no botão **"Import .env"**
3. Abra o arquivo `.env.vercel` que está na pasta `backend-api`
4. Cole o conteúdo no campo que aparecer
5. Clique em **"Import"** ou **"Save"**

## ⚠️ IMPORTANTE: Atualizar APP_URL

Antes de importar, **substitua** `seu-projeto` pelo nome real do seu projeto no Vercel:

```
APP_URL=https://backendbet.vercel.app
```

Ou o nome que o Vercel gerou para seu projeto.

## Conteúdo do Arquivo

```
PORT=3001
NODE_ENV=production
APP_ENV=production
APP_URL=https://seu-projeto.vercel.app
CORS_ORIGIN=https://betgeniusbr.com
DB_HOST=nozomi.proxy.rlwy.net
DB_PORT=40823
DB_USER=root
DB_PASSWORD=XNtNSnKSwGddVKdrHMcUrGhMUgrvKXSj
DB_NAME=railway
DB_SSL=false
```

## Depois de Importar

1. Verifique se todas as variáveis foram importadas
2. Atualize `APP_URL` com o nome real do projeto
3. Faça deploy (automático ou manual)
4. Teste: `curl https://seu-projeto.vercel.app/api/health`

