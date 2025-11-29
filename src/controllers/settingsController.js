import pool from '../config/database.js'
import { cache } from '../config/redis.js'

export const getSettings = async (req, res) => {
  try {
    const cacheKey = 'api.settings.data'
    const cached = await cache.get(cacheKey)
    
    if (cached) {
      return res.json(cached)
    }

    const [settings] = await pool.execute(
      'SELECT * FROM settings LIMIT 1'
    )

    let setting = settings && settings.length > 0 ? settings[0] : {
      software_name: 'BetGenius',
      software_description: 'Plataforma de cassino online',
      software_favicon: null,
      software_logo_white: null,
      software_logo_black: null,
    }

    // Buscar customização
    const [customizations] = await pool.execute(
      'SELECT * FROM custom_layouts LIMIT 1'
    )

    const custom = customizations && customizations.length > 0 ? customizations[0] : {
      primary_color: '#01b7fc',
      secondary_color: '#0a0e27',
    }

    const response = {
      setting: {
        ...setting,
        custom,
      },
    }

    await cache.set(cacheKey, response, 3600) // 1 hora

    res.json(response)
  } catch (error) {
    console.error('Erro ao buscar configurações:', error)
    res.status(500).json({
      error: 'Erro ao buscar configurações',
      status: false,
    })
  }
}

export const getBanners = async (req, res) => {
  try {
    const cacheKey = 'api.settings.banners'
    const cached = await cache.get(cacheKey)
    
    if (cached) {
      return res.json(cached)
    }

    const [banners] = await pool.execute(
      `SELECT id, image, link, type, description
       FROM banners
       WHERE status = 1
       ORDER BY type, id`
    )

    const response = { banners }
    await cache.set(cacheKey, response, 3600) // 1 hora

    res.json(response)
  } catch (error) {
    console.error('Erro ao buscar banners:', error)
    res.status(500).json({
      error: 'Erro ao buscar banners',
      status: false,
    })
  }
}

/**
 * GET /api/settings/admin
 * Busca configurações para o admin
 */
export const getAdminSettings = async (req, res) => {
  try {
    const [settings] = await pool.execute(
      'SELECT * FROM settings LIMIT 1'
    )

    let setting = settings && settings.length > 0 ? settings[0] : {
      software_name: 'BetGenius',
      software_description: 'Plataforma de cassino online',
      software_favicon: null,
      software_logo_white: null,
      software_logo_black: null,
    }

    res.json({ setting })
  } catch (error) {
    console.error('Erro ao buscar configurações do admin:', error)
    res.status(500).json({
      error: 'Erro ao buscar configurações',
      status: false,
    })
  }
}

/**
 * PUT /api/settings/admin
 * Atualiza configurações
 */
export const updateSettings = async (req, res) => {
  try {
    const {
      software_name,
      software_description,
      software_favicon,
      software_logo_white,
      software_logo_black,
    } = req.body

    // Verificar se já existe registro
    const [existing] = await pool.execute(
      'SELECT id FROM settings LIMIT 1'
    )

    let result
    if (existing && existing.length > 0) {
      // Atualizar
      const updateFields = []
      const updateValues = []

      if (software_name !== undefined) {
        updateFields.push('software_name = ?')
        updateValues.push(software_name || null)
      }
      if (software_description !== undefined) {
        updateFields.push('software_description = ?')
        updateValues.push(software_description || null)
      }
      if (software_favicon !== undefined) {
        updateFields.push('software_favicon = ?')
        updateValues.push(software_favicon || null)
      }
      if (software_logo_white !== undefined) {
        updateFields.push('software_logo_white = ?')
        updateValues.push(software_logo_white || null)
      }
      if (software_logo_black !== undefined) {
        updateFields.push('software_logo_black = ?')
        updateValues.push(software_logo_black || null)
      }

      updateFields.push('updated_at = NOW()')
      updateValues.push(existing[0].id)

      await pool.execute(
        `UPDATE settings SET ${updateFields.join(', ')} WHERE id = ?`,
        updateValues
      )
      result = existing[0].id
    } else {
      // Criar novo
      const [insertResult] = await pool.execute(
        `INSERT INTO settings (
          software_name, software_description, software_favicon,
          software_logo_white, software_logo_black, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, NOW(), NOW())`,
        [
          software_name || 'BetGenius',
          software_description || null,
          software_favicon || null,
          software_logo_white || null,
          software_logo_black || null,
        ]
      )
      result = insertResult.insertId
    }

    // Limpar cache
    await cache.clear('api.settings.*')

    // Buscar settings atualizado
    const [updated] = await pool.execute(
      'SELECT * FROM settings WHERE id = ?',
      [result]
    )

    res.json({
      message: 'Configurações atualizadas com sucesso',
      setting: updated[0],
    })
  } catch (error) {
    console.error('Erro ao atualizar configurações:', error)
    res.status(500).json({
      error: 'Erro ao atualizar configurações',
      message: error.message,
      status: false,
    })
  }
}


