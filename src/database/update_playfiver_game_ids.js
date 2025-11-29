import pool from '../config/database.js'
import dotenv from 'dotenv'
import { getPlayFiverGames } from '../services/playfiver.js'

dotenv.config()

// Mapeamento de IDs reais da PlayFiver
// Formato: { 'game_code_atual': 'id_real_playfiver' }
// IMPORTANTE: Substitua pelos IDs reais fornecidos pela PlayFiver
// Você pode obter os IDs reais:
// 1. Consultando a documentação da PlayFiver
// 2. Testando manualmente um jogo e verificando os logs
// 3. Entrando em contato com o suporte da PlayFiver
const PLAYFIVER_GAME_IDS = {
  // Pragmatic Play
  // Exemplo: 'gates-of-olympus': 'PP_gatesofolympus', // Substitua pelo ID real
  // Exemplo: 'sweet-bonanza': 'PP_sweetbonanza', // Substitua pelo ID real
  // Adicione os IDs reais aqui conforme obtê-los da PlayFiver
  
  // Adicione mais jogos aqui conforme obter os IDs reais da PlayFiver
  // Exemplo de formato:
  // 'game-code': 'PROVIDER_gameid',
}

/**
 * Buscar lista de jogos da PlayFiver usando o endpoint oficial
 * Documentação: https://api.playfivers.com/docs/api
 * Endpoint: GET /api/v2/games
 */
async function fetchPlayFiverGames() {
  try {
    // Buscar credenciais do banco
    const [keys] = await pool.execute(
      'SELECT playfiver_token, playfiver_secret FROM games_keys LIMIT 1'
    )

    if (!keys || keys.length === 0 || !keys[0].playfiver_token) {
      console.warn('⚠️  Credenciais PlayFiver não encontradas. Usando mapeamento manual.')
      return null
    }

    const { playfiver_token, playfiver_secret } = keys[0]

    try {
      // Usar a função do serviço playfiver.js
      const games = await getPlayFiverGames({
        playfiver_token,
        playfiver_secret,
      })

      if (games && Array.isArray(games) && games.length > 0) {
        console.log(`✅ Lista de jogos obtida da PlayFiver: ${games.length} jogos`)
        return games
      }
    } catch (apiError) {
      console.warn('⚠️  Não foi possível buscar jogos da API PlayFiver:', apiError.message)
      console.warn('⚠️  Usando mapeamento manual de IDs.')
    }

    return null
  } catch (error) {
    console.warn('⚠️  Erro ao buscar jogos da PlayFiver:', error.message)
    return null
  }
}

/**
 * Atualizar game_id dos jogos no banco de dados
 */
async function updateGameIds(playfiverGames = null) {
  console.log('\n🔄 Atualizando IDs dos jogos com IDs reais da PlayFiver...\n')

  try {
    // Buscar todos os jogos do banco
    const [allGames] = await pool.execute(
      `SELECT id, game_code, game_name, game_id, provider_id
       FROM games
       WHERE status = 1`
    )

    console.log(`📋 Encontrados ${allGames.length} jogos no banco de dados\n`)

    let updatedCount = 0
    let skippedCount = 0
    let notFoundCount = 0

    // Se temos lista da API, criar mapeamento
    let gameIdMap = { ...PLAYFIVER_GAME_IDS }
    
    if (playfiverGames && Array.isArray(playfiverGames)) {
      console.log('\n📋 Criando mapeamento a partir da lista da PlayFiver...\n')
      
      // Criar mapeamento baseado na lista da API
      // A API pode retornar: { code: 'game_code', game_code: '...', name: 'game_name', ... }
      playfiverGames.forEach(game => {
        const gameCode = game.code || game.game_code || game.slug
        const gameId = game.id || game.game_id || gameCode
        
        if (gameCode && gameId) {
          gameIdMap[gameCode] = gameId
          console.log(`  📝 Mapeado: ${gameCode} → ${gameId}`)
        }
      })
      
      console.log(`\n✅ ${Object.keys(gameIdMap).length} jogos no mapeamento (incluindo manual)\n`)
    }

    for (const game of allGames) {
      const currentGameCode = game.game_code
      const currentGameId = game.game_id
      const playfiverId = gameIdMap[currentGameCode]

      if (!playfiverId) {
        console.log(`  ⏭️  "${game.game_name}" (${currentGameCode}): ID PlayFiver não encontrado no mapeamento`)
        notFoundCount++
        continue
      }

      if (currentGameId === playfiverId) {
        console.log(`  ✓  "${game.game_name}" (${currentGameCode}): Já está atualizado (${playfiverId})`)
        skippedCount++
        continue
      }

      try {
        await pool.execute(
          'UPDATE games SET game_id = ?, updated_at = NOW() WHERE id = ?',
          [playfiverId, game.id]
        )
        console.log(`  ✅ "${game.game_name}" (${currentGameCode}): ${currentGameId} → ${playfiverId}`)
        updatedCount++
      } catch (error) {
        console.error(`  ❌ Erro ao atualizar "${game.game_name}":`, error.message)
      }
    }

    console.log(`\n📊 Resumo:`)
    console.log(`  ✅ ${updatedCount} jogos atualizados`)
    console.log(`  ⏭️  ${skippedCount} jogos já estavam atualizados`)
    console.log(`  ⚠️  ${notFoundCount} jogos sem ID PlayFiver no mapeamento`)

    if (notFoundCount > 0) {
      console.log(`\n💡 Dica: Adicione os IDs faltantes no objeto PLAYFIVER_GAME_IDS do script.`)
    }

  } catch (error) {
    console.error('\n❌ Erro ao atualizar IDs dos jogos:', error)
    throw error
  }
}

/**
 * Função principal
 */
async function main() {
  try {
    console.log('🚀 Iniciando atualização de IDs dos jogos...\n')

    // Tentar buscar jogos da API (opcional)
    const playfiverGames = await fetchPlayFiverGames()

    // Atualizar IDs
    await updateGameIds(playfiverGames)

    console.log('\n🎉 Atualização concluída!')
  } catch (error) {
    console.error('\n❌ Erro fatal:', error)
    process.exit(1)
  } finally {
    pool.end()
  }
}

// Executar
main()

