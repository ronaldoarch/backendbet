import pool from '../config/database.js'
import { cache } from '../config/redis.js'

export const getCategories = async (req, res) => {
  try {
    const cacheKey = 'api.categories'
    const cached = await cache.get(cacheKey)
    
    if (cached) {
      return res.json(cached)
    }

    const [categories] = await pool.execute(
      `SELECT id, name, slug, description
       FROM categories
       WHERE status = 1
       ORDER BY name`
    )

    const response = { categories }
    await cache.set(cacheKey, response, 1800) // 30 minutos

    res.json(response)
  } catch (error) {
    console.error('Erro ao buscar categorias:', error)
    res.status(500).json({
      error: 'Erro ao buscar categorias',
      status: false,
    })
  }
}


