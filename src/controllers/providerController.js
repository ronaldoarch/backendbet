import pool from '../config/database.js'
import { cache } from '../config/redis.js'

/**
 * GET /api/providers
 * Lista todos os provedores (público - apenas ativos)
 */
export const getProviders = async (req, res) => {
  try {
    const cacheKey = 'api.providers'
    const cached = await cache.get(cacheKey)
    
    if (cached) {
      return res.json(cached)
    }

    const [providers] = await pool.execute(
      `SELECT id, code, name, cover, status, distribution
       FROM providers
       WHERE status = 1
       ORDER BY name`
    )

    const response = { providers }
    await cache.set(cacheKey, response, 3600) // 1 hora

    res.json(response)
  } catch (error) {
    console.error('Erro ao buscar provedores:', error)
    res.status(500).json({
      error: 'Erro ao buscar provedores',
      status: false,
    })
  }
}

/**
 * GET /api/admin/providers
 * Lista todos os provedores (admin - inclui inativos)
 */
export const getAllProviders = async (req, res) => {
  try {
    const [providers] = await pool.execute(
      `SELECT id, code, name, cover, status, distribution, created_at, updated_at
       FROM providers
       ORDER BY name`
    )

    res.json({ providers })
  } catch (error) {
    console.error('Erro ao buscar provedores:', error)
    res.status(500).json({
      error: 'Erro ao buscar provedores',
      status: false,
    })
  }
}

/**
 * POST /api/admin/providers
 * Cria um novo provedor
 */
export const createProvider = async (req, res) => {
  try {
    const { code, name, status, cover, distribution } = req.body

    // Validar dados obrigatórios
    if (!code || !name) {
      return res.status(400).json({
        error: 'Código e nome são obrigatórios',
        status: false,
      })
    }

    // Verificar se código já existe
    const [existing] = await pool.execute(
      'SELECT id FROM providers WHERE code = ?',
      [code]
    )

    if (existing && existing.length > 0) {
      return res.status(400).json({
        error: 'Código do provedor já existe',
        status: false,
      })
    }

    // Inserir provedor
    const [result] = await pool.execute(
      `INSERT INTO providers (code, name, cover, status, distribution, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, NOW(), NOW()) RETURNING id`,
      [
        code,
        name,
        cover || null,
        status !== false,
        distribution || 'play_fiver',
      ]
    )

    // Invalidar cache
    await cache.clear('api.providers*')

    const providerId = result.insertId || result[0]?.id || (result.length > 0 ? result[0].id : null)
    const [newProvider] = await pool.execute(
      'SELECT * FROM providers WHERE id = ?',
      [providerId]
    )

    res.status(201).json({
      message: 'Provedor criado com sucesso',
      provider: newProvider[0],
    })
  } catch (error) {
    console.error('Erro ao criar provedor:', error)
    res.status(500).json({
      error: 'Erro ao criar provedor',
      status: false,
    })
  }
}

/**
 * PUT /api/admin/providers/:id
 * Atualiza um provedor
 */
export const updateProvider = async (req, res) => {
  try {
    const { id } = req.params
    const { code, name, status, cover, distribution } = req.body

    // Verificar se provedor existe
    const [existing] = await pool.execute(
      'SELECT id FROM providers WHERE id = ?',
      [id]
    )

    if (!existing || existing.length === 0) {
      return res.status(404).json({
        error: 'Provedor não encontrado',
        status: false,
      })
    }

    // Verificar se código já existe em outro provedor
    if (code) {
      const [codeExists] = await pool.execute(
        'SELECT id FROM providers WHERE code = ? AND id != ?',
        [code, id]
      )

      if (codeExists && codeExists.length > 0) {
        return res.status(400).json({
          error: 'Código do provedor já existe',
          status: false,
        })
      }
    }

    // Atualizar provedor
    const updateFields = []
    const updateValues = []

    if (code !== undefined) {
      updateFields.push('code = ?')
      updateValues.push(code)
    }
    if (name !== undefined) {
      updateFields.push('name = ?')
      updateValues.push(name)
    }
    if (cover !== undefined) {
      updateFields.push('cover = ?')
      updateValues.push(cover)
    }
    if (status !== undefined) {
      updateFields.push('status = ?')
      updateValues.push(status ? 1 : 0)
    }
    if (distribution !== undefined) {
      updateFields.push('distribution = ?')
      updateValues.push(distribution)
    }

    updateFields.push('updated_at = NOW()')
    updateValues.push(id)

    await pool.execute(
      `UPDATE providers SET ${updateFields.join(', ')} WHERE id = ?`,
      updateValues
    )

    // Invalidar cache
    await cache.clear('api.providers*')

    const [updatedProvider] = await pool.execute(
      'SELECT * FROM providers WHERE id = ?',
      [id]
    )

    res.json({
      message: 'Provedor atualizado com sucesso',
      provider: updatedProvider[0],
    })
  } catch (error) {
    console.error('Erro ao atualizar provedor:', error)
    res.status(500).json({
      error: 'Erro ao atualizar provedor',
      status: false,
    })
  }
}

/**
 * DELETE /api/admin/providers/:id
 * Deleta um provedor
 */
export const deleteProvider = async (req, res) => {
  try {
    const { id } = req.params

    // Verificar se provedor existe
    const [existing] = await pool.execute(
      'SELECT id FROM providers WHERE id = ?',
      [id]
    )

    if (!existing || existing.length === 0) {
      return res.status(404).json({
        error: 'Provedor não encontrado',
        status: false,
      })
    }

    // Verificar se há jogos usando este provedor
    const [games] = await pool.execute(
      'SELECT id FROM games WHERE provider_id = ? LIMIT 1',
      [id]
    )

    if (games && games.length > 0) {
      return res.status(400).json({
        error: 'Não é possível excluir provedor que possui jogos associados',
        status: false,
      })
    }

    // Deletar provedor
    await pool.execute('DELETE FROM providers WHERE id = ?', [id])

    // Invalidar cache
    await cache.clear('api.providers*')

    res.json({
      message: 'Provedor excluído com sucesso',
    })
  } catch (error) {
    console.error('Erro ao excluir provedor:', error)
    res.status(500).json({
      error: 'Erro ao excluir provedor',
      status: false,
    })
  }
}

