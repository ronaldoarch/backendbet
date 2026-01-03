# 🏗️ Arquitetura: Backend na Hostinger

## 📊 Componentes Necessários

### 1. **PM2** (Gerenciador de Processos)
- ✅ **O que é:** Gerencia o processo Node.js (inicia, reinicia, monitora)
- ✅ **Por que precisa:** Mantém o backend rodando 24/7, reinicia se crashar
- ✅ **Alternativa:** Não tem - é essencial para produção

### 2. **Apache** (Proxy Reverso)
- ✅ **O que é:** Servidor web que já vem instalado na Hostinger
- ✅ **Por que precisa:** Roteia requisições do frontend (`/api/*`) para o backend Node.js
- ✅ **Alternativa:** Nginx (mas Apache já vem instalado)

## 🎯 Arquitetura Completa

```
┌─────────────────┐
│   Frontend      │
│  (Hostinger)    │
│  betgeniusbr.com│
└────────┬────────┘
         │
         │ Requisições /api/*
         ▼
┌─────────────────┐
│     Apache      │ ← Proxy Reverso (.htaccess)
│  (já instalado) │
└────────┬────────┘
         │
         │ Redireciona para localhost:3001
         ▼
┌─────────────────┐
│   Node.js       │ ← Backend API
│   (PM2)         │
│   Porta 3001    │
└────────┬────────┘
         │
         │ Conexão MySQL
         ▼
┌─────────────────┐
│     Railway     │ ← Banco de Dados
│     MySQL       │
└─────────────────┘
```

## 📋 Passo a Passo Completo

### 1. Instalar Node.js e PM2 na Hostinger

```bash
# Conectar via SSH
ssh usuario@hostinger.com

# Carregar NVM (Node Version Manager)
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Instalar Node.js (versão LTS)
nvm install --lts
nvm use --lts

# Instalar PM2 globalmente
npm install -g pm2

# Verificar instalação
node --version
pm2 --version
```

### 2. Fazer Upload do Backend

```bash
# Na sua máquina local
cd backend-api
tar -czf backend-api.tar.gz --exclude node_modules --exclude .git .

# Upload via SCP
scp backend-api.tar.gz usuario@hostinger.com:~/backend-api.tar.gz

# Na Hostinger, extrair
ssh usuario@hostinger.com
cd ~
mkdir -p backend-api
cd backend-api
tar -xzf ../backend-api.tar.gz

# Instalar dependências
npm install --production
```

### 3. Configurar .env

```bash
cd ~/backend-api
nano .env
```

Conteúdo do `.env`:

```env
# Banco de Dados Railway
DB_HOST=containers-us-west-XXX.railway.app
DB_PORT=3306
DB_USER=root
DB_PASSWORD=sua_senha_do_railway
DB_NAME=railway
DB_SSL=true

# Servidor
NODE_ENV=production
PORT=3001

# JWT
JWT_SECRET=sua_jwt_secret_super_segura_aqui

# CORS (opcional, se necessário)
CORS_ORIGIN=https://betgeniusbr.com,http://betgeniusbr.com
```

### 4. Criar Configuração do PM2

```bash
cd ~/backend-api
nano ecosystem.config.cjs
```

Conteúdo:

```javascript
module.exports = {
  apps: [{
    name: 'backend-api',
    script: 'src/server.js',
    cwd: '/home/usuario/backend-api',
    instances: 1,
    exec_mode: 'fork',
    watch: false,
    max_memory_restart: '500M',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    autorestart: true,
    max_restarts: 10,
    min_uptime: '10s'
  }]
}
```

**Importante:** Substitua `/home/usuario/backend-api` pelo caminho real na Hostinger.

### 5. Iniciar com PM2

```bash
cd ~/backend-api
mkdir -p logs

# Iniciar o backend
pm2 start ecosystem.config.cjs

# Salvar configuração do PM2 (para iniciar após reiniciar servidor)
pm2 save

# Configurar PM2 para iniciar no boot
pm2 startup
# Execute o comando que aparecer (geralmente algo como: sudo env PATH=... pm2 startup systemd -u usuario --hp /home/usuario)

# Ver status
pm2 status

# Ver logs
pm2 logs backend-api
```

