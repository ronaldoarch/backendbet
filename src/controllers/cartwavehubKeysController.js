import pool from '../config/database.js'

/**
 * GET /api/admin/cartwavehub-keys
 * Busca as credenciais Cartwavehub configuradas
 */
export const getCartwavehubKeys = async (req, res) => {
  try {
    console.log('[CartwavehubKeys] ==========================================')
    console.log('[CartwavehubKeys] Buscando credenciais do banco de dados...')
    
    // Buscar credenciais da tabela app_settings
    const [settings] = await pool.execute(
      `SELECT setting_key, setting_value 
       FROM app_settings 
       WHERE setting_key IN ('cartwavehub_api_secret', 'cartwavehub_api_public', 'cartwavehub_base_url', 'cartwavehub_ativo')`
    )

    console.log('[CartwavehubKeys] Settings encontrados no banco:', settings.length)
    settings.forEach(s => {
      console.log(`  ${s.setting_key}: ${s.setting_value ? `${s.setting_value.substring(0, 20)}... (${s.setting_value.length} chars)` : 'NULL'}`)
    })

    const config = {
      cartwavehub_api_secret: '',
      cartwavehub_api_public: '',
      cartwavehub_base_url: 'https://api.cartwavehub.com.br',
      cartwavehub_ativo: false,
    }

    settings.forEach(setting => {
      if (setting.setting_key === 'cartwavehub_api_secret') {
        config.cartwavehub_api_secret = setting.setting_value || ''
      } else if (setting.setting_key === 'cartwavehub_api_public') {
        config.cartwavehub_api_public = setting.setting_value || ''
      } else if (setting.setting_key === 'cartwavehub_base_url') {
        config.cartwavehub_base_url = setting.setting_value || 'https://api.cartwavehub.com.br'
      } else if (setting.setting_key === 'cartwavehub_ativo') {
        config.cartwavehub_ativo = setting.setting_value === 'true'
      }
    })

    console.log('[CartwavehubKeys] Config montado:', {
      has_secret: !!config.cartwavehub_api_secret,
      secret_length: config.cartwavehub_api_secret?.length || 0,
      has_public: !!config.cartwavehub_api_public,
      base_url: config.cartwavehub_base_url,
      ativo: config.cartwavehub_ativo,
    })

    const response = {
      ...config,
      cartwavehub_ativo: config.cartwavehub_ativo,
      has_secret: !!config.cartwavehub_api_secret,
      webhook_url: `${process.env.BASE_URL || 'https://qoo8wgogo4ow4gsg0k0wk4g4.agenciamidas.com'}/api/payments/cartwavehub-webhook`,
    }
    
    console.log('[CartwavehubKeys] ✅ Retornando credenciais para o frontend')
    console.log('[CartwavehubKeys] ==========================================')
    
    res.json(response)
  } catch (error) {
    console.error('[CartwavehubKeys] ❌ Erro ao buscar credenciais:', {
      message: error.message,
      stack: error.stack,
    })
    res.status(500).json({
      error: 'Erro ao buscar credenciais',
      status: false,
    })
  }
}

/**
 * POST /api/admin/cartwavehub-keys
 * Salva as credenciais Cartwavehub
 */
export const saveCartwavehubKeys = async (req, res) => {
  try {
    console.log('[CartwavehubKeys] ==========================================')
    console.log('[CartwavehubKeys] Recebendo requisição para salvar credenciais')
    console.log('[CartwavehubKeys] Body recebido:', {
      has_secret: !!req.body.cartwavehub_api_secret,
      secret_length: req.body.cartwavehub_api_secret?.length || 0,
      has_public: !!req.body.cartwavehub_api_public,
      base_url: req.body.cartwavehub_base_url,
      has_password: !!req.body.admin_password,
    })
    
    const { cartwavehub_api_secret, cartwavehub_api_public, cartwavehub_base_url, admin_password } = req.body

    // Validar campos obrigatórios
    if (!cartwavehub_api_secret || cartwavehub_api_secret.trim() === '') {
      console.error('[CartwavehubKeys] ❌ API Secret não fornecido')
      return res.status(400).json({
        error: 'API Secret é obrigatório',
        status: false,
      })
    }

    // TODO: Validar admin_password se necessário (2FA)
    if (!admin_password || admin_password.trim() === '') {
      console.error('[CartwavehubKeys] ❌ Senha 2FA não fornecida')
      return res.status(400).json({
        error: 'Senha de 2FA é obrigatória',
        status: false,
      })
    }

    // Validar URL base
    const baseUrl = cartwavehub_base_url?.trim() || 'https://api.cartwavehub.com.br'

    console.log('[CartwavehubKeys] Dados que serão salvos:', {
      base_url: baseUrl,
      has_secret: !!cartwavehub_api_secret,
      secret_preview: cartwavehub_api_secret.substring(0, 20) + '...',
      has_public: !!cartwavehub_api_public,
    })

    // Salvar ou atualizar credenciais
    const credentials = [
      { key: 'cartwavehub_api_secret', value: cartwavehub_api_secret.trim() },
      { key: 'cartwavehub_api_public', value: cartwavehub_api_public?.trim() || '' },
      { key: 'cartwavehub_base_url', value: baseUrl },
      { key: 'cartwavehub_ativo', value: cartwavehub_ativo ? 'true' : 'false' },
    ]

    for (const cred of credentials) {
      console.log(`[CartwavehubKeys] Salvando ${cred.key}...`)
      const [result] = await pool.execute(
        `INSERT INTO app_settings (setting_key, setting_value, updated_at)
         VALUES (?, ?, NOW())
         ON DUPLICATE KEY UPDATE 
         setting_value = VALUES(setting_value),
         updated_at = NOW()`,
        [cred.key, cred.value]
      )
      console.log(`[CartwavehubKeys] ✅ ${cred.key} salvo com sucesso`, {
        affectedRows: result.affectedRows,
        insertId: result.insertId,
      })
    }

    // Verificar se foi salvo corretamente
    const [verifySettings] = await pool.execute(
      `SELECT setting_key, setting_value 
       FROM app_settings 
       WHERE setting_key IN ('cartwavehub_api_secret', 'cartwavehub_api_public', 'cartwavehub_base_url')`
    )
    
    console.log('[CartwavehubKeys] Verificação após salvar:', {
      settings_encontrados: verifySettings.length,
      settings: verifySettings.map(s => ({
        key: s.setting_key,
        has_value: !!s.setting_value,
        value_length: s.setting_value?.length || 0,
      })),
    })

    console.log('[CartwavehubKeys] ✅ Credenciais salvas com sucesso!')
    console.log('[CartwavehubKeys] ==========================================')

    res.json({
      message: 'Credenciais Cartwavehub salvas com sucesso',
      status: true,
      config: {
        cartwavehub_api_secret: cartwavehub_api_secret.trim(),
        cartwavehub_api_public: cartwavehub_api_public?.trim() || '',
        cartwavehub_base_url: baseUrl,
      },
    })
  } catch (error) {
    console.error('[CartwavehubKeys] ❌ Erro ao salvar credenciais:', {
      message: error.message,
      stack: error.stack,
      code: error.code,
    })
    res.status(500).json({
      error: 'Erro ao salvar credenciais',
      message: error.message || 'Erro desconhecido',
      status: false,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    })
  }
}

