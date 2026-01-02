# Diagnosticar Aplicação Node.js no Coolify

## Problemas Identificados:
- ❌ `ps` não está disponível no container
- ❌ Porta 3001 não está respondendo
- ❌ Aplicação pode não estar rodando

## Comandos Alternativos (sem `ps`):

### 1. Verificar processos Node.js:
```bash
# Tentar com pgrep (se disponível)
pgrep -a node

# Ou verificar arquivos de processo
ls -la /proc/*/cmdline 2>/dev/null | grep node

# Verificar se há processo na porta 3001
netstat -tuln 2>/dev/null | grep 3001
# ou
ss -tuln 2>/dev/null | grep 3001
```

### 2. Verificar estrutura do diretório:
```bash
# Ver onde estamos
pwd

# Ver estrutura
ls -la

# Ver se há package.json
cat package.json | head -20

# Ver se há node_modules
ls -la node_modules 2>/dev/null | head -5
```

### 3. Verificar variáveis de ambiente:
```bash
# Ver PORT
echo $PORT

# Ver NODE_ENV
echo $NODE_ENV

# Ver todas as variáveis relacionadas
env | sort
```

### 4. Tentar iniciar a aplicação manualmente:
```bash
# Verificar se node está disponível
node --version
npm --version

# Tentar iniciar
npm start
# ou
node src/server.js
```

### 5. Verificar logs do supervisor (se estiver usando):
```bash
# Ver logs do supervisor
cat /var/log/supervisor/supervisord.log 2>/dev/null | tail -50

# Ver processos do supervisor
supervisorctl status 2>/dev/null
```

### 6. Verificar configuração do Coolify:
1. Vá na aba **"Configuration"**
2. Verifique:
   - **Start Command**: Deve ser `npm start` ou `node src/server.js`
   - **Port**: Deve ser `3001`
   - **Build Command**: Deve ser `npm install` ou `npm ci`
   - **Working Directory**: Deve estar correto

### 7. Verificar se há erros no build:
1. Vá na aba **"Deployments"**
2. Clique no último deployment
3. Veja os logs de build para identificar erros

### 8. Verificar arquivos de log:
```bash
# Procurar arquivos de log
find . -name "*.log" 2>/dev/null

# Ver se há logs em /var/log
ls -la /var/log/ 2>/dev/null

# Ver logs do npm
cat npm-debug.log 2>/dev/null
```

## Se a aplicação não estiver rodando:

### Verificar configuração do Coolify:
1. **Start Command** deve ser: `npm start`
2. **Port** deve ser: `3001`
3. **Environment Variables** devem incluir:
   - `NODE_ENV=production`
   - `PORT=3001`
   - `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`
   - `JWT_SECRET`
   - `ARKAMA_API_TOKEN` (se configurado)

### Fazer Redeploy:
1. Vá na aba principal do aplicativo
2. Clique em **"Redeploy"**
3. Aguarde o build e deploy completar
4. Verifique os logs de build para erros