### 6. Configurar Apache (Proxy Reverso)

O Apache já vem instalado na Hostinger. Você só precisa configurar o `.htaccess`:

```bash
cd ~/domains/betgeniusbr.com/public_html
nano .htaccess
```

Conteúdo do `.htaccess`:

```apache
# Habilitar mod_rewrite (geralmente já está habilitado)
<IfModule mod_rewrite.c>
    RewriteEngine On

    # Proxy reverso para /api/* → localhost:3001
    RewriteCond %{REQUEST_URI} ^/api/(.*)$
    RewriteRule ^api/(.*)$ http://127.0.0.1:3001/api/$1 [P,L]

    # Habilitar mod_proxy (necessário para proxy reverso)
    <IfModule mod_proxy.c>
        ProxyPreserveHost On
        ProxyPass /api http://127.0.0.1:3001/api
        ProxyPassReverse /api http://127.0.0.1:3001/api
    </IfModule>
</IfModule>

# SPA Routing (para o frontend React)
<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteBase /
    RewriteRule ^index\.html$ - [L]
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteRule . /index.html [L]
</IfModule>
```

**Importante:** Se o Apache não tiver `mod_proxy` habilitado, você pode precisar pedir ao suporte da Hostinger para habilitar, ou usar apenas `mod_rewrite` com `[P]` flag.

### 7. Testar

```bash
# Testar se o backend está rodando
curl http://localhost:3001/api/health

# Testar via Apache (proxy)
curl https://betgeniusbr.com/api/health

# Ver logs do PM2
pm2 logs backend-api

# Ver logs do Apache (se necessário)
tail -f /var/log/apache2/error.log
```

## 🔧 Comandos Úteis do PM2

```bash
# Ver status
pm2 status

# Ver logs
pm2 logs backend-api

# Reiniciar
pm2 restart backend-api

# Parar
pm2 stop backend-api

# Iniciar
pm2 start backend-api

# Deletar do PM2
pm2 delete backend-api

# Monitorar (dashboard)
pm2 monit

# Atualizar variáveis de ambiente
pm2 restart backend-api --update-env
```

## ⚠️ Problemas Comuns

### Apache não tem mod_proxy

**Solução 1:** Pedir ao suporte da Hostinger para habilitar `mod_proxy` e `mod_proxy_http`.

**Solução 2:** Usar apenas `mod_rewrite` com flag `[P]` (requer `mod_proxy` mesmo assim).

**Solução 3:** Usar Nginx ao invés de Apache (se disponível).

### Porta 3001 já está em uso

```bash
# Ver o que está usando a porta
lsof -i :3001

# Matar o processo
kill -9 PID
```

### PM2 não inicia após reiniciar servidor

```bash
# Reconfigurar startup
pm2 unstartup
pm2 startup
# Execute o comando que aparecer
pm2 save
```

## ✅ Vantagens desta Arquitetura

- ✅ **IP Fixo:** Hostinger tem IP fixo (fácil para whitelist)
- ✅ **Sem Timeout:** Sem limite de 10 segundos
- ✅ **Controle Total:** Você controla tudo
- ✅ **PM2:** Reinicia automaticamente se crashar
- ✅ **Apache:** Já vem instalado, só configurar
- ✅ **Banco Railway:** Gerenciado, backups automáticos

## 🆚 Comparação: Vercel vs Hostinger

| Aspecto | Vercel | Hostinger |
|---------|--------|-----------|
| IP | ❌ Dinâmico (muda) | ✅ Fixo |
| Timeout | ⚠️ 10s (free) | ✅ Sem limite |
| PM2 | ❌ Não precisa | ✅ Necessário |
| Proxy | ❌ Não precisa | ✅ Apache |
| Controle | ⚠️ Limitado | ✅ Total |
| Custo | ✅ Grátis | 💰 Pago |

## 💡 Resumo

**Sim, você precisa de AMBOS:**
- **PM2:** Para gerenciar o processo Node.js
- **Apache:** Para fazer proxy reverso (rotear `/api/*` para o backend)

Mas ambos são fáceis de configurar e a Hostinger já tem o Apache instalado!

