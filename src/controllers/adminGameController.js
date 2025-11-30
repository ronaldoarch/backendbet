import pool from '../config/database.js'
import { cache } from '../config/redis.js'

/**
 * GET /api/admin/games
 * Lista todos os jogos para o admin
 */
export const getAllGames = async (req, res) => {
  try {
    const [games] = await pool.execute(
      `SELECT g.*, p.name as provider_name, p.code as provider_code, p.id as provider_id
       FROM games g
       JOIN providers p ON g.provider_id = p.id
       ORDER BY g.id DESC`
    )

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
          ...game,
          provider: {
            id: game.provider_id,
            name: game.provider_name,
            code: game.provider_code,
          },
          categories: categories,
        }
      })
    )

    res.json({ games: gamesWithCategories })
  } catch (error) {
    console.error('Erro ao buscar jogos:', error)
    res.status(500).json({
      error: 'Erro ao buscar jogos',
      status: false,
    })
  }
}

/**
 * POST /api/admin/games
 * Cria um novo jogo
 */
export const createGame = async (req, res) => {
  try {
    console.log('[Admin] Criando jogo:', req.body)
    
    const {
      provider_id,
      game_name,
      game_code,
      game_id,
      cover,
      views,
      is_featured,
      show_home,
      original,
      status,
      categories,
    } = req.body

    // Validar dados obrigatórios
    if (!provider_id || !game_name || !game_code || !game_id) {
      return res.status(400).json({
        error: `Dados obrigatórios faltando: provider_id=${provider_id}, game_name=${game_name}, game_code=${game_code}, game_id=${game_id}`,
        status: false,
      })
    }

    // Verificar se provider existe
    const [providers] = await pool.execute(
      'SELECT id FROM providers WHERE id = ?',
      [provider_id]
    )

    if (!providers || providers.length === 0) {
      return res.status(400).json({
        error: `Provedor com ID ${provider_id} não encontrado. Use um ID válido.`,
        status: false,
      })
    }

    // Verificar se game_code já existe
    const [existing] = await pool.execute(
      'SELECT id FROM games WHERE game_code = ?',
      [game_code]
    )

    if (existing && existing.length > 0) {
      return res.status(400).json({
        error: 'Código do jogo já existe',
        status: false,
      })
    }

    // Processar cover: aceitar URL completa ou base64
    let coverValue = cover || null
    if (coverValue) {
      // Se for uma URL completa (http/https), usar diretamente
      if (coverValue.startsWith('http://') || coverValue.startsWith('https://')) {
        // URL completa - usar como está
        coverValue = coverValue
      } 
      // Se for base64 e muito grande, tentar usar URL se disponível ou truncar
      else if (coverValue.startsWith('data:image') && coverValue.length > 65535) {
        console.warn('Imagem base64 muito grande, truncando...')
        coverValue = coverValue.substring(0, 65535)
      }
      // Se for uma URL relativa da PlayFiver, usar como está (será processada no getImageUrl)
      // Caso contrário, usar como está
    }
    
    // Inserir jogo
    const [result] = await pool.execute(
      `INSERT INTO games (
        provider_id, game_id, game_name, game_code, cover, views,
        is_featured, show_home, original, status, distribution, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'play_fiver', NOW(), NOW())`,
      [
        provider_id,
        game_id,
        game_name,
        game_code,
        coverValue,
        views || 0,
        is_featured || false,
        show_home || false,
        original || false,
        status !== false,
      ]
    )

    const gameId = result.insertId

    // Adicionar categorias
    if (categories && Array.isArray(categories) && categories.length > 0) {
      // Buscar IDs das categorias pelos nomes
      for (const categoryName of categories) {
        const [catResult] = await pool.execute(
          'SELECT id FROM categories WHERE name = ? OR slug = ? LIMIT 1',
          [categoryName, categoryName.toLowerCase().replace(/\s+/g, '-')]
        )

        if (catResult && catResult.length > 0) {
          const categoryId = catResult[0].id
          await pool.execute(
            'INSERT INTO category_games (category_id, game_id, created_at, updated_at) VALUES (?, ?, NOW(), NOW())',
            [categoryId, gameId]
          )
        }
      }
    }

    // Invalidar cache - limpar todas as chaves relacionadas a jogos (sem bloquear)
    Promise.all([
      cache.del('api.games.providers').catch(() => {}),
      cache.del('api.games.featured').catch(() => {}),
      cache.del('api.source.games').catch(() => {}),
      cache.clear('api.games.all.*').catch(() => {}),
      cache.clear('api.games*').catch(() => {}),
    ]).catch(() => {
      // Ignorar erros de cache
    })

    // Buscar jogo criado
    const [newGame] = await pool.execute(
      `SELECT g.*, p.name as provider_name, p.code as provider_code, p.id as provider_id
       FROM games g
       JOIN providers p ON g.provider_id = p.id
       WHERE g.id = ?`,
      [gameId]
    )

    res.status(201).json({
      game: newGame[0],
      message: 'Jogo criado com sucesso',
    })
  } catch (error) {
    console.error('Erro ao criar jogo:', error)
    res.status(500).json({
      error: `Erro ao criar jogo: ${error.message}`,
      status: false,
      details: error.message,
    })
  }
}

