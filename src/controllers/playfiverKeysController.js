import pool from '../config/database.js'

/**
 * GET /api/admin/playfiver-keys
 * Busca as chaves PlayFiver configuradas
 */
export const getPlayfiverKeys = async (req, res) => {
  try {
    // Buscar apenas campos que existem (evitar erro se campos novos não existirem)
    const [keys] = await pool.execute(
      `SELECT 
        id, 
        playfiver_code, 
        playfiver_token, 
        playfiver_secret,
        callback_url,
        COALESCE(rtp, 93) as rtp,
        COALESCE(limit_amount, 100) as limit_amount,
        COALESCE(limit_hours, 1) as limit_hours,
        COALESCE(limit_enable, 0) as limit_enable,
        COALESCE(bonus_enable, 0) as bonus_enable
      FROM games_keys 
      ORDER BY id DESC 
      LIMIT 1`
    )

    if (!keys || keys.length === 0) {
      return res.json({
        playfiver_code: '',
        playfiver_token: '',
        playfiver_secret: '',
        callback_url: '',
        rtp: 93,
        limit_amount: 100,
        limit_hours: 1,
        limit_enable: false,
        bonus_enable: false,
      })
    }

    const key = keys[0]
    res.json({
      id: key.id,
      playfiver_code: key.playfiver_code || '',
      playfiver_token: key.playfiver_token || '',
      playfiver_secret: key.playfiver_secret || '',
      callback_url: key.callback_url || '',
      rtp: Number(key.rtp) || 93,
      limit_amount: Number(key.limit_amount) || 100,
      limit_hours: Number(key.limit_hours) || 1,
      limit_enable: Boolean(key.limit_enable),
      bonus_enable: Boolean(key.bonus_enable),
    })
  } catch (error) {
    console.error('Erro ao buscar chaves PlayFiver:', error)
    // Se erro for por coluna não existir, retornar valores padrão
    if (error.message && error.message.includes('Unknown column')) {
      return res.json({
        playfiver_code: '',
        playfiver_token: '',
        playfiver_secret: '',
        callback_url: '',
        rtp: 93,
        limit_amount: 100,
        limit_hours: 1,
        limit_enable: false,
        bonus_enable: false,
      })
    }
    res.status(500).json({
      error: 'Erro ao buscar chaves PlayFiver',
      message: error.message,
      status: false,
    })
  }
}

/**
 * POST /api/admin/playfiver-keys
 * Salva ou atualiza as chaves PlayFiver
 */
