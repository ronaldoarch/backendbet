#!/bin/bash

# Script para fazer commit das mudanças da Nova API Cartwave

echo "🚀 Preparando commit da Nova API Cartwave..."
echo ""

cd "$(dirname "$0")"

# Verificar se está em um repositório git
if [ ! -d ".git" ]; then
    echo "❌ Erro: Não é um repositório git!"
    echo "   Execute este script dentro do diretório backend-api"
    exit 1
fi

# Adicionar arquivos novos
echo "📦 Adicionando arquivos novos..."
git add src/services/cartwaveAuth.js
git add config_cartwave_jwt.sql
git add test_cartwave_jwt.js
git add test_cartwave_pix.js

# Adicionar arquivos modificados
echo "📝 Adicionando arquivos modificados..."
git add src/services/cartwavehub.js
git add src/controllers/cartwavehubWebhookController.js

# Adicionar documentação (se existir no diretório pai)
if [ -f "../GUIA_CONFIGURACAO_CARTWAVE.md" ]; then
    git add ../GUIA_CONFIGURACAO_CARTWAVE.md
fi

if [ -f "../CHANGELOG_CARTWAVE.md" ]; then
    git add ../CHANGELOG_CARTWAVE.md
fi

# Verificar status
echo ""
echo "📊 Status das mudanças:"
git status --short

echo ""
read -p "✅ Deseja fazer o commit? (s/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[SsYy]$ ]]; then
    echo "💾 Fazendo commit..."
    git commit -m "feat: implementar Nova API Cartwave com autenticação JWT

- Adicionar serviço de autenticação JWT (cartwaveAuth.js)
- Atualizar cartwavehub.js para suportar Nova API e API antiga
- Atualizar webhook handler para formato novo e antigo
- Adicionar validação HMAC opcional
- Criar scripts de teste e configuração
- Adicionar documentação completa

Breaking changes: Nenhum (compatibilidade retroativa mantida)"
    
    echo ""
    echo "✅ Commit realizado com sucesso!"
    echo ""
    read -p "🚀 Deseja fazer push? (s/n) " -n 1 -r
    echo ""
    
    if [[ $REPLY =~ ^[SsYy]$ ]]; then
        echo "📤 Fazendo push..."
        git push
        echo ""
        echo "✅ Push realizado com sucesso!"
    else
        echo "⏭️  Push cancelado. Execute 'git push' manualmente quando estiver pronto."
    fi
else
    echo "❌ Commit cancelado."
    exit 1
fi

echo ""
echo "🎉 Concluído!"
echo ""
echo "📋 Próximos passos:"
echo "   1. Configure as credenciais JWT (veja GUIA_CONFIGURACAO_CARTWAVE.md)"
echo "   2. Faça deploy no Coolify"
echo "   3. Execute os testes:"
echo "      - node test_cartwave_jwt.js"
echo "      - node test_cartwave_pix.js"



