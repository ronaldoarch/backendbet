import pool from '../config/database.js'
import { cache } from '../config/redis.js'

/**
 * GET /api/stories
 * Lista todos os stories ativos (público)
 */
export const getStories = async (req, res) => {
  try {
    const cacheKey = 'api.stories'
    
    // Tentar cache (com timeout curto)
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

    const [stories] = await pool.execute(
      `SELECT id, title, image, link, color, icon, order_index 
       FROM stories 
       WHERE status = 1 
       ORDER BY order_index ASC, created_at DESC 
       LIMIT 20`
    )

    const response = { stories }
    
    // Tentar salvar no cache (sem bloquear)
    cache.set(cacheKey, response, 3600).catch(() => {
      // Ignorar erro de cache
    })

    res.json(response)
  } catch (error) {
    console.error('Erro ao buscar stories:', error)
    res.status(500).json({
      error: 'Erro ao buscar stories',
      status: false,
    })
  }
}

