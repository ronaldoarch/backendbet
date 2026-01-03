# Como Popular a Tabela category_games

Este documento explica como associar jogos às categorias para que apareçam quando filtrados.

## Problema

Quando você filtra jogos por categoria (ex: "slots", "ao vivo"), nenhum jogo aparece porque a tabela `category_games` não tem associações entre jogos e categorias.

## Solução

Execute o script `populate_category_games.js` que irá:

1. Verificar se as categorias existem (criar padrões se não existirem)
2. Buscar todos os jogos ativos
3. Associar jogos às categorias baseado em regras inteligentes:
   - **Slots**: Jogos que não são ao vivo, crash, roleta ou caixas
   - **Ao Vivo / Roleta**: Jogos com "live", "roleta", "roulette", "baccarat", etc.
   - **Crash**: Jogos com "crash", "aviator", "spaceman", "mines"
   - **Caixas**: Jogos com "caixa", "box", "surpresa"
4. Se nenhuma categoria for encontrada, atribuir "Slots" como padrão

## Como Executar

### No Coolify (Produção)

1. Acesse o terminal do Coolify
2. Navegue até o diretório do projeto
3. Execute:

```bash
npm run populate-category-games
```

### Localmente

```bash
cd backend-api
npm run populate-category-games
```

Ou diretamente:

```bash
node populate_category_games.js
```

## Resultado Esperado

O script irá:
- Criar categorias padrão se não existirem
- Associar todos os jogos às categorias apropriadas
- Mostrar estatísticas de quantos jogos foram associados a cada categoria

## Exemplo de Saída

```
🔧 POPULANDO TABELA CATEGORY_GAMES

✅ Encontradas 5 categorias:
   - Slots (slots)
   - Ao Vivo (ao-vivo)
   - Roleta (roleta)
   - Crash (crash)
   - Caixas (caixas)

✅ Encontrados 49 jogos

✅ Processo concluído!
   - Associações criadas: 45
   - Associações já existentes (ignoradas): 4

📊 Estatísticas por categoria:
   - Slots (slots): 35 jogos
   - Ao Vivo (ao-vivo): 8 jogos
   - Roleta (roleta): 2 jogos
   - Crash (crash): 0 jogos
   - Caixas (caixas): 0 jogos
```

## Notas

- O script não remove associações existentes, apenas adiciona novas
- Se um jogo já estiver associado a uma categoria, a associação será ignorada (não duplicada)
- Você pode executar o script múltiplas vezes sem problemas

