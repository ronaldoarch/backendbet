import axios from 'axios'
import pool from '../config/database.js'

/**
 * Buscar credenciais do Cartwavehub do banco de dados
 * @returns {Promise<{apiSecret: string, apiPublic: string|null, baseUrl: string}>}
 */
async function getCartwavehubCredentials() {
  try {
    const [settings] = await pool.execute(
      `SELECT setting_value FROM app_settings WHERE setting_key = 'cartwavehub_api_secret'`
    )
    const [publicSettings] = await pool.execute(
      `SELECT setting_value FROM app_settings WHERE setting_key = 'cartwavehub_api_public'`
    )
    const [urlSettings] = await pool.execute(
      `SELECT setting_value FROM app_settings WHERE setting_key = 'cartwavehub_base_url'`
    )

    const apiSecret = settings.length > 0 ? settings[0].setting_value : process.env.CARTWAVEHUB_API_SECRET || ''
    const apiPublic = publicSettings.length > 0 ? publicSettings[0].setting_value : process.env.CARTWAVEHUB_API_PUBLIC || null
    const baseUrl = urlSettings.length > 0 ? urlSettings[0].setting_value : process.env.CARTWAVEHUB_BASE_URL || 'https://api.cartwavehub.com.br'

    if (!apiSecret || apiSecret.trim() === '') {
      throw new Error('API Secret do Cartwavehub não configurado')
    }

    return {
      apiSecret: apiSecret.trim(),
      apiPublic: apiPublic ? apiPublic.trim() : null,
      baseUrl: baseUrl.trim(),
    }
  } catch (error) {
    console.error('[Cartwavehub] Erro ao buscar credenciais:', error)
    return {
      apiSecret: process.env.CARTWAVEHUB_API_SECRET || '',
      apiPublic: process.env.CARTWAVEHUB_API_PUBLIC || null,
      baseUrl: process.env.CARTWAVEHUB_BASE_URL || 'https://api.cartwavehub.com.br',
    }
  }
}

/**
 * Serviço para integração com gateway de pagamento Cartwavehub
 * Documentação: https://cartwavehub.notion.site
 */

// Criar instância do axios (será configurada dinamicamente)
let cartwavehubApi = null
let lastConfig = null

async function getCartwavehubApi() {
  const { apiSecret, apiPublic, baseUrl } = await getCartwavehubCredentials()
  
  // Recriar instância se as credenciais mudaram
  if (!cartwavehubApi || 
      lastConfig?.apiSecret !== apiSecret || 
      lastConfig?.apiPublic !== apiPublic || 
      lastConfig?.baseUrl !== baseUrl) {
    
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'x-authorization-key': apiSecret,
    }
    
    // Adicionar chave pública se disponível
    if (apiPublic && apiPublic.trim() !== '') {
      headers['x-store-key'] = apiPublic.trim()
    }
    
    cartwavehubApi = axios.create({
      baseURL: baseUrl,
      headers: headers,
      timeout: 30000,
    })
    
    lastConfig = { apiSecret, apiPublic, baseUrl }
  }
  
  return cartwavehubApi
}

/**
 * Criar uma transação PIX (depósito)
 * @param {Object} data - Dados da transação
 * @param {number} data.amount - Valor da transação em reais
 * @param {string} data.user_email - Email do usuário
 * @param {string} data.user_id - ID do usuário
 * @param {string} data.description - Descrição da transação
 * @param {string} data.callback_url - URL de callback para webhook
 * @param {string} data.ip - IP do cliente
 * @returns {Promise<Object>} Resposta da API Cartwavehub
 */
export const createPixTransaction = async (data) => {
  try {
    const { apiSecret } = await getCartwavehubCredentials()
    const api = await getCartwavehubApi()

    console.log('[Cartwavehub] Criando transação PIX:', {
      amount: data.amount,
      user_email: data.user_email,
    })

    // Converter valor para centavos
    const amountInCents = Math.round(parseFloat(data.amount) * 100)
    
    // Gerar código externo único
    const externalCode = `deposit_${data.user_id}_${Date.now()}`

    // Montar payload conforme documentação
    const requestBody = {
      postbackUrl: data.callback_url,
      amount: amountInCents, // Valor em centavos
      externalCode: externalCode,
      metadata: {
        user_id: data.user_id.toString(),
        user_email: data.user_email,
        description: data.description || 'Depósito na plataforma',
      },
    }
    
    // Adicionar IP se disponível
    if (data.ip && data.ip !== '0.0.0.0') {
      requestBody.ip = data.ip
    }

    console.log('[Cartwavehub] Enviando requisição:', {
      ...requestBody,
      amount: `${amountInCents} centavos (R$ ${data.amount})`,
    })

    const response = await api.post('/v1/cob', requestBody)

    console.log('[Cartwavehub] Transação criada com sucesso:', {
      transaction_id: response.data.id,
      status: response.data.status,
    })

    return {
      success: true,
      data: response.data,
    }
  } catch (error) {
    console.error('[Cartwavehub] ❌ Erro ao criar transação:', {
      message: error.message,
      code: error.code,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      stack: error.stack,
    })
    
    // Se for erro de conexão/timeout
    if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT' || error.code === 'ENOTFOUND') {
      return {
        success: false,
        error: 'Não foi possível conectar ao gateway de pagamento',
        details: {
          code: error.code,
          message: error.message,
        },
        status: 503,
      }
    }
    
    // Retornar erro mais detalhado
    const errorData = error.response?.data || {}
    const errorMessage = errorData.message || 
                        errorData.error || 
                        (errorData.errors ? Object.values(errorData.errors).flat().join(', ') : null) ||
                        error.message ||
                        'Erro desconhecido ao criar pagamento'
    
    console.error('[Cartwavehub] Detalhes do erro:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      errorMessage,
      errorData: JSON.stringify(errorData, null, 2),
    })
    
    return {
      success: false,
      error: errorMessage,
      details: errorData,
      status: error.response?.status || 500,
    }
  }
}

/**
 * Buscar informações de uma transação
 * @param {string} transactionId - ID da transação
 * @returns {Promise<Object>} Dados da transação
 */
export const getTransaction = async (transactionId) => {
  try {
    const api = await getCartwavehubApi()

    console.log('[Cartwavehub] Buscando transação:', transactionId)

    const response = await api.get(`/v1/transactions/${transactionId}`)

    return {
      success: true,
      data: response.data,
    }
  } catch (error) {
    console.error('[Cartwavehub] Erro ao buscar transação:', error)
    return {
      success: false,
      error: error.response?.data?.message || error.message,
      status: error.response?.status || 500,
    }
  }
}

export default {
  createPixTransaction,
  getTransaction,
  getCartwavehubCredentials,
}

