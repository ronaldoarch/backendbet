#!/bin/bash

# Script para executar configuração do Cartwave JWT no banco Railway via Coolify
# Cole este comando no terminal do Coolify

echo "🚀 Configurando Nova API Cartwave no banco Railway..."
echo ""

# Obter variáveis de ambiente (já configuradas no Coolify)
HOST="${DB_HOST:-${MYSQL_HOST}}"
PORT="${DB_PORT:-${MYSQL_PORT:-3306}}"
USER="${DB_USER:-${MYSQL_USER}}"
PASSWORD="${DB_PASSWORD:-${MYSQL_PASSWORD}}"
DATABASE="${DB_NAME:-${MYSQL_DATABASE}}"

# Verificar se as variáveis estão configuradas
if [ -z "$HOST" ] || [ -z "$USER" ] || [ -z "$DATABASE" ]; then
  echo "❌ Erro: Variáveis de ambiente não configuradas!"
  echo ""
  echo "Configure no Coolify:"
  echo "  - DB_HOST (ou MYSQL_HOST)"
  echo "  - DB_PORT (ou MYSQL_PORT)"  
  echo "  - DB_USER (ou MYSQL_USER)"
  echo "  - DB_PASSWORD (ou MYSQL_PASSWORD)"
  echo "  - DB_NAME (ou MYSQL_DATABASE)"
  exit 1
fi

echo "📋 Conectando ao banco:"
echo "   Host: $HOST"
echo "   Port: $PORT"
echo "   User: $USER"
echo "   Database: $DATABASE"
echo ""

# SQL para configurar Cartwave JWT
# IMPORTANTE: Edite os valores 'seu_client_id' e 'seu_client_secret' antes de executar!
SQL="
-- Credenciais JWT (OBRIGATÓRIO)
INSERT INTO app_settings (setting_key, setting_value, created_at, updated_at) 
VALUES ('cartwave_client_id', 'seu_client_id', NOW(), NOW())
ON DUPLICATE KEY UPDATE setting_value = 'seu_client_id', updated_at = NOW();

INSERT INTO app_settings (setting_key, setting_value, created_at, updated_at) 
VALUES ('cartwave_client_secret', 'seu_client_secret', NOW(), NOW())
ON DUPLICATE KEY UPDATE setting_value = 'seu_client_secret', updated_at = NOW();

-- URL Base da API (padrão: https://api.cartwave.com.br)
INSERT INTO app_settings (setting_key, setting_value, created_at, updated_at) 
VALUES ('cartwave_base_url', 'https://api.cartwave.com.br', NOW(), NOW())
ON DUPLICATE KEY UPDATE setting_value = 'https://api.cartwave.com.br', updated_at = NOW();

-- HMAC Secret (OPCIONAL - apenas se configurar validação HMAC nos webhooks)
INSERT INTO app_settings (setting_key, setting_value, created_at, updated_at) 
VALUES ('cartwave_hmac_secret', 'seu_hmac_secret', NOW(), NOW())
ON DUPLICATE KEY UPDATE setting_value = 'seu_hmac_secret', updated_at = NOW();
"

# Verificar se mysql está disponível
if ! command -v mysql &> /dev/null; then
  echo "❌ Erro: mysql client não encontrado!"
  echo ""
  echo "💡 Instale o mysql client ou execute via Node.js:"
  echo "   node -e \"const mysql = require('mysql2/promise'); (async () => { const conn = await mysql.createConnection({host: process.env.DB_HOST, port: process.env.DB_PORT || 3306, user: process.env.DB_USER, password: process.env.DB_PASSWORD, database: process.env.DB_NAME}); await conn.query(\\\"$SQL\\\"); console.log('✅ Configurado!'); await conn.end(); })();\""
  exit 1
fi

# Executar SQL
echo "⚙️  Executando SQL..."
mysql -h "$HOST" -P "$PORT" -u "$USER" -p"$PASSWORD" "$DATABASE" <<EOF
$SQL
EOF

if [ $? -eq 0 ]; then
  echo ""
  echo "✅ Configuração aplicada com sucesso!"
  echo ""
  echo "📊 Verificando configuração:"
  mysql -h "$HOST" -P "$PORT" -u "$USER" -p"$PASSWORD" "$DATABASE" -e "
    SELECT 
      setting_key,
      CASE 
        WHEN setting_key LIKE '%secret%' OR setting_key LIKE '%_secret' THEN 
          CONCAT(LEFT(setting_value, 4), '...', RIGHT(setting_value, 4))
        ELSE 
          setting_value 
      END as setting_value_masked,
      updated_at
    FROM app_settings
    WHERE setting_key LIKE 'cartwave%'
    ORDER BY setting_key;
  "
  echo ""
  echo "⚠️  IMPORTANTE: Edite os valores 'seu_client_id' e 'seu_client_secret' no script antes de executar novamente!"
else
  echo ""
  echo "❌ Erro ao executar SQL!"
  exit 1
fi



