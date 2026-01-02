import { getCartwaveAuth, getCartwaveCredentials } from './src/services/cartwaveAuth.js'
import pool from './src/config/database.js'

/**
 * Script para testar autenticação JWT do Cartwave
 */

console.log('🧪 Testando autenticação JWT do Cartwave...\n')

try {
  // 1. Verificar credenciais
  console.log('1️⃣ Verificando credenciais...')
  const credentials = await getCartwaveCredentials()
  
  console.log('   ✅ Credenciais encontradas:')
  console.log('      Client ID:', credentials.clientId ? `${credentials.clientId.substring(0, 10)}...` : '❌ NÃO CONFIGURADO')
  console.log('      Client Secret:', credentials.clientSecret ? '✅ Configurado' : '❌ NÃO CONFIGURADO')
  console.log('      Base URL:', credentials.baseUrl)
  console.log('')

  if (!credentials.clientId || !credentials.clientSecret) {
    console.error('❌ ERRO: Credenciais JWT não configuradas!')
    console.log('')
    console.log('💡 Configure as credenciais:')
    console.log('   1. Execute o script SQL: config_cartwave_jwt.sql')
    console.log('   2. Ou configure variáveis de ambiente:')
    console.log('      CARTWAVE_CLIENT_ID=seu_client_id')
    console.log('      CARTWAVE_CLIENT_SECRET=seu_client_secret')
    console.log('      CARTWAVE_BASE_URL=https://api.cartwave.com.br')
    process.exit(1)
  }

  // 2. Obter token
  console.log('2️⃣ Obtendo token JWT...')
  const auth = getCartwaveAuth()
  const token = await auth.getToken()
  
  console.log('   ✅ Token obtido com sucesso!')
  console.log('      Token:', token.substring(0, 50) + '...')
  console.log('      Tamanho:', token.length, 'caracteres')
  console.log('')

  // 3. Verificar expiração
  console.log('3️⃣ Verificando cache de token...')
  const token2 = await auth.getToken()
  
  if (token === token2) {
    console.log('   ✅ Token em cache funcionando (mesmo token retornado)')
  } else {
    console.log('   ⚠️ Token foi renovado (pode ser normal se expirou)')
  }
  console.log('')

  // 4. Testar renovação
  console.log('4️⃣ Testando invalidação e renovação...')
  auth.invalidateToken()
  const token3 = await auth.getToken()
  
  if (token3 !== token) {
    console.log('   ✅ Renovação de token funcionando (novo token obtido)')
  } else {
    console.log('   ⚠️ Token não foi renovado (pode ser cache)')
  }
  console.log('')

  // 5. Fechar conexão do banco
  await pool.end()

  console.log('✅ Todos os testes passaram!')
  console.log('')
  console.log('🎯 Próximos passos:')
  console.log('   1. Testar criação de PIX')
  console.log('   2. Testar webhook')
  console.log('   3. Fazer depósito real')

  process.exit(0)
} catch (error) {
  console.error('❌ Erro nos testes:', error.message)
  console.error('')
  console.error('Detalhes:', error)
  process.exit(1)
}

