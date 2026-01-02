import axios from 'axios'
import pool from '../config/database.js'
import { getCartwaveAuth, getCartwaveCredentials } from './cartwaveAuth.js'

/**
 * Buscar credenciais do Cartwavehub do banco de dados (LEGADO - manter para compatibilidade)
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
 * Serviço para integração com gateway de pagamento Cartwave
 * Nova API: https://cartwave-prod.readme.io/reference/cartwave-api-documentation
 * 
 * Suporta:
 * - Nova API (JWT) - padrão
 * - API antiga (headers) - fallback se JWT não configurado
 */

// Instância do axios para nova API (JWT)
let cartwaveApi = null
let lastBaseUrl = null

/**
 * Obter instância do axios configurada com JWT (Nova API)
 * @returns {Promise<axios>}
 */
async function getCartwaveApi() {
  const credentials = await getCartwaveCredentials()
  
  // Recriar instância se baseUrl mudou
  if (!cartwaveApi || lastBaseUrl !== credentials.baseUrl) {
    cartwaveApi = axios.create({
      baseURL: credentials.baseUrl,
      timeout: 30000,
    })
    
    // Interceptor para adicionar token JWT em cada requisição
    cartwaveApi.interceptors.request.use(async (config) => {
      try {
        const auth = getCartwaveAuth()
        const token = await auth.getToken()
        config.headers.Authorization = `Bearer ${token}`
        config.headers['Content-Type'] = 'application/json'
        config.headers.Accept = 'application/json'
        return config
      } catch (error) {
        console.error('[Cartwave] Erro ao obter token para requisição:', error)
        throw error
      }
    })
    
    lastBaseUrl = credentials.baseUrl
  }
  
  return cartwaveApi
}

// Instância do axios para API antiga (LEGADO - manter para compatibilidade)
let cartwavehubApi = null
let lastConfig = null

/**
 * Obter instância do axios para API antiga (LEGADO)
 * @returns {Promise<axios>}
 */
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
 * Usa Nova API (JWT) por padrão, com fallback para API antiga
 * 
 * @param {Object} data - Dados da transação
 * @param {number} data.amount - Valor da transação em reais
 * @param {string} data.user_email - Email do usuário
 * @param {string} data.user_id - ID do usuário
 * @param {string} data.description - Descrição da transação
 * @param {string} data.callback_url - URL de callback para webhook
 * @param {string} data.ip - IP do cliente
 * @returns {Promise<Object>} Resposta da API Cartwave
 */
export const createPixTransaction = async (data) => {
  try {
    const credentials = await getCartwaveCredentials()
    
    // Verificar se tem credenciais JWT configuradas
    const useNewApi = credentials.clientId && credentials.clientSecret
    
    console.log('[Cartwave] Criando transação PIX:', {
      amount: data.amount,
      user_email: data.user_email,
      api_version: useNewApi ? 'NOVA (JWT)' : 'ANTIGA (headers)',
    })

    // Converter valor para centavos
    const amountInCents = Math.round(parseFloat(data.amount) * 100)
    
    // Gerar código externo único
    const externalCode = `deposit_${data.user_id}_${Date.now()}`

    if (useNewApi) {
      // ========== NOVA API (JWT) ==========
      const api = await getCartwaveApi()
      
      // Montar payload conforme nova documentação
      const requestBody = {
        amount: amountInCents, // Valor em centavos
        webhookUrl: data.callback_url, // Novo nome do campo
        externalId: externalCode, // Novo nome do campo
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

      console.log('[Cartwave] Enviando requisição (Nova API):', {
        ...requestBody,
        amount: `${amountInCents} centavos (R$ ${data.amount})`,
      })

      const response = await api.post('/v1/pix/cash-in', requestBody)

      console.log('[Cartwave] ✅ Transação criada com sucesso (Nova API):', {
        transaction_id: response.data.id,
        status: response.data.status,
      })

      // Adaptar resposta para formato esperado pelo código atual
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
    } else {
      // ========== API ANTIGA (FALLBACK) ==========
      console.log('[Cartwave] ⚠️ Usando API antiga (fallback). Configure JWT para usar nova API.')
      const api = await getCartwavehubApi()

      const requestBody = {
        postbackUrl: data.callback_url,
        amount: amountInCents,
        externalCode: externalCode,
        metadata: {
          user_id: data.user_id.toString(),
          user_email: data.user_email,
          description: data.description || 'Depósito na plataforma',
        },
      }
      
      if (data.ip && data.ip !== '0.0.0.0') {
        requestBody.ip = data.ip
      }

      console.log('[Cartwave] Enviando requisição (API Antiga):', {
        ...requestBody,
        amount: `${amountInCents} centavos (R$ ${data.amount})`,
      })

      const response = await api.post('/v1/cob', requestBody)

      console.log('[Cartwave] ✅ Transação criada com sucesso (API Antiga):', {
        transaction_id: response.data.id,
        status: response.data.status,
      })

      return {
        success: true,
        data: response.data,
      }
    }
  } catch (error) {
    console.error('[Cartwave] ❌ Erro ao criar transação:', {
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
    
    // Se for erro 401 (não autenticado), tentar invalidar token e retry uma vez
    if (error.response?.status === 401) {
      console.log('[Cartwave] Token inválido, invalidando e tentando novamente...')
      const auth = getCartwaveAuth()
      auth.invalidateToken()
      
      // Retry uma vez (apenas se estava usando nova API)
      try {
        const api = await getCartwaveApi()
        // ... retry logic aqui se necessário
      } catch (retryError) {
        // Continuar com tratamento de erro normal
      }
    }
    
    // Retornar erro mais detalhado
    const errorData = error.response?.data || {}
    const errorMessage = errorData.message || 
                        errorData.error || 
                        errorData.error_description ||
                        (errorData.errors ? Object.values(errorData.errors).flat().join(', ') : null) ||
                        error.message ||
                        'Erro desconhecido ao criar pagamento'
    
    console.error('[Cartwave] Detalhes do erro:', {
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
 * Usa Nova API (JWT) por padrão, com fallback para API antiga
 * 
 * @param {string} transactionId - ID da transação
 * @returns {Promise<Object>} Dados da transação
 */
export const getTransaction = async (transactionId) => {
  try {
    const credentials = await getCartwaveCredentials()
    const useNewApi = credentials.clientId && credentials.clientSecret

    console.log('[Cartwave] Buscando transação:', {
      transactionId,
      api_version: useNewApi ? 'NOVA (JWT)' : 'ANTIGA (headers)',
    })

    if (useNewApi) {
      // ========== NOVA API (JWT) ==========
      const api = await getCartwaveApi()
      const response = await api.get(`/v1/pix/cash-in/${transactionId}`)

      return {
        success: true,
        data: response.data,
      }
    } else {
      // ========== API ANTIGA (FALLBACK) ==========
      const api = await getCartwavehubApi()
      const response = await api.get(`/v1/transactions/${transactionId}`)

      return {
        success: true,
        data: response.data,
      }
    }
  } catch (error) {
    console.error('[Cartwave] Erro ao buscar transação:', error)
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
  getCartwavehubCredentials,
}

