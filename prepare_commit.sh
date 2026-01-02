#!/bin/bash

# Script para preparar commit da Nova API Cartwave
# Se o git não funcionar, este script lista os arquivos para commit manual

echo "🚀 Preparando commit da Nova API Cartwave..."
echo ""

cd "$(dirname "$0")"

# Lista de arquivos para commit
echo "📋 Arquivos que precisam ser commitados:"
echo ""
echo "📦 Arquivos NOVOS:"
echo "   git add src/services/cartwaveAuth.js"
echo "   git add config_cartwave_jwt.sql"
echo "   git add test_cartwave_jwt.js"
echo "   git add test_cartwave_pix.js"
echo ""
echo "📝 Arquivos MODIFICADOS:"
echo "   git add src/services/cartwavehub.js"
echo "   git add src/controllers/cartwavehubWebhookController.js"
echo ""

# Tentar verificar se git funciona
if git rev-parse --git-dir > /dev/null 2>&1; then
    echo "✅ Git funcionando! Executando comandos..."
    echo ""
    
    # Adicionar arquivos novos
    echo "📦 Adicionando arquivos novos..."
    git add src/services/cartwaveAuth.js 2>/dev/null && echo "   ✅ cartwaveAuth.js" || echo "   ⚠️  cartwaveAuth.js (não encontrado ou já adicionado)"
    git add config_cartwave_jwt.sql 2>/dev/null && echo "   ✅ config_cartwave_jwt.sql" || echo "   ⚠️  config_cartwave_jwt.sql (não encontrado ou já adicionado)"
    git add test_cartwave_jwt.js 2>/dev/null && echo "   ✅ test_cartwave_jwt.js" || echo "   ⚠️  test_cartwave_jwt.js (não encontrado ou já adicionado)"
    git add test_cartwave_pix.js 2>/dev/null && echo "   ✅ test_cartwave_pix.js" || echo "   ⚠️  test_cartwave_pix.js (não encontrado ou já adicionado)"
    
    # Adicionar arquivos modificados
    echo ""
    echo "📝 Adicionando arquivos modificados..."
    git add src/services/cartwavehub.js 2>/dev/null && echo "   ✅ cartwavehub.js" || echo "   ⚠️  cartwavehub.js (não encontrado ou já adicionado)"
    git add src/controllers/cartwavehubWebhookController.js 2>/dev/null && echo "   ✅ cartwavehubWebhookController.js" || echo "   ⚠️  cartwavehubWebhookController.js (não encontrado ou já adicionado)"
    
    echo ""
    echo "📊 Status:"
    git status --short 2>/dev/null || echo "   ⚠️  Não foi possível verificar status"
    
    echo ""
    echo "💡 Para fazer commit, execute:"
    echo "   git commit -m \"feat: implementar Nova API Cartwave com autenticação JWT\""
    echo ""
    echo "💡 Para fazer push, execute:"
    echo "   git push"
    
else
    echo "⚠️  Git não está funcionando neste diretório."
    echo ""
    echo "📋 Execute os comandos MANUALMENTE:"
    echo ""
    echo "# 1. Adicionar arquivos novos:"
    echo "git add src/services/cartwaveAuth.js"
    echo "git add config_cartwave_jwt.sql"
    echo "git add test_cartwave_jwt.js"
    echo "git add test_cartwave_pix.js"
    echo ""
    echo "# 2. Adicionar arquivos modificados:"
    echo "git add src/services/cartwavehub.js"
    echo "git add src/controllers/cartwavehubWebhookController.js"
    echo ""
    echo "# 3. Fazer commit:"
    echo "git commit -m \"feat: implementar Nova API Cartwave com autenticação JWT\""
    echo ""
    echo "# 4. Fazer push:"
    echo "git push"
    echo ""
fi

echo ""
echo "✅ Script concluído!"