export const savePlayfiverKeys = async (req, res) => {
  try {
    const {
      playfiver_code,
      playfiver_token,
      playfiver_secret,
      callback_url,
      admin_password,
    } = req.body

    console.log('[PlayFiver Keys] Recebendo requisição para salvar:', {
      has_code: !!playfiver_code,
      has_token: !!playfiver_token,
      has_secret: !!playfiver_secret,
      has_callback: !!callback_url,
      has_password: !!admin_password,
    })

    // Validar senha de admin (2FA) - temporariamente aceitar qualquer senha não vazia
    // TODO: Implementar autenticação 2FA adequada
    if (!admin_password || admin_password.trim() === '') {
      return res.status(400).json({
        error: 'Senha de 2FA é obrigatória',
        status: false,
      })
    }

    // Validar campos obrigatórios
    if (!playfiver_token || playfiver_token.trim() === '') {
      return res.status(400).json({
        error: 'Agent Token é obrigatório',
        status: false,
      })
    }

    if (!playfiver_secret || playfiver_secret.trim() === '') {
      return res.status(400).json({
        error: 'Agent Secret é obrigatório',
        status: false,
      })
    }

    // Verificar conexão com banco
    let existing
    try {
      [existing] = await Promise.race([
        pool.execute('SELECT id FROM games_keys ORDER BY id DESC LIMIT 1'),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout na conexão com banco')), 8000)
        )
      ])
      console.log('[PlayFiver Keys] Registro existente:', existing && existing.length > 0 ? `ID: ${existing[0].id}` : 'Nenhum')
    } catch (dbError) {
      console.error('[PlayFiver Keys] Erro ao verificar registro existente:', dbError.message)
      return res.status(500).json({
        error: 'Erro ao conectar com banco de dados',
        message: dbError.message,
        status: false,
      })
    }

    try {
      if (existing && existing.length > 0) {
        // Atualizar registro existente
        const [result] = await Promise.race([
          pool.execute(
            `UPDATE games_keys SET
              playfiver_code = ?,
              playfiver_token = ?,
              playfiver_secret = ?,
              callback_url = ?,
              updated_at = NOW()
            WHERE id = ?`,
            [
              playfiver_code || null,
              playfiver_token.trim(),
              playfiver_secret.trim(),
              callback_url || null,
              existing[0].id,
            ]
          ),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Timeout ao atualizar')), 8000)
          )
        ])
        console.log('[PlayFiver Keys] Registro atualizado. Linhas afetadas:', result.affectedRows)
      } else {
        // Criar novo registro
        const [result] = await Promise.race([
          pool.execute(
            `INSERT INTO games_keys (
              playfiver_code, playfiver_token, playfiver_secret, callback_url, created_at, updated_at
            ) VALUES (?, ?, ?, ?, NOW(), NOW())`,
            [playfiver_code || null, playfiver_token.trim(), playfiver_secret.trim(), callback_url || null]
          ),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Timeout ao inserir')), 8000)
          )
        ])
        console.log('[PlayFiver Keys] Novo registro criado. ID:', result.insertId)
      }
    } catch (updateError) {
      console.error('[PlayFiver Keys] Erro ao salvar no banco:', updateError.message)
      // Verificar se é erro de coluna não existente
      if (updateError.message && updateError.message.includes('Unknown column')) {
        return res.status(400).json({
          error: 'Estrutura da tabela incompleta',
          message: 'A coluna callback_url não existe. Execute o script SQL para atualizar a tabela.',
          status: false,
        })
      }
      throw updateError
    }

    // Verificar se foi salvo corretamente (com timeout)
    try {
      const [verify] = await Promise.race([
        pool.execute(
          'SELECT playfiver_code, playfiver_token, playfiver_secret, callback_url FROM games_keys ORDER BY id DESC LIMIT 1'
        ),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout na verificação')), 5000)
        )
      ])
      
      if (verify && verify.length > 0) {
        console.log('[PlayFiver Keys] Verificação - Valores salvos:', {
          code: verify[0].playfiver_code || 'vazio',
          token: verify[0].playfiver_token ? verify[0].playfiver_token.substring(0, 20) + '...' : 'vazio',
          secret: verify[0].playfiver_secret ? verify[0].playfiver_secret.substring(0, 20) + '...' : 'vazio',
          callback: verify[0].callback_url || 'vazio',
        })
      }
    } catch (verifyError) {
      console.warn('[PlayFiver Keys] Erro ao verificar (não crítico):', verifyError.message)
      // Não falhar se a verificação der erro
    }

    res.json({
      message: 'Chaves PlayFiver atualizadas com sucesso',
      status: true,
    })
  } catch (error) {
    console.error('[PlayFiver Keys] Erro ao salvar:', error)
    console.error('[PlayFiver Keys] Stack:', error.stack)
    res.status(500).json({
      error: 'Erro ao salvar chaves PlayFiver',
      message: error.message,
      status: false,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    })
  }
}

/**
 * PUT /api/admin/playfiver-keys/info
 * Atualiza informações do agente (RTP, limites, etc)
 */
export const updatePlayfiverInfo = async (req, res) => {
  try {
    const {
      rtp,
      limit_amount,
      limit_hours,
      limit_enable,
      bonus_enable,
    } = req.body

    // Verificar se já existe registro
    const [existing] = await pool.execute(
      'SELECT id FROM games_keys ORDER BY id DESC LIMIT 1'
    )

    // Tentar atualizar campos novos, mas não falhar se não existirem
    try {
      if (existing && existing.length > 0) {
        // Atualizar informações
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
            rtp !== undefined ? rtp : 93,
            limit_amount !== undefined ? limit_amount : 100,
            limit_hours !== undefined ? limit_hours : 1,
            limit_enable !== undefined ? (limit_enable ? 1 : 0) : 0,
            bonus_enable !== undefined ? (bonus_enable ? 1 : 0) : 0,
            existing[0].id,
          ]
        )
      } else {
        // Criar novo registro com valores padrão
        await pool.execute(
          `INSERT INTO games_keys (
            rtp, limit_amount, limit_hours, limit_enable, bonus_enable, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, NOW(), NOW())`,
          [
            rtp !== undefined ? rtp : 93,
            limit_amount !== undefined ? limit_amount : 100,
            limit_hours !== undefined ? limit_hours : 1,
            limit_enable !== undefined ? (limit_enable ? 1 : 0) : 0,
            bonus_enable !== undefined ? (bonus_enable ? 1 : 0) : 0,
          ]
        )
      }
    } catch (updateError) {
      // Se erro for por coluna não existir, informar ao usuário
      if (updateError.message && updateError.message.includes('Unknown column')) {
        return res.status(400).json({
          error: 'Campos de configuração não disponíveis. Execute o script SQL para atualizar a tabela.',
          message: 'Execute: mysql -u root -p betgenius < backend-api/update_games_keys_simple.sql',
          status: false,
        })
      }
      throw updateError
    }

    res.json({
      message: 'Informações do agente atualizadas com sucesso',
      status: true,
    })
  } catch (error) {
    console.error('Erro ao atualizar informações PlayFiver:', error)
    res.status(500).json({
      error: 'Erro ao atualizar informações',
      message: error.message,
      status: false,
    })
  }
}

