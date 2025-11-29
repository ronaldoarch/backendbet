import pool from '../config/database.js'
import { cache } from '../config/redis.js'
import { playFiverLaunch } from '../services/playfiver.js'
import crypto from 'crypto'

/**
 * Gerar hash para cache baseado em parâmetros
 */
const generateCacheKey = (prefix, params = {}) => {
  const hash = crypto.createHash('md5').update(JSON.stringify(params)).digest('hex')
  return `api.${prefix}.${hash}`
}

/**
 * GET /api/games/all
 * Lista todos os provedores com seus jogos
 */
export const getAllGames = async (req, res) => {
  try {
    const cacheKey = 'api.games.providers'
    
    // Tentar buscar do cache (com timeout curto)
    try {
      const cached = await Promise.race([
        cache.get(cacheKey),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Cache timeout')), 1000))
      ])
      if (cached) {
        return res.json(cached)
      }
    } catch (cacheError) {
      // Ignorar erro de cache, continuar com query
      console.warn('Cache não disponível, usando query direta')
    }

    const [providers] = await pool.execute(
      `SELECT id, code, name, cover, status, distribution
       FROM providers
       WHERE status = 1
       ORDER BY name`
    )

    const providersWithGames = await Promise.all(
      providers.map(async (provider) => {
        const [games] = await pool.execute(
          `SELECT id, game_name, game_code, cover, views, is_featured, show_home
           FROM games
           WHERE provider_id = ? AND status = 1
           ORDER BY views DESC`,
          [provider.id]
        )

        return {
          ...provider,
          games: games.map(game => ({
            id: game.id,
            game_name: game.game_name,
            game_code: game.game_code,
            cover: game.cover,
            views: game.views,
            is_featured: game.is_featured,
            provider: {
              id: provider.id,
              name: provider.name,
            },
          })),
        }
      })
    )

    const response = { providers: providersWithGames }
    
    // Tentar salvar no cache (sem bloquear)
    cache.set(cacheKey, response, 300).catch(() => {
      // Ignorar erro de cache
    }) // Cache de 5 minutos (reduzido)

    res.json(response)
  } catch (error) {
    console.error('Erro ao buscar jogos:', error)
    res.status(500).json({
      error: 'Erro ao buscar jogos',
      status: false,
    })
  }
}

/**
 * GET /api/featured/games
 * Lista jogos em destaque
 */
export const getFeaturedGames = async (req, res) => {
  try {
    const cacheKey = 'api.games.featured'
    
    // Tentar buscar do cache (com timeout curto)
    try {
      const cached = await Promise.race([
        cache.get(cacheKey),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Cache timeout')), 1000))
      ])
      if (cached) {
        return res.json(cached)
      }
    } catch (cacheError) {
      // Ignorar erro de cache, continuar com query
      console.warn('Cache não disponível, usando query direta')
    }

    const [games] = await pool.execute(
      `SELECT g.id, g.game_name, g.game_code, g.cover, g.views, g.is_featured,
              p.id as provider_id, p.name as provider_name, p.code as provider_code
       FROM games g
       JOIN providers p ON g.provider_id = p.id
       WHERE g.status = 1 AND g.is_featured = 1
       ORDER BY g.views DESC
       LIMIT 20`
    )

    const featuredGames = games.map(game => ({
      id: game.id,
      game_name: game.game_name,
      game_code: game.game_code,
      cover: game.cover,
      views: game.views,
      is_featured: game.is_featured,
      provider: {
        id: game.provider_id,
        name: game.provider_name,
        code: game.provider_code,
      },
    }))

    const response = { featured_games: featuredGames }
    
    // Tentar salvar no cache (sem bloquear)
    cache.set(cacheKey, response, 300).catch(() => {
      // Ignorar erro de cache
    }) // Cache de 5 minutos (reduzido)

    res.json(response)
  } catch (error) {
    console.error('Erro ao buscar jogos em destaque:', error)
    res.status(500).json({
      error: 'Erro ao buscar jogos em destaque',
      status: false,
    })
  }
}

/**
 * GET /api/casinos/games
 * Lista paginada de jogos com filtros
 */
