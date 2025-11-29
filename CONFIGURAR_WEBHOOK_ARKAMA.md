# 🔧 Configurar Webhook/Postback da Arkama

## ❌ Problema Identificado

A URL do webhook está incompleta:
- ❌ Atual: `https://qoo8wgogo4ow4gsg0k0wk4g4.agenciamidas.com/api/pay`
- ✅ Correto: `https://qoo8wgogo4ow4gsg0k0wk4g4.agenciamidas.com/api/payments/arkama-webhook`

## ✅ Configuração Correta

### 1. URL do Webhook

**URL completa:**
```
https://qoo8wgogo4ow4gsg0k0wk4g4.agenciamidas.com/api/payments/arkama-webhook
```

### 2. Configurações do Postback

**URL:** `https://qoo8wgogo4ow4gsg0k0wk4g4.agenciamidas.com/api/payments/arkama-webhook`

**Método:** `POST` ✅ (já está correto)

**Eventos:** ✅ (já está correto)
- Venda: Pago
- Venda: Pendente
- Venda: Cancelado
- Venda: Em análise

**Interface:** `Arkama - Padrão (Versão 2.0.0)` ✅ (já está correto)

**Formato:** `Application/json` ✅ (já está correto)

**Produto:** `Todos os produtos` ✅ (já está correto)

**Token:** (seu token) ✅ (já está preenchido)

## 🔍 Se o Erro Persistir

Se ainda aparecer o erro "O campo uRL não é uma URL válida", tente:

1. **Copiar e colar a URL completa:**
   ```
   https://qoo8wgogo4ow4gsg0k0wk4g4.agenciamidas.com/api/payments/arkama-webhook
   ```

2. **Verificar se não há espaços** antes ou depois da URL

3. **Limpar o campo e digitar novamente**

4. **Verificar se o backend está acessível:**
   ```bash
   curl https://qoo8wgogo4ow4gsg0k0wk4g4.agenciamidas.com/api/health
   ```

## 📋 Checklist

- [ ] URL completa: `/api/payments/arkama-webhook`
- [ ] Método: `POST`
- [ ] Eventos selecionados (Pago, Pendente, Cancelado, Em análise)
- [ ] Interface: Versão 2.0.0
- [ ] Formato: Application/json
- [ ] Token preenchido
- [ ] Clicar em "Criar"

## 🧪 Testar Webhook

Após criar o postback, você pode testar:

1. **Criar um depósito de teste**
2. **Verificar os logs do Coolify:**
   - Procure por: `[PaymentController] Webhook Arkama recebido`
3. **Verificar se a transação foi processada**

## 🔄 Quando Configurar DNS

Quando você configurar o DNS do `api.betgeniusbr.com`, atualize a URL do webhook para:

```
https://api.betgeniusbr.com/api/payments/arkama-webhook
```

## ⚠️ Importante

- A URL deve ser **pública** e acessível via HTTPS
- O backend deve estar **rodando** e **acessível**
- O endpoint `/api/payments/arkama-webhook` deve estar **funcionando**


