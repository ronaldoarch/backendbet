import axios from 'axios'
import https from 'https'

// URL da API iGameWin conforme documentação: https://igamewin.com/docs
const IGAMEWIN_BASE_URL = 'https://igamewin.com/api/v1'

/**
 * Obter credenciais do iGameWin do banco de dados
 */
export async function getIgamewinCredentials() {
  const pool = (await import('../config/database.js')).default
  
  try {
    const [rows] = await pool.execute(
      `SELECT 
        igamewin_agent_code,
        igamewin_agent_token
      FROM games_keys 
      LIMIT 1`
    )

    if (!rows || rows.length === 0) {
      return null
    }

    const credentials = rows[0]
    
    if (!credentials.igamewin_agent_code || !credentials.igamewin_agent_token) {
      return null
    }

    return {
      agent_code: credentials.igamewin_agent_code,
      agent_token: credentials.igamewin_agent_token,
    }
  } catch (error) {
    console.error('[iGameWin] Erro ao buscar credenciais:', error)
    return null
  }
}

/**
 * Criar agente HTTPS para requisições
 */
function createHttpsAgent() {
  return new https.Agent({
    rejectUnauthorized: true,
    minVersion: 'TLSv1.2',
    maxVersion: 'TLSv1.3',
    keepAlive: false,
  })
}

/**
 * Fazer requisição à API iGameWin
 */
async function makeRequest(endpoint, method = 'POST', data = null) {
  const credentials = await getIgamewinCredentials()
  
  if (!credentials) {
    throw new Error('Credenciais iGameWin não configuradas')
  }

  const url = `${IGAMEWIN_BASE_URL}${endpoint}`
  const agent = createHttpsAgent()

  const config = {
    httpsAgent: agent,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'User-Agent': 'BetGenius/1.0',
    },
    timeout: 15000,
    validateStatus: (status) => status < 500,
  }

  // Adicionar credenciais ao body se for POST/PUT
  if (method === 'POST' || method === 'PUT') {
    config.data = {
      agent_code: credentials.agent_code,
      agent_token: credentials.agent_token,
      ...(data || {}),
    }
  } else {
    // Para GET, adicionar credenciais como query params
    config.params = {
      agent_code: credentials.agent_code,
      agent_token: credentials.agent_token,
      ...(data || {}),
    }
  }

  try {
    let response
    if (method === 'GET') {
      response = await axios.get(url, config)
    } else if (method === 'POST') {
      response = await axios.post(url, config.data, config)
    } else if (method === 'PUT') {
      response = await axios.put(url, config.data, config)
    }

    // Verificar resposta conforme documentação
    // A API retorna { status: 0 } para sucesso, { status: 1 } para erro
    if (response.data && response.data.status !== undefined) {
      if (response.data.status === 0) {
        return response.data
      } else {
        const errorMsg = response.data.msg || response.data.detail || 'Erro desconhecido'
        throw new Error(`Erro da API iGameWin: ${errorMsg}`)
      }
    }

    return response.data
  } catch (error) {
    console.error('[iGameWin] Erro na requisição:', error.message)
    
    if (error.response) {
      const errorMsg = error.response.data?.msg || error.response.data?.detail || error.message
      throw new Error(`Erro da API iGameWin (${error.response.status}): ${errorMsg}`)
    }
    
    throw error
  }
}

/**
 * Criar usuário no iGameWin
 * @param {string} username - Nome de usuário único
 * @param {boolean} isDemo - Se true, cria usuário demo
 * @returns {Promise<Object>}
 */
export async function createUser(username, isDemo = false) {
  console.log('[iGameWin] Criando usuário:', { username, isDemo })
  
  const result = await makeRequest('/user/create', 'POST', {
    username,
    is_demo: isDemo ? 1 : 0,
  })

  console.log('[iGameWin] ✅ Usuário criado com sucesso')
  return result
}

/**
 * Depositar saldo para o usuário
 * @param {string} username - Nome de usuário
 * @param {number} amount - Valor em centavos (ex: 10000 = R$ 100,00)
 * @returns {Promise<Object>}
 */
