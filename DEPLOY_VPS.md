# 🚀 Deploy do Backend na VPS

## ✅ Vantagens da VPS

- ✅ **IP Fixo:** Fácil para whitelist da PlayFiver
- ✅ **Controle Total:** Você controla tudo
- ✅ **Sem Limites:** Sem timeout, sem limites de requisições
- ✅ **Flexibilidade:** Escolhe o sistema operacional
- ✅ **Custo:** Geralmente mais barato que Hostinger

## 📋 Pré-requisitos

- VPS com Ubuntu/Debian (recomendado)
- Acesso SSH
- Domínio apontando para o IP da VPS (opcional, mas recomendado)

## 🏗️ Arquitetura

```
Frontend (betgeniusbr.com)
    ↓
Nginx/Apache (Proxy Reverso)
    ↓
Node.js (PM2) - Porta 3001
    ↓
Railway MySQL
```

## 📦 Passo 1: Conectar na VPS

```bash
ssh root@seu-ip-vps
# ou
ssh usuario@seu-ip-vps
```

## 🔧 Passo 2: Atualizar Sistema

```bash
# Ubuntu/Debian
sudo apt update && sudo apt upgrade -y

# CentOS/RHEL
sudo yum update -y
```

## 📥 Passo 3: Instalar Node.js

### Opção A: Usando NVM (Recomendado)

```bash
# Instalar NVM
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Recarregar shell
source ~/.bashrc
# ou
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Instalar Node.js LTS
nvm install --lts
nvm use --lts
nvm alias default node

# Verificar
node --version
npm --version
```

### Opção B: Usando NodeSource (Alternativa)

```bash
# Ubuntu/Debian
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verificar
node --version
npm --version
```

## 📦 Passo 4: Instalar PM2

```bash
npm install -g pm2

# Verificar
pm2 --version
```

## 🌐 Passo 5: Instalar Nginx (Recomendado) ou Apache

### Opção A: Nginx (Recomendado - mais leve)

```bash
# Ubuntu/Debian
sudo apt install nginx -y

# Iniciar e habilitar no boot
sudo systemctl start nginx
sudo systemctl enable nginx

# Verificar status
sudo systemctl status nginx
```

### Opção B: Apache (Alternativa)

```bash
# Ubuntu/Debian
sudo apt install apache2 -y

# Habilitar mods necessários
sudo a2enmod rewrite
sudo a2enmod proxy
sudo a2enmod proxy_http
sudo a2enmod headers

# Reiniciar
sudo systemctl restart apache2
sudo systemctl enable apache2
```

## 🔥 Passo 6: Configurar Firewall

```bash
# Ubuntu (UFW)
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'  # ou 'Apache Full'
sudo ufw allow 3001/tcp  # Porta do backend (opcional, se quiser acesso direto)
sudo ufw enable
sudo ufw status

# Ou usar iptables diretamente
sudo iptables -A INPUT -p tcp --dport 22 -j ACCEPT
sudo iptables -A INPUT -p tcp --dport 80 -j ACCEPT
sudo iptables -A INPUT -p tcp --dport 443 -j ACCEPT
sudo iptables -A INPUT -p tcp --dport 3001 -j ACCEPT  # Opcional
sudo iptables -P INPUT DROP
```

## 📤 Passo 7: Fazer Upload do Backend

### Opção A: Via Git (Recomendado)

```bash
# Na VPS
cd ~
git clone https://github.com/seu-usuario/backendbet.git backend-api
cd backend-api

# Instalar dependências
npm install --production
```

### Opção B: Via SCP (Alternativa)

```bash
# Na sua máquina local
cd backend-api
tar -czf backend-api.tar.gz --exclude node_modules --exclude .git .

# Upload
scp backend-api.tar.gz usuario@seu-ip-vps:~/backend-api.tar.gz

# Na VPS
cd ~
mkdir -p backend-api
cd backend-api
tar -xzf ../backend-api.tar.gz
npm install --production
```

## ⚙️ Passo 8: Configurar .env

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

# CORS
CORS_ORIGIN=https://betgeniusbr.com,http://betgeniusbr.com
```

## 🚀 Passo 9: Configurar PM2

```bash
cd ~/backend-api

# Criar diretório de logs
mkdir -p logs

# Iniciar com PM2
pm2 start ecosystem.config.cjs

# Salvar configuração
pm2 save

# Configurar para iniciar no boot
pm2 startup
# Execute o comando que aparecer (geralmente algo como: sudo env PATH=... pm2 startup systemd -u usuario --hp /home/usuario)

# Ver status
pm2 status

