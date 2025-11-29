import axios from 'axios'
import pool from '../config/database.js'

// Função para obter credenciais do banco
async function getArkamaCredentials() {
  try {
    const [settings] = await pool.execute(
      `SELECT setting_key, setting_value 
       FROM app_settings 
       WHERE setting_key IN ('arkama_api_token', 'arkama_base_url', 'arkama_environment')`
    )

    let apiToken = process.env.ARKAMA_API_TOKEN || ''
    let baseUrl = process.env.ARKAMA_BASE_URL || 'https://sandbox.arkama.com.br/api/v1'
    let environment = process.env.ARKAMA_ENVIRONMENT || 'sandbox'

    settings.forEach(setting => {
      if (setting.setting_key === 'arkama_api_token') {
        apiToken = setting.setting_value || apiToken
      } else if (setting.setting_key === 'arkama_base_url') {
        baseUrl = setting.setting_value || baseUrl
      } else if (setting.setting_key === 'arkama_environment') {
        environment = setting.setting_value || environment
      }
    })

    // Se não houver URL base definida, definir baseado no ambiente
    if (!baseUrl || baseUrl === 'https://sandbox.arkama.com.br/api/v1') {
      switch (environment) {
        case 'production':
          baseUrl = 'https://app.arkama.com.br/api/v1'
          break
        case 'beta':
          baseUrl = 'https://beta.arkama.com.br/api/v1'
          break
        case 'sandbox':
        default:
          baseUrl = 'https://sandbox.arkama.com.br/api/v1'
          break
      }
    }

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
let lastConfig = null

async function getArkamaApi() {
  const { apiToken, baseUrl } = await getArkamaCredentials()
  
  // Recriar instância se as credenciais mudaram
  if (!arkamaApi || lastConfig?.apiToken !== apiToken || lastConfig?.baseUrl !== baseUrl) {
    arkamaApi = axios.create({
      baseURL: baseUrl,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'BetGenius-Casino',
        'Authorization': `Bearer ${apiToken}`,
      },
      timeout: 30000,
    })
    lastConfig = { apiToken, baseUrl }
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

    // Converter amount para número e garantir formato correto
    const amountValue = parseFloat(data.amount)
    
    // A API Arkama exige 'value' OU 'total_value', mas não ambos
    // Se enviar 'value', não pode enviar 'total_value'
    const requestBody = {
      value: amountValue.toFixed(2), // Campo obrigatório (não enviar total_value quando value está presente)
      user_email: data.user_email,
      user_name: data.user_name || data.user_email,
      description: data.description || 'Depósito na plataforma',
      callback_url: data.callback_url,
      return_url: data.return_url,
    }

    // Adicionar token no body se necessário (algumas APIs esperam assim)
    if (apiToken) {
      requestBody.token = apiToken
    }

    console.log('[Arkama] Enviando requisição:', {
      ...requestBody,
      token: apiToken ? '***' : 'não fornecido',
    })

    const response = await api.post('/orders', requestBody)

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

