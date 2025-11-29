import axios from 'axios'
import https from 'https'

// URL correta da API PlayFiver conforme documentação: https://api.playfivers.com/docs/api
const PLAYFIVER_HOST = 'api.playfivers.com'
const PLAYFIVER_URL = `https://${PLAYFIVER_HOST}/api/v2/game_launch`

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
      timeout: 60000,
      validateStatus: (status) => status < 500,
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
    })
    
    console.log('[PlayFiver] Resposta recebida - Status:', response.status)
    return { success: true, data: response.data }
  } catch (error1) {
    console.log('[PlayFiver] Tentativa 1 falhou:', error1.message)
    
    // Configuração 2: Usar fetch nativo do Node.js (se disponível) ou curl via child_process
    try {
      console.log('[PlayFiver] Tentativa 2: Usando curl via child_process...')
      const { exec } = await import('child_process')
      const { promisify } = await import('util')
      const execAsync = promisify(exec)
      
      const curlCommand = `curl -X POST "${PLAYFIVER_URL}" \\
        -H "Content-Type: application/json" \\
        -H "Accept: application/json" \\
        -d '${JSON.stringify(body).replace(/'/g, "'\\''")}' \\
        --insecure \\
        --max-time 60 \\
        --silent \\
        --show-error \\
        -w "\\n%{http_code}" 2>&1`
      
      const { stdout, stderr } = await execAsync(curlCommand, {
        maxBuffer: 10 * 1024 * 1024, // 10MB
      })
      
      // Parse resposta do curl
      const lines = stdout.trim().split('\n')
      const httpCode = parseInt(lines[lines.length - 1])
      const responseBody = lines.slice(0, -1).join('\n')
      
      if (httpCode >= 200 && httpCode < 500) {
        try {
          const data = JSON.parse(responseBody)
          console.log('[PlayFiver] Resposta recebida via curl - Status:', httpCode)
          return { success: true, data }
        } catch (parseError) {
          console.log('[PlayFiver] Erro ao parsear resposta do curl:', parseError.message)
        }
      }
      
      throw new Error(`curl retornou código ${httpCode}`)
    } catch (error2) {
      console.log('[PlayFiver] Tentativa 2 (curl) falhou:', error2.message)
      
      // Configuração 3: Com SNI explícito mas com TLS mais antigo
      const agent3 = new https.Agent({
        rejectUnauthorized: false,
        minVersion: 'TLSv1',
        maxVersion: 'TLSv1.2', // Tentar apenas TLS 1.2
        servername: PLAYFIVER_HOST,
        keepAlive: false,
      })
      
      try {
        console.log('[PlayFiver] Tentativa 3: Com SNI e TLS 1.2 apenas...')
        const response = await axios.post(PLAYFIVER_URL, body, {
          httpsAgent: agent3,
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Host': PLAYFIVER_HOST,
          },
          timeout: 60000,
          validateStatus: (status) => status < 500,
          maxContentLength: Infinity,
          maxBodyLength: Infinity,
        })
        
        console.log('[PlayFiver] Resposta recebida - Status:', response.status)
        return { success: true, data: response.data }
      } catch (error3) {
        console.log('[PlayFiver] Tentativa 3 falhou:', error3.message)
        
        // Retornar o último erro
        const errorMessage = error3.message || 'Erro desconhecido'
        const errorCode = error3.code || 'UNKNOWN'
        const errorResponse = error3.response ? {
          status: error3.response.status,
          statusText: error3.response.statusText,
          data: error3.response.data,
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
}

/**
 * Lançar jogo no PlayFiver com múltiplas estratégias de fallback
 */
export const playFiverLaunch = async (gameId, userEmail, userBalance, credentials) => {
  const { playfiver_token, playfiver_secret, playfiver_code } = credentials

  if (!playfiver_token || !playfiver_secret) {
    throw new Error('Credenciais PlayFiver não configuradas')
  }

  const body = {
    agentToken: playfiver_token,
    secretKey: playfiver_secret,
    user_code: userEmail,
    game_code: gameId,
    game_original: true,
    user_balance: parseFloat(userBalance).toFixed(2),
  }

  console.log('[PlayFiver] Tentando lançar jogo:', { gameId, userEmail, userBalance })

  // Tentar apenas com hostname (IP direto causa erro SSL)
  console.log('[PlayFiver] Tentando conexão com hostname...')
  const result = await tryWithHostname(body)
  
  if (result.success) {
    console.log('[PlayFiver] ✅ Sucesso!')
    // Verificar se a resposta tem dados válidos
    if (result.data) {
      // Verificar diferentes formatos de resposta
      const launchUrl = result.data.launch_url || result.data.url || result.data.game_url
      if (launchUrl) {
        console.log('[PlayFiver] URL de lançamento obtida:', launchUrl.substring(0, 50) + '...')
        return result.data
      }
      
      // Se não tem URL mas tem status de sucesso, pode ser erro de credenciais
      if (result.data.status === false || result.data.error) {
        const errorMsg = result.data.error || result.data.message || 'Erro desconhecido da API'
        console.error('[PlayFiver] API retornou erro:', errorMsg)
        throw new Error(`Erro da API PlayFiver: ${errorMsg}. Verifique as credenciais.`)
      }
      
      console.warn('[PlayFiver] Resposta recebida mas sem URL de lançamento:', JSON.stringify(result.data).substring(0, 200))
      throw new Error('Resposta da API PlayFiver não contém URL de lançamento. Verifique as credenciais e o código do jogo.')
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
 * Obter saldo do PlayFiver (webhook Balance)
 */
export const getBalancePlayFiver = async (userEmail) => {
  // Esta função é chamada pelo webhook
  // O saldo é calculado no backend, não precisa chamar API externa
  return null
}
