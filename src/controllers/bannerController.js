import pool from '../config/database.js'
import { cache } from '../config/redis.js'

/**
 * GET /api/banners
 * Lista todos os banners ativos (público)
 */
export const getBanners = async (req, res) => {
  try {
    const { type } = req.query
    const cacheKey = `api.banners${type ? `.${type}` : ''}`
    
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

    let query = 'SELECT * FROM banners WHERE status = 1'
    const params = []

    if (type) {
      query += ' AND type = ?'
      params.push(type)
    }

    query += ' ORDER BY created_at DESC LIMIT 50' // Limitar resultados

    const [banners] = await pool.execute(query, params)

    const response = { banners }
    
    // Tentar salvar no cache (sem bloquear)
    cache.set(cacheKey, response, 3600).catch(() => {
      // Ignorar erro de cache
    })

    res.json(response)
  } catch (error) {
    console.error('Erro ao buscar banners:', error)
    res.status(500).json({
      error: 'Erro ao buscar banners',
      status: false,
      message: error.message,
    })
  }
}

/**
 * GET /api/admin/banners
 * Lista todos os banners (admin - inclui inativos)
 */
export const getAllBanners = async (req, res) => {
  try {
    const [banners] = await pool.execute(
      'SELECT * FROM banners ORDER BY created_at DESC'
    )

    res.json({ banners })
  } catch (error) {
    console.error('Erro ao buscar banners:', error)
    res.status(500).json({
      error: 'Erro ao buscar banners',
      status: false,
    })
  }
}

/**
 * GET /api/admin/banners/:id
 * Busca um banner específico
 */
export const getBanner = async (req, res) => {
  try {
    const { id } = req.params

    const [banners] = await pool.execute(
      'SELECT * FROM banners WHERE id = ?',
      [id]
    )

    if (!banners || banners.length === 0) {
      return res.status(404).json({
        error: 'Banner não encontrado',
        status: false,
      })
    }

    res.json({ banner: banners[0] })
  } catch (error) {
    console.error('Erro ao buscar banner:', error)
    res.status(500).json({
      error: 'Erro ao buscar banner',
      status: false,
    })
  }
}

/**
 * POST /api/admin/banners
 * Cria um novo banner
 */
