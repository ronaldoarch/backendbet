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

    console.log('[AdminStoryController] Criando story:', {
      title,
      hasImage: !!image,
      imageLength: image ? image.length : 0,
      link,
      color,
      icon,
      order_index,
      status,
    })

    // Validar dados obrigatórios
    if (!title) {
      return res.status(400).json({
        error: 'Título é obrigatório',
        status: false,
      })
    }

    // Imagem ou ícone deve estar presente
    if (!image && !icon) {
      return res.status(400).json({
        error: 'Imagem ou ícone é obrigatório',
        status: false,
      })
    }

    // Processar valores
    const imageValue = image || null
    const linkValue = link || null
    const colorValue = color || null
    const iconValue = icon || null
    const orderIndexValue = order_index !== undefined ? (parseInt(order_index) || 0) : 0
    const statusValue = status !== false ? 1 : 0

    // Inserir story
    const [result] = await pool.execute(
      `INSERT INTO stories (title, image, link, color, icon, order_index, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        title,
        imageValue,
        linkValue,
        colorValue,
        iconValue,
        orderIndexValue,
        statusValue,
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

    console.log('[AdminStoryController] Atualizando story:', {
      id,
      title,
      hasImage: !!image,
      imageLength: image ? image.length : 0,
      link,
      color,
      icon,
      order_index,
      status,
    })

    // Validar dados obrigatórios
    if (!title) {
      return res.status(400).json({
        error: 'Título é obrigatório',
        status: false,
      })
    }

    // Verificar se story existe
    const [existing] = await pool.execute('SELECT id FROM stories WHERE id = ?', [id])

    if (!existing || existing.length === 0) {
      return res.status(404).json({
        error: 'Story não encontrado',
        status: false,
      })
    }

    // Processar valores
    const imageValue = image !== undefined ? (image || null) : null
    const linkValue = link !== undefined ? (link || null) : null
    const colorValue = color !== undefined ? (color || null) : null
    const iconValue = icon !== undefined ? (icon || null) : null
    const orderIndexValue = order_index !== undefined ? (parseInt(order_index) || 0) : 0
    const statusValue = status !== false ? 1 : 0

    console.log('[AdminStoryController] Valores processados:', {
      imageValue: imageValue ? `${imageValue.substring(0, 50)}...` : null,
      linkValue,
      colorValue,
      iconValue,
      orderIndexValue,
      statusValue,
    })

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
        imageValue,
        linkValue,
        colorValue,
        iconValue,
        orderIndexValue,
        statusValue,
        id,
      ]
    )

    console.log('[AdminStoryController] Story atualizado com sucesso!')

    // Invalidar cache
    try {
      await cache.del('api.stories')
    } catch (cacheError) {
      console.warn('Erro ao limpar cache:', cacheError)
    }

    res.json({
      message: 'Story atualizado com sucesso',
      status: true,
    })
  } catch (error) {
    console.error('❌ Erro ao atualizar story:', error)
    console.error('Stack:', error.stack)
    res.status(500).json({
      error: error.message || 'Erro ao atualizar story',
      message: error.message || 'Erro desconhecido ao atualizar story',
      status: false,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
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

