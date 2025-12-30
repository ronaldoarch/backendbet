import pool from '../config/database.js'

/**
 * GET /api/settings/data
 * Retorna todas as configurações da aplicação
 */
export const getSettings = async (req, res) => {
  try {
    // Buscar configurações da tabela app_settings
    const [settings] = await pool.execute(
      'SELECT setting_key, setting_value FROM app_settings'
    )

    // Converter array de settings em objeto
    const settingsObj = {}
    settings.forEach(setting => {
      settingsObj[setting.setting_key] = setting.setting_value
    })

    // Retornar formato esperado pelo frontend
    res.json({
      status: true,
      custom: settingsObj,
      data: settingsObj,
    })
  } catch (error) {
    console.error('Erro ao buscar configurações:', error)
    res.status(500).json({
      error: 'Erro ao buscar configurações',
      status: false,
      message: error.message,
      custom: {},
      data: {},
    })
  }
}

export default {
  getSettings,
}

