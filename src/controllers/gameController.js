import pool from '../config/database.js'
import { cache } from '../config/redis.js'
import { playFiverLaunch } from '../services/playfiver.js'
import crypto from 'crypto'

/**
 * Função auxiliar para construir URL completa da imagem
 * Se for uma URL completa (http/https), retorna como está
 * Se for uma URL relativa da PlayFiver, adiciona o domínio base
 * Se for base64, retorna como está
 */
const getImageUrl = (cover, gameCode = null) => {
  try {
    // Se cover existe e é válido, processar normalmente
    if (cover && cover !== null && cover !== undefined) {
      const coverStr = String(cover).trim()
      
      if (coverStr !== '' && coverStr !== 'null' && coverStr !== 'undefined') {
        // Se já for uma URL completa (http/https), retorna como está
        if (coverStr.startsWith('http://') || coverStr.startsWith('https://')) {
          return coverStr
        }
        
        // Se for base64, retorna como está
        if (coverStr.startsWith('data:image')) {
          return coverStr
        }
        
        // Se for uma URL relativa da PlayFiver (começa com /Games/), adiciona o domínio base
        if (coverStr.startsWith('/Games/') || coverStr.startsWith('Games/')) {
          return `https://imagensfivers.com/${coverStr.startsWith('/') ? coverStr.substring(1) : coverStr}`
        }
        
        // Se não começar com /, assume que é relativo e adiciona o domínio base
        if (!coverStr.startsWith('/')) {
          return `https://imagensfivers.com/Games/${coverStr}`
        }
        
        // Caso padrão: retorna como está
        return coverStr
      }
    }
    
    // Se cover está vazio/null e temos gameCode, tentar construir URL do PlayFiver
    if (gameCode && gameCode.trim() !== '') {
      const code = String(gameCode).trim()
      // Tentar URL padrão do PlayFiver: https://imagensfivers.com/Games/{gameCode}.jpg
      return `https://imagensfivers.com/Games/${code}.jpg`
    }
    
    // Se não temos nem cover nem gameCode, retornar null
    return null
  } catch (error) {
    console.warn('[GameController] Erro ao processar URL da imagem:', error)
    return null
  }
}

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
            cover: getImageUrl(game.cover, game.game_code),
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
      cover: getImageUrl(game.cover, game.game_code),
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
    console.log('[GameController] ==========================================')
    console.log('[GameController] getCasinoGames chamado')
    console.log('[GameController] Query params:', req.query)
    console.log('[GameController] Headers:', {
      authorization: req.headers.authorization ? 'Presente' : 'Ausente',
      origin: req.headers.origin,
    })
    
    const { provider, category, searchTerm, page = 1, per_page = 12 } = req.query
    const perPage = parseInt(per_page) || 12
    const offset = (parseInt(page) - 1) * perPage
    
    console.log('[GameController] Parâmetros processados:', {
      provider,
      category,
      searchTerm,
      page,
      per_page: perPage,
      offset,
    })

    const cacheKey = generateCacheKey('games.all', { provider, category, searchTerm, page })
    
    try {
      const cached = await cache.get(cacheKey)
      if (cached) {
        return res.json(cached)
      }
    } catch (cacheError) {
      console.warn('[GameController] Erro ao buscar cache, continuando com query direta:', cacheError.message)
    }

    let query = `
      SELECT g.id, g.game_name, g.game_code, g.cover, g.views, g.is_featured,
             p.id as provider_id, p.name as provider_name, p.code as provider_code
      FROM games g
      INNER JOIN providers p ON g.provider_id = p.id
      WHERE g.status = 1 AND p.status = 1
    `
    const params = []
    
    console.log('[GameController] Query base criada')

    // Filtro por provedor (pode ser ID ou nome)
    if (provider && provider !== 'all' && provider !== 'todos') {
      // Tentar como ID primeiro
      if (!isNaN(provider)) {
        query += ' AND g.provider_id = ?'
        params.push(parseInt(provider))
      } else {
        // Se não for número, buscar por nome ou código do provedor
        query += ' AND (p.name = ? OR p.code = ? OR p.distribution = ?)'
        params.push(provider, provider, provider)
      }
    }

    // Filtro por categoria
    let categoryExists = true
    if (category && category !== 'all' && category !== 'todos') {
      // Verificar se a categoria existe
      try {
        const [categoryCheck] = await pool.execute(
          'SELECT id, name, slug FROM categories WHERE slug = ?',
          [category]
        )
        
        if (categoryCheck.length === 0) {
          // Categoria não existe, retornar resposta vazia
          categoryExists = false
        } else {
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
      } catch (categoryError) {
        console.error('[GameController] Erro ao verificar categoria:', categoryError)
        categoryExists = false
      }
    }
    
    // Se a categoria não existe, retornar resposta vazia
    if (!categoryExists) {
      return res.json({
        games: {
          data: [],
          current_page: parseInt(page),
          last_page: 0,
          per_page: perPage,
          total: 0,
        },
      })
    }

    // Busca por termo (mínimo 2 caracteres)
    if (searchTerm && searchTerm.length >= 2) {
      query += ' AND (g.game_name LIKE ? OR g.game_code LIKE ? OR g.distribution LIKE ? OR p.name LIKE ?)'
      const searchPattern = `%${searchTerm}%`
      params.push(searchPattern, searchPattern, searchPattern, searchPattern)
    }

    // Ordenação
    if (searchTerm && searchTerm.length >= 2) {
      query += ' ORDER BY g.game_name ASC'
    } else {
      query += ' ORDER BY g.views DESC, g.game_name ASC'
    }

    // Criar query de contagem separada (sem LIMIT e OFFSET)
    let countQuery = `
      SELECT COUNT(DISTINCT g.id) as total
      FROM games g
      INNER JOIN providers p ON g.provider_id = p.id
      WHERE g.status = 1 AND p.status = 1
    `
    const countParams = []
    
    console.log('[GameController] CountQuery base criada')
    console.log('[GameController] CountQuery inicial:', countQuery)

    // Aplicar os mesmos filtros na query de contagem
    if (provider && provider !== 'all' && provider !== 'todos') {
      if (!isNaN(provider)) {
        countQuery += ' AND g.provider_id = ?'
        countParams.push(parseInt(provider))
      } else {
        countQuery += ' AND (p.name = ? OR p.code = ? OR p.distribution = ?)'
        countParams.push(provider, provider, provider)
      }
    }

    if (category && category !== 'all' && category !== 'todos' && categoryExists) {
      countQuery += `
        AND g.id IN (
          SELECT cg.game_id
          FROM category_games cg
          JOIN categories c ON cg.category_id = c.id
          WHERE c.slug = ?
        )
      `
      countParams.push(category)
    }

    if (searchTerm && searchTerm.length >= 2) {
      countQuery += ' AND (g.game_name LIKE ? OR g.game_code LIKE ? OR g.distribution LIKE ? OR p.name LIKE ?)'
      const searchPattern = `%${searchTerm}%`
      countParams.push(searchPattern, searchPattern, searchPattern, searchPattern)
    }

    let total = 0
    try {
      console.log('[GameController] Executando countQuery:', countQuery)
      console.log('[GameController] CountParams:', countParams)
      const countResultArray = await pool.execute(countQuery, countParams)
      console.log('[GameController] CountResultArray recebido:', countResultArray)
      console.log('[GameController] CountResultArray tipo:', typeof countResultArray)
      console.log('[GameController] CountResultArray é array?', Array.isArray(countResultArray))
      console.log('[GameController] CountResultArray length:', countResultArray?.length)
      
      // mysql2 retorna [rows, fields], então precisamos pegar o primeiro elemento
      const countResult = Array.isArray(countResultArray) ? countResultArray[0] : countResultArray
      console.log('[GameController] CountResult (rows):', countResult)
      console.log('[GameController] CountResult tipo:', typeof countResult)
      console.log('[GameController] CountResult é array?', Array.isArray(countResult))
      
      if (countResult && Array.isArray(countResult) && countResult.length > 0) {
        // Tentar acessar 'total' ou 'COUNT(*)'
        const firstRow = countResult[0]
        console.log('[GameController] FirstRow:', firstRow)
        total = parseInt(firstRow?.total || firstRow?.['COUNT(*)'] || firstRow?.['COUNT(DISTINCT g.id)'] || 0)
        console.log('[GameController] Total extraído:', total)
      } else {
        console.warn('[GameController] ⚠️ CountResult está vazio ou inválido')
        total = 0
      }
      
      console.log('[GameController] Total de jogos final:', total)
    } catch (countError) {
      console.error('[GameController] ❌ Erro ao contar jogos:', countError)
      console.error('[GameController] CountQuery:', countQuery)
      console.error('[GameController] CountParams:', countParams)
      console.error('[GameController] Erro completo:', {
        message: countError.message,
        code: countError.code,
        sqlState: countError.sqlState,
        sqlMessage: countError.sqlMessage,
      })
      // Se der erro na contagem, continuar com total 0
      total = 0
    }

    // Paginação - MySQL2 não aceita placeholders em LIMIT/OFFSET, usar valores diretamente
    // Garantir que são números inteiros e seguros
    const safeLimit = Math.max(1, Math.min(parseInt(perPage) || 12, 100)) // Máximo 100 por página
    const safeOffset = Math.max(0, parseInt(offset) || 0)
    query += ` LIMIT ${safeLimit} OFFSET ${safeOffset}`

    console.log('[GameController] Executando query final:', query.substring(0, 200))
    console.log('[GameController] Parâmetros finais:', params)
    
    let games = []
    try {
      [games] = await pool.execute(query, params)
      console.log('[GameController] Jogos encontrados:', games.length)
    } catch (queryError) {
      console.error('[GameController] ❌ Erro ao executar query:', queryError)
      console.error('[GameController] Erro completo:', {
        message: queryError.message,
        code: queryError.code,
        sqlState: queryError.sqlState,
        sqlMessage: queryError.sqlMessage,
      })
      
      // Se for erro de tabela não encontrada, retornar resposta vazia
      if (queryError.code === 'ER_NO_SUCH_TABLE') {
        return res.json({
          games: {
            data: [],
            current_page: parseInt(page),
            last_page: 0,
            per_page: perPage,
            total: 0,
          },
        })
      }
      
      throw queryError
    }

    // Buscar categorias de cada jogo
    const gamesWithCategories = await Promise.all(
      games.map(async (game) => {
        try {
          const [categories] = await pool.execute(
            `SELECT c.id, c.name, c.slug
             FROM categories c
             INNER JOIN category_games cg ON c.id = cg.category_id
             WHERE cg.game_id = ? AND c.status = 1`,
            [game.id]
          )

          return {
            id: game.id,
            game_name: game.game_name,
            game_code: game.game_code,
            cover: getImageUrl(game.cover, game.game_code),
            views: game.views,
            is_featured: game.is_featured,
            provider: {
              id: game.provider_id,
              name: game.provider_name,
              code: game.provider_code,
            },
            categories: categories || [],
          }
        } catch (categoryError) {
          console.error(`[GameController] Erro ao buscar categorias do jogo ${game.id}:`, categoryError)
          return {
            id: game.id || 0,
            game_name: game.game_name || 'Jogo sem nome',
            game_code: game.game_code || '',
            cover: getImageUrl(game.cover, game.game_code),
            views: parseInt(game.views || 0),
            is_featured: Boolean(game.is_featured),
            provider: {
              id: game.provider_id || 0,
              name: game.provider_name || 'Desconhecido',
              code: game.provider_code || '',
            },
            categories: [],
          }
        }
      })
    )

    console.log('[GameController] Montando resposta final...')
    const response = {
      games: {
        data: gamesWithCategories,
        current_page: parseInt(page),
        last_page: Math.ceil(total / perPage),
        per_page: perPage,
        total: total,
      },
    }

    console.log('[GameController] Resposta montada:', {
      total_jogos: gamesWithCategories.length,
      total_registros: total,
      pagina_atual: parseInt(page),
      ultima_pagina: Math.ceil(total / perPage),
    })

    try {
      await cache.set(cacheKey, response, 600) // 10 minutos
      console.log('[GameController] Cache salvo com sucesso')
    } catch (cacheError) {
      console.warn('[GameController] Erro ao salvar cache (não crítico):', cacheError.message)
    }

    console.log('[GameController] ✅ Enviando resposta para o frontend')
    res.json(response)
  } catch (error) {
    console.error('[GameController] ❌ Erro ao buscar jogos do cassino:', error)
    console.error('[GameController] Erro completo:', {
      message: error.message,
      code: error.code,
      sqlState: error.sqlState,
      sqlMessage: error.sqlMessage,
      stack: error.stack,
    })
    
    // Se for erro de tabela não encontrada, retornar resposta vazia em vez de erro 500
    if (error.code === 'ER_NO_SUCH_TABLE') {
      return res.json({
        games: {
          data: [],
          current_page: parseInt(req.query.page || 1),
          last_page: 0,
          per_page: parseInt(req.query.per_page || 12),
          total: 0,
        },
      })
    }
    
    res.status(500).json({
      error: 'Erro ao buscar jogos',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Erro interno do servidor',
      status: false,
      details: process.env.NODE_ENV === 'development' ? {
        code: error.code,
        sqlState: error.sqlState,
        sqlMessage: error.sqlMessage,
      } : undefined,
    })
  }
}

