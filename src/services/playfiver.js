import axios from 'axios'
import https from 'https'

// URL correta da API PlayFiver conforme documentação: https://api.playfivers.com/docs/api
const PLAYFIVER_HOST = 'api.playfivers.com'
const PLAYFIVER_URL = `https://${PLAYFIVER_HOST}/api/v2/game_launch`
const PLAYFIVER_GAMES_URL = `https://${PLAYFIVER_HOST}/api/v2/games`

/**
 * Estratégia 1: Tentar com IP direto (bypass SNI) - DESABILITADA
 * Nota: Esta estratégia causa erro "tlsv1 unrecognized name" porque o servidor
 * precisa do SNI correto. Vamos usar apenas hostname.
 */
const tryWithIP = async (ip, body) => {
  // Desabilitado - causa erro SSL
  return { success: false, error: 'IP direto desabilitado - usar hostname' }
}

/**
 * Estratégia: Tentar com hostname normal usando diferentes abordagens
 */
const tryWithHostname = async (body) => {
  // Tentar múltiplas configurações SSL para contornar o erro "unrecognized name"
  
  // Configuração 1: Sem SNI explícito e com configuração mais permissiva
  const agent1 = new https.Agent({
    rejectUnauthorized: false,
    minVersion: 'TLSv1',
    maxVersion: 'TLSv1.3',
    keepAlive: false,
    // Não especificar servername para evitar problemas de SNI
  })
  
  try {
    console.log('[PlayFiver] Tentativa 1: Sem SNI explícito...')
    const response = await axios.post(PLAYFIVER_URL, body, {
      httpsAgent: agent1,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      timeout: 8000, // 8 segundos (Vercel tem limite de 10s no plano gratuito)
      validateStatus: (status) => status < 500,
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
    })
    
    console.log('[PlayFiver] Resposta recebida - Status:', response.status)
    return { success: true, data: response.data }
  } catch (error1) {
    console.log('[PlayFiver] Tentativa 1 falhou:', error1.message)
    
    // Configuração 2: Com SNI explícito mas com TLS mais antigo
    // Pular curl no Vercel (não disponível)
    try {
      console.log('[PlayFiver] Tentativa 2: Com SNI e TLS 1.2 apenas...')
      
      const agent2 = new https.Agent({
        rejectUnauthorized: false,
        minVersion: 'TLSv1.2',
        maxVersion: 'TLSv1.3',
        servername: PLAYFIVER_HOST,
        keepAlive: false,
      })
      
      const response = await axios.post(PLAYFIVER_URL, body, {
        httpsAgent: agent2,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Host': PLAYFIVER_HOST,
        },
        timeout: 8000, // 8 segundos (Vercel tem limite de 10s no plano gratuito)
        validateStatus: (status) => status < 500,
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
      })
      
      console.log('[PlayFiver] Resposta recebida - Status:', response.status)
      return { success: true, data: response.data }
    } catch (error2) {
      console.log('[PlayFiver] Tentativa 2 falhou:', error2.message)
      
      // Retornar o último erro
      const errorMessage = error2.message || 'Erro desconhecido'
      const errorCode = error2.code || 'UNKNOWN'
      const errorResponse = error2.response ? {
        status: error2.response.status,
        statusText: error2.response.statusText,
        data: error2.response.data,
      } : null
      
      return { 
        success: false, 
        error: errorMessage,
        code: errorCode,
        response: errorResponse,
      }
    }
  }
}

/**
 * Lançar jogo no PlayFiver com múltiplas estratégias de fallback
 */