export const createBanner = async (req, res) => {
  try {
    const { link, image, type, description, status } = req.body

    // Validar dados obrigatórios
    if (!image) {
      return res.status(400).json({
        error: 'Imagem é obrigatória',
        status: false,
      })
    }

    // Verificar tamanho da imagem recebida
    const imageLength = image ? image.length : 0
    console.log(`[Banner] Recebendo imagem com ${imageLength} caracteres (${(imageLength / 1024).toFixed(2)} KB)`)
    
    // Verificar tipo da coluna no banco antes de inserir
    try {
      const [columnInfo] = await pool.execute(
        "SELECT COLUMN_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'banners' AND COLUMN_NAME = 'image'"
      )
      if (columnInfo && columnInfo.length > 0) {
        const columnType = columnInfo[0].COLUMN_TYPE
        console.log(`[Banner] Tipo da coluna image no banco: ${columnType}`)
        
        // Se não for MEDIUMTEXT ou LONGTEXT, tentar alterar
        if (!columnType.includes('mediumtext') && !columnType.includes('longtext')) {
          console.warn(`[Banner] ⚠️ Coluna não é MEDIUMTEXT! Tipo atual: ${columnType}. Tentando alterar...`)
          try {
            await pool.execute('ALTER TABLE banners MODIFY COLUMN image MEDIUMTEXT NOT NULL')
            console.log('[Banner] ✅ Coluna alterada para MEDIUMTEXT com sucesso!')
          } catch (alterError) {
            console.error('[Banner] ❌ Erro ao alterar coluna:', alterError.message)
            return res.status(500).json({
              error: 'Erro ao configurar banco de dados. A coluna image precisa ser MEDIUMTEXT.',
              status: false,
              details: alterError.message,
            })
          }
        }
      }
    } catch (checkError) {
      console.warn('[Banner] Não foi possível verificar tipo da coluna:', checkError.message)
    }

    // MEDIUMTEXT suporta até 16MB, então não precisamos truncar
    // Mas vamos validar se não é muito grande (limite de 10MB para segurança)
    let imageValue = image
    
    // Verificar se a imagem está truncada (65535 é o limite do TEXT antigo)
    if (imageValue && imageValue.length === 65535) {
      console.warn('⚠️ Imagem parece estar truncada (65535 caracteres). Verifique se a coluna está como MEDIUMTEXT.')
      return res.status(400).json({
        error: 'A imagem parece estar truncada. Por favor, execute: npm run fix-banner-column no backend e tente novamente.',
        status: false,
        details: 'A coluna image precisa ser MEDIUMTEXT para suportar imagens maiores.',
      })
    }
    
    if (imageValue && imageValue.length > 10 * 1024 * 1024) {
      console.warn('Imagem base64 muito grande (>10MB), rejeitando...')
      return res.status(400).json({
        error: 'A imagem é muito grande. Por favor, use uma imagem menor (máximo 5MB).',
        status: false,
      })
    }

    console.log(`[Banner] Inserindo banner com imagem de ${imageValue.length} caracteres...`)

    // Verificar se a imagem está muito próxima do limite do TEXT antigo
    if (imageValue.length >= 65530 && imageValue.length <= 65535) {
      console.warn(`[Banner] ⚠️ ATENÇÃO: Imagem tem ${imageValue.length} caracteres, muito próximo do limite do TEXT (65535)`)
      console.warn(`[Banner] Isso pode indicar que a imagem já veio truncada do frontend ou foi truncada em algum lugar.`)
    }

    // Inserir banner
    let result
    try {
      [result] = await pool.execute(
        `INSERT INTO banners (link, image, type, description, status, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, NOW(), NOW())`,
        [
          link || null,
          imageValue,
          type || 'home',
          description || null,
          status !== false,
        ]
      )
    } catch (insertError) {
      console.error('[Banner] ❌ Erro ao inserir no banco:', insertError.message)
      console.error('[Banner] Código do erro:', insertError.code)
      
      if (insertError.code === 'ER_DATA_TOO_LONG') {
        return res.status(500).json({
          error: 'A imagem é muito grande para a coluna atual. A coluna precisa ser MEDIUMTEXT.',
          status: false,
          details: `Tamanho da imagem: ${imageValue.length} caracteres. Execute: npm run fix-banner-column`,
        })
      }
      
      throw insertError
    }
    
    // Obter ID do banner inserido
    const bannerId = result.insertId
    
    // Verificar se foi salvo corretamente
    const [savedBanner] = await pool.execute(
      'SELECT id, LENGTH(image) as image_length FROM banners WHERE id = ?',
      [bannerId]
    )
    
    if (savedBanner && savedBanner.length > 0) {
      const savedLength = savedBanner[0].image_length
      console.log(`[Banner] Banner salvo! ID: ${bannerId}, Tamanho da imagem salva: ${savedLength} caracteres`)
      
      if (savedLength !== imageValue.length) {
        console.error(`[Banner] ❌ TRUNCAMENTO DETECTADO!`)
        console.error(`[Banner] Enviado: ${imageValue.length} caracteres (${(imageValue.length / 1024).toFixed(2)} KB)`)
        console.error(`[Banner] Salvo: ${savedLength} caracteres (${(savedLength / 1024).toFixed(2)} KB)`)
        console.error(`[Banner] Diferença: ${imageValue.length - savedLength} caracteres perdidos`)
        
        // Deletar o banner truncado
        await pool.execute('DELETE FROM banners WHERE id = ?', [bannerId])
        
        // Tentar alterar a coluna novamente
        try {
          console.log('[Banner] Tentando alterar coluna para MEDIUMTEXT novamente...')
          await pool.execute('ALTER TABLE banners MODIFY COLUMN image MEDIUMTEXT NOT NULL')
          console.log('[Banner] ✅ Coluna alterada para MEDIUMTEXT')
        } catch (alterError) {
          console.error('[Banner] ❌ Erro ao alterar coluna:', alterError.message)
        }
        
        return res.status(500).json({
          error: 'A imagem foi truncada ao salvar. A coluna image precisa ser MEDIUMTEXT.',
          status: false,
          details: `Enviado: ${imageValue.length} caracteres, Salvo: ${savedLength} caracteres. Execute: npm run fix-banner-column`,
        })
      } else {
        console.log(`[Banner] ✅ Imagem salva completamente sem truncamento!`)
      }
    }

    // Invalidar cache de banners
    await cache.clear('api.banners*')
    await cache.del('api.banners')
    await cache.del('api.banners.carousel')
    await cache.del('api.banners.home')
    console.log('Cache de banners limpo após criar banner')

    const [newBanner] = await pool.execute(
      'SELECT * FROM banners WHERE id = ?',
      [result.insertId]
    )

    res.status(201).json({
      message: 'Banner criado com sucesso',
      banner: newBanner[0],
    })
  } catch (error) {
    console.error('Erro ao criar banner:', error)
    
    // Tratar erro específico de coluna muito pequena
    if (error.code === 'ER_DATA_TOO_LONG' || error.message?.includes('Data too long')) {
      return res.status(400).json({
        error: 'A imagem é muito grande. Por favor, use uma imagem menor ou execute o script SQL para atualizar a tabela.',
        status: false,
        details: 'Execute: mysql -u root -p betgenius < backend-api/fix_banners_image_column.sql',
      })
    }
    
    res.status(500).json({
      error: 'Erro ao criar banner',
      message: error.message,
      status: false,
    })
  }
}

