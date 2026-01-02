import axios from 'axios'
import pool from '../config/database.js'

/**
 * Buscar credenciais do Cartwave do banco de dados
 * @returns {Promise<{clientId: string, clientSecret: string, baseUrl: string}>}
 */
export async function getCartwaveCredentials() {
  try {
    const [clientIdSettings] = await pool.execute(
      `SELECT setting_value FROM app_settings WHERE setting_key = 'cartwave_client_id'`
    )
    const [clientSecretSettings] = await pool.execute(
      `SELECT setting_value FROM app_settings WHERE setting_key = 'cartwave_client_secret'`
    )
    const [urlSettings] = await pool.execute(
      `SELECT setting_value FROM app_settings WHERE setting_key = 'cartwave_base_url'`
    )

    const clientId = clientIdSettings.length > 0 ? clientIdSettings[0].setting_value : process.env.CARTWAVE_CLIENT_ID || ''
    const clientSecret = clientSecretSettings.length > 0 ? clientSecretSettings[0].setting_value : process.env.CARTWAVE_CLIENT_SECRET || ''
    const baseUrl = urlSettings.length > 0 ? urlSettings[0].setting_value : process.env.CARTWAVE_BASE_URL || 'https://api.cartwavehub.com.br'

    return {
      clientId: clientId ? clientId.trim() : '',
      clientSecret: clientSecret ? clientSecret.trim() : '',
      baseUrl: baseUrl.trim(),
    }
  } catch (error) {
    console.error('[CartwaveAuth] Erro ao buscar credenciais:', error)
    return {
      clientId: process.env.CARTWAVE_CLIENT_ID || '',
      clientSecret: process.env.CARTWAVE_CLIENT_SECRET || '',
      baseUrl: process.env.CARTWAVE_BASE_URL || 'https://api.cartwavehub.com.br',
    }
  }
}

/**
 * Classe para gerenciar autenticação JWT com Cartwave
 */
class CartwaveAuth {
  constructor() {
    this.token = null
    this.tokenExpiry = null
    this.credentials = null
  }

  /**
   * Obter token JWT válido (com cache)
   * @returns {Promise<string>}
   */
  async getToken() {
    // Se tem token válido em cache, retornar
    if (this.token && this.tokenExpiry && Date.now() < this.tokenExpiry) {
      return this.token
    }

    // Buscar credenciais
    this.credentials = await getCartwaveCredentials()

    if (!this.credentials.clientId || !this.credentials.clientSecret) {
      throw new Error('Credenciais do Cartwave não configuradas (clientId e clientSecret são obrigatórios)')
    }

    try {
      // Fazer requisição para obter token
      const response = await axios.post(
        `${this.credentials.baseUrl}/v1/auth/token`,
        {
          client_id: this.credentials.clientId,
          client_secret: this.credentials.clientSecret,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          timeout: 10000,
        }
      )

      if (!response.data || !response.data.access_token) {
        throw new Error('Resposta inválida ao obter token')
      }

      this.token = response.data.access_token
      
      // Cache do token por 50 minutos (assumindo que expira em 60 minutos)
      const expiresIn = response.data.expires_in || 3600
      this.tokenExpiry = Date.now() + (expiresIn - 600) * 1000 // 10 minutos antes do vencimento

      console.log('[CartwaveAuth] ✅ Token obtido com sucesso')
      
      return this.token
    } catch (error) {
      console.error('[CartwaveAuth] ❌ Erro ao obter token:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      })
      throw new Error(`Erro ao autenticar com Cartwave: ${error.response?.data?.message || error.message}`)
    }
  }

  /**
   * Invalidar token atual (forçar renovação)
   */
  invalidateToken() {
    console.log('[CartwaveAuth] Invalidando token atual')
    this.token = null
    this.tokenExpiry = null
  }
}

// Instância singleton
let authInstance = null

/**
 * Obter instância do CartwaveAuth
 * @returns {CartwaveAuth}
 */
export function getCartwaveAuth() {
  if (!authInstance) {
    authInstance = new CartwaveAuth()
  }
  return authInstance
}

