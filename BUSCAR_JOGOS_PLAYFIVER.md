# 🎮 Buscar IDs Reais dos Jogos da PlayFiver

## ✅ Confirmação da Documentação

Após consultar a documentação oficial da PlayFiver (https://api.playfivers.com/docs/api), confirmamos:

1. **`game_code` vai no BODY** (não na URL) ✅
   - O código atual está correto
   - Formato: `POST /api/v2/game_launch` com `game_code` no body

2. **Existe endpoint para listar jogos** ✅
   - Endpoint: `POST /api/v2/games`
   - Retorna lista completa de jogos disponíveis com seus IDs reais

## 🚀 Como Usar

### Opção 1: Buscar Automaticamente da API (Recomendado)

O script agora busca automaticamente os IDs reais da PlayFiver:

```bash
cd backend-api
npm run update-playfiver-ids
```

O script irá:
1. ✅ Buscar credenciais do banco (`games_keys`)
2. ✅ Chamar a API `/api/v2/games` da PlayFiver
3. ✅ Obter lista de jogos com IDs reais
4. ✅ Atualizar automaticamente o campo `game_id` no banco

### Opção 2: Mapeamento Manual

Se a API não funcionar, você pode editar o arquivo:
```
backend-api/src/database/update_playfiver_game_ids.js
```

E adicionar os IDs manualmente no objeto `PLAYFIVER_GAME_IDS`.

## 📋 Formato da Resposta da API

A API `/api/v2/games` retorna algo como:

```json
{
  "status": true,
  "games": [
    {
      "code": "PP_vs7monkeys",
      "name": "7 Monkeys",
      "provider": "Pragmatic Play",
      ...
    },
    ...
  ]
}
```

O script mapeia automaticamente `code` → `game_id` no banco.

## ⚠️ Importante

- **Credenciais**: Certifique-se de que as credenciais PlayFiver estão configuradas no admin
- **Teste**: Após atualizar, teste abrindo alguns jogos
- **Logs**: Verifique os logs para ver quais jogos foram atualizados

## 🔍 Troubleshooting

### Erro: "Credenciais PlayFiver não encontradas"
- Configure no admin: `/admin/playfiver-keys`
- Verifique se `playfiver_token` e `playfiver_secret` estão salvos

### Erro: "Não foi possível buscar jogos da API"
- Verifique se as credenciais estão corretas
- Verifique se a API está acessível
- O script usará mapeamento manual como fallback

### Jogos não atualizados
- Verifique se o `game_code` no banco corresponde ao `code` retornado pela API
- Alguns jogos podem precisar de mapeamento manual

