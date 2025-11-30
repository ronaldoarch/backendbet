# Comandos para Executar no Terminal do Coolify

## Verificar se está no diretório correto:
```bash
pwd
# Deve mostrar: /app
```

## Verificar package.json:
```bash
cat package.json | grep -A 5 "scripts"
```

## Tentar iniciar a aplicação:
```bash
# Opção 1: Usar npm start
npm start

# Opção 2: Usar node diretamente
node src/server.js

# Opção 3: Verificar se há erro no package.json
cat package.json
```

## Verificar se há arquivo .env:
```bash
ls -la .env
cat .env | head -10
```

## Verificar logs em tempo real:
```bash
# Se usar npm start, os logs aparecerão no terminal
npm start 2>&1

# Ou usar node diretamente
node src/server.js 2>&1
```

## Testar se a aplicação está rodando:
```bash
# Em outro terminal ou após iniciar
curl http://localhost:3001/api/health
```

