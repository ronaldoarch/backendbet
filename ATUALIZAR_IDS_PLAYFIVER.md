# 🎮 Atualizar IDs dos Jogos com IDs Reais da PlayFiver

## 📋 Descrição

Este script atualiza o campo `game_id` dos jogos no banco de dados com os IDs reais fornecidos pela PlayFiver.

## 🚀 Como Usar

### Opção 1: Usar Mapeamento Manual (Recomendado)

1. **Edite o arquivo** `src/database/update_playfiver_game_ids.js`
2. **Atualize o objeto** `PLAYFIVER_GAME_IDS` com os IDs reais:

```javascript
const PLAYFIVER_GAME_IDS = {
  'gates-of-olympus': 'PP_vs7monkeys', // ID real da PlayFiver
  'sweet-bonanza': 'PP_sweetbonanza',
  // ... adicione mais jogos
}
```

3. **Execute o script**:

```bash
npm run update-playfiver-ids
```

### Opção 2: Buscar da API PlayFiver (Se disponível)

O script tenta buscar automaticamente da API da PlayFiver, mas isso requer:
- Credenciais configuradas no banco (`games_keys`)
- Endpoint de listagem de jogos na API PlayFiver
- Ajuste do endpoint no código se necessário

## 📝 Formato dos IDs

Os IDs da PlayFiver geralmente seguem o padrão:
- **Pragmatic Play**: `PP_` + código do jogo
- **Evolution**: `EVO_` + código do jogo
- **Play'n GO**: `PNG_` + código do jogo
- **NetEnt**: `NET_` + código do jogo
- etc.

**Exemplo**: `PP_vs7monkeys` para o jogo "7 Monkeys" da Pragmatic Play

## 🔍 Como Obter os IDs Reais

### Método 1: Documentação PlayFiver
- Consulte a documentação oficial: https://api.playfivers.com/docs/api
- Procure pela lista de jogos disponíveis

### Método 2: Teste Manual
1. Tente abrir um jogo no admin
2. Verifique os logs do backend ao tentar lançar
3. O erro pode mostrar o ID esperado

### Método 3: Contato com Suporte
- Entre em contato com o suporte da PlayFiver
- Solicite a lista completa de IDs dos jogos

## ⚙️ O que o Script Faz

1. ✅ Busca todos os jogos ativos do banco
2. ✅ Tenta buscar lista da API PlayFiver (opcional)
3. ✅ Compara `game_code` com o mapeamento
4. ✅ Atualiza o campo `game_id` com o ID real
5. ✅ Mostra relatório de atualizações

## 📊 Exemplo de Saída

```
🚀 Iniciando atualização de IDs dos jogos...

📋 Encontrados 50 jogos no banco de dados

  ✅ "Gates of Olympus" (gates-of-olympus): gates-of-olympus → PP_vs7monkeys
  ✅ "Sweet Bonanza" (sweet-bonanza): sweet-bonanza → PP_sweetbonanza
  ✓  "Big Bass Bonanza" (big-bass-bonanza): Já está atualizado (PP_bigbassbonanza)
  ⏭️  "Novo Jogo" (novo-jogo): ID PlayFiver não encontrado no mapeamento

📊 Resumo:
  ✅ 45 jogos atualizados
  ⏭️  3 jogos já estavam atualizados
  ⚠️  2 jogos sem ID PlayFiver no mapeamento

🎉 Atualização concluída!
```

## ⚠️ Importante

- **Faça backup** do banco antes de executar
- **Verifique os IDs** antes de adicionar ao mapeamento
- **Teste** abrindo alguns jogos após a atualização
- **Adicione IDs faltantes** conforme necessário

## 🔧 Troubleshooting

### Erro: "Credenciais PlayFiver não encontradas"
- Configure as credenciais no admin: `/admin/playfiver-keys`
- Ou use apenas o mapeamento manual

### Erro: "ID PlayFiver não encontrado no mapeamento"
- Adicione o ID real no objeto `PLAYFIVER_GAME_IDS`
- Verifique se o `game_code` está correto

### Jogos não abrem após atualização
- Verifique se o ID está correto
- Teste manualmente com um jogo conhecido
- Verifique os logs do backend ao tentar abrir

## 📝 Notas

- O script **não deleta** jogos
- O script **não altera** outros campos além de `game_id`
- O script **preserva** o `game_code` original
- O script **atualiza** apenas jogos ativos (`status = 1`)

