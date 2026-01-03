# ✅ Variáveis Vercel - Configuração Final

## Host Público Encontrado! 🎉

Você encontrou o host público do Railway:
- **Host:** `nozomi.proxy.rlwy.net`
- **Porta:** `40823` (não 3306!)

## Variáveis para Configurar no Vercel

No Vercel: **Settings** → **Environment Variables**

### Configuração do Servidor

```env
PORT=3001
NODE_ENV=production
APP_ENV=production
```

### URLs e CORS

```env
APP_URL=https://seu-projeto.vercel.app
CORS_ORIGIN=https://betgeniusbr.com
```

**⚠️ IMPORTANTE:** Substitua `seu-projeto` pelo nome real do seu projeto no Vercel.

### Banco de Dados (Railway - Host Público)

```env
DB_HOST=nozomi.proxy.rlwy.net
DB_PORT=40823
DB_USER=root
DB_PASSWORD=XNtNSnKSwGddVKdrHMcUrGhMUgrvKXSj
DB_NAME=railway
DB_SSL=false
```

## Como Adicionar no Vercel

1. Acesse: https://vercel.com
2. Selecione seu projeto
3. Vá em **Settings** → **Environment Variables**
4. Clique em **"Add New"**
5. Adicione cada variável:
   - **Key:** `DB_HOST`
   - **Value:** `nozomi.proxy.rlwy.net`
   - **Environment:** Selecione `Production`, `Preview` e `Development`
6. Repita para todas as variáveis acima

## Lista Completa de Variáveis

Adicione estas 11 variáveis no Vercel:

1. `PORT` = `3001`
2. `NODE_ENV` = `production`
3. `APP_ENV` = `production`
4. `APP_URL` = `https://seu-projeto.vercel.app` (substitua!)
5. `CORS_ORIGIN` = `https://betgeniusbr.com`
6. `DB_HOST` = `nozomi.proxy.rlwy.net`
7. `DB_PORT` = `40823`
8. `DB_USER` = `root`
9. `DB_PASSWORD` = `XNtNSnKSwGddVKdrHMcUrGhMUgrvKXSj`
10. `DB_NAME` = `railway`
11. `DB_SSL` = `false`

## Depois de Configurar

1. Faça um novo deploy no Vercel (ou aguarde deploy automático)
2. Teste:
   ```bash
   curl https://seu-projeto.vercel.app/api/health
   ```

## Pronto! 🎉

Agora o Vercel vai conseguir conectar ao MySQL do Railway!

