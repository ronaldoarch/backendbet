import pool from '../config/database.js'

/**
 * GET /api/admin/arkama-keys
 * Busca as credenciais Arkama configuradas
 */
export const getArkamaKeys = async (req, res) => {
  try {
    // Buscar credenciais da tabela app_settings
    const [settings] = await pool.execute(
      `SELECT setting_key, setting_value 
       FROM app_settings 
       WHERE setting_key IN ('arkama_api_token', 'arkama_base_url', 'arkama_environment')`
    )

    const config = {
      arkama_api_token: '',
      arkama_base_url: 'https://sandbox.arkama.com.br/api/v1',
      arkama_environment: 'sandbox',
    }

    settings.forEach(setting => {
      if (setting.setting_key === 'arkama_api_token') {
        config.arkama_api_token = setting.setting_value || ''
      } else if (setting.setting_key === 'arkama_base_url') {
        config.arkama_base_url = setting.setting_value || 'https://sandbox.arkama.com.br/api/v1'
      } else if (setting.setting_key === 'arkama_environment') {
        config.arkama_environment = setting.setting_value || 'sandbox'
      }
    })

    res.json({
      ...config,
      has_token: !!config.arkama_api_token,
    })
  } catch (error) {
    console.error('Erro ao buscar credenciais Arkama:', error)
    res.status(500).json({
      error: 'Erro ao buscar credenciais',
      status: false,
    })
  }
}

/**
 * POST /api/admin/arkama-keys
 * Salva as credenciais Arkama
 */
export const saveArkamaKeys = async (req, res) => {
  try {
    const { arkama_api_token, arkama_base_url, arkama_environment, admin_password } = req.body

    // Validar campos obrigatórios
    if (!arkama_api_token || arkama_api_token.trim() === '') {
      return res.status(400).json({
        error: 'Token da API é obrigatório',
        status: false,
      })
    }

    // TODO: Validar admin_password se necessário (2FA)
    // Por enquanto, aceita qualquer senha para facilitar o desenvolvimento
    if (!admin_password || admin_password.trim() === '') {
      return res.status(400).json({
        error: 'Senha de 2FA é obrigatória',
        status: false,
      })
    }

    // Validar URL base
    let baseUrl = arkama_base_url
    if (!baseUrl || baseUrl.trim() === '') {
      // Definir URL base baseado no ambiente
      if (arkama_environment === 'production') {
        baseUrl = 'https://app.arkama.com.br/api/v1'
      } else if (arkama_environment === 'beta') {
        baseUrl = 'https://beta.arkama.com.br/api/v1'
      } else {
        baseUrl = 'https://sandbox.arkama.com.br/api/v1'
      }
    }

    // Salvar ou atualizar credenciais
    const credentials = [
      { key: 'arkama_api_token', value: arkama_api_token.trim() },
      { key: 'arkama_base_url', value: baseUrl },
      { key: 'arkama_environment', value: arkama_environment || 'sandbox' },
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

    console.log('[ArkamaKeys] Credenciais salvas:', {
      environment: arkama_environment,
      base_url: baseUrl,
      has_token: !!arkama_api_token,
    })

    res.json({
      message: 'Credenciais Arkama salvas com sucesso',
      status: true,
      config: {
        arkama_api_token: arkama_api_token.trim(),
        arkama_base_url: baseUrl,
        arkama_environment: arkama_environment || 'sandbox',
      },
    })
  } catch (error) {
    console.error('Erro ao salvar credenciais Arkama:', error)
    res.status(500).json({
      error: 'Erro ao salvar credenciais',
      message: error.message || 'Erro desconhecido',
      status: false,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    })
  }
}

