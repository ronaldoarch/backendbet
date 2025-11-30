import pool from '../config/database.js'
import { cache } from '../config/redis.js'

/**
 * GET /api/admin/stories
 * Lista todos os stories para o admin
 */
export const getAllStories = async (req, res) => {
  try {
    const [stories] = await pool.execute(
      `SELECT * FROM stories ORDER BY order_index ASC, created_at DESC`
    )

    res.json({ stories })
  } catch (error) {
    console.error('Erro ao buscar stories:', error)
    res.status(500).json({
      error: 'Erro ao buscar stories',
      status: false,
    })
  }
}

/**
 * POST /api/admin/stories
 * Cria um novo story
 */
export const createStory = async (req, res) => {
  try {
    const {
      title,
      image,
      link,
      color,
      icon,
      order_index,
      status,
    } = req.body

    // Validar dados obrigatórios
    if (!title) {
      return res.status(400).json({
        error: 'Título é obrigatório',
        status: false,
      })
    }

    if (!image) {
      return res.status(400).json({
        error: 'Imagem é obrigatória',
        status: false,
      })
    }

    // Inserir story
    const [result] = await pool.execute(
      `INSERT INTO stories (title, image, link, color, icon, order_index, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        title,
        image,
        link || null,
        color || null,
        icon || null,
        order_index || 0,
        status !== false ? 1 : 0,
      ]
    )

    const storyId = result.insertId

    // Invalidar cache
    try {
      await cache.del('api.stories')
    } catch (cacheError) {
      console.warn('Erro ao limpar cache:', cacheError)
    }

    res.status(201).json({
      message: 'Story criado com sucesso',
      story: {
        id: storyId,
        title,
        image,
        link,
        color,
        icon,
        order_index: order_index || 0,
        status: status !== false ? 1 : 0,
      },
    })
  } catch (error) {
    console.error('Erro ao criar story:', error)
    res.status(500).json({
      error: 'Erro ao criar story',
      status: false,
    })
  }
}

/**
 * PUT /api/admin/stories/:id
 * Atualiza um story
 */
export const updateStory = async (req, res) => {
  try {
    const { id } = req.params
    const {
      title,
      image,
      link,
      color,
      icon,
      order_index,
      status,
    } = req.body

    // Verificar se story existe
    const [existing] = await pool.execute('SELECT id FROM stories WHERE id = ?', [id])

    if (!existing || existing.length === 0) {
      return res.status(404).json({
        error: 'Story não encontrado',
        status: false,
      })
    }

    // Atualizar story
    await pool.execute(
      `UPDATE stories SET
        title = ?,
        image = ?,
        link = ?,
        color = ?,
        icon = ?,
        order_index = ?,
        status = ?,
        updated_at = NOW()
      WHERE id = ?`,
      [
        title,
        image,
        link || null,
        color || null,
        icon || null,
        order_index !== undefined ? order_index : 0,
        status !== false ? 1 : 0,
        id,
      ]
    )

    // Invalidar cache
    try {
      await cache.del('api.stories')
    } catch (cacheError) {
      console.warn('Erro ao limpar cache:', cacheError)
    }

    res.json({
      message: 'Story atualizado com sucesso',
    })
  } catch (error) {
    console.error('Erro ao atualizar story:', error)
    res.status(500).json({
      error: 'Erro ao atualizar story',
      status: false,
    })
  }
}

/**
 * DELETE /api/admin/stories/:id
 * Exclui um story
 */
export const deleteStory = async (req, res) => {
  try {
    const { id } = req.params

    // Verificar se story existe
    const [existing] = await pool.execute('SELECT id FROM stories WHERE id = ?', [id])

    if (!existing || existing.length === 0) {
      return res.status(404).json({
        error: 'Story não encontrado',
        status: false,
      })
    }

    // Excluir story
    await pool.execute('DELETE FROM stories WHERE id = ?', [id])

    // Invalidar cache
    try {
      await cache.del('api.stories')
    } catch (cacheError) {
      console.warn('Erro ao limpar cache:', cacheError)
    }

    res.json({
      message: 'Story excluído com sucesso',
    })
  } catch (error) {
    console.error('Erro ao excluir story:', error)
    res.status(500).json({
      error: 'Erro ao excluir story',
      status: false,
    })
  }
}

