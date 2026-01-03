# 🧪 Testar API no Vercel

## ⚠️ Erro "Rota não encontrada"

Você acessou a raiz do domínio (`backendbet.vercel.app`), mas as rotas estão em `/api/*`.

## Rotas Corretas

### 1. Health Check

```
https://backendbet.vercel.app/api/health
```

### 2. Banners

```
https://backendbet.vercel.app/api/banners
```

### 3. Settings

```
https://backendbet.vercel.app/api/settings/data
```

### 4. Games

```
https://backendbet.vercel.app/api/games/all
```

## Testar no Navegador

1. Acesse: `https://backendbet.vercel.app/api/health`
2. Deve retornar:
   ```json
   {
     "status": "ok",
     "timestamp": "..."
   }
   ```

## Testar via Terminal

```bash
curl https://backendbet.vercel.app/api/health
```

## Se Ainda Der Erro

Verifique:
1. ✅ Schema criado no Railway?
2. ✅ Variáveis de ambiente configuradas no Vercel?
3. ✅ `APP_URL` atualizado com a URL correta?

## Ver Logs no Vercel

1. No Vercel, vá em **Deployments**
2. Clique no último deploy
3. Vá em **Functions** ou **Logs**
4. Veja se há erros de conexão com o banco

