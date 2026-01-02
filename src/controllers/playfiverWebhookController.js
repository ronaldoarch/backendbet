import pool from '../config/database.js'

/**
 * Webhook Controller para PlayFiver
 * Processa callbacks de apostas, ganhos e consultas de saldo
 * 
 * Tipos de webhook:
 * - Balance: Consulta de saldo
 * - WinBet: Aposta/Ganho
 * - Refund: Reembolso
 */

/**
 * GET /playfiver/callback ou POST /playfiver/callback
 * Webhook principal do PlayFiver
 */
export const callback = async (req, res) => {
  try {
    const webhookData = req.body
    const webhookType = webhookData.type

    console.log('[Webhook PlayFiver] Webhook recebido:', {
      type: webhookType,
      user_code: webhookData.user_code,
      agent_code: webhookData.agent_code,
    })

    // Validar credenciais
    const { agent_code, agent_secret } = webhookData
    
    // Buscar credenciais do banco
    const [keys] = await pool.execute(
      'SELECT playfiver_code, playfiver_secret FROM games_keys LIMIT 1'
    )

    if (!keys || keys.length === 0) {
      console.error('[Webhook PlayFiver] Credenciais não configuradas')
      return res.status(500).json({
        msg: 'INVALID_CONFIG',
        balance: 0
      })
    }

    const storedCode = keys[0].playfiver_code
    const storedSecret = keys[0].playfiver_secret

    // Validar credenciais
    if (agent_code !== storedCode || agent_secret !== storedSecret) {
      console.warn('[Webhook PlayFiver] Credenciais inválidas:', {
        received_code: agent_code,
        received_secret: agent_secret ? agent_secret.substring(0, 10) + '...' : 'vazio',
        ip: req.ip,
      })
      return res.status(401).json({
        msg: 'UNAUTHORIZED',
        balance: 0
      })
    }

    // Processar conforme tipo
    switch (webhookType) {
      case 'Balance':
        return await handleBalance(req, res, webhookData)
      
      case 'WinBet':
        return await handleWinBet(req, res, webhookData)
      
      case 'Refund':
        return await handleRefund(req, res, webhookData)
      
      default:
        console.warn('[Webhook PlayFiver] Tipo desconhecido:', webhookType)
        return res.status(400).json({
          msg: 'INVALID_TYPE',
          balance: 0
        })
    }
  } catch (error) {
    console.error('[Webhook PlayFiver] Erro ao processar webhook:', error)
    return res.status(500).json({
      msg: 'ERROR',
      balance: 0
    })
  }
}

/**
 * Balance: Consulta de saldo
 */
async function handleBalance(req, res, data) {
  try {
    const userEmail = data.user_code

    // Buscar usuário
    const [users] = await pool.execute(
      'SELECT id FROM users WHERE email = ?',
      [userEmail]
    )

    if (!users || users.length === 0) {
      console.warn('[Webhook PlayFiver] Usuário não encontrado:', userEmail)
      return res.json({
        msg: 'INVALID_USER',
        balance: 0
      })
    }

    // Buscar carteira
    const [wallets] = await pool.execute(
      'SELECT balance, balance_bonus, balance_withdrawal FROM wallets WHERE user_id = ?',
      [users[0].id]
    )

    if (!wallets || wallets.length === 0) {
      console.warn('[Webhook PlayFiver] Carteira não encontrada para:', userEmail)
      return res.json({
        msg: 'INVALID_USER',
        balance: 0
      })
    }

    const wallet = wallets[0]
    const totalBalance = parseFloat(wallet.balance || 0) + 
                        parseFloat(wallet.balance_bonus || 0) + 
                        parseFloat(wallet.balance_withdrawal || 0)

    console.log('[Webhook PlayFiver] Balance consultado:', {
      user: userEmail,
      balance: totalBalance.toFixed(2)
    })

    return res.json({
      msg: '',
      balance: totalBalance.toFixed(2)
    })
  } catch (error) {
    console.error('[Webhook PlayFiver] Erro ao processar Balance:', error)
    return res.status(500).json({
      msg: 'ERROR',
      balance: 0
    })
  }
}

/**
 * WinBet: Aposta/Ganho
 */
