import pool from '../config/database.js'

/**
 * GET /api/settings/data
 * Retornar todas as configurações da aplicação
 */
export const getSettings = async (req, res) => {
  try {
    // Buscar todas as configurações do banco
    const [settings] = await pool.execute(
      'SELECT setting_key, setting_value FROM app_settings'
    )

    // Transformar array de objetos em objeto chave-valor
    const settingsObj = {}
    settings.forEach(setting => {
      settingsObj[setting.setting_key] = setting.setting_value
    })

    // Estrutura de resposta esperada pelo frontend
    const response = {
      status: true,
      setting: {
        // Configurações gerais
        software_name: settingsObj.software_name || 'FortuneVegas',
        software_logo_black: settingsObj.software_logo_black || null,
        software_logo_white: settingsObj.software_logo_white || null,
        software_favicon: settingsObj.software_favicon || null,
        
        // Cores e tema
        primary_color: settingsObj.primary_color || '#0ea5e9',
        secondary_color: settingsObj.secondary_color || '#8b5cf6',
        background_geral: settingsObj.background_geral || '#0a0e27',
        navbar_background: settingsObj.navbar_background || '#060918',
        sidebar_background: settingsObj.sidebar_background || '#141830',
        sidebar_border: settingsObj.sidebar_border || '#1e2542',
        
        // Textos
        text_color: settingsObj.text_color || '#ffffff',
        font_family_default: settingsObj.font_family_default || 'Roboto Condensed',
        
        // Botões
        navbar_button_background_registro: settingsObj.navbar_button_background_registro || 'linear-gradient(to right, #0284c7, #0ea5e9)',
        navbar_button_text_registro: settingsObj.navbar_button_text_registro || '#ffffff',
        navbar_button_background_login: settingsObj.navbar_button_background_login || '#141830',
        navbar_button_text_login: settingsObj.navbar_button_text_login || '#ffffff',
        navbar_button_border_color: settingsObj.navbar_button_border_color || '#1e2542',
        navbar_button_deposito_background: settingsObj.navbar_button_deposito_background || '#10b981',
        
        // VIPs
        vips_button_background: settingsObj.vips_button_background || 'linear-gradient(to right, #d97706, #f59e0b)',
        vips_button_text_color: settingsObj.vips_button_text_color || '#ffffff',
        
        // Objeto custom para configurações adicionais do frontend
        custom: {
          // Pode adicionar configurações customizadas aqui
          enableAnimations: settingsObj.enable_animations !== 'false',
          enableNotifications: settingsObj.enable_notifications !== 'false',
        },
      },
    }

    res.json(response)
  } catch (error) {
    console.error('[SettingsController] Erro ao buscar configurações:', error)
    res.status(500).json({
      error: 'Erro ao buscar configurações',
      message: error.message || 'Erro desconhecido',
      status: false,
    })
  }
}

export default {
  getSettings,
}

