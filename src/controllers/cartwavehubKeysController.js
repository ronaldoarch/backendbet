import pool from '../config/database.js'

/**
 * GET /api/admin/cartwavehub-keys
 * Busca as credenciais Cartwavehub configuradas
 */
export const getCartwavehubKeys = async (req, res) => {
  try {
    // Buscar credenciais da tabela app_settings
    const [settings] = await pool.execute(
      `SELECT setting_key, setting_value 
       FROM app_settings 
       WHERE setting_key IN ('cartwavehub_api_secret', 'cartwavehub_api_public', 'cartwavehub_base_url')`
    )

    const config = {
      cartwavehub_api_secret: '',
      cartwavehub_api_public: '',
      cartwavehub_base_url: 'https://api.cartwavehub.com.br',
    }

    settings.forEach(setting => {
      if (setting.setting_key === 'cartwavehub_api_secret') {
        config.cartwavehub_api_secret = setting.setting_value || ''
      } else if (setting.setting_key === 'cartwavehub_api_public') {
        config.cartwavehub_api_public = setting.setting_value || ''
      } else if (setting.setting_key === 'cartwavehub_base_url') {
        config.cartwavehub_base_url = setting.setting_value || 'https://api.cartwavehub.com.br'
      }
    })

    res.json({
      ...config,
      has_secret: !!config.cartwavehub_api_secret,
      webhook_url: `${process.env.BASE_URL || 'https://qoo8wgogo4ow4gsg0k0wk4g4.agenciamidas.com'}/api/payments/cartwavehub-webhook`,
    })
  } catch (error) {
    console.error('Erro ao buscar credenciais Cartwavehub:', error)
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
    const { cartwavehub_api_secret, cartwavehub_api_public, cartwavehub_base_url, admin_password } = req.body

    // Validar campos obrigatórios
    if (!cartwavehub_api_secret || cartwavehub_api_secret.trim() === '') {
      return res.status(400).json({
        error: 'API Secret é obrigatório',
        status: false,
      })
    }

    // TODO: Validar admin_password se necessário (2FA)
    if (!admin_password || admin_password.trim() === '') {
      return res.status(400).json({
        error: 'Senha de 2FA é obrigatória',
        status: false,
      })
    }

    // Validar URL base
    const baseUrl = cartwavehub_base_url?.trim() || 'https://api.cartwavehub.com.br'

    // Salvar ou atualizar credenciais
    const credentials = [
      { key: 'cartwavehub_api_secret', value: cartwavehub_api_secret.trim() },
      { key: 'cartwavehub_api_public', value: cartwavehub_api_public?.trim() || '' },
      { key: 'cartwavehub_base_url', value: baseUrl },
    ]

    for (const cred of credentials) {
      await pool.execute(
        `INSERT INTO app_settings (setting_key, setting_value, updated_at)
         VALUES (?, ?, NOW())
         ON DUPLICATE KEY UPDATE 
         setting_value = VALUES(setting_value),
         updated_at = NOW()`,
        [cred.key, cred.value]
      )
    }

    console.log('[CartwavehubKeys] Credenciais salvas:', {
      base_url: baseUrl,
      has_secret: !!cartwavehub_api_secret,
      has_public: !!cartwavehub_api_public,
    })

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
    console.error('Erro ao salvar credenciais Cartwavehub:', error)
    res.status(500).json({
      error: 'Erro ao salvar credenciais',
      message: error.message || 'Erro desconhecido',
      status: false,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    })
  }
}