export const getCasinoGames = async (req, res) => {
  try {
    const { provider, category, searchTerm, page = 1 } = req.query
    const perPage = 12
    const offset = (parseInt(page) - 1) * perPage

    const cacheKey = generateCacheKey('games.all', { provider, category, searchTerm, page })
    const cached = await cache.get(cacheKey)
    
    if (cached) {
      return res.json(cached)
    }

    let query = `
      SELECT g.id, g.game_name, g.game_code, g.cover, g.views, g.is_featured,
             p.id as provider_id, p.name as provider_name, p.code as provider_code
      FROM games g
      JOIN providers p ON g.provider_id = p.id
      WHERE g.status = 1
    `
    const params = []

    // Filtro por provedor
    if (provider && provider !== 'all') {
      query += ' AND g.provider_id = ?'
      params.push(provider)
    }

    // Filtro por categoria
    if (category && category !== 'all') {
      query += `
        AND g.id IN (
          SELECT cg.game_id
          FROM category_games cg
          JOIN categories c ON cg.category_id = c.id
          WHERE c.slug = ?
        )
      `
      params.push(category)
    }

    // Busca por termo
    if (searchTerm && searchTerm.length >= 3) {
      query += ' AND (g.game_name LIKE ? OR g.game_code LIKE ? OR g.distribution LIKE ? OR p.name LIKE ?)'
      const searchPattern = `%${searchTerm}%`
      params.push(searchPattern, searchPattern, searchPattern, searchPattern)
    }

    // Ordenação
    if (searchTerm && searchTerm.length >= 3) {
      query += ' ORDER BY g.game_name ASC'
    } else {
      query += ' ORDER BY g.views DESC'
    }

    // Contar total
    const countQuery = query.replace(
      'SELECT g.id, g.game_name, g.game_code, g.cover, g.views, g.is_featured, p.id as provider_id, p.name as provider_name, p.code as provider_code',
      'SELECT COUNT(*) as total'
    )
    const [countResult] = await pool.execute(countQuery, params)
    const total = countResult[0].total

    // Paginação
    query += ' LIMIT ? OFFSET ?'
    params.push(perPage, offset)

    const [games] = await pool.execute(query, params)

    // Buscar categorias de cada jogo
    const gamesWithCategories = await Promise.all(
      games.map(async (game) => {
        const [categories] = await pool.execute(
          `SELECT c.id, c.name, c.slug
           FROM categories c
           JOIN category_games cg ON c.id = cg.category_id
           WHERE cg.game_id = ?`,
          [game.id]
        )

        return {
          id: game.id,
          game_name: game.game_name,
          game_code: game.game_code,
          cover: game.cover,
          views: game.views,
          is_featured: game.is_featured,
          provider: {
            id: game.provider_id,
            name: game.provider_name,
            code: game.provider_code,
          },
          categories: categories,
        }
      })
    )

    const response = {
      games: {
        data: gamesWithCategories,
        current_page: parseInt(page),
        last_page: Math.ceil(total / perPage),
        per_page: perPage,
        total: total,
      },
    }

    await cache.set(cacheKey, response, 600) // 10 minutos

    res.json(response)
  } catch (error) {
    console.error('Erro ao buscar jogos do cassino:', error)
    res.status(500).json({
      error: 'Erro ao buscar jogos',
      status: false,
    })
  }
}

/**
 * GET /api/games/single/:id
 * Obtém detalhes de um jogo e URL de lançamento
 */
