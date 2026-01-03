#!/bin/bash

# Script para fazer commit do backend-api

cd "$(dirname "$0")"

echo "📦 Preparando commit do backend-api..."

# Verificar se é um repositório git
if [ ! -d ".git" ]; then
    echo "⚠️  Inicializando repositório git..."
    git init
fi

# Adicionar arquivos
echo "📝 Adicionando arquivos..."
git add src/server.js
git add src/config/redis.js
git add src/config/database.js
git add src/config/database.postgres.js
git add src/routes/index.js
git add package.json

# Fazer commit
echo "💾 Fazendo commit..."
git commit -m "Criar server.js, redis.js e configurar PostgreSQL para Railway

- Adicionar server.js com Express, CORS e rate limiting
- Criar redis.js opcional para cache
- Configurar database.postgres.js para Railway PostgreSQL
- Criar database.js de compatibilidade
- Adicionar routes/index.js para organizar rotas
- Adicionar dependência pg ao package.json
- Configurar health check e graceful shutdown"

echo "✅ Commit realizado com sucesso!"
echo ""
echo "Para fazer push (se tiver remote configurado):"
echo "  git remote add origin <url-do-repositorio>"
echo "  git push -u origin main"

