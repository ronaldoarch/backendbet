# 🖼️ Atualizar Imagens dos Jogos

## Problema

Os jogos foram adicionados com uma imagem placeholder muito pequena (1x1 pixel transparente) que não aparece no frontend.

## Solução

Execute o script para atualizar todas as imagens dos jogos com um placeholder SVG melhor (300x400px) que será visível.

## Como Executar

### Opção 1: Localmente (Recomendado)

```bash
cd backend-api
npm run update-game-images
```

### Opção 2: Via SSH no Servidor

```bash
ssh -p 65002 u127271520@212.85.6.24
cd ~/backend-api
npm run update-game-images
```

## O que o Script Faz

1. Busca todos os jogos ativos no banco de dados
2. Verifica se a imagem é muito pequena (placeholder antigo)
3. Atualiza com uma imagem SVG placeholder melhor (300x400px)
4. Mantém jogos que já têm imagens reais

## Resultado Esperado

```
🖼️  Atualizando imagens dos jogos...

📋 Encontrados 35 jogos

  ✅ Atualizado: "Lightning Roulette" (ID: 1)
  ✅ Atualizado: "Crazy Time" (ID: 2)
  ...

📊 Resumo:
  ✅ Jogos atualizados: 35
  ⏭️  Jogos mantidos: 0

✨ Atualização concluída!
```

## Após Executar

1. As imagens placeholder aparecerão nos cards dos jogos
2. Você pode adicionar imagens reais pelo painel admin:
   - Acesse: https://betgeniusbr.com/admin/games
   - Clique em "Editar" no jogo
   - Faça upload de uma imagem real
   - Salve

## Nota

O placeholder SVG mostra:
- Um gradiente azul escuro
- Texto "Jogo" no centro
- Texto "Adicione a imagem no admin" abaixo

Isso ajuda a identificar visualmente quais jogos precisam de imagens reais.

