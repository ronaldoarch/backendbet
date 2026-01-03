#!/bin/bash

###############################################################################
# Script para atualizar banco Railway via Coolify
# Execute este script no terminal do container do Coolify
###############################################################################

echo "🚂 Atualizando banco de dados Railway..."
echo ""

# Verificar se as variáveis existem
if [ -z "$DB_HOST" ] || [ -z "$DB_USER" ] || [ -z "$DB_NAME" ]; then
  echo "❌ Variáveis de ambiente não encontradas!"
  echo ""
  echo "Este script precisa das seguintes variáveis:"
  echo "  - DB_HOST (ou MYSQL_HOST)"
  echo "  - DB_PORT (ou MYSQL_PORT)"  
  echo "  - DB_USER (ou MYSQL_USER)"
  echo "  - DB_PASSWORD (ou MYSQL_PASSWORD)"
  echo "  - DB_NAME (ou MYSQL_DATABASE)"
  echo ""
  echo "Execute manualmente via Railway Dashboard:"
  echo "https://railway.app"
  exit 1
fi

# Usar variáveis alternativas se necessário
HOST="${DB_HOST:-${MYSQL_HOST}}"
PORT="${DB_PORT:-${MYSQL_PORT:-3306}}"
USER="${DB_USER:-${MYSQL_USER}}"
PASSWORD="${DB_PASSWORD:-${MYSQL_PASSWORD}}"
DATABASE="${DB_NAME:-${MYSQL_DATABASE}}"

echo "📊 Conectando ao banco:"
echo "   Host: $HOST"
echo "   Port: $PORT"
echo "   User: $USER"
echo "   Database: $DATABASE"
echo ""

# SQL para executar
SQL="ALTER TABLE transactions MODIFY COLUMN status VARCHAR(20) NOT NULL DEFAULT 'pending';"

echo "🔨 Executando SQL..."
echo "$SQL"
echo ""

# Executar SQL
mysql -h "$HOST" -P "$PORT" -u "$USER" -p"$PASSWORD" "$DATABASE" -e "$SQL"

if [ $? -eq 0 ]; then
  echo ""
  echo "✅ SQL executado com sucesso!"
  echo ""
  echo "🔍 Verificando alteração..."
  mysql -h "$HOST" -P "$PORT" -u "$USER" -p"$PASSWORD" "$DATABASE" -e "SHOW COLUMNS FROM transactions WHERE Field = 'status';"
  echo ""
  echo "✅ Banco de dados atualizado!"
  echo ""
  echo "🎯 Próximos passos:"
  echo "   1. Recarregue a página do navegador"
  echo "   2. Configure o webhook no Cartwavehub"
  echo "   3. Teste um depósito de R$ 1,00"
else
  echo ""
  echo "❌ Erro ao executar SQL!"
  echo ""
  echo "💡 Execute manualmente via Railway Dashboard:"
  echo "   1. Acesse https://railway.app"
  echo "   2. Vá no serviço do banco de dados"
  echo "   3. Clique em 'Query' ou 'Data'"
  echo "   4. Execute o SQL:"
  echo "      $SQL"
  exit 1
fi

