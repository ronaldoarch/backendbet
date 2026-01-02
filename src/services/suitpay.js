import axios from 'axios'
import pool from '../config/database.js'

/**
 * Buscar credenciais do SuitPay do banco de dados
 * @returns {Promise<{clientId: string, clientSecret: string, baseUrl: string}>}
 */
async function getSuitpayCredentials() {
  try {
    const [clientIdSettings] = await pool.execute(
      `SELECT setting_value FROM app_settings WHERE setting_key = 'suitpay_client_id'`
    )
    const [clientSecretSettings] = await pool.execute(
      `SELECT setting_value FROM app_settings WHERE setting_key = 'suitpay_client_secret'`
    )
    const [urlSettings] = await pool.execute(
      `SELECT setting_value FROM app_settings WHERE setting_key = 'suitpay_base_url'`
    )

    const clientId = clientIdSettings.length > 0 ? clientIdSettings[0].setting_value : process.env.SUITPAY_CLIENT_ID || ''
    const clientSecret = clientSecretSettings.length > 0 ? clientSecretSettings[0].setting_value : process.env.SUITPAY_CLIENT_SECRET || ''
    const baseUrl = urlSettings.length > 0 ? urlSettings[0].setting_value : process.env.SUITPAY_BASE_URL || 'https://api.suitpay.app'

    return {
      clientId: clientId ? clientId.trim() : '',
      clientSecret: clientSecret ? clientSecret.trim() : '',
      baseUrl: baseUrl.trim(),
    }
  } catch (error) {
    console.error('[SuitPay] Erro ao buscar credenciais:', error)
    return {
      clientId: process.env.SUITPAY_CLIENT_ID || '',
      clientSecret: process.env.SUITPAY_CLIENT_SECRET || '',
      baseUrl: process.env.SUITPAY_BASE_URL || 'https://api.suitpay.app',
    }
  }
}

// Instância do axios para SuitPay
let suitpayApi = null
let lastConfig = null

/**
 * Obter instância do axios configurada com autenticação
 * @returns {Promise<axios>}
 */
async function getSuitpayApi() {
  const credentials = await getSuitpayCredentials()
  
  // Recriar instância se as credenciais mudaram
  if (!suitpayApi || 
      lastConfig?.clientId !== credentials.clientId || 
      lastConfig?.clientSecret !== credentials.clientSecret || 
      lastConfig?.baseUrl !== credentials.baseUrl) {
    
    suitpayApi = axios.create({
      baseURL: credentials.baseUrl,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      auth: {
        username: credentials.clientId,
        password: credentials.clientSecret,
      },
    })
    
    lastConfig = { clientId: credentials.clientId, clientSecret: credentials.clientSecret, baseUrl: credentials.baseUrl }
  }
  
  return suitpayApi
}

/**
 * Criar uma transação PIX (depósito)
 * 
 * @param {Object} data - Dados da transação
 * @param {number} data.amount - Valor da transação em reais
 * @param {string} data.user_email - Email do usuário
 * @param {string} data.user_id - ID do usuário
 * @param {string} data.description - Descrição da transação
 * @param {string} data.callback_url - URL de callback para webhook
 * @param {string} data.ip - IP do cliente
 * @returns {Promise<Object>} Resposta da API SuitPay
 */
export const createPixTransaction = async (data) => {
  try {
    const credentials = await getSuitpayCredentials()
    
    if (!credentials.clientId || !credentials.clientSecret) {
      throw new Error('Credenciais do SuitPay não configuradas')
    }

    console.log('[SuitPay] Criando transação PIX:', {
      amount: data.amount,
      user_email: data.user_email,
    })

    // Converter valor para centavos
    const amountInCents = Math.round(parseFloat(data.amount) * 100)
    
    // Gerar código externo único
    const externalCode = `deposit_${data.user_id}_${Date.now()}`

    const api = await getSuitpayApi()
    
    // Montar payload conforme API SuitPay
    const requestBody = {
      amount: amountInCents, // Valor em centavos
      callbackUrl: data.callback_url,
      externalId: externalCode,
      customer: {
        email: data.user_email,
        name: data.user_id.toString(),
      },
      metadata: {
        user_id: data.user_id.toString(),
        description: data.description || 'Depósito na plataforma',
      },
    }
    
    // Adicionar IP se disponível
    if (data.ip && data.ip !== '0.0.0.0') {
      requestBody.ip = data.ip
    }

    console.log('[SuitPay] Enviando requisição:', {
      ...requestBody,
      amount: `${amountInCents} centavos (R$ ${data.amount})`,
    })

    const response = await api.post('/v1/pix/create', requestBody)

    console.log('[SuitPay] ✅ Transação criada com sucesso:', {
      transaction_id: response.data.id,
      status: response.data.status,
    })

    // Adaptar resposta para formato esperado
    return {
      success: true,
      data: {
        id: response.data.id,
        status: response.data.status,
        pix: {
          encodedImage: response.data.qrCode, // QR Code em base64
          payload: response.data.pixCode, // PIX Copia e Cola
        },
        encodedImage: response.data.qrCode, // Compatibilidade
        payload: response.data.pixCode, // Compatibilidade
        amount: response.data.amount,
        createdAt: response.data.createdAt,
      },
    }
  } catch (error) {
    console.error('[SuitPay] ❌ Erro ao criar transação:', {
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
                        error.message ||
                        'Erro desconhecido ao criar pagamento'
    
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
 * 
 * @param {string} transactionId - ID da transação
 * @returns {Promise<Object>} Dados da transação
 */
export const getTransaction = async (transactionId) => {
  try {
    const api = await getSuitpayApi()
    const response = await api.get(`/v1/pix/${transactionId}`)

    return {
      success: true,
      data: response.data,
    }
  } catch (error) {
    console.error('[SuitPay] Erro ao buscar transação:', error)
    return {
      success: false,
      error: error.response?.data?.message || error.response?.data?.error || error.message,
      status: error.response?.status || 500,
    }
  }
}

export default {
  createPixTransaction,
  getTransaction,
}