# Ver logs
pm2 logs backend-api
```

## 🌐 Passo 10: Configurar Nginx (Proxy Reverso)

### Criar configuração do site

```bash
sudo nano /etc/nginx/sites-available/backend-api
```

Conteúdo:

```nginx
server {
    listen 80;
    server_name api.betgeniusbr.com;  # ou seu-ip-vps

    # Logs
    access_log /var/log/nginx/backend-api-access.log;
    error_log /var/log/nginx/backend-api-error.log;

    # Proxy para o backend Node.js
    location /api {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeout aumentado para requisições longas
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Health check
    location /health {
        proxy_pass http://127.0.0.1:3001/health;
    }
}
```

### Habilitar site

```bash
# Criar link simbólico
sudo ln -s /etc/nginx/sites-available/backend-api /etc/nginx/sites-enabled/

# Testar configuração
sudo nginx -t

# Recarregar Nginx
sudo systemctl reload nginx
```

## 🌐 Passo 10 (Alternativa): Configurar Apache

### Criar configuração do site

```bash
sudo nano /etc/apache2/sites-available/backend-api.conf
```

Conteúdo:

```apache
<VirtualHost *:80>
    ServerName api.betgeniusbr.com
    
    # Logs
    ErrorLog ${APACHE_LOG_DIR}/backend-api-error.log
    CustomLog ${APACHE_LOG_DIR}/backend-api-access.log combined

    # Proxy para o backend Node.js
    ProxyPreserveHost On
    ProxyPass /api http://127.0.0.1:3001/api
    ProxyPassReverse /api http://127.0.0.1:3001/api
    
    # Headers
    ProxyPassReverse /api http://127.0.0.1:3001/api
    RequestHeader set X-Forwarded-Proto "http"
    RequestHeader set X-Forwarded-Port "80"
</VirtualHost>
```

### Habilitar site

```bash
# Habilitar site
sudo a2ensite backend-api.conf

# Testar configuração
sudo apache2ctl configtest

# Recarregar Apache
sudo systemctl reload apache2
```

## 🔒 Passo 11: Configurar SSL (HTTPS) - Let's Encrypt

```bash
# Instalar Certbot
sudo apt install certbot python3-certbot-nginx -y  # Para Nginx
# ou
sudo apt install certbot python3-certbot-apache -y  # Para Apache

# Obter certificado
sudo certbot --nginx -d api.betgeniusbr.com  # Para Nginx
# ou
sudo certbot --apache -d api.betgeniusbr.com  # Para Apache

# Renovação automática (já configurado automaticamente)
sudo certbot renew --dry-run
```

## ✅ Passo 12: Testar

```bash
# Testar backend diretamente
curl http://localhost:3001/api/health

# Testar via Nginx/Apache
curl http://api.betgeniusbr.com/api/health
# ou
curl http://seu-ip-vps/api/health

# Testar HTTPS
curl https://api.betgeniusbr.com/api/health

# Ver logs do PM2
pm2 logs backend-api

# Ver logs do Nginx
sudo tail -f /var/log/nginx/backend-api-error.log

# Ver logs do Apache
sudo tail -f /var/log/apache2/backend-api-error.log
```

## 🔧 Comandos Úteis

### PM2

```bash
# Ver status
pm2 status

# Ver logs
pm2 logs backend-api

# Reiniciar
pm2 restart backend-api

# Parar
pm2 stop backend-api

# Monitorar
pm2 monit

# Atualizar variáveis de ambiente
pm2 restart backend-api --update-env
```

### Nginx

```bash
# Testar configuração
sudo nginx -t

# Recarregar
sudo systemctl reload nginx

# Reiniciar
sudo systemctl restart nginx

# Ver status
sudo systemctl status nginx
```

### Apache

```bash
# Testar configuração
sudo apache2ctl configtest

# Recarregar
sudo systemctl reload apache2

# Reiniciar
sudo systemctl restart apache2

# Ver status
sudo systemctl status apache2
```

## 🔄 Atualizar Backend

```bash
cd ~/backend-api

# Se usar Git
git pull origin main
npm install --production
pm2 restart backend-api

# Se usar SCP
# Fazer upload novamente e:
npm install --production
pm2 restart backend-api
```

## 🐛 Troubleshooting

### Backend não inicia

```bash
# Ver logs
pm2 logs backend-api

# Verificar se a porta está em uso
sudo lsof -i :3001

# Verificar .env
cat .env
```

### Nginx/Apache não faz proxy

```bash
# Verificar se o backend está rodando
curl http://localhost:3001/api/health

# Ver logs do Nginx/Apache
sudo tail -f /var/log/nginx/backend-api-error.log
# ou
sudo tail -f /var/log/apache2/backend-api-error.log

# Verificar configuração
sudo nginx -t
# ou
sudo apache2ctl configtest
```

### Erro de conexão com banco

```bash
# Testar conexão
node -e "
const mysql = require('mysql2/promise');
(async () => {
  try {
    const conn = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      ssl: { rejectUnauthorized: false }
    });
    console.log('✅ Conexão OK!');
    await conn.end();
  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
})();
"
```

## 📊 Comparação: VPS vs Hostinger vs Vercel

| Aspecto | VPS | Hostinger | Vercel |
|---------|-----|-----------|--------|
| IP Fixo | ✅ Sim | ✅ Sim | ❌ Dinâmico |
| Controle | ✅ Total | ✅ Total | ⚠️ Limitado |
| Timeout | ✅ Sem limite | ✅ Sem limite | ⚠️ 10s (free) |
| Custo | 💰 Variável | 💰 Pago | ✅ Grátis |
| Configuração | ⚠️ Manual | ⚠️ Manual | ✅ Automático |
| SSL | ✅ Let's Encrypt | ✅ Incluído | ✅ Automático |

## 💡 Recomendação

**VPS é uma excelente opção se:**
- ✅ Você quer controle total
- ✅ Você tem conhecimento técnico
- ✅ Você quer economizar (algumas VPS são baratas)
- ✅ Você precisa de IP fixo para whitelist

**Use Hostinger se:**
- ✅ Você quer simplicidade
- ✅ Você já tem conta lá
- ✅ Você prefere suporte gerenciado

**Use Vercel se:**
- ✅ Você quer deploy automático
- ✅ Você não se importa com IP dinâmico
- ✅ Você quer grátis (mas com limitações)

## 🎯 Próximos Passos

1. ✅ Configurar VPS
2. ✅ Fazer deploy do backend
3. ✅ Configurar proxy reverso
4. ✅ Configurar SSL
5. ✅ Atualizar frontend para usar nova URL da API
6. ✅ Adicionar IP da VPS à whitelist da PlayFiver

