import axios from 'axios'
import pool from '../config/database.js'

// Função para obter credenciais do banco
async function getArkamaCredentials() {
  try {
    const [settings] = await pool.execute(
      `SELECT setting_key, setting_value 
       FROM settings 
       WHERE setting_key IN ('arkama_api_token', 'arkama_base_url')`
    )

    let apiToken = process.env.ARKAMA_API_TOKEN || ''
    let baseUrl = process.env.ARKAMA_BASE_URL || 'https://sandbox.arkama.com.br/api/v1'

    settings.forEach(setting => {
      if (setting.setting_key === 'arkama_api_token') {
        apiToken = setting.setting_value || apiToken
      } else if (setting.setting_key === 'arkama_base_url') {
        baseUrl = setting.setting_value || baseUrl
      }
    })

    return { apiToken, baseUrl }
  } catch (error) {
    console.error('[Arkama] Erro ao buscar credenciais:', error)
    return {
      apiToken: process.env.ARKAMA_API_TOKEN || '',
      baseUrl: process.env.ARKAMA_BASE_URL || 'https://sandbox.arkama.com.br/api/v1',
    }
  }
}

/**
 * Serviço para integração com gateway de pagamento Arkama
 * Documentação: https://arkama.readme.io/reference/intro
 */

// Criar instância do axios (será configurada dinamicamente)
let arkamaApi = null

async function getArkamaApi() {
  if (!arkamaApi) {
    const { apiToken, baseUrl } = await getArkamaCredentials()
    arkamaApi = axios.create({
      baseURL: baseUrl,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'BetGenius-Casino',
        'Authorization': `Bearer ${apiToken}`,
      },
      timeout: 30000,
    })
  }
  return arkamaApi
}

/**
 * Criar uma compra (depósito)
 * @param {Object} data - Dados da compra
 * @param {number} data.amount - Valor da compra
 * @param {string} data.user_email - Email do usuário
 * @param {string} data.user_name - Nome do usuário
 * @param {string} data.description - Descrição da compra
 * @param {string} data.callback_url - URL de callback para webhook
 * @param {string} data.return_url - URL de retorno após pagamento
 * @returns {Promise<Object>} Resposta da API Arkama
 */
export const createOrder = async (data) => {
  try {
    const { apiToken } = await getArkamaCredentials()
    const api = await getArkamaApi()

    console.log('[Arkama] Criando compra:', {
      amount: data.amount,
      user_email: data.user_email,
    })

    const response = await api.post('/orders', {
      amount: data.amount,
      user_email: data.user_email,
      user_name: data.user_name || data.user_email,
      description: data.description || 'Depósito na plataforma',
      callback_url: data.callback_url,
      return_url: data.return_url,
      token: apiToken, // Alternativa: enviar token no body
    })

    console.log('[Arkama] Compra criada com sucesso:', {
      order_id: response.data.id,
      status: response.data.status,
    })

    return {
      success: true,
      data: response.data,
    }
  } catch (error) {
    console.error('[Arkama] Erro ao criar compra:', error.response?.data || error.message)
    
    return {
      success: false,
      error: error.response?.data?.message || error.message,
      details: error.response?.data,
    }
  }
}

/**
 * Buscar informações de uma compra
 * @param {string} orderId - ID da compra
 * @returns {Promise<Object>} Dados da compra
 */
export const getOrder = async (orderId) => {
  try {
    const { apiToken } = await getArkamaCredentials()
    const api = await getArkamaApi()

    console.log('[Arkama] Buscando compra:', orderId)

    const response = await api.get(`/orders/${orderId}`, {
      params: {
        token: apiToken, // Alternativa: enviar token como query param
      },
    })

    return {
      success: true,
      data: response.data,
    }
  } catch (error) {
    console.error('[Arkama] Erro ao buscar compra:', error.response?.data || error.message)
    
    return {
      success: false,
      error: error.response?.data?.message || error.message,
      details: error.response?.data,
    }
  }
}

/**
 * Estornar uma compra (reembolso)
 * @param {string} orderId - ID da compra
 * @returns {Promise<Object>} Resposta da API Arkama
 */
export const refundOrder = async (orderId) => {
  try {
    const { apiToken } = await getArkamaCredentials()
    const api = await getArkamaApi()

    console.log('[Arkama] Estornando compra:', orderId)

    const response = await api.post(`/orders/${orderId}/refund`, {
      token: apiToken,
    })

    console.log('[Arkama] Compra estornada com sucesso:', {
      order_id: orderId,
      status: response.data.status,
    })

    return {
      success: true,
      data: response.data,
    }
  } catch (error) {
    console.error('[Arkama] Erro ao estornar compra:', error.response?.data || error.message)
    
    return {
      success: false,
      error: error.response?.data?.message || error.message,
      details: error.response?.data,
    }
  }
}

export default {
  createOrder,
  getOrder,
  refundOrder,
}