export const getSingleGame = async (req, res) => {
  try {
    const { id } = req.params
    const user = req.user

    if (!user) {
      return res.status(401).json({
        error: 'Você precisa estar autenticado para jogar',
        status: false,
      })
    }

    // Buscar jogo (com timeout)
    const [games] = await Promise.race([
      pool.execute(
        `SELECT g.*, p.name as provider_name, p.code as provider_code
         FROM games g
         JOIN providers p ON g.provider_id = p.id
         WHERE g.id = ? AND g.status = 1`,
        [id]
      ),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Query timeout')), 5000))
    ])

    if (!games || games.length === 0) {
      return res.status(404).json({
        error: 'Jogo não encontrado ou inativo',
        status: false,
      })
    }

    const game = games[0]

    // Buscar carteira (com timeout)
    const [wallets] = await Promise.race([
      pool.execute('SELECT * FROM wallets WHERE user_id = ?', [user.id]),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Query timeout')), 5000))
    ])

    if (!wallets || wallets.length === 0) {
      return res.status(400).json({
        error: 'Carteira não encontrada',
        status: false,
      })
    }

    const wallet = wallets[0]
    const totalBalance = parseFloat(wallet.balance || 0) + 
                        parseFloat(wallet.balance_bonus || 0) + 
                        parseFloat(wallet.balance_withdrawal || 0)

    // Permitir jogar sem saldo em modo de desenvolvimento/testes
    // Em produção, descomente a verificação abaixo
    // if (totalBalance <= 0) {
    //   return res.json({
    //     error: 'Você precisa ter saldo para jogar',
    //     status: false,
    //     action: 'deposit',
    //   })
    // }

    // Usar saldo mínimo de 1000 para testes se o saldo for 0
    const balanceToUse = totalBalance > 0 ? totalBalance : 1000

    // Buscar categorias (com timeout)
    const [categories] = await Promise.race([
      pool.execute(
        `SELECT c.id, c.name, c.slug
         FROM categories c
         JOIN category_games cg ON c.id = cg.category_id
         WHERE cg.game_id = ?`,
        [id]
      ),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Query timeout')), 5000))
    ])

    // Buscar credenciais PlayFiver (com timeout)
    const [keys] = await Promise.race([
      pool.execute('SELECT playfiver_token, playfiver_secret, playfiver_code FROM games_keys LIMIT 1'),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Query timeout')), 5000))
    ])

    if (!keys || keys.length === 0 || !keys[0].playfiver_token) {
      return res.status(500).json({
        error: 'Credenciais PlayFiver não configuradas',
        status: false,
      })
    }

    // Incrementar views (sem bloquear)
    pool.execute('UPDATE games SET views = views + 1 WHERE id = ?', [id]).catch(() => {
      // Ignorar erro
    })

    // Invalidar cache (sem bloquear)
    cache.clear('api.games.*').catch(() => {})

    // Lançar jogo no PlayFiver
    try {
      console.log('[GameController] Iniciando lançamento do jogo:', {
        gameId: game.id,
        gameCode: game.game_id || game.game_code,
        userEmail: user.email,
        balance: balanceToUse,
        gameOriginal: game.original,
        hasCredentials: !!(keys[0] && keys[0].playfiver_token),
      })

      const playfiverResponse = await Promise.race([
        playFiverLaunch(
          game.game_id || game.game_code,
          user.email,
          balanceToUse, // Usar balanceToUse em vez de totalBalance
          {
            ...keys[0],
            game_original: game.original !== undefined ? game.original : true, // Usar game_original do banco
          }
        ),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout ao lançar jogo no PlayFiver (8s)')), 8000)
        )
      ])

      console.log('[GameController] Resposta do PlayFiver recebida:', {
        hasLaunchUrl: !!playfiverResponse.launch_url,
        status: playfiverResponse.status,
        msg: playfiverResponse.msg,
      })

      // Conforme documentação: https://api.playfivers.com/docs/api
      // A resposta contém: { "status": true, "msg": "SUCCESS", "launch_url": "https://games.playfivers.com/launch?token=..." }
      const gameUrl = playfiverResponse.launch_url

      if (!gameUrl) {
        const errorMsg = playfiverResponse.msg || 'URL de lançamento não retornada pela PlayFiver'
        console.error('[GameController] Erro: Sem launch_url na resposta:', playfiverResponse)
        throw new Error(errorMsg)
      }

      res.json({
        game: {
          id: game.id,
          game_name: game.game_name,
          game_code: game.game_code,
          game_id: game.game_id,
          cover: game.cover,
          distribution: game.distribution,
          provider: {
            id: game.provider_id,
            name: game.provider_name,
          },
          categories: categories,
        },
        gameUrl: gameUrl,
        token: playfiverResponse.session_id || playfiverResponse.token || 'session_token',
      })
    } catch (playfiverError) {
      console.error('[GameController] ❌ Erro ao lançar jogo no PlayFiver')
      console.error('[GameController] Tipo do erro:', playfiverError.constructor.name)
      console.error('[GameController] Mensagem:', playfiverError.message)
      console.error('[GameController] Código:', playfiverError.code)
      console.error('[GameController] Stack:', playfiverError.stack)
      
      if (playfiverError.response) {
        console.error('[GameController] Resposta HTTP:', {
          status: playfiverError.response.status,
          statusText: playfiverError.response.statusText,
          data: playfiverError.response.data,
        })
      }
      
      // Verificar tipo de erro e retornar mensagem apropriada
      let errorMessage = 'Erro ao conectar com o provedor de jogos'
      let errorDetails = playfiverError.message
      
      // Se o erro tem uma resposta da API, usar a mensagem dela
      if (playfiverError.response && playfiverError.response.data) {
        const apiError = playfiverError.response.data
        if (apiError.msg) {
          errorMessage = apiError.msg
        } else if (apiError.error) {
          errorMessage = apiError.error
        } else if (apiError.message) {
          errorMessage = apiError.message
        }
      } else if (playfiverError.message.includes('Credenciais')) {
        errorMessage = 'Credenciais PlayFiver não configuradas ou inválidas'
        errorDetails = 'Por favor, configure as credenciais do PlayFiver no painel administrativo (Admin > Chaves PlayFiver).'
      } else if (playfiverError.message.includes('SSL') || playfiverError.message.includes('TLS') || playfiverError.message.includes('EPROTO')) {
        errorMessage = 'Erro de conexão SSL com PlayFiver'
        errorDetails = 'Não foi possível estabelecer uma conexão segura com o servidor PlayFiver. Verifique se as credenciais estão corretas e se o servidor está acessível.'
      } else if (playfiverError.message.includes('timeout') || playfiverError.message.includes('Timeout')) {
        errorMessage = 'Timeout ao conectar com PlayFiver'
        errorDetails = 'O servidor PlayFiver não respondeu a tempo. Tente novamente mais tarde.'
      }
      
      return res.status(500).json({
        error: errorMessage,
        status: false,
        details: errorDetails,
        action: 'configure_playfiver',
      })
    }
  } catch (error) {
    console.error('[GameController] ❌ Erro geral ao processar requisição:', error)
    console.error('[GameController] Stack:', error.stack)
    return res.status(500).json({
      error: 'Erro interno do servidor',
      status: false,
      details: error.message,
    })
  }
}
    })
  }
}