export async function deposit(username, amount) {
  console.log('[iGameWin] Depositando:', { username, amount })
  
  // Converter para centavos se necessário
  const amountInCents = Math.round(amount * 100)
  
  const result = await makeRequest('/user/deposit', 'POST', {
    username,
    amount: amountInCents,
  })

  console.log('[iGameWin] ✅ Depósito realizado com sucesso')
  return result
}

/**
 * Sacar saldo do usuário
 * @param {string} username - Nome de usuário
 * @param {number} amount - Valor em centavos (ex: 5000 = R$ 50,00)
 * @returns {Promise<Object>}
 */
export async function withdraw(username, amount) {
  console.log('[iGameWin] Sacando:', { username, amount })
  
  // Converter para centavos se necessário
  const amountInCents = Math.round(amount * 100)
  
  const result = await makeRequest('/user/withdraw', 'POST', {
    username,
    amount: amountInCents,
  })

  console.log('[iGameWin] ✅ Saque realizado com sucesso')
  return result
}

/**
 * Lançar jogo ou lobby
 * @param {string} username - Nome de usuário
 * @param {string} provider - Código do provedor (ex: 'PRAGMATIC', 'EVOLUTION')
 * @param {string|null} gameCode - Código do jogo (null para lobby)
 * @param {string} lang - Idioma (ex: 'pt', 'en')
 * @returns {Promise<Object>} Objeto com launch_url
 */
export async function launchGame(username, provider, gameCode = null, lang = 'pt') {
  console.log('[iGameWin] Lançando jogo:', { username, provider, gameCode, lang })
  
  const data = {
    username,
    provider,
    lang,
  }

  // Se gameCode for fornecido, adicionar ao body
  if (gameCode) {
    data.game_code = gameCode
  }

  const result = await makeRequest('/game/launch', 'POST', data)

  if (!result.launch_url) {
    throw new Error('URL de lançamento não retornada pela API')
  }

  console.log('[iGameWin] ✅ Jogo lançado com sucesso')
  return result
}

/**
 * Obter lista de provedores disponíveis
 * @returns {Promise<Array>}
 */
export async function getProviderList() {
  console.log('[iGameWin] Buscando lista de provedores...')
  
  const result = await makeRequest('/provider/list', 'GET')
  
  // A API pode retornar providers como array ou dentro de um objeto
  const providers = Array.isArray(result) ? result : (result.providers || result.data || [])
  
  console.log(`[iGameWin] ✅ Lista de provedores obtida: ${providers.length} provedores`)
  return providers
}

/**
 * Obter lista de jogos de um provedor
 * @param {string} provider - Código do provedor
 * @returns {Promise<Array>}
 */
export async function getGameList(provider) {
  console.log('[iGameWin] Buscando lista de jogos do provedor:', provider)
  
  const result = await makeRequest('/game/list', 'GET', { provider })
  
  // A API pode retornar games como array ou dentro de um objeto
  const games = Array.isArray(result) ? result : (result.games || result.data || [])
  
  console.log(`[iGameWin] ✅ Lista de jogos obtida: ${games.length} jogos`)
  return games
}

/**
 * Obter saldo do usuário
 * @param {string} username - Nome de usuário
 * @returns {Promise<Object>} Objeto com balance
 */
export async function getBalance(username) {
  console.log('[iGameWin] Buscando saldo do usuário:', username)
  
  const result = await makeRequest('/user/balance', 'GET', { username })
  
  const balance = result.balance !== undefined ? result.balance : (result.data?.balance || 0)
  
  // Converter de centavos para reais
  const balanceInReais = balance / 100
  
  console.log('[iGameWin] ✅ Saldo obtido:', balanceInReais)
  return {
    balance: balanceInReais,
    balance_cents: balance,
  }
}

export default {
  createUser,
  deposit,
  withdraw,
  launchGame,
  getProviderList,
  getGameList,
  getBalance,
  getIgamewinCredentials,
}