export const playFiverLaunch = async (gameId, userEmail, userBalance, credentials) => {
  const { playfiver_token, playfiver_secret, playfiver_code, game_original } = credentials

  if (!playfiver_token || !playfiver_secret) {
    throw new Error('Credenciais PlayFiver não configuradas')
  }

  // Montar body conforme documentação: https://api.playfivers.com/docs/api
  // Documentação: POST /api/v2/game_launch
  const body = {
    agentToken: playfiver_token,
    secretKey: playfiver_secret,
    user_code: userEmail,
    game_code: gameId,
    game_original: game_original !== undefined ? game_original : true, // Usar do banco ou true como padrão
    user_balance: parseFloat(userBalance).toFixed(2),
    lang: 'pt', // Português conforme documentação
    // user_rtp é opcional, pode ser adicionado se necessário
  }

  console.log('[PlayFiver] Tentando lançar jogo:', { gameId, userEmail, userBalance })

  // Tentar apenas com hostname (IP direto causa erro SSL)
  console.log('[PlayFiver] Tentando conexão com hostname...')
  const result = await tryWithHostname(body)
  
  if (result.success) {
    console.log('[PlayFiver] ✅ Sucesso!')
    // Verificar se a resposta tem dados válidos conforme documentação
    if (result.data) {
      // Verificar status da resposta (conforme documentação: status: true/false)
      if (result.data.status === false) {
        const errorMsg = result.data.msg || result.data.error || result.data.message || 'Erro desconhecido da API'
        console.error('[PlayFiver] API retornou erro:', errorMsg)
        throw new Error(`Erro da API PlayFiver: ${errorMsg}. Verifique as credenciais e o código do jogo.`)
      }
      
      // Verificar launch_url conforme documentação
      // Documentação: https://api.playfivers.com/docs/api
      // Resposta esperada: { "status": true, "msg": "SUCCESS", "launch_url": "https://games.playfivers.com/launch?token=..." }
      const launchUrl = result.data.launch_url
      if (launchUrl) {
        console.log('[PlayFiver] URL de lançamento obtida:', launchUrl.substring(0, 50) + '...')
        console.log('[PlayFiver] Resposta completa:', {
          status: result.data.status,
          msg: result.data.msg,
          user_balance: result.data.user_balance,
          user_created: result.data.user_created,
          name: result.data.name,
        })
        return result.data
      }
      
      // Se não tem launch_url, verificar se há mensagem de erro
      const errorMsg = result.data.msg || result.data.error || 'Resposta inválida da API'
      console.warn('[PlayFiver] Resposta recebida mas sem launch_url:', JSON.stringify(result.data).substring(0, 200))
      throw new Error(`Erro da API PlayFiver: ${errorMsg}. Verifique as credenciais e o código do jogo.`)
    }
  }
  
  // Tratamento de erros
  const errorMessage = result.error || 'Erro desconhecido'
  const errorCode = result.code || 'UNKNOWN'
  const errorResponse = result.response || null
  
  console.error('[PlayFiver] ❌ Falha na conexão')
  console.error('[PlayFiver] Erro:', errorMessage)
  console.error('[PlayFiver] Código:', errorCode)
  if (errorResponse) {
    console.error('[PlayFiver] Resposta HTTP:', errorResponse.status, errorResponse.statusText)
    console.error('[PlayFiver] Dados:', errorResponse.data)
  }
  
  // Se for erro de credenciais (401, 403)
  if (errorResponse && (errorResponse.status === 401 || errorResponse.status === 403)) {
    throw new Error(`Credenciais PlayFiver inválidas (${errorResponse.status}). Verifique o Agent Token e Agent Secret no painel admin.`)
  }
  
  // Se for erro SSL/TLS
  if (errorCode === 'EPROTO' || errorMessage.includes('SSL') || errorMessage.includes('TLS') || errorMessage.includes('certificate') || errorMessage.includes('unrecognized name')) {
    throw new Error(`Erro de conexão SSL com PlayFiver: ${errorMessage}. O servidor pode estar temporariamente indisponível.`)
  }
  
  // Erro genérico
  throw new Error(`Erro ao conectar com PlayFiver: ${errorMessage}`)
}

/**
 * Obter lista de jogos disponíveis da PlayFiver
 * Documentação: https://api.playfivers.com/docs/api
 * Endpoint: GET /api/v2/games
 */
export const getPlayFiverGames = async (credentials) => {
  const { playfiver_token, playfiver_secret } = credentials

  if (!playfiver_token || !playfiver_secret) {
    throw new Error('Credenciais PlayFiver não configuradas')
  }

  const agent = new https.Agent({
    rejectUnauthorized: false,
    minVersion: 'TLSv1.2',
    maxVersion: 'TLSv1.3',
    keepAlive: false,
  })

  try {
    console.log('[PlayFiver] Buscando lista de jogos disponíveis...')
    
    // Tentar com autenticação no body (conforme padrão da API)
    const response = await axios.post(PLAYFIVER_GAMES_URL, {
      agentToken: playfiver_token,
      secretKey: playfiver_secret,
    }, {
      httpsAgent: agent,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      timeout: 15000, // 15 segundos
      validateStatus: (status) => status < 500,
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
    })

    if (response.data && response.data.status === false) {
      const errorMsg = response.data.msg || response.data.error || 'Erro desconhecido'
      throw new Error(`Erro da API PlayFiver: ${errorMsg}`)
    }

    if (response.data && response.data.games) {
      console.log(`[PlayFiver] ✅ Lista de jogos obtida: ${response.data.games.length} jogos`)
      return response.data.games
    }

    // Tentar formato alternativo (se games estiver no root)
    if (Array.isArray(response.data)) {
      console.log(`[PlayFiver] ✅ Lista de jogos obtida: ${response.data.length} jogos`)
      return response.data
    }

    throw new Error('Formato de resposta inesperado da API PlayFiver')
  } catch (error) {
    console.error('[PlayFiver] ❌ Erro ao buscar lista de jogos:', error.message)
    
    // Se for erro de autenticação, tentar GET sem body
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      try {
        console.log('[PlayFiver] Tentando GET com token no header...')
        const getResponse = await axios.get(PLAYFIVER_GAMES_URL, {
          httpsAgent: agent,
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${playfiver_token}`,
            'X-Agent-Token': playfiver_token,
            'X-Secret-Key': playfiver_secret,
          },
          timeout: 15000,
          validateStatus: (status) => status < 500,
        })

        if (getResponse.data && getResponse.data.games) {
          console.log(`[PlayFiver] ✅ Lista de jogos obtida (GET): ${getResponse.data.games.length} jogos`)
          return getResponse.data.games
        }
      } catch (getError) {
        console.error('[PlayFiver] ❌ Erro ao buscar com GET:', getError.message)
      }
    }

    throw error
  }
}

/**
 * Obter saldo do PlayFiver (webhook Balance)
 */
export const getBalancePlayFiver = async (userEmail) => {
  // Esta função é chamada pelo webhook
  // O saldo é calculado no backend, não precisa chamar API externa
  return null
}
