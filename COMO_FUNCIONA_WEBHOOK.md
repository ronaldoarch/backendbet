# 💰 Como Funciona o Sistema de Ganhos/Perdas

## ✅ Sim, o sistema está configurado!

Quando o usuário ganha ou perde no jogo, a PlayFiver envia um webhook (callback) para o seu backend, que atualiza automaticamente a carteira do usuário.

## 🔄 Como Funciona

### 1. Usuário Joga

1. Usuário abre um jogo
2. Faz uma aposta
3. Ganha ou perde

### 2. PlayFiver Envia Webhook

A PlayFiver envia automaticamente um webhook para:
```
https://qoo8wgogo4ow4gsg0k0wk4g4.agenciamidas.com/playfiver/callback
```

Ou se configurou DNS:
```
https://api.betgeniusbr.com/playfiver/callback
```

### 3. Backend Processa

O backend recebe o webhook e:
- ✅ Deduz a aposta da carteira
- ✅ Adiciona o ganho (se houver)
- ✅ Atualiza o saldo
- ✅ Registra a transação na tabela `orders`

## 📋 Tipos de Webhooks

### 1. **Balance** (Consulta de Saldo)
- PlayFiver consulta o saldo atual do usuário
- Retorna o saldo total

### 2. **WinBet** (Aposta/Ganho)
- Quando o usuário faz uma aposta
- Quando o usuário ganha
- Processa:
  - Deduz a aposta
  - Adiciona o ganho (se houver)
  - Atualiza a carteira

### 3. **Refund** (Reembolso)
- Quando há um reembolso
- Adiciona o valor de volta à carteira

## 💵 Como os Ganhos São Creditados

### Quando o usuário GANHA:

1. **Deduz a aposta:**
   - Primeiro tenta deduzir de `balance_bonus`
   - Se não tiver, deduz de `balance`
   - Se não tiver, deduz de `balance_withdrawal`

2. **Adiciona o ganho:**
   - O ganho é adicionado em `balance_withdrawal`
   - Isso permite controle de saque (ganhos precisam ser liberados)

### Exemplo:

```
Saldo inicial: R$ 100,00
Aposta: R$ 10,00
Ganho: R$ 50,00

Resultado:
- balance: R$ 90,00 (deduziu R$ 10,00)
- balance_withdrawal: R$ 50,00 (ganho adicionado)
- Total: R$ 140,00
```

## 🔧 Configuração Necessária

### 1. URL de Callback no PlayFiver

A URL de callback deve estar configurada na PlayFiver:
```
https://qoo8wgogo4ow4gsg0k0wk4g4.agenciamidas.com/playfiver/callback
```

Ou:
```
https://api.betgeniusbr.com/playfiver/callback
```

### 2. Verificar se Está Configurada

No painel admin do seu sistema:
1. Vá em **Admin > Chaves PlayFiver**
2. Verifique se o campo **"Callback URL"** está preenchido
3. Deve ser: `https://qoo8wgogo4ow4gsg0k0wk4g4.agenciamidas.com/playfiver/callback`

### 3. Configurar na PlayFiver

Você precisa configurar essa URL no painel da PlayFiver também.

## 🧪 Como Testar

### 1. Verificar Logs

No Coolify, verifique os logs:
- Procure por: `[Webhook PlayFiver] WinBet processado`
- Deve mostrar: `bet`, `win`, `balance`

### 2. Testar Manualmente

Você pode simular um webhook (apenas para testes):

```bash
curl -X POST https://qoo8wgogo4ow4gsg0k0wk4g4.agenciamidas.com/playfiver/callback \
  -H "Content-Type: application/json" \
  -d '{
    "type": "WinBet",
    "user_code": "email@usuario.com",
    "agent_code": "betgenius",
    "agent_secret": "sua_secret",
    "slot": {
      "round_id": "test123",
      "txn_id": "txn123",
      "game_code": "EVOLIVE_DHPTable00000001",
      "bet": "10.00",
      "win": "50.00"
    }
  }'
```

## ⚠️ Importante

1. **URL Pública:** A URL de callback deve ser acessível publicamente (não pode ser localhost)
2. **HTTPS:** Recomendado usar HTTPS (o Coolify já fornece)
3. **Credenciais:** O webhook valida as credenciais (agent_code e agent_secret)
4. **Idempotência:** O sistema evita processar a mesma transação duas vezes

## 🔍 Verificar se Está Funcionando

### 1. Verificar Logs do Coolify

Após um jogo, verifique os logs:
```
[Webhook PlayFiver] WinBet processado: {
  user_code: 'email@usuario.com',
  round_id: '...',
  bet: 10.00,
  win: 50.00,
  balance: 140.00
}
```

### 2. Verificar Carteira do Usuário

1. Acesse o painel admin
2. Vá em **Usuários** ou **Carteiras**
3. Verifique se o saldo foi atualizado

### 3. Verificar Transações

1. Verifique a tabela `orders` no banco
2. Deve ter registros de `bet` e `win`

## 📊 Estrutura de Saldos

A carteira tem 3 tipos de saldo:

1. **balance:** Saldo principal (depósitos)
2. **balance_bonus:** Saldo de bônus
3. **balance_withdrawal:** Saldo disponível para saque (ganhos)

**Prioridade de uso:**
1. Primeiro usa `balance_bonus`
2. Depois usa `balance`
3. Por último usa `balance_withdrawal`

**Ganhos vão para:**
- `balance_withdrawal` (precisa ser liberado para saque)

## ✅ Checklist

- [x] Sistema de webhook implementado
- [ ] URL de callback configurada no PlayFiver
- [ ] URL de callback salva no banco (Admin > Chaves PlayFiver)
- [ ] Testado com jogo real
- [ ] Logs verificados após jogo
- [ ] Saldo atualizado corretamente

## 🆘 Se Não Estiver Funcionando

1. **Verifique a URL de callback:**
   - Deve estar configurada no PlayFiver
   - Deve estar salva no banco

2. **Verifique os logs:**
   - Procure por erros nos logs do Coolify
   - Verifique se o webhook está sendo recebido

3. **Teste manualmente:**
   - Use o curl acima para testar

4. **Verifique credenciais:**
   - `agent_code` e `agent_secret` devem estar corretos