/**
 * GET /api/games/single/:id
 * Obtém detalhes de um jogo e URL de lançamento
 */
export const getSingleGame = async (req, res) => {
  try {
    console.log('[GameController] 🎮 getSingleGame chamado')
    console.log('[GameController] Parâmetros:', req.params)
    console.log('[GameController] Headers:', {
      authorization: req.headers.authorization ? 'Presente' : 'Ausente',
      origin: req.headers.origin,
      userAgent: req.headers['user-agent']?.substring(0, 50),
    })
    
    const { id } = req.params
    const user = req.user

    console.log('[GameController] User:', user ? `ID: ${user.id}` : 'Não autenticado')

    if (!user) {
      console.log('[GameController] ❌ Usuário não autenticado')
      return res.status(401).json({
        error: 'Você precisa estar autenticado para jogar',
        status: false,
      })
    }
    
    console.log('[GameController] ✅ Usuário autenticado, buscando jogo ID:', id)

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

    // Verificar se o usuário tem saldo para jogar (MODO PRODUÇÃO)
    if (totalBalance <= 0) {
      return res.status(400).json({
        error: 'Você precisa ter saldo para jogar',
        status: false,
        action: 'deposit',
      })
    }

    // Usar o saldo real do usuário
    const balanceToUse = totalBalance

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
      const gameCodeToUse = game.game_id || game.game_code
      
      console.log('[GameController] ========== DETALHES DO JOGO ==========')
      console.log('[GameController] ID do banco:', game.id)
      console.log('[GameController] Nome:', game.game_name)
      console.log('[GameController] game_code (banco):', game.game_code)
      console.log('[GameController] game_id (banco):', game.game_id || '(vazio)')
      console.log('[GameController] Código que será enviado:', gameCodeToUse)
      console.log('[GameController] Provedor:', game.provider_name, `(${game.provider_code})`)
      console.log('[GameController] Original:', game.original)
      console.log('[GameController] User:', user.email)
      console.log('[GameController] Balance:', balanceToUse)
      console.log('[GameController] ======================================\n')

      if (!gameCodeToUse) {
        return res.status(500).json({
          error: 'Código do jogo não encontrado. O jogo precisa ter game_id ou game_code configurado.',
          status: false,
          details: 'Execute: npm run update-playfiver-ids para atualizar os IDs dos jogos',
        })
      }

      const playfiverResponse = await Promise.race([
        playFiverLaunch(
          gameCodeToUse,
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
          cover: getImageUrl(game.cover, game.game_code),
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
              errorDetails = apiError.msg
            } else if (apiError.error) {
              errorMessage = apiError.error
              errorDetails = apiError.error
            } else if (apiError.message) {
              errorMessage = apiError.message
              errorDetails = apiError.message
            }
          } else if (playfiverError.message.includes('IP') || playfiverError.message.includes('ip') || playfiverError.message.includes('permitido') || playfiverError.message.includes('Não permitido')) {
            errorMessage = 'IP do servidor não está na whitelist da PlayFiver'
            errorDetails = 'O IP do servidor precisa estar na whitelist da PlayFiver. Execute: npm run get-ip para descobrir o IP atual e adicione à whitelist.'
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

/**
 * GET /api/games/favorites
 * Lista todos os jogos favoritos do usuário
 */
export const getFavorites = async (req, res) => {
  try {
    const userId = req.user.id

    const [favorites] = await pool.execute(
      `SELECT g.*, p.name as provider_name, p.code as provider_code, gf.created_at as favorited_at
       FROM game_favorites gf
       INNER JOIN games g ON gf.game_id = g.id
       LEFT JOIN providers p ON g.provider_id = p.id
       WHERE gf.user_id = ? AND g.status = 1
       ORDER BY gf.created_at DESC`,
      [userId]
    )

    const games = favorites.map(game => ({
      id: game.id,
      game_code: game.game_code,
      game_name: game.game_name,
      cover: getImageUrl(game.cover, game.game_code),
      provider: game.provider_name || 'Desconhecido',
      category: null,
      type: 'slot',
      distribution: game.distribution || 'play_fiver',
      technology: 'html5',
      rtp: 96.5,
      is_mobile: true,
      is_featured: game.is_featured || false,
      is_new: false,
      views: game.views || 0,
      likes: 0,
    }))

    res.json({
      status: true,
      games: games,
    })
  } catch (error) {
    console.error('Erro ao buscar favoritos:', error)
    res.status(500).json({
      error: 'Erro ao buscar favoritos',
      status: false,
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