/**
 * PUT /api/admin/banners/:id
 * Atualiza um banner
 */
export const updateBanner = async (req, res) => {
  try {
    const { id } = req.params
    const { link, image, type, description, status } = req.body

    // Verificar se banner existe
    const [existing] = await pool.execute(
      'SELECT id FROM banners WHERE id = ?',
      [id]
    )

    if (!existing || existing.length === 0) {
      return res.status(404).json({
        error: 'Banner não encontrado',
        status: false,
      })
    }

    // Atualizar banner
    const updateFields = []
    const updateValues = []

    if (link !== undefined) {
      updateFields.push('link = ?')
      updateValues.push(link || null)
    }
    if (image !== undefined) {
      // Verificar tamanho da imagem recebida
      const imageLength = image ? image.length : 0
      console.log(`[Banner Update] Recebendo imagem com ${imageLength} caracteres (${(imageLength / 1024).toFixed(2)} KB)`)
      
      // Verificar tipo da coluna no banco antes de atualizar
      try {
        const [columnInfo] = await pool.execute(
          "SELECT COLUMN_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'banners' AND COLUMN_NAME = 'image'"
        )
        if (columnInfo && columnInfo.length > 0) {
          const columnType = columnInfo[0].COLUMN_TYPE
          if (!columnType.includes('mediumtext') && !columnType.includes('longtext')) {
            console.warn(`[Banner Update] ⚠️ Coluna não é MEDIUMTEXT! Tipo atual: ${columnType}. Tentando alterar...`)
            try {
              await pool.execute('ALTER TABLE banners MODIFY COLUMN image MEDIUMTEXT NOT NULL')
              console.log('[Banner Update] ✅ Coluna alterada para MEDIUMTEXT com sucesso!')
            } catch (alterError) {
              console.error('[Banner Update] ❌ Erro ao alterar coluna:', alterError.message)
            }
          }
        }
      } catch (checkError) {
        console.warn('[Banner Update] Não foi possível verificar tipo da coluna:', checkError.message)
      }
      
      // MEDIUMTEXT suporta até 16MB, então não precisamos truncar
      // Mas vamos validar se não é muito grande (limite de 10MB para segurança)
      let imageValue = image
      if (imageValue && imageValue.length > 10 * 1024 * 1024) {
        console.warn('Imagem base64 muito grande (>10MB), rejeitando...')
        return res.status(400).json({
          error: 'A imagem é muito grande. Por favor, use uma imagem menor (máximo 5MB).',
          status: false,
        })
      }
      updateFields.push('image = ?')
      updateValues.push(imageValue)
    }
    if (type !== undefined) {
      updateFields.push('type = ?')
      updateValues.push(type)
    }
    if (description !== undefined) {
      updateFields.push('description = ?')
      updateValues.push(description || null)
    }
    if (status !== undefined) {
      updateFields.push('status = ?')
      updateValues.push(status ? 1 : 0)
    }

    updateFields.push('updated_at = NOW()')
    updateValues.push(id)

    // Se estamos atualizando a imagem, verificar tamanho antes de atualizar
    let imageValueToCheck = null
    if (image !== undefined) {
      imageValueToCheck = image
    }

    await pool.execute(
      `UPDATE banners SET ${updateFields.join(', ')} WHERE id = ?`,
      updateValues
    )
    
    // Verificar se foi salvo corretamente (se atualizou a imagem)
    if (imageValueToCheck) {
      const [updatedBanner] = await pool.execute(
        'SELECT id, LENGTH(image) as image_length FROM banners WHERE id = ?',
        [id]
      )
      
      if (updatedBanner && updatedBanner.length > 0) {
        const savedLength = updatedBanner[0].image_length
        const sentLength = imageValueToCheck.length
        
        console.log(`[Banner Update] Verificando salvamento: Enviado: ${sentLength}, Salvo: ${savedLength}`)
        
        if (savedLength !== sentLength) {
          console.error(`[Banner Update] ❌ TRUNCAMENTO DETECTADO!`)
          console.error(`[Banner Update] Enviado: ${sentLength} caracteres (${(sentLength / 1024).toFixed(2)} KB)`)
          console.error(`[Banner Update] Salvo: ${savedLength} caracteres (${(savedLength / 1024).toFixed(2)} KB)`)
          console.error(`[Banner Update] Diferença: ${sentLength - savedLength} caracteres perdidos`)
          
          return res.status(500).json({
            error: 'A imagem foi truncada ao salvar. A coluna image precisa ser MEDIUMTEXT.',
            status: false,
            details: `Enviado: ${sentLength} caracteres, Salvo: ${savedLength} caracteres. Execute: npm run fix-banner-column`,
          })
        } else {
          console.log(`[Banner Update] ✅ Imagem atualizada completamente sem truncamento!`)
        }
      }
    }

    // Invalidar cache de banners
    await cache.clear('api.banners*')
    await cache.del('api.banners')
    await cache.del('api.banners.carousel')
    await cache.del('api.banners.home')
    console.log('Cache de banners limpo após atualizar banner')

    // Verificar se foi salvo corretamente
    const [updatedBanner] = await pool.execute(
      'SELECT id, LENGTH(image) as image_length, * FROM banners WHERE id = ?',
      [id]
    )
    
    if (updatedBanner && updatedBanner.length > 0) {
      const savedLength = updatedBanner[0].image_length
      const sentLength = image ? image.length : 0
      
      if (sentLength > 0 && savedLength !== sentLength) {
        console.error(`[Banner Update] ❌ TRUNCAMENTO DETECTADO! Enviado: ${sentLength}, Salvo: ${savedLength}`)
        return res.status(500).json({
          error: 'A imagem foi truncada ao salvar. A coluna image precisa ser MEDIUMTEXT. Execute: npm run fix-banner-column',
          status: false,
          details: `Enviado: ${sentLength} caracteres, Salvo: ${savedLength} caracteres`,
        })
      }
      
      console.log(`[Banner Update] Banner atualizado! ID: ${id}, Tamanho da imagem salva: ${savedLength} caracteres`)
    }

    res.json({
      message: 'Banner atualizado com sucesso',
      banner: updatedBanner[0],
    })
  } catch (error) {
    console.error('Erro ao atualizar banner:', error)
    res.status(500).json({
      error: 'Erro ao atualizar banner',
      status: false,
    })
  }
}

/**
 * DELETE /api/admin/banners/:id
 * Deleta um banner
 */
export const deleteBanner = async (req, res) => {
  try {
    const { id } = req.params

    // Verificar se banner existe
    const [existing] = await pool.execute(
      'SELECT id FROM banners WHERE id = ?',
      [id]
    )

    if (!existing || existing.length === 0) {
      return res.status(404).json({
        error: 'Banner não encontrado',
        status: false,
      })
    }

    // Deletar banner
    await pool.execute('DELETE FROM banners WHERE id = ?', [id])

    // Invalidar cache de banners
    await cache.clear('api.banners*')
    await cache.del('api.banners')
    await cache.del('api.banners.carousel')
    await cache.del('api.banners.home')
    console.log('Cache de banners limpo após deletar banner')

    res.json({
      message: 'Banner excluído com sucesso',
    })
  } catch (error) {
    console.error('Erro ao excluir banner:', error)
    res.status(500).json({
      error: 'Erro ao excluir banner',
      status: false,
    })
  }
}