/**
 * PUT /api/admin/games/:id
 * Atualiza um jogo
 */
export const updateGame = async (req, res) => {
  try {
    const { id } = req.params
    const {
      provider_id,
      game_name,
      game_code,
      game_id,
      cover,
      views,
      is_featured,
      show_home,
      original,
      status,
      categories,
    } = req.body

    // Verificar se jogo existe
    const [existing] = await pool.execute('SELECT id FROM games WHERE id = ?', [id])

    if (!existing || existing.length === 0) {
      return res.status(404).json({
        error: 'Jogo não encontrado',
        status: false,
      })
    }

    // Processar cover: aceitar URL completa ou base64
    let coverValue = cover !== undefined ? cover : null
    if (coverValue) {
      // Se for uma URL completa (http/https), usar diretamente
      if (coverValue.startsWith('http://') || coverValue.startsWith('https://')) {
        // URL completa - usar como está
        coverValue = coverValue
      } 
      // Se for base64 e muito grande, tentar usar URL se disponível ou truncar
      else if (coverValue.startsWith('data:image') && coverValue.length > 65535) {
        console.warn('Imagem base64 muito grande, truncando...')
        coverValue = coverValue.substring(0, 65535)
      }
      // Caso contrário, usar como está
    }

    // Atualizar jogo
    await pool.execute(
      `UPDATE games SET
        provider_id = ?,
        game_id = ?,
        game_name = ?,
        game_code = ?,
        cover = ?,
        views = ?,
        is_featured = ?,
        show_home = ?,
        original = ?,
        status = ?,
        updated_at = NOW()
      WHERE id = ?`,
      [
        provider_id,
        game_id,
        game_name,
        game_code,
        coverValue,
        views || 0,
        is_featured || false,
        show_home || false,
        original || false,
        status !== false,
        id,
      ]
    )

    // Atualizar categorias
    if (categories && Array.isArray(categories)) {
      // Remover categorias antigas
      await pool.execute('DELETE FROM category_games WHERE game_id = ?', [id])

      // Adicionar novas categorias
      for (const categoryName of categories) {
        const [catResult] = await pool.execute(
          'SELECT id FROM categories WHERE name = ? OR slug = ? LIMIT 1',
          [categoryName, categoryName.toLowerCase().replace(/\s+/g, '-')]
        )

        if (catResult && catResult.length > 0) {
          const categoryId = catResult[0].id
          await pool.execute(
            'INSERT INTO category_games (category_id, game_id, created_at, updated_at) VALUES (?, ?, NOW(), NOW())',
            [categoryId, id]
          )
        }
      }
    }

    // Invalidar cache - limpar todas as chaves relacionadas a jogos
    try {
      await cache.del('api.games.providers')
      await cache.del('api.games.featured')
      await cache.del('api.source.games')
      const keys = await cache.keys('api.games.all.*')
      for (const key of keys) {
        await cache.del(key)
      }
    } catch (cacheError) {
      console.warn('Erro ao limpar cache:', cacheError)
    }

    res.json({
      message: 'Jogo atualizado com sucesso',
    })
  } catch (error) {
    console.error('Erro ao atualizar jogo:', error)
    res.status(500).json({
      error: 'Erro ao atualizar jogo',
      status: false,
    })
  }
}

/**
 * DELETE /api/admin/games/:id
 * Exclui um jogo
 */
export const deleteGame = async (req, res) => {
  try {
    const { id } = req.params

    // Verificar se jogo existe
    const [existing] = await pool.execute('SELECT id FROM games WHERE id = ?', [id])

    if (!existing || existing.length === 0) {
      return res.status(404).json({
        error: 'Jogo não encontrado',
        status: false,
      })
    }

    // Excluir jogo (categorias serão excluídas automaticamente por CASCADE)
    await pool.execute('DELETE FROM games WHERE id = ?', [id])

    // Invalidar cache - limpar todas as chaves relacionadas a jogos
    try {
      await cache.del('api.games.providers')
      await cache.del('api.games.featured')
      await cache.del('api.source.games')
      const keys = await cache.keys('api.games.all.*')
      for (const key of keys) {
        await cache.del(key)
      }
    } catch (cacheError) {
      console.warn('Erro ao limpar cache:', cacheError)
    }

    res.json({
      message: 'Jogo excluído com sucesso',
    })
  } catch (error) {
    console.error('Erro ao excluir jogo:', error)
    res.status(500).json({
      error: 'Erro ao excluir jogo',
      status: false,
    })
  }
}

