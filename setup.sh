#!/bin/bash

echo "🚀 Configurando Backend API BetGenius..."
echo ""

# Verificar se .env existe
if [ ! -f .env ]; then
    echo "📝 Criando arquivo .env..."
    cp .env.example .env
    echo "✅ Arquivo .env criado!"
    echo ""
    echo "⚠️  IMPORTANTE: Edite o arquivo .env e configure sua senha do MySQL:"
    echo "   DB_PASSWORD=sua_senha_aqui"
    echo ""
    read -p "Pressione ENTER após configurar o .env..."
fi

# Criar banco de dados
echo "🗄️  Criando banco de dados..."
echo "Por favor, insira a senha do MySQL quando solicitado:"
mysql -u root -p << EOF
CREATE DATABASE IF NOT EXISTS betgenius;
SHOW DATABASES LIKE 'betgenius';
EOF

if [ $? -eq 0 ]; then
    echo "✅ Banco de dados criado com sucesso!"
else
    echo "❌ Erro ao criar banco de dados. Verifique suas credenciais MySQL."
    exit 1
fi

echo ""
echo "🔄 Executando migrations..."
npm run migrate

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Setup concluído com sucesso!"
    echo ""
    echo "Para iniciar o servidor:"
    echo "  npm run dev"
else
    echo "❌ Erro ao executar migrations."
    exit 1
fi


