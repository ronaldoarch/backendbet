import axios from 'axios'
import pool from '../config/database.js'

/**
 * Serviço de autenticação JWT para Cartwave API
 * Nova API usa OAuth 2.0 Client Credentials
 */

/**
 * Buscar credenciais do Cartwave do banco de dados
 * @returns {Promise<{clientId: string, clientSecret: string, baseUrl: string}>}
 */
export async function getCartwaveCredentials() {
  try {
    // Tentar buscar novas credenciais (client_id e client_secret)
    const [clientIdSettings] = await pool.execute(
      `SELECT setting_value FROM app_settings WHERE setting_key = 'cartwave_client_id'`
    )
    const [clientSecretSettings] = await pool.execute(
      `SELECT setting_value FROM app_settings WHERE setting_key = 'cartwave_client_secret'`
    )
    const [urlSettings] = await pool.execute(
      `SELECT setting_value FROM app_settings WHERE setting_key = 'cartwave_base_url'`
    )

    // Se não encontrar, tentar usar as antigas (para compatibilidade)
    if (!clientIdSettings || clientIdSettings.length === 0) {
      const [oldSecretSettings] = await pool.execute(
        `SELECT setting_value FROM app_settings WHERE setting_key = 'cartwavehub_api_secret'`
      )
      if (oldSecretSettings && oldSecretSettings.length > 0) {
        // Usar API secret antiga como client_secret temporariamente
        console.warn('[CartwaveAuth] Usando credenciais antigas. Configure cartwave_client_id e cartwave_client_secret.')
      }
    }

    const clientId = clientIdSettings?.length > 0 
      ? clientIdSettings[0].setting_value 
      : process.env.CARTWAVE_CLIENT_ID || process.env.CARTWAVEHUB_API_PUBLIC || ''
    
    const clientSecret = clientSecretSettings?.length > 0 
      ? clientSecretSettings[0].setting_value 
      : process.env.CARTWAVE_CLIENT_SECRET || process.env.CARTWAVEHUB_API_SECRET || ''
    
    const baseUrl = urlSettings?.length > 0 
      ? urlSettings[0].setting_value 
      : process.env.CARTWAVE_BASE_URL || process.env.CARTWAVEHUB_BASE_URL || 'https://api.cartwave.com.br'

    if (!clientId || !clientSecret) {
      throw new Error('Credenciais do Cartwave não configuradas (client_id e client_secret)')
    }

    return {
      clientId: clientId.trim(),
      clientSecret: clientSecret.trim(),
      baseUrl: baseUrl.trim(),
    }
  } catch (error) {
    console.error('[CartwaveAuth] Erro ao buscar credenciais:', error)
    return {
      clientId: process.env.CARTWAVE_CLIENT_ID || process.env.CARTWAVEHUB_API_PUBLIC || '',
      clientSecret: process.env.CARTWAVE_CLIENT_SECRET || process.env.CARTWAVEHUB_API_SECRET || '',
      baseUrl: process.env.CARTWAVE_BASE_URL || process.env.CARTWAVEHUB_BASE_URL || 'https://api.cartwave.com.br',
    }
  }
}

/**
 * Classe para gerenciar autenticação JWT do Cartwave
 */
class CartwaveAuth {
  constructor() {
    this.token = null
    this.tokenExpiry = null
    this.clientId = null
    this.clientSecret = null
    this.baseUrl = null
  }

  /**
   * Obter token JWT válido (com cache)
   * @returns {Promise<string>} Token JWT
   */
  async getToken() {
    // Buscar credenciais
    const credentials = await getCartwaveCredentials()
    
    // Se credenciais mudaram, invalidar token
    if (this.clientId !== credentials.clientId || 
        this.clientSecret !== credentials.clientSecret ||
        this.baseUrl !== credentials.baseUrl) {
      this.token = null
      this.tokenExpiry = null
      this.clientId = credentials.clientId
      this.clientSecret = credentials.clientSecret
      this.baseUrl = credentials.baseUrl
    }

    // Se token válido, retornar
    if (this.token && this.tokenExpiry && this.tokenExpiry > Date.now()) {
      return this.token
    }

    // Obter novo token
    try {
      console.log('[CartwaveAuth] Obtendo novo token JWT...')
      
      const response = await axios.post(`${this.baseUrl}/v1/auth/token`, {
        grant_type: 'client_credentials',
        client_id: this.clientId,
        client_secret: this.clientSecret,
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      })

      if (!response.data.access_token) {
        throw new Error('Token não retornado na resposta')
      }

      this.token = response.data.access_token
      const expiresIn = response.data.expires_in || 3600 // Padrão: 1 hora
      // Renovar 5 minutos antes de expirar
      this.tokenExpiry = Date.now() + (expiresIn * 1000) - 300000

      console.log('[CartwaveAuth] ✅ Token obtido com sucesso. Expira em:', new Date(this.tokenExpiry).toISOString())
      
      return this.token
    } catch (error) {
      console.error('[CartwaveAuth] ❌ Erro ao obter token:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      })
      throw new Error(`Erro ao autenticar no Cartwave: ${error.response?.data?.error_description || error.message}`)
    }
  }

  /**
   * Invalidar token (forçar renovação)
   */
  invalidateToken() {
    this.token = null
    this.tokenExpiry = null
  }
}

// Instância singleton
let authInstance = null

/**
 * Obter instância do serviço de autenticação
 * @returns {CartwaveAuth}
 */
export function getCartwaveAuth() {
  if (!authInstance) {
    authInstance = new CartwaveAuth()
  }
  return authInstance
}

// Exportar função de credenciais
export { getCartwaveCredentials }

export default {
  getCartwaveAuth,
  getCartwaveCredentials,
}

