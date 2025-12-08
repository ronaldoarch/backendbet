import cartwavehubService from './src/services/cartwavehub.js'

/**
 * Script para testar criação de PIX na Nova API Cartwave
 * 
 * Uso: node test_cartwave_pix.js [amount]
 * Exemplo: node test_cartwave_pix.js 1
 */

const amount = parseFloat(process.argv[2]) || 1.00
const userId = process.argv[3] || '1'
const userEmail = process.argv[4] || 'teste@exemplo.com'

console.log('🧪 Testando criação de PIX na Nova API Cartwave...\n')
console.log('📋 Parâmetros:')
console.log('   Valor: R$', amount.toFixed(2))
console.log('   User ID:', userId)
console.log('   Email:', userEmail)
console.log('')

try {
  const baseUrl = process.env.APP_URL || 
                 process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 
                 'https://qoo8wgogo4ow4gsg0k0wk4g4.agenciamidas.com'

  console.log('1️⃣ Criando transação PIX...')
  const result = await cartwavehubService.createPixTransaction({
    amount: amount,
    user_email: userEmail,
    user_id: userId,
    description: `Depósito de teste - R$ ${amount.toFixed(2)}`,
    callback_url: `${baseUrl}/api/payments/cartwavehub-webhook`,
    ip: '127.0.0.1',
  })

  if (!result.success) {
    console.error('❌ Erro ao criar transação:', result.error)
    console.error('   Detalhes:', result.details)
    process.exit(1)
  }

  console.log('   ✅ Transação criada com sucesso!')
  console.log('')

  const data = result.data
  console.log('2️⃣ Dados da transação:')
  console.log('   ID:', data.id)
  console.log('   Status:', data.status)
  console.log('   Valor:', data.amount ? `R$ ${(data.amount / 100).toFixed(2)}` : 'N/A')
  console.log('')

  console.log('3️⃣ Dados de pagamento:')
  if (data.pix?.encodedImage || data.encodedImage) {
    const qrCode = data.pix?.encodedImage || data.encodedImage
    console.log('   ✅ QR Code:', qrCode.substring(0, 50) + '... (base64)')
    console.log('      Tamanho:', qrCode.length, 'caracteres')
  } else {
    console.log('   ⚠️ QR Code não encontrado')
  }

  if (data.pix?.payload || data.payload) {
    const pixCode = data.pix?.payload || data.payload
    console.log('   ✅ PIX Copia e Cola:', pixCode.substring(0, 50) + '...')
    console.log('      Tamanho:', pixCode.length, 'caracteres')
  } else {
    console.log('   ⚠️ PIX Copia e Cola não encontrado')
  }
  console.log('')

  console.log('4️⃣ Resposta completa:')
  console.log(JSON.stringify(data, null, 2))
  console.log('')

  console.log('✅ Teste concluído com sucesso!')
  console.log('')
  console.log('💡 Próximos passos:')
  console.log('   1. Use o ID da transação para testar webhook')
  console.log('   2. Verifique se o QR Code aparece no frontend')
  console.log('   3. Teste o pagamento real')

  process.exit(0)
} catch (error) {
  console.error('❌ Erro no teste:', error.message)
  console.error('')
  console.error('Stack:', error.stack)
  process.exit(1)
} finally {
  // Fechar conexão do banco se necessário
  if (typeof pool !== 'undefined' && pool.end) {
    await pool.end().catch(() => {})
  }
}

