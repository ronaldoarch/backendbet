# Como Verificar Logs da Aplicação Node.js no Coolify

## Se `tail -f /proc/1/fd/1` não mostrar nada:

### 1. Verificar se a aplicação está rodando

No Terminal do Coolify, execute:

```bash
# Ver processos Node.js
ps aux | grep node

# Ver processos em execução
ps aux

# Verificar porta 3001
netstat -tulpn | grep 3001
# ou
ss -tulpn | grep 3001
```

### 2. Verificar variáveis de ambiente

```bash
# Ver se NODE_ENV está definido
echo $NODE_ENV

# Ver PORT
echo $PORT

# Ver todas as variáveis
env | grep -E "NODE|PORT|DB"
```

### 3. Tentar iniciar a aplicação manualmente

```bash
# Navegar até o diretório da aplicação
cd /app
# ou
cd /usr/src/app
# ou onde estiver o código

# Ver estrutura
ls -la

# Tentar iniciar
npm start
# ou
node src/server.js
```

### 4. Verificar logs do PM2 (se estiver usando)

```bash
# Ver processos PM2
pm2 list

# Ver logs
pm2 logs

# Ver logs de um processo específico
pm2 logs betgenius-api
```

### 5. Verificar logs do sistema

```bash
# Ver logs do supervisor
tail -f /var/log/supervisor/supervisord.log

# Ver logs do nginx
tail -f /var/log/nginx/error.log

# Ver todos os logs recentes
journalctl -u nodejs -n 100 --no-pager
```

### 6. Testar endpoint diretamente

```bash
# Testar health check
curl http://localhost:3001/api/health

# Testar com verbose para ver erros
curl -v http://localhost:3001/api/health
```

### 7. Verificar se há arquivo de log

```bash
# Procurar arquivos de log
find /app -name "*.log" 2>/dev/null
find /var/log -name "*node*" 2>/dev/null

# Ver se há logs em /tmp
ls -la /tmp/*.log
```

## Se a aplicação não estiver rodando:

1. Verifique as configurações do Coolify:
   - **Start Command**: Deve ser `npm start` ou `node src/server.js`
   - **Port**: Deve ser `3001`
   - **Environment Variables**: Verifique se estão configuradas

2. Tente fazer um "Redeploy" no Coolify

3. Verifique os logs de build/deploy na aba "Deployments"

