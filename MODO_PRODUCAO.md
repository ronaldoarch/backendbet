# 🚀 Configurar Modo Produção

## ✅ Alterações Realizadas

### 1. Verificação de Saldo Real

**Antes (Modo Demo):**
- Permitia jogar sem saldo
- Usava saldo mínimo de 1000 para testes

**Agora (Modo Produção):**
- ✅ Verifica se o usuário tem saldo real
- ✅ Bloqueia jogos se saldo <= 0
- ✅ Usa apenas o saldo real do usuário

### 2. Código Atualizado

O arquivo `gameController.js` foi atualizado para:
- Verificar saldo antes de permitir jogar
- Retornar erro se saldo for 0 ou negativo
- Usar apenas o saldo real da carteira

## 📋 Verificar Variáveis de Ambiente

No Coolify, certifique-se de que:

```env
NODE_ENV=production
```

## 🔄 Fazer Deploy

### Opção 1: Deploy Automático (Git)

Se configurou webhook:
```bash
git add .
git commit -m "Ativar modo produção - verificação de saldo real"
git push
```

O Coolify fará deploy automaticamente!

### Opção 2: Deploy Manual

No painel do Coolify:
1. Vá na aplicação
2. Clique em **"Redeploy"** ou **"Refazer Deploy"**

## ✅ Testar Modo Produção

### 1. Testar com Saldo Zero

1. Crie um usuário de teste
2. Verifique que a carteira tem saldo 0
3. Tente abrir um jogo
4. **Esperado:** Erro "Você precisa ter saldo para jogar"

### 2. Testar com Saldo Real

1. Adicione saldo à carteira do usuário
2. Tente abrir um jogo
3. **Esperado:** Jogo abre normalmente

## 🔍 Verificar Logs

No Coolify, verifique os logs:
- ✅ Não deve aparecer "Balance: 1000" (saldo de teste)
- ✅ Deve aparecer o saldo real do usuário

## ⚠️ Importante

1. **Usuários sem saldo** não poderão mais jogar
2. **Usuários precisam fazer depósito** antes de jogar
3. **Sistema de depósito** deve estar funcionando

## 📝 Checklist

- [x] Código atualizado para modo produção
- [ ] Variável `NODE_ENV=production` no Coolify
- [ ] Deploy realizado
- [ ] Testado com saldo zero (deve bloquear)
- [ ] Testado com saldo real (deve funcionar)
- [ ] Logs verificados

## 🆘 Se Algo Não Funcionar

1. Verifique os logs do Coolify
2. Verifique se `NODE_ENV=production` está configurado
3. Verifique se o deploy foi concluído
4. Teste novamente