/**
 * POST /api/games/favorite/:id
 * Toggle de favorito
 */
export const toggleFavorite = async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.user.id

    // Verificar se já existe
    const [existing] = await pool.execute(
      'SELECT id FROM game_favorites WHERE user_id = ? AND game_id = ?',
      [userId, id]
    )

    if (existing && existing.length > 0) {
      // Remover
      await pool.execute(
        'DELETE FROM game_favorites WHERE user_id = ? AND game_id = ?',
        [userId, id]
      )
      res.json({
        status: true,
        message: 'Removido com sucesso',
      })
    } else {
      // Adicionar
      await pool.execute(
        'INSERT INTO game_favorites (user_id, game_id, created_at, updated_at) VALUES (?, ?, NOW(), NOW())',
        [userId, id]
      )
      res.json({
        status: true,
        message: 'Criado com sucesso',
      })
    }
  } catch (error) {
    console.error('Erro ao favoritar jogo:', error)
    res.status(500).json({
      error: 'Erro ao favoritar jogo',
      status: false,
    })
  }
}

/**
 * POST /api/games/like/:id
 * Toggle de like
 */
export const toggleLike = async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.user.id

    // Verificar se já existe
    const [existing] = await pool.execute(
      'SELECT id FROM game_likes WHERE user_id = ? AND game_id = ?',
      [userId, id]
    )

    if (existing && existing.length > 0) {
      // Remover
      await pool.execute(
        'DELETE FROM game_likes WHERE user_id = ? AND game_id = ?',
        [userId, id]
      )
      res.json({
        status: true,
        message: 'Removido com sucesso',
      })
    } else {
      // Adicionar
      await pool.execute(
        'INSERT INTO game_likes (user_id, game_id, created_at, updated_at) VALUES (?, ?, NOW(), NOW())',
        [userId, id]
      )
      res.json({
        status: true,
        message: 'Criado com sucesso',
      })
    }
  } catch (error) {
    console.error('Erro ao curtir jogo:', error)
    res.status(500).json({
      error: 'Erro ao curtir jogo',
      status: false,
    })
  }
}

/**
 * GET /api/source/games
 * Lista todos os jogos ativos
 */
export const getSourceGames = async (req, res) => {
  try {
    const cacheKey = 'api.source.games'
    const cached = await cache.get(cacheKey)
    
    if (cached) {
      return res.json(cached)
    }

    const [games] = await pool.execute(
      `SELECT g.id, g.game_name, g.game_code, g.cover, g.views, g.is_featured,
              p.id as provider_id, p.name as provider_name, p.code as provider_code
       FROM games g
       JOIN providers p ON g.provider_id = p.id
       WHERE g.status = 1
       ORDER BY g.views DESC`
    )

    const response = {
      games: games.map(game => ({
        id: game.id,
        game_name: game.game_name,
        game_code: game.game_code,
        cover: game.cover,
        views: game.views,
        is_featured: game.is_featured,
        provider: {
          id: game.provider_id,
          name: game.provider_name,
          code: game.provider_code,
        },
      })),
    }

    await cache.set(cacheKey, response, 600) // 10 minutos

    res.json(response)
  } catch (error) {
    console.error('Erro ao buscar jogos:', error)
    res.status(500).json({
      error: 'Erro ao buscar jogos',
      status: false,
    })
  }
}

