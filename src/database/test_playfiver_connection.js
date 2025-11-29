import axios from 'axios'
import https from 'https'
import pool from '../config/database.js'

const PLAYFIVER_HOST = 'api.playfiver.com'
const PLAYFIVER_URL = `https://${PLAYFIVER_HOST}/api/v2/game_launch`

async function testPlayFiverConnection() {
  try {
    console.log('🔍 TESTANDO CONEXÃO COM PLAYFIVER\n')
    
    // Buscar credenciais
    const [keys] = await pool.execute(
      'SELECT playfiver_token, playfiver_secret, playfiver_code FROM games_keys LIMIT 1'
    )
    
    if (!keys || keys.length === 0 || !keys[0].playfiver_token) {
      console.error('❌ Credenciais não encontradas!')
      process.exit(1)
    }
    
    const { playfiver_token, playfiver_secret, playfiver_code } = keys[0]
    console.log('✅ Credenciais encontradas:')
    console.log(`   Código: ${playfiver_code}`)
    console.log(`   Token: ${playfiver_token.substring(0, 20)}...`)
    console.log(`   Secret: ${playfiver_secret.substring(0, 20)}...\n`)
    
    const body = {
      agentToken: playfiver_token,
      secretKey: playfiver_secret,
      user_code: 'test@example.com',
      game_code: 'vs20olympx', // Gates of Olympus
      game_original: true,
      user_balance: '1000.00',
    }
    
    console.log('📤 Enviando requisição para:', PLAYFIVER_URL)
    console.log('📦 Body:', JSON.stringify(body, null, 2).replace(playfiver_token, '***').replace(playfiver_secret, '***'))
    console.log('')
    
    // Teste 1: Tentar com configuração SSL flexível
    console.log('🧪 Teste 1: Conexão com SSL flexível...')
    const agent1 = new https.Agent({
      rejectUnauthorized: false,
      minVersion: 'TLSv1',
      maxVersion: 'TLSv1.3',
    })
    
    try {
      const response1 = await axios.post(PLAYFIVER_URL, body, {
        httpsAgent: agent1,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (compatible; BetGenius/1.0)',
        },
        timeout: 60000,
        validateStatus: () => true, // Aceitar qualquer status
      })
      
      console.log('✅ Status:', response1.status)
      console.log('✅ Headers:', JSON.stringify(response1.headers, null, 2))
      console.log('✅ Data:', JSON.stringify(response1.data, null, 2))
      
      if (response1.data && (response1.data.launch_url || response1.data.url)) {
        console.log('\n🎉 SUCESSO! URL de lançamento obtida!')
        process.exit(0)
      } else if (response1.status === 200) {
        console.log('\n⚠️  Resposta 200 mas sem URL de lançamento')
        console.log('   Verifique se as credenciais estão corretas')
      }
    } catch (error1) {
      console.log('❌ Erro:', error1.message)
      console.log('   Code:', error1.code)
      console.log('   Response:', error1.response?.status, error1.response?.statusText)
      console.log('   Data:', error1.response?.data)
    }
    
    // Teste 2: Tentar com curl via child_process
    console.log('\n🧪 Teste 2: Tentando com curl...')
    const { exec } = await import('child_process')
    const { promisify } = await import('util')
    const execAsync = promisify(exec)
    
    const curlCommand = `curl -X POST "${PLAYFIVER_URL}" \\
      -H "Content-Type: application/json" \\
      -H "Accept: application/json" \\
      -d '${JSON.stringify(body)}' \\
      --insecure \\
      --max-time 60 \\
      -v 2>&1`
    
    try {
      const { stdout, stderr } = await execAsync(curlCommand)
      console.log('✅ Curl output:')
      console.log(stdout)
      if (stderr) {
        console.log('⚠️  Curl stderr:')
        console.log(stderr)
      }
    } catch (curlError) {
      console.log('❌ Curl error:', curlError.message)
    }
    
    process.exit(0)
  } catch (error) {
    console.error('❌ Erro geral:', error.message)
    console.error(error.stack)
    process.exit(1)
  }
}

testPlayFiverConnection()

