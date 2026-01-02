import pool from '../config/database.js'
import { playFiverLaunch } from '../services/playfiver.js'
import dotenv from 'dotenv'

dotenv.config()

/**
 * Script para testar o lançamento de um jogo específico
 * Uso: node src/database/test_game_launch.js <game_id_do_banco>
 * Exemplo: node src/database/test_game_launch.js 37
 */
async function testGameLaunch(gameId) {
  try {
    console.log(`\n🧪 Testando lançamento do jogo ID: ${gameId}\n`)

    // Buscar jogo no banco
    const [games] = await pool.execute(
      `SELECT g.*, p.name as provider_name, p.code as provider_code
       FROM games g
       JOIN providers p ON g.provider_id = p.id
       WHERE g.id = ?`,
      [gameId]
    )

    if (!games || games.length === 0) {
      console.error(`❌ Jogo com ID ${gameId} não encontrado no banco`)
      process.exit(1)
    }

    const game = games[0]
    console.log('📋 Informações do jogo:')
    console.log(`  ID do banco: ${game.id}`)
    console.log(`  Nome: ${game.game_name}`)
    console.log(`  game_code: ${game.game_code}`)
    console.log(`  game_id: ${game.game_id || '(vazio)'}`)
    console.log(`  Provedor: ${game.provider_name} (${game.provider_code})`)
    console.log(`  Original: ${game.original}`)
    console.log(`  Status: ${game.status}`)

    // Buscar credenciais
    const [keys] = await pool.execute(
      'SELECT playfiver_token, playfiver_secret, playfiver_code FROM games_keys LIMIT 1'
    )

    if (!keys || keys.length === 0 || !keys[0].playfiver_token) {
      console.error('❌ Credenciais PlayFiver não encontradas no banco')
      process.exit(1)
    }

    console.log('\n🔑 Credenciais encontradas:')
    console.log(`  Agent Code: ${keys[0].playfiver_code || '(não configurado)'}`)
    console.log(`  Agent Token: ${keys[0].playfiver_token.substring(0, 20)}...`)
    console.log(`  Agent Secret: ${keys[0].playfiver_secret.substring(0, 20)}...`)

    // Determinar qual código usar
    const gameCodeToUse = game.game_id || game.game_code
    console.log(`\n🎮 Código do jogo que será enviado: "${gameCodeToUse}"`)

    if (!gameCodeToUse) {
      console.error('❌ Nenhum código de jogo encontrado (game_id e game_code estão vazios)')
      process.exit(1)
    }

    // Testar lançamento
    console.log('\n🚀 Tentando lançar jogo na PlayFiver...\n')

    try {
      const result = await playFiverLaunch(
        gameCodeToUse,
        'teste@example.com', // Email de teste
        1000.00, // Saldo de teste
        {
          ...keys[0],
          game_original: game.original !== undefined ? game.original : true,
        }
      )

      console.log('\n✅ SUCESSO! Jogo lançado com sucesso!')
      console.log('\n📊 Resposta da PlayFiver:')
      console.log(`  Status: ${result.status}`)
      console.log(`  Mensagem: ${result.msg || 'N/A'}`)
      console.log(`  Launch URL: ${result.launch_url ? result.launch_url.substring(0, 80) + '...' : 'N/A'}`)
      console.log(`  User Balance: ${result.user_balance || 'N/A'}`)
      console.log(`  User Created: ${result.user_created || 'N/A'}`)

      if (result.launch_url) {
        console.log(`\n🔗 URL completa: ${result.launch_url}`)
      }

    } catch (error) {
      console.error('\n❌ ERRO ao lançar jogo:')
      console.error(`  Mensagem: ${error.message}`)
      
      if (error.response) {
        console.error(`  Status HTTP: ${error.response.status}`)
        console.error(`  Dados da resposta:`, JSON.stringify(error.response.data, null, 2))
      }

      console.error('\n💡 Possíveis causas:')
      console.error('  1. O game_code não existe na PlayFiver')
      console.error('  2. O jogo não está disponível para este agente')
      console.error('  3. As credenciais estão incorretas')
      console.error('  4. O formato do game_code está errado')
      console.error('\n💡 Solução:')
      console.error(`  - Verifique se o código "${gameCodeToUse}" existe na PlayFiver`)
      console.error(`  - Execute: npm run update-playfiver-ids para atualizar os IDs`)
      console.error(`  - Ou edite manualmente o game_id do jogo no banco`)
    }

  } catch (error) {
    console.error('\n❌ Erro fatal:', error)
    process.exit(1)
  } finally {
    pool.end()
  }
}

// Obter ID do jogo da linha de comando
const gameId = process.argv[2]

if (!gameId) {
  console.error('❌ Uso: node src/database/test_game_launch.js <game_id>')
  console.error('   Exemplo: node src/database/test_game_launch.js 37')
  process.exit(1)
}

testGameLaunch(parseInt(gameId))

