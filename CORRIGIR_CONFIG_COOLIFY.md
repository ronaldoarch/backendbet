# Corrigir Configuração do Coolify

## Problemas Identificados:
- ❌ PORT está configurado como `80` (deveria ser `3001`)
- ❌ NODE_ENV está configurado como `80` (deveria ser `production`)
- ❌ Código não está em `/var/www/html/` (package.json não encontrado)

## Solução:

### 1. No Terminal do Coolify, verificar onde está o código:

```bash
# Ver onde estamos
pwd

# Procurar package.json
find / -name "package.json" 2>/dev/null | grep -v node_modules

# Ver estrutura de diretórios comuns
ls -la /app 2>/dev/null
ls -la /usr/src/app 2>/dev/null
ls -la /var/www 2>/dev/null
```

### 2. Corrigir Configuração no Coolify:

Vá na aba **"Configuration"** e ajuste:

#### **Environment Variables:**
- `PORT=3001` (não 80!)
- `NODE_ENV=production` (não 80!)
- `DB_HOST=localhost` (ou o IP do Railway)
- `DB_USER=u127271520_boraganhar`
- `DB_PASSWORD=2403Auror@`
- `DB_NAME=u127271520_boraganhar`
- `JWT_SECRET=seu_jwt_secret_aqui`

#### **Build & Deploy Settings:**
- **Build Command**: `npm install --production`
- **Start Command**: `npm start`
- **Port**: `3001`
- **Working Directory**: Deixe vazio ou `/app` (depende de onde o código está)

### 3. Verificar Dockerfile ou configuração de build:

Se o Coolify estiver usando um Dockerfile, verifique se está correto. O código deve estar sendo copiado para o local correto.

### 4. Após corrigir, fazer Redeploy:

1. Salve as configurações
2. Clique em **"Redeploy"**
3. Aguarde o build completar
4. Verifique os logs

## Comandos para verificar após correção:

```bash
# Verificar variáveis
echo $PORT
echo $NODE_ENV

# Verificar se package.json existe
ls -la package.json

# Tentar iniciar
npm start
```

