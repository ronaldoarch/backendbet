import pool from '../config/database.js'

/**
 * GET /api/admin/playfiver-keys
 * Buscar configurações das chaves PlayFiver
 */
export const getKeys = async (req, res) => {
  try {
    const [keys] = await pool.execute(
      `SELECT 
        id,
        playfiver_code,
        playfiver_token,
        playfiver_secret,
        callback_url,
        rtp,
        limit_amount,
        limit_hours,
        limit_enable,
        bonus_enable,
        created_at,
        updated_at
      FROM games_keys 
      LIMIT 1`
    )

    if (!keys || keys.length === 0) {
      // Retornar estrutura vazia se não existir
      return res.json({
        id: null,
        playfiver_code: '',
        playfiver_token: '',
        playfiver_secret: '',
        callback_url: '',
        rtp: 93.00,
        limit_amount: 100.00,
        limit_hours: 1,
        limit_enable: false,
        bonus_enable: false,
      })
    }

    const keyData = keys[0]
    
    // Retornar dados diretamente (sem wrapper data)
    res.json({
      id: keyData.id,
      playfiver_code: keyData.playfiver_code || '',
      playfiver_token: keyData.playfiver_token || '',
      playfiver_secret: keyData.playfiver_secret || '',
      callback_url: keyData.callback_url || '',
      rtp: parseFloat(keyData.rtp) || 93.00,
      limit_amount: parseFloat(keyData.limit_amount) || 100.00,
      limit_hours: parseInt(keyData.limit_hours) || 1,
      limit_enable: Boolean(keyData.limit_enable),
      bonus_enable: Boolean(keyData.bonus_enable),
    })
  } catch (error) {
    console.error('[PlayFiver Keys] Erro ao buscar configuração:', error)
    res.status(500).json({
      error: 'Erro ao buscar configurações',
      message: error.message,
      status: false
    })
  }
}

/**
 * GET /api/admin/playfiver-keys/info
 * Buscar informações das chaves (sem dados sensíveis)
 */
export const getInfo = async (req, res) => {
  try {
    const [keys] = await pool.execute(
      `SELECT 
        id,
        playfiver_code,
        callback_url,
        rtp,
        limit_amount,
        limit_hours,
        limit_enable,
        bonus_enable,
        updated_at
      FROM games_keys 
      LIMIT 1`
    )

    if (!keys || keys.length === 0) {
      return res.json({
        playfiver_code: '',
        callback_url: '',
        rtp: 93.00,
        limit_amount: 100.00,
        limit_hours: 1,
        limit_enable: false,
        bonus_enable: false,
      })
    }

    const keyData = keys[0]
    
    res.json({
      playfiver_code: keyData.playfiver_code || '',
      callback_url: keyData.callback_url || '',
      rtp: parseFloat(keyData.rtp) || 93.00,
      limit_amount: parseFloat(keyData.limit_amount) || 100.00,
      limit_hours: parseInt(keyData.limit_hours) || 1,
      limit_enable: Boolean(keyData.limit_enable),
      bonus_enable: Boolean(keyData.bonus_enable),
    })
  } catch (error) {
    console.error('[PlayFiver Keys] Erro ao buscar informações:', error)
    res.status(500).json({
      error: 'Erro ao buscar informações',
      message: error.message,
      status: false
    })
  }
}

/**
 * PUT /api/admin/playfiver-keys
 * Atualizar configurações das chaves PlayFiver
 */
export const updateKeys = async (req, res) => {
  try {
    const {
      playfiver_code,
      playfiver_token,
      playfiver_secret,
      callback_url,
      rtp,
      limit_amount,
      limit_hours,
      limit_enable,
      bonus_enable,
    } = req.body

    // Validar campos obrigatórios
    if (!playfiver_code || !playfiver_token || !playfiver_secret) {
      return res.status(400).json({
        error: 'Campos obrigatórios faltando',
        message: 'playfiver_code, playfiver_token e playfiver_secret são obrigatórios',
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
          playfiver_code = ?,
          playfiver_token = ?,
          playfiver_secret = ?,
          callback_url = ?,
          rtp = ?,
          limit_amount = ?,
          limit_hours = ?,
          limit_enable = ?,
          bonus_enable = ?,
          updated_at = NOW()
        WHERE id = ?`,
        [
          playfiver_code,
          playfiver_token,
          playfiver_secret,
          callback_url || null,
          rtp || 93.00,
          limit_amount || 100.00,
          limit_hours || 1,
          limit_enable ? 1 : 0,
          bonus_enable ? 1 : 0,
          recordId
        ]
      )

      res.json({
        status: true,
        message: 'Configurações atualizadas com sucesso',
        data: { id: recordId }
      })
    } else {
      // Criar novo registro
      const [result] = await pool.execute(
        `INSERT INTO games_keys (
          playfiver_code,
          playfiver_token,
          playfiver_secret,
          callback_url,
          rtp,
          limit_amount,
          limit_hours,
          limit_enable,
          bonus_enable,
          created_at,
          updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [
          playfiver_code,
          playfiver_token,
          playfiver_secret,
          callback_url || null,
          rtp || 93.00,
          limit_amount || 100.00,
          limit_hours || 1,
          limit_enable ? 1 : 0,
          bonus_enable ? 1 : 0,
        ]
      )

      res.json({
        status: true,
        message: 'Configurações criadas com sucesso',
        data: { id: result.insertId }
      })
    }
  } catch (error) {
    console.error('[PlayFiver Keys] Erro ao atualizar configuração:', error)
    res.status(500).json({
      error: 'Erro ao atualizar configurações',
      message: error.message,
      status: false
    })
  }
}

/**
 * POST /api/admin/playfiver-keys/info
 * Atualizar apenas informações (RTP, limites, etc) sem alterar credenciais
 */
export const updateInfo = async (req, res) => {
  try {
    const {
      rtp,
      limit_amount,
      limit_hours,
      limit_enable,
      bonus_enable,
    } = req.body

    // Verificar se existe registro
    const [existing] = await pool.execute(
      'SELECT id FROM games_keys LIMIT 1'
    )

    if (!existing || existing.length === 0) {
      return res.status(404).json({
        error: 'Configuração não encontrada',
        message: 'É necessário criar as credenciais primeiro',
        status: false
      })
    }

    const recordId = existing[0].id

    await pool.execute(
      `UPDATE games_keys SET
        rtp = ?,
        limit_amount = ?,
        limit_hours = ?,
        limit_enable = ?,
        bonus_enable = ?,
        updated_at = NOW()
      WHERE id = ?`,
      [
        rtp || 93.00,
        limit_amount || 100.00,
        limit_hours || 1,
        limit_enable ? 1 : 0,
        bonus_enable ? 1 : 0,
        recordId
      ]
    )

    res.json({
      status: true,
      message: 'Informações atualizadas com sucesso',
      data: { id: recordId }
    })
  } catch (error) {
    console.error('[PlayFiver Keys] Erro ao atualizar informações:', error)
    res.status(500).json({
      error: 'Erro ao atualizar informações',
      message: error.message,
      status: false
    })
  }
}

export default {
  getKeys,
  getInfo,
  updateKeys,
  updateInfo,
}
