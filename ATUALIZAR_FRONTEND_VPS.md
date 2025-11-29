# 🔄 Atualizar Frontend para Usar VPS

## 📋 Após Configurar o Backend na VPS

Depois de configurar o backend na VPS, você precisa atualizar o frontend para usar a nova URL da API.

## 🔧 Passo 1: Atualizar .env.local

No frontend, edite ou crie o arquivo `.env.local`:

```bash
cd frontend-standalone
nano .env.local
```

Conteúdo:

```env
# Se você configurou subdomínio
VITE_API_URL=https://api.betgeniusbr.com/api

# Ou se você configurou no mesmo domínio
VITE_API_URL=https://betgeniusbr.com/api

# Ou se você está usando IP direto (não recomendado para produção)
VITE_API_URL=http://seu-ip-vps/api
```

## 🔧 Passo 2: Rebuild do Frontend

```bash
cd frontend-standalone
npm run build
```

## 📤 Passo 3: Fazer Upload do Frontend

```bash
# Na sua máquina local
cd frontend-standalone
tar -czf dist.tar.gz dist/

# Upload para Hostinger (ou onde estiver hospedado o frontend)
scp dist.tar.gz usuario@hostinger.com:~/dist.tar.gz

# Na Hostinger
cd ~/domains/betgeniusbr.com/public_html
rm -rf dist/*
tar -xzf ~/dist.tar.gz -C .
```

## ✅ Passo 4: Testar

1. Acesse: `https://betgeniusbr.com`
2. Abra o console do navegador (F12)
3. Verifique se as requisições estão indo para a nova URL da API
4. Teste abrir um jogo

## 🔍 Verificar se Está Funcionando

No console do navegador, você deve ver requisições para:
- `https://api.betgeniusbr.com/api/...` (se usou subdomínio)
- ou `https://betgeniusbr.com/api/...` (se usou mesmo domínio)

Se ainda estiver usando `backendbet.vercel.app`, o frontend não foi atualizado corretamente.

