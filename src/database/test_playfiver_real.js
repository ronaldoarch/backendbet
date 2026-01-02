import axios from 'axios'
import https from 'https'
import pool from '../config/database.js'

const PLAYFIVER_HOST = 'api.playfiver.com'
const PLAYFIVER_URL = `https://${PLAYFIVER_HOST}/api/v2/game_launch`

async function testPlayFiverReal() {
  try {
    console.log('🔍 TESTE DE CONEXÃO COM PLAYFIVER (CREDENCIAIS REAIS)\n')
    
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
    
    // Verificar se são credenciais de teste
    if (playfiver_token === 'test' || playfiver_secret === 'test') {
      console.error('⚠️  ATENÇÃO: Credenciais são "test" - você precisa configurar as credenciais reais!')
      console.error('   Acesse: http://localhost:3000/admin/playfiver-keys')
      console.error('   E configure as credenciais reais do PlayFiver\n')
    }
    
    // Buscar um jogo real do banco
    const [games] = await pool.execute(
      `SELECT game_id, game_code, game_name FROM games WHERE status = 1 LIMIT 1`
    )
    
    const gameCode = games && games.length > 0 
      ? (games[0].game_id || games[0].game_code)
      : 'vs20olympx' // Fallback
    
    console.log(`🎮 Testando com jogo: ${gameCode}`)
    if (games && games.length > 0) {
      console.log(`   Nome: ${games[0].game_name}`)
    }
    console.log('')
    
    const body = {
      agentToken: playfiver_token,
      secretKey: playfiver_secret,
      user_code: 'test@example.com',
      game_code: gameCode,
      game_original: true,
      user_balance: '1000.00',
    }
    
    console.log('📤 Enviando requisição para:', PLAYFIVER_URL)
    console.log('📦 Body (credenciais ocultas):')
    console.log(JSON.stringify({
      ...body,
      agentToken: '***',
      secretKey: '***',
    }, null, 2))
    console.log('')
    
    // Configuração SSL
    const agent = new https.Agent({
      rejectUnauthorized: false,
      minVersion: 'TLSv1.2',
      maxVersion: 'TLSv1.3',
      servername: PLAYFIVER_HOST,
      keepAlive: true,
    })
    
    try {
      console.log('⏳ Aguardando resposta...')
      const response = await axios.post(PLAYFIVER_URL, body, {
        httpsAgent: agent,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Connection': 'keep-alive',
        },
        timeout: 60000,
        validateStatus: () => true, // Aceitar qualquer status para ver a resposta
      })
      
      console.log('\n✅ RESPOSTA RECEBIDA:')
      console.log(`   Status: ${response.status} ${response.statusText || ''}`)
      console.log(`   Headers:`, JSON.stringify(response.headers, null, 2))
      console.log(`\n   Data:`, JSON.stringify(response.data, null, 2))
      
      if (response.status === 200 && response.data) {
        if (response.data.launch_url || response.data.url) {
          console.log('\n🎉 SUCESSO! URL de lançamento obtida!')
          console.log(`   URL: ${response.data.launch_url || response.data.url}`)
          process.exit(0)
        } else if (response.data.status === false || response.data.error) {
          console.log('\n❌ API retornou erro:')
          console.log(`   Erro: ${response.data.error || response.data.message}`)
          console.log('\n💡 Isso geralmente significa:')
          console.log('   - Credenciais inválidas')
          console.log('   - Código do jogo incorreto')
          console.log('   - Agente não tem permissão para este jogo')
        }
      } else if (response.status === 401 || response.status === 403) {
        console.log('\n❌ ERRO DE AUTENTICAÇÃO')
        console.log('   As credenciais estão incorretas ou inválidas')
        console.log('   Verifique o Agent Token e Agent Secret')
      } else {
        console.log(`\n⚠️  Status HTTP: ${response.status}`)
      }
      
    } catch (error) {
      console.log('\n❌ ERRO NA REQUISIÇÃO:')
      console.log(`   Mensagem: ${error.message}`)
      console.log(`   Código: ${error.code || 'N/A'}`)
      
      if (error.response) {
        console.log(`   Status: ${error.response.status}`)
        console.log(`   Dados:`, JSON.stringify(error.response.data, null, 2))
      }
      
      if (error.code === 'EPROTO' || error.message.includes('SSL') || error.message.includes('TLS')) {
        console.log('\n💡 Erro SSL/TLS detectado')
        console.log('   Isso pode significar:')
        console.log('   - Servidor PlayFiver temporariamente indisponível')
        console.log('   - Problema de rede/firewall')
        console.log('   - Certificado SSL inválido no servidor')
      }
    }
    
    process.exit(0)
  } catch (error) {
    console.error('❌ Erro geral:', error.message)
    console.error(error.stack)
    process.exit(1)
  }
}

testPlayFiverReal()

