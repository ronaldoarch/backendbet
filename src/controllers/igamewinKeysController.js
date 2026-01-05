import pool from '../config/database.js'

/**
 * GET /api/admin/igamewin-keys
 * Buscar configurações das chaves iGameWin
 */
export const getKeys = async (req, res) => {
  try {
    const [keys] = await pool.execute(
      `SELECT 
        id,
        igamewin_agent_code,
        igamewin_agent_token,
        created_at,
        updated_at
      FROM games_keys 
      LIMIT 1`
    )

    if (!keys || keys.length === 0) {
      // Retornar estrutura vazia se não existir
      return res.json({
        id: null,
        igamewin_agent_code: '',
        igamewin_agent_token: '',
      })
    }

    const keyData = keys[0]
    
    console.log('[iGameWin Keys] Retornando dados do banco:', {
      id: keyData.id,
      has_agent_code: !!keyData.igamewin_agent_code,
      has_agent_token: !!keyData.igamewin_agent_token,
    })
    
    res.json({
      id: keyData.id,
      igamewin_agent_code: keyData.igamewin_agent_code || '',
      igamewin_agent_token: keyData.igamewin_agent_token || '',
    })
  } catch (error) {
    console.error('[iGameWin Keys] Erro ao buscar configuração:', error)
    res.status(500).json({
      error: 'Erro ao buscar configurações',
      message: error.message,
      status: false
    })
  }
}

/**
 * GET /api/admin/igamewin-keys/info
 * Buscar informações das chaves (sem dados sensíveis)
 */
export const getInfo = async (req, res) => {
  try {
    const [keys] = await pool.execute(
      `SELECT 
        id,
        igamewin_agent_code,
        updated_at
      FROM games_keys 
      LIMIT 1`
    )

    if (!keys || keys.length === 0) {
      return res.json({
        igamewin_agent_code: '',
      })
    }

    const keyData = keys[0]
    
    res.json({
      igamewin_agent_code: keyData.igamewin_agent_code || '',
    })
  } catch (error) {
    console.error('[iGameWin Keys] Erro ao buscar informações:', error)
    res.status(500).json({
      error: 'Erro ao buscar informações',
      message: error.message,
      status: false
    })
  }
}

/**
 * PUT /api/admin/igamewin-keys
 * Atualizar configurações das chaves iGameWin
 */
export const updateKeys = async (req, res) => {
  try {
    const {
      igamewin_agent_code,
      igamewin_agent_token,
    } = req.body

    console.log('[iGameWin Keys] Atualizando chaves:', {
      igamewin_agent_code,
      has_token: !!igamewin_agent_token,
    })

    // Validar campos obrigatórios
    if (!igamewin_agent_code || !igamewin_agent_token) {
      return res.status(400).json({
        error: 'Campos obrigatórios faltando',
        message: 'igamewin_agent_code e igamewin_agent_token são obrigatórios',
        status: false
      })
    }

    // Verificar se já existe registro
    const [existing] = await pool.execute(
      'SELECT id FROM games_keys LIMIT 1'
    )

    if (existing && existing.length > 0) {
      // Atualizar registro existente
      const recordId = existing[0].id
      
      await pool.execute(
        `UPDATE games_keys SET
          igamewin_agent_code = ?,
          igamewin_agent_token = ?,
          updated_at = NOW()
        WHERE id = ?`,
        [
          igamewin_agent_code,
          igamewin_agent_token,
          recordId
        ]
      )

      res.json({
        status: true,
        message: 'Configurações iGameWin atualizadas com sucesso',
        data: { id: recordId }
      })
    } else {
      // Criar novo registro
      const [result] = await pool.execute(
        `INSERT INTO games_keys (
          igamewin_agent_code,
          igamewin_agent_token,
          created_at,
          updated_at
        ) VALUES (?, ?, NOW(), NOW())`,
        [
          igamewin_agent_code,
          igamewin_agent_token,
        ]
      )

      res.json({
        status: true,
        message: 'Configurações iGameWin criadas com sucesso',
        data: { id: result.insertId }
      })
    }
  } catch (error) {
    console.error('[iGameWin Keys] Erro ao atualizar configuração:', error)
    res.status(500).json({
      error: 'Erro ao atualizar configurações',
      message: error.message,
      status: false
    })
  }
}

export default {
  getKeys,
  getInfo,
  updateKeys,
}

