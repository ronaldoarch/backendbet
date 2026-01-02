import mysql from 'mysql2/promise'
import axios from 'axios'

async function testArkama() {
  try {
    // Conectar ao banco
    const conn = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '3306'),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
    })
    
    // Buscar credenciais Arkama
    const [rows] = await conn.execute(
      'SELECT setting_key, setting_value FROM app_settings WHERE setting_key LIKE "arkama%"'
    )
    
    const credentials = {}
    rows.forEach(row => {
      credentials[row.setting_key] = row.setting_value
    })
    
    console.log('📋 Credenciais Arkama:')
    console.log('  Token:', credentials.arkama_api_token ? credentials.arkama_api_token.substring(0, 20) + '...' : 'NÃO CONFIGURADO')
    console.log('  Base URL:', credentials.arkama_base_url || 'NÃO CONFIGURADO')
    console.log('  Environment:', credentials.arkama_environment || 'NÃO CONFIGURADO')
    
    // Determinar URL base
    let baseUrl = credentials.arkama_base_url
    const environment = credentials.arkama_environment || 'sandbox'
    
    if (!baseUrl || baseUrl === 'https://sandbox.arkama.com.br/api/v1') {
      switch (environment) {
        case 'production':
          baseUrl = 'https://app.arkama.com.br/api/v1'
          break
        case 'beta':
          baseUrl = 'https://beta.arkama.com.br/api/v1'
          break
        case 'sandbox':
        default:
          baseUrl = 'https://sandbox.arkama.com.br/api/v1'
          break
      }
    }
    
    console.log('\n🌐 URL Base Final:', baseUrl)
    
    const apiToken = credentials.arkama_api_token
    
    if (!apiToken) {
      console.error('❌ Token não configurado!')
      await conn.end()
      return
    }
    
    // Preparar requisição
    const requestBody = {
      value: '20.00',
      payment_method: 'pix',
      customer: {
        name: 'Teste User',
        email: 'teste@teste.com'
      },
      user_email: 'teste@teste.com',
      user_name: 'Teste User',
      description: 'Depósito de teste',
      callback_url: 'https://qoo8wgogo4ow4gsg0k0wk4g4.agenciamidas.com/api/payments/arkama-webhook',
      return_url: 'https://qoo8wgogo4ow4gsg0k0wk4g4.agenciamidas.com/wallet?payment=success'
    }
    
    console.log('\n📤 Enviando requisição para:', baseUrl + '/orders')
    console.log('📋 Body:', JSON.stringify(requestBody, null, 2))
    console.log('🔑 Token:', apiToken.substring(0, 20) + '...')
    
    try {
      const response = await axios.post(baseUrl + '/orders', requestBody, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiToken}`,
          'User-Agent': 'BetGenius-Casino'
        },
        timeout: 30000
      })
      
      console.log('\n✅ Sucesso!')
      console.log('📊 Status:', response.status)
      console.log('📊 Resposta:', JSON.stringify(response.data, null, 2))
    } catch (error) {
      console.log('\n❌ Erro na requisição:')
      console.log('Status:', error.response?.status)
      console.log('Status Text:', error.response?.statusText)
      console.log('Data:', JSON.stringify(error.response?.data, null, 2))
      
      if (error.response?.data?.errors) {
        console.log('\n📋 Erros de validação:')
        console.log(JSON.stringify(error.response.data.errors, null, 2))
      }
    }
    
    await conn.end()
  } catch (e) {
    console.error('❌ Erro:', e.message)
    console.error('Stack:', e.stack)
  }
}

testArkama()

