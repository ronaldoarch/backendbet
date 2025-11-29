import axios from 'axios'

const ARKAMA_BASE_URL = process.env.ARKAMA_BASE_URL || 'https://sandbox.arkama.com.br/api/v1'
const ARKAMA_API_TOKEN = process.env.ARKAMA_API_TOKEN || ''

/**
 * Serviço para integração com gateway de pagamento Arkama
 * Documentação: https://arkama.readme.io/reference/intro
 */

const arkamaApi = axios.create({
  baseURL: ARKAMA_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'User-Agent': 'BetGenius-Casino',
    'Authorization': `Bearer ${ARKAMA_API_TOKEN}`,
  },
  timeout: 30000,
})

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
    console.log('[Arkama] Criando compra:', {
      amount: data.amount,
      user_email: data.user_email,
    })

    const response = await arkamaApi.post('/orders', {
      amount: data.amount,
      user_email: data.user_email,
      user_name: data.user_name || data.user_email,
      description: data.description || 'Depósito na plataforma',
      callback_url: data.callback_url,
      return_url: data.return_url,
      token: ARKAMA_API_TOKEN, // Alternativa: enviar token no body
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
    console.log('[Arkama] Buscando compra:', orderId)

    const response = await arkamaApi.get(`/orders/${orderId}`, {
      params: {
        token: ARKAMA_API_TOKEN, // Alternativa: enviar token como query param
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
    console.log('[Arkama] Estornando compra:', orderId)

    const response = await arkamaApi.post(`/orders/${orderId}/refund`, {
      token: ARKAMA_API_TOKEN,
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

