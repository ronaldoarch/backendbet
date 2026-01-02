import axios from 'axios'

/**
 * Script para testar o webhook do Cartwavehub
 * Simula um pagamento aprovado
 * 
 * Uso: node test_webhook.js <payment_id> [amount_in_cents]
 * Exemplo: node test_webhook.js 672748e7-b8f8-432f-a9e2-8c9a5f3e1d2b 2000
 */

// CONFIGURAÇÃO
const BACKEND_URL = 'https://qoo8wgogo4ow4gsg0k0wk4g4.agenciamidas.com'

// Obter ID da transação do argumento ou usar padrão
const TRANSACTION_ID = process.argv[2] || '7b80543e-322a-44e6-b8f8-432fc12e7a9b'
const AMOUNT_IN_CENTS = parseInt(process.argv[3]) || 100 // Padrão: R$ 1,00

if (!process.argv[2]) {
  console.log('⚠️  Nenhum payment_id fornecido. Usando ID padrão.')
  console.log('💡 Uso: node test_webhook.js <payment_id> [amount_in_cents]')
  console.log('💡 Execute: node list_pending_transactions.js para ver IDs disponíveis\n')
}

// Payload simulando webhook do Cartwavehub quando pagamento é aprovado
const webhookPayload = {
  code: TRANSACTION_ID, // ID da transação no nosso banco
  externalCode: `deposit_test_${Date.now()}`,
  orderId: TRANSACTION_ID,
  status: 'paid', // Status de pagamento aprovado
  amount: AMOUNT_IN_CENTS, // Valor em centavos
  endToEnd: `E${Date.now()}`,
  payer: {
    name: 'Teste Usuario',
    document: '12345678900',
  },
}

console.log('🧪 Testando webhook do Cartwavehub...')
console.log('💰 Valor: R$', (AMOUNT_IN_CENTS / 100).toFixed(2))
console.log('🆔 Transaction ID:', TRANSACTION_ID)
console.log('📋 Payload:', JSON.stringify(webhookPayload, null, 2))
console.log('')

// Enviar webhook
try {
  const response = await axios.post(
    `${BACKEND_URL}/api/payments/cartwavehub-webhook`,
    webhookPayload,
    {
      headers: {
        'Content-Type': 'application/json',
      },
    }
  )

  console.log('✅ Webhook enviado com sucesso!')
  console.log('📊 Resposta:', response.data)
  console.log('')
  
  if (response.data.success) {
    if (response.data.message?.includes('não encontrada')) {
      console.log('⚠️  Transação não encontrada no banco de dados!')
      console.log('💡 Execute: node list_pending_transactions.js')
      console.log('💡 E use o Payment ID de uma transação pendente real.')
    } else {
      console.log('✅ A transação deve estar aprovada e o saldo creditado!')
      console.log('💡 Verifique no banco de dados ou recarregue a página.')
    }
  }
} catch (error) {
  console.error('❌ Erro ao enviar webhook:')
  console.error('Status:', error.response?.status)
  console.error('Dados:', error.response?.data)
  console.error('Mensagem:', error.message)
}

