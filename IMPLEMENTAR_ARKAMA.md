# 💳 Implementar Gateway Arkama

## ✅ Implementação Completa

O gateway de pagamento Arkama foi implementado com sucesso!

## 📋 O que foi criado

### 1. Serviço Arkama (`src/services/arkama.js`)
- ✅ Criar compras (depósitos)
- ✅ Buscar status de compras
- ✅ Estornar compras (reembolsos)

### 2. Controller de Pagamentos (`src/controllers/paymentController.js`)
- ✅ Criar depósito
- ✅ Processar webhook da Arkama
- ✅ Verificar status de transação
- ✅ Histórico de transações

### 3. Rotas de Pagamento (`src/routes/paymentRoutes.js`)
- ✅ `POST /api/payments/deposit` - Criar depósito
- ✅ `POST /api/payments/arkama-webhook` - Webhook (público)
- ✅ `GET /api/payments/status/:transactionId` - Status da transação
- ✅ `GET /api/payments/history` - Histórico

### 4. Tabela de Transações
- ✅ Script de criação: `src/database/create_transactions_table.js`

## 🔧 Configuração

### 1. Criar Tabela de Transações

Execute no banco de dados:

```bash
cd backend-api
node src/database/create_transactions_table.js
```

Ou execute o SQL manualmente:

```sql
CREATE TABLE transactions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  type ENUM('deposit', 'withdrawal') NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  status ENUM('pending', 'completed', 'failed', 'cancelled') DEFAULT 'pending',
  payment_method VARCHAR(50) DEFAULT 'arkama',
  payment_id VARCHAR(255) NULL,
  payment_data TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_user_id (user_id),
  INDEX idx_status (status),
  INDEX idx_payment_id (payment_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 2. Configurar Variáveis de Ambiente

No Coolify, adicione estas variáveis:

```env
# Arkama Gateway
ARKAMA_API_TOKEN=seu_token_da_arkama
ARKAMA_BASE_URL=https://app.arkama.com.br/api/v1

# Para sandbox (testes):
# ARKAMA_BASE_URL=https://sandbox.arkama.com.br/api/v1

# URL base do backend (para callbacks)
APP_URL=https://qoo8wgogo4ow4gsg0k0wk4g4.agenciamidas.com
# Ou quando configurar DNS:
# APP_URL=https://api.betgeniusbr.com
```

### 3. Obter Token da Arkama

1. Acesse o painel da Arkama
2. Vá em **"API"**
3. Copie seu **API Token**
4. Adicione no Coolify como `ARKAMA_API_TOKEN`

### 4. Configurar Webhook na Arkama

No painel da Arkama, configure a URL de webhook:

```
https://qoo8wgogo4ow4gsg0k0wk4g4.agenciamidas.com/api/payments/arkama-webhook
```

Ou quando configurar DNS:

```
https://api.betgeniusbr.com/api/payments/arkama-webhook
```

## 🚀 Como Usar

### 1. Criar Depósito (Frontend)

```javascript
// POST /api/payments/deposit
const response = await fetch('/api/payments/deposit', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  },
  body: JSON.stringify({
    amount: 100.00, // Valor em reais
    description: 'Depósito na plataforma', // Opcional
  }),
})

const data = await response.json()

// Redirecionar usuário para URL de pagamento
if (data.payment_url) {
  window.location.href = data.payment_url
}
```

### 2. Verificar Status

```javascript
// GET /api/payments/status/:transactionId
const response = await fetch(`/api/payments/status/${transactionId}`, {
  headers: {
    'Authorization': `Bearer ${token}`,
  },
})

const data = await response.json()
console.log(data.transaction.status) // pending, completed, failed
```

### 3. Histórico de Transações

```javascript
// GET /api/payments/history?page=1&limit=20
const response = await fetch('/api/payments/history?page=1&limit=20', {
  headers: {
    'Authorization': `Bearer ${token}`,
  },
})

const data = await response.json()
console.log(data.transactions)
```

## 🔄 Fluxo Completo

1. **Usuário solicita depósito:**
   - Frontend chama `POST /api/payments/deposit`
   - Backend cria compra na Arkama
   - Retorna `payment_url`

2. **Usuário é redirecionado:**
   - Frontend redireciona para `payment_url`
   - Usuário paga na Arkama

3. **Arkama envia webhook:**
   - Arkama chama `POST /api/payments/arkama-webhook`
   - Backend processa pagamento
   - Credita na carteira do usuário

4. **Usuário retorna:**
   - Arkama redireciona para `return_url`
   - Frontend verifica status
   - Mostra confirmação

## 📊 Estrutura de Dados

### Transação (tabela `transactions`)

```sql
{
  id: 1,
  user_id: 123,
  type: 'deposit',
  amount: 100.00,
  status: 'completed', // pending, completed, failed, cancelled
  payment_method: 'arkama',
  payment_id: 'arkama_order_123',
  payment_data: '{"id": "123", "status": "paid", ...}',
  created_at: '2024-11-29 20:00:00',
  updated_at: '2024-11-29 20:05:00'
}
```

## 🧪 Testar

### 1. Ambiente Sandbox

Para testes, use o ambiente sandbox:

```env
ARKAMA_BASE_URL=https://sandbox.arkama.com.br/api/v1
```

### 2. Criar Depósito de Teste

```bash
curl -X POST https://qoo8wgogo4ow4gsg0k0wk4g4.agenciamidas.com/api/payments/deposit \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN_JWT" \
  -d '{
    "amount": 50.00,
    "description": "Depósito de teste"
  }'
```

### 3. Verificar Webhook

Após pagamento, verifique os logs do Coolify:
- Procure por: `[PaymentController] Webhook Arkama recebido`
- Procure por: `[PaymentController] Depósito processado`

## ⚠️ Importante

1. **Ambiente:** Use sandbox para testes, produção para live
2. **Webhook:** Deve ser acessível publicamente (HTTPS)
3. **Token:** Mantenha o token seguro (não commite no Git)
4. **Validação:** O sistema valida valores mínimos (R$ 10,00)

## 📝 Checklist

- [ ] Tabela `transactions` criada
- [ ] Variáveis de ambiente configuradas no Coolify
- [ ] Token da Arkama obtido e configurado
- [ ] Webhook configurado no painel da Arkama
- [ ] Testado em sandbox
- [ ] Frontend integrado
- [ ] Testado com pagamento real

## 🔗 Documentação

- **Arkama API:** https://arkama.readme.io/reference/intro
- **Ambientes:**
  - Produção: `https://app.arkama.com.br/api/v1`
  - Sandbox: `https://sandbox.arkama.com.br/api/v1`
  - Beta: `https://beta.arkama.com.br/api/v1`

## 🆘 Troubleshooting

### Erro: "Invalid token"

- Verifique se `ARKAMA_API_TOKEN` está correto
- Verifique se o token está ativo no painel da Arkama

### Webhook não está sendo recebido

- Verifique se a URL está acessível publicamente
- Verifique se está usando HTTPS
- Verifique os logs do Coolify

### Pagamento não está sendo creditado

- Verifique os logs do webhook
- Verifique se a transação foi criada no banco
- Verifique se o status está correto


