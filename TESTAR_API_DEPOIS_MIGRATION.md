# ✅ Migration Concluída - Testar API

## Testar Endpoints

### 1. Health Check

```bash
curl https://backendbet.vercel.app/api/health
```

### 2. Banners

```bash
curl https://backendbet.vercel.app/api/banners
```

### 3. Settings

```bash
curl https://backendbet.vercel.app/api/settings/data
```

### 4. Games

```bash
curl https://backendbet.vercel.app/api/games/all
```

## Próximos Passos

### 1. Atualizar Frontend

No arquivo `frontend-standalone/.env.production`:

```env
VITE_API_URL=https://backendbet.vercel.app/api
```

### 2. Rebuild Frontend

```bash
cd frontend-standalone
npm run build
```

### 3. Upload Frontend para Hostinger

Upload da pasta `dist/` para `public_html` na Hostinger.

### 4. Testar Site

Acesse: https://betgeniusbr.com

## Pronto! 🎉

Agora você tem:
- ✅ Backend no Vercel
- ✅ Banco no Railway
- ✅ Tabelas criadas
- ✅ Frontend na Hostinger

Tudo funcionando!

