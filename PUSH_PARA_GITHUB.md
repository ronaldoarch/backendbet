# 📤 Push para GitHub e Deploy no Vercel

## 1. Inicializar Git e Fazer Push

Execute os comandos abaixo no terminal:

```bash
cd backend-api

# Inicializar git
git init

# Adicionar arquivos
git add .

# Commit inicial
git commit -m "Initial commit - Backend BetGenius"

# Adicionar remote do GitHub
git remote add origin https://github.com/ronaldoarch/backendbet.git

# Fazer push
git branch -M main
git push -u origin main
```

**Se pedir autenticação:**
- Use seu **token de acesso pessoal** do GitHub
- Ou configure SSH keys

## 2. Conectar no Vercel

1. Acesse: https://vercel.com
2. Faça login com GitHub
3. Clique em **"Add New"** → **"Project"**
4. Selecione o repositório **`ronaldoarch/backendbet`**
5. Configure:
   - **Framework Preset:** Other
   - **Root Directory:** (deixe vazio, já está na raiz)
   - **Build Command:** (deixe vazio)
   - **Output Directory:** (deixe vazio)
   - **Install Command:** `npm install`

## 3. Configurar Variáveis de Ambiente

No Vercel, vá em **Settings** → **Environment Variables**:

```env
PORT=3001
APP_URL=https://seu-projeto.vercel.app
CORS_ORIGIN=https://betgeniusbr.com
DB_HOST=aws.connect.psdb.cloud
DB_PORT=3306
DB_USER=seu_usuario_planetscale
DB_PASSWORD=sua_senha_planetscale
DB_NAME=seu_banco_planetscale
DB_SSL=true
NODE_ENV=production
APP_ENV=production
```

**⚠️ IMPORTANTE:** O MySQL na Hostinger não funciona do Vercel. Use PlanetScale!

## 4. Deploy

1. Clique em **"Deploy"**
2. Aguarde 1-2 minutos
3. Você receberá uma URL: `https://seu-projeto.vercel.app`

## 5. Testar

```bash
curl https://seu-projeto.vercel.app/api/health
```

## Próximos Passos

1. ✅ Push para GitHub
2. ✅ Deploy no Vercel
3. ⏭️ Configurar PlanetScale (banco de dados)
4. ⏭️ Atualizar frontend com URL do Vercel

## Precisa de Ajuda?

Se tiver problemas com autenticação do GitHub, posso ajudar a configurar!