async function handleWinBet(req, res, data) {
  try {
    const userEmail = data.user_code
    const gameType = data.game_type || 'slot' // slot, live, etc
    
    // Obter detalhes do jogo
    const gameDetails = data[gameType]
    if (!gameDetails) {
      console.error('[Webhook PlayFiver] Detalhes do jogo não encontrados')
      return res.status(400).json({
        msg: 'INVALID_DATA',
        balance: 0
      })
    }

    const roundId = gameDetails.round_id
    const txnId = gameDetails.txn_id || roundId
    const bet = parseFloat(gameDetails.bet || 0)
    const win = parseFloat(gameDetails.win || 0)
    const gameCode = gameDetails.game_code

    console.log('[Webhook PlayFiver] WinBet recebido:', {
      user: userEmail,
      round_id: roundId,
      bet,
      win,
      game_code: gameCode
    })

    // Buscar usuário
    const [users] = await pool.execute(
      'SELECT id FROM users WHERE email = ?',
      [userEmail]
    )

    if (!users || users.length === 0) {
      console.warn('[Webhook PlayFiver] Usuário não encontrado:', userEmail)
      return res.json({
        msg: 'INVALID_USER',
        balance: 0
      })
    }

    const userId = users[0].id

    // Verificar se já processou esta transação (idempotência)
    const [existingOrders] = await pool.execute(
      'SELECT id FROM orders WHERE round_id = ?',
      [roundId]
    )

    if (existingOrders && existingOrders.length > 0) {
      console.log('[Webhook PlayFiver] Transação já processada:', roundId)
      
      // Retornar saldo atual
      const [wallets] = await pool.execute(
        'SELECT balance, balance_bonus, balance_withdrawal FROM wallets WHERE user_id = ?',
        [userId]
      )
      
      if (wallets && wallets.length > 0) {
        const wallet = wallets[0]
        const totalBalance = parseFloat(wallet.balance || 0) + 
                            parseFloat(wallet.balance_bonus || 0) + 
                            parseFloat(wallet.balance_withdrawal || 0)
        
        return res.json({
          msg: '',
          balance: totalBalance.toFixed(2)
        })
      }
    }

    // Buscar carteira
    const [wallets] = await pool.execute(
      'SELECT balance, balance_bonus, balance_withdrawal FROM wallets WHERE user_id = ?',
      [userId]
    )

    if (!wallets || wallets.length === 0) {
      console.warn('[Webhook PlayFiver] Carteira não encontrada')
      return res.json({
        msg: 'INVALID_USER',
        balance: 0
      })
    }

    const wallet = wallets[0]

    // Processar aposta e ganho
    // 1. Deduzir aposta (primeiro de balance_bonus, depois balance, depois balance_withdrawal)
    let remainingBet = bet
    
    if (remainingBet > 0 && parseFloat(wallet.balance_bonus || 0) > 0) {
      const bonusDeduction = Math.min(remainingBet, parseFloat(wallet.balance_bonus || 0))
      await pool.execute(
        'UPDATE wallets SET balance_bonus = balance_bonus - ? WHERE user_id = ?',
        [bonusDeduction, userId]
      )
      remainingBet -= bonusDeduction
    }

    if (remainingBet > 0 && parseFloat(wallet.balance || 0) > 0) {
      const balanceDeduction = Math.min(remainingBet, parseFloat(wallet.balance || 0))
      await pool.execute(
        'UPDATE wallets SET balance = balance - ? WHERE user_id = ?',
        [balanceDeduction, userId]
      )
      remainingBet -= balanceDeduction
    }

    if (remainingBet > 0 && parseFloat(wallet.balance_withdrawal || 0) > 0) {
      await pool.execute(
        'UPDATE wallets SET balance_withdrawal = balance_withdrawal - ? WHERE user_id = ?',
        [remainingBet, userId]
      )
    }

    // 2. Adicionar ganho em balance_withdrawal
    if (win > 0) {
      await pool.execute(
        'UPDATE wallets SET balance_withdrawal = balance_withdrawal + ? WHERE user_id = ?',
        [win, userId]
      )
    }

    // 3. Registrar transação
    await pool.execute(
      `INSERT INTO orders (
        user_id, round_id, txn_id, game_code, game_type,
        bet, win, status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 'completed', NOW())`,
      [userId, roundId, txnId, gameCode, gameType, bet, win]
    )

    // 4. Retornar saldo atualizado
    const [updatedWallets] = await pool.execute(
      'SELECT balance, balance_bonus, balance_withdrawal FROM wallets WHERE user_id = ?',
      [userId]
    )

    const updatedWallet = updatedWallets[0]
    const totalBalance = parseFloat(updatedWallet.balance || 0) + 
                        parseFloat(updatedWallet.balance_bonus || 0) + 
                        parseFloat(updatedWallet.balance_withdrawal || 0)

    console.log('[Webhook PlayFiver] WinBet processado:', {
      user: userEmail,
      round_id: roundId,
      bet,
      win,
      balance: totalBalance.toFixed(2)
    })

    return res.json({
      msg: '',
      balance: totalBalance.toFixed(2)
    })
  } catch (error) {
    console.error('[Webhook PlayFiver] Erro ao processar WinBet:', error)
    return res.status(500).json({
      msg: 'ERROR',
      balance: 0
    })
  }
}

/**
 * Refund: Reembolso
 */
async function handleRefund(req, res, data) {
  try {
    const userEmail = data.user_code
    const gameType = data.game_type || 'slot'
    
    const gameDetails = data[gameType]
    if (!gameDetails) {
      return res.status(400).json({
        msg: 'INVALID_DATA',
        balance: 0
      })
    }

    const roundId = gameDetails.round_id
    const refundAmount = parseFloat(gameDetails.win || 0)

    console.log('[Webhook PlayFiver] Refund recebido:', {
      user: userEmail,
      round_id: roundId,
      amount: refundAmount
    })

    // Buscar usuário
    const [users] = await pool.execute(
      'SELECT id FROM users WHERE email = ?',
      [userEmail]
    )

    if (!users || users.length === 0) {
      return res.json({
        msg: 'INVALID_USER',
        balance: 0
      })
    }

    const userId = users[0].id

    // Marcar ordem como reembolsada
    await pool.execute(
      'UPDATE orders SET refunded = 1 WHERE round_id = ?',
      [roundId]
    )

    // Adicionar reembolso em balance_withdrawal
    if (refundAmount > 0) {
      await pool.execute(
        'UPDATE wallets SET balance_withdrawal = balance_withdrawal + ? WHERE user_id = ?',
        [refundAmount, userId]
      )
    }

    // Retornar saldo atualizado
    const [wallets] = await pool.execute(
      'SELECT balance, balance_bonus, balance_withdrawal FROM wallets WHERE user_id = ?',
      [userId]
    )

    const wallet = wallets[0]
    const totalBalance = parseFloat(wallet.balance || 0) + 
                        parseFloat(wallet.balance_bonus || 0) + 
                        parseFloat(wallet.balance_withdrawal || 0)

    return res.json({
      msg: '',
      balance: totalBalance.toFixed(2)
    })
  } catch (error) {
    console.error('[Webhook PlayFiver] Erro ao processar Refund:', error)
    return res.status(500).json({
      msg: 'ERROR',
      balance: 0
    })
  }
}

export default {
  callback,
}

