# 🔍 Diagnosticar Erro ao Abrir Jogo

## 🎯 Problema

Erro 500 ao tentar abrir um jogo: "Erro ao conectar com o provedor de jogos"

## 🔧 Passos para Diagnosticar

### 1. Verificar os Logs do Backend

Quando você tentar abrir o jogo, os logs do backend mostrarão informações detalhadas:

```
[GameController] ========== DETALHES DO JOGO ==========
[GameController] ID do banco: 37
[GameController] Nome: Nome do Jogo
[GameController] game_code (banco): gates-of-olympus
[GameController] game_id (banco): (vazio) ou PP_gatesofolympus
[GameController] Código que será enviado: ...
[GameController] Provedor: Pragmatic Play
...
```

**Verifique:**
- Se `game_id` está vazio → Precisa atualizar os IDs
- Se `game_id` existe mas o jogo não abre → ID pode estar incorreto

### 2. Testar um Jogo Específico

Execute o script de teste para ver o erro exato:

```bash
cd backend-api
npm run test-game-launch 37
```

(Substitua `37` pelo ID do jogo que está dando erro)

O script mostrará:
- ✅ Informações do jogo no banco
- ✅ Credenciais encontradas
- ✅ Código que será enviado
- ✅ Resposta completa da PlayFiver (ou erro detalhado)

### 3. Atualizar IDs dos Jogos

Se o `game_id` estiver vazio ou incorreto, execute:

```bash
cd backend-api
npm run update-playfiver-ids
```

Este script irá:
1. Buscar lista de jogos da PlayFiver
2. Atualizar automaticamente os `game_id` no banco

### 4. Verificar Manualmente no Banco

Se o script não funcionar, verifique manualmente:

```sql
SELECT id, game_name, game_code, game_id, provider_id 
FROM games 
WHERE id = 37;
```

**O que verificar:**
- `game_id` deve conter o ID real da PlayFiver (ex: `PP_vs7monkeys`)
- Se estiver vazio ou com valor genérico, precisa atualizar

### 5. Verificar se o Jogo Existe na PlayFiver

O erro pode ocorrer se:
- ❌ O jogo não existe na PlayFiver
- ❌ O jogo não está disponível para seu agente
- ❌ O código do jogo está incorreto

**Solução:**
- Verifique na documentação da PlayFiver se o jogo existe
- Entre em contato com o suporte da PlayFiver
- Verifique se o jogo está ativo no painel da PlayFiver

## 🐛 Erros Comuns

### Erro: "Código do jogo não encontrado"
**Causa:** `game_id` e `game_code` estão vazios no banco
**Solução:** Execute `npm run update-playfiver-ids`

### Erro: "Erro da API PlayFiver: Game not found"
**Causa:** O `game_code` enviado não existe na PlayFiver
**Solução:** 
- Verifique se o código está correto
- Execute `npm run update-playfiver-ids` para atualizar

### Erro: "Credenciais PlayFiver inválidas"
**Causa:** Token ou Secret incorretos
**Solução:** Verifique as credenciais no admin (`/admin/playfiver-keys`)

### Erro: "Timeout ao lançar jogo"
**Causa:** API da PlayFiver não respondeu a tempo
**Solução:** 
- Verifique sua conexão
- Tente novamente
- Verifique se a API da PlayFiver está online

## 📋 Checklist

- [ ] Credenciais PlayFiver configuradas no admin
- [ ] Jogo tem `game_id` preenchido no banco
- [ ] `game_id` corresponde ao ID real da PlayFiver
- [ ] Jogo existe e está ativo na PlayFiver
- [ ] Jogo está disponível para seu agente
- [ ] Logs do backend mostram o código sendo enviado
- [ ] Script de teste mostra erro específico

## 💡 Próximos Passos

1. **Execute o teste:**
   ```bash
   npm run test-game-launch 37
   ```

2. **Verifique os logs** do backend ao tentar abrir o jogo

3. **Atualize os IDs:**
   ```bash
   npm run update-playfiver-ids
   ```

4. **Se ainda não funcionar**, compartilhe:
   - Saída do script de teste
   - Logs do backend
   - ID do jogo que está dando erro

