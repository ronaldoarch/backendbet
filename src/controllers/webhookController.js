import pool from '../config/database.js'

/**
 * POST /api/playfiver/webhook
 * Webhook para receber callbacks da PlayFiver
 */
export const playfiverWebhook = async (req, res) => {
  try {
    const { type, user_code, agent_secret, agent_code, slot } = req.body

    console.log('[Webhook PlayFiver] Recebido:', { type, user_code })

    // Buscar usuário por email
    const [users] = await pool.execute(
      'SELECT id FROM users WHERE email = ?',
      [user_code]
    )

    if (!users || users.length === 0) {
      return res.status(404).json({
        msg: 'User not found',
      })
    }

    const userId = users[0].id

    // Buscar carteira
    const [wallets] = await pool.execute(
      'SELECT * FROM wallets WHERE user_id = ?',
      [userId]
    )

    if (!wallets || wallets.length === 0) {
      return res.status(404).json({
        msg: 'Wallet not found',
      })
    }

    const wallet = wallets[0]

    // Tipo: Balance (Consulta de Saldo)
    if (type === 'Balance') {
      const totalBalance = parseFloat(wallet.balance || 0) + 
                          parseFloat(wallet.balance_bonus || 0) + 
                          parseFloat(wallet.balance_withdrawal || 0)

      return res.json({
        msg: '',
        balance: totalBalance.toFixed(2),
      })
    }

    // Tipo: WinBet (Aposta/Ganho)
    if (type === 'WinBet') {
      // Validar credenciais
      const [keys] = await pool.execute(
        'SELECT playfiver_secret, playfiver_code FROM games_keys LIMIT 1'
      )

      if (!keys || keys.length === 0) {
        return res.status(401).json({
          msg: 'Invalid credentials',
        })
      }

      const { playfiver_secret, playfiver_code } = keys[0]

      if (agent_secret !== playfiver_secret || agent_code !== playfiver_code) {
        return res.status(401).json({
          msg: 'Invalid credentials',
        })
      }

      if (!slot || !slot.round_id || !slot.txn_id) {
        return res.status(400).json({
          msg: 'Invalid request data',
        })
      }

      const { round_id, txn_id, game_code, bet, win } = slot
      const betAmount = parseFloat(bet || 0)
      const winAmount = parseFloat(win || 0)

      // Verificar se transação já foi processada
      const [existingOrders] = await pool.execute(
        'SELECT id FROM orders WHERE transaction_id = ?',
        [txn_id]
      )

      if (existingOrders && existingOrders.length > 0) {
        // Transação já processada, retornar saldo atual
        const totalBalance = parseFloat(wallet.balance || 0) + 
                            parseFloat(wallet.balance_bonus || 0) + 
                            parseFloat(wallet.balance_withdrawal || 0)
        return res.json({
          msg: '',
          balance: totalBalance.toFixed(2),
        })
      }

      // Calcular saldo anterior
      const previousBalance = parseFloat(wallet.balance || 0) + 
                             parseFloat(wallet.balance_bonus || 0) + 
                             parseFloat(wallet.balance_withdrawal || 0)

      // Processar aposta/ganho
      let newBalance = wallet.balance
      let newBalanceBonus = wallet.balance_bonus
      let newBalanceWithdrawal = wallet.balance_withdrawal
      let typeMoney = 'balance'

      // Se win == 0, é apenas uma aposta
      if (winAmount === 0) {
        // Deduzir aposta
        if (newBalanceBonus >= betAmount) {
          newBalanceBonus -= betAmount
          typeMoney = 'balance_bonus'
        } else if (newBalance >= betAmount) {
          newBalance -= betAmount
          typeMoney = 'balance'
        } else if (newBalanceWithdrawal >= betAmount) {
          newBalanceWithdrawal -= betAmount
          typeMoney = 'balance_withdrawal'
        } else {
          return res.json({
            msg: 'INSUFFICIENT_USER_FUNDS',
          })
        }
      } else {
        // É um ganho: deduzir aposta e adicionar ganho
        // Primeiro deduzir aposta
        if (newBalanceBonus >= betAmount) {
          newBalanceBonus -= betAmount
          typeMoney = 'balance_bonus'
        } else if (newBalance >= betAmount) {
          newBalance -= betAmount
          typeMoney = 'balance'
        } else if (newBalanceWithdrawal >= betAmount) {
          newBalanceWithdrawal -= betAmount
          typeMoney = 'balance_withdrawal'
        } else {
          return res.json({
            msg: 'INSUFFICIENT_USER_FUNDS',
          })
        }

        // Adicionar ganho ao balance_withdrawal
        newBalanceWithdrawal += winAmount
      }

      // Atualizar carteira
      await pool.execute(
        `UPDATE wallets 
         SET balance = ?, balance_bonus = ?, balance_withdrawal = ?, updated_at = NOW()
         WHERE user_id = ?`,
        [newBalance, newBalanceBonus, newBalanceWithdrawal, userId]
      )

      // Criar registro em orders
      await pool.execute(
        `INSERT INTO orders 
         (user_id, transaction_id, game, type, type_money, amount, providers, round_id, status, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, NOW(), NOW())`,
        [
          userId,
          txn_id,
          game_code || 'unknown',
          winAmount > 0 ? 'win' : 'bet',
          typeMoney,
          winAmount > 0 ? winAmount : betAmount,
          'playfiver',
          round_id,
        ]
      )

      // Invalidar cache
      const { cache } = await import('../config/redis.js')
      await cache.clear('api.*')

      const totalBalance = newBalance + newBalanceBonus + newBalanceWithdrawal

      console.log('[Webhook PlayFiver] WinBet processado:', {
        user_code,
        round_id,
        bet: betAmount,
        win: winAmount,
        balance: totalBalance,
      })

      res.json({
        msg: '',
        balance: totalBalance.toFixed(2),
      })
    }

    // Tipo: Refund (Reembolso)
    if (type === 'Refund') {
      if (!slot || !slot.round_id) {
        return res.status(400).json({
          msg: 'Invalid request data',
        })
      }

      const { round_id, win } = slot
      const refundAmount = parseFloat(win || 0)

      // Buscar ordem
      const [orders] = await pool.execute(
        'SELECT * FROM orders WHERE round_id = ? AND user_id = ?',
        [round_id, userId]
      )

      if (!orders || orders.length === 0) {
        return res.status(404).json({
          msg: 'Order not found',
        })
      }

      const order = orders[0]

      if (order.refunded) {
        // Já foi reembolsado, retornar saldo atual
        const totalBalance = parseFloat(wallet.balance || 0) + 
                            parseFloat(wallet.balance_bonus || 0) + 
                            parseFloat(wallet.balance_withdrawal || 0)
        return res.json({
          msg: '',
          balance: totalBalance.toFixed(2),
        })
      }

      // Marcar como reembolsado
      await pool.execute(
        'UPDATE orders SET refunded = 1, updated_at = NOW() WHERE id = ?',
        [order.id]
      )

      // Adicionar ao balance_withdrawal
      const newBalanceWithdrawal = parseFloat(wallet.balance_withdrawal || 0) + refundAmount

      await pool.execute(
        `UPDATE wallets 
         SET balance_withdrawal = ?, updated_at = NOW()
         WHERE user_id = ?`,
        [newBalanceWithdrawal, userId]
      )

      // Invalidar cache
      const { cache } = await import('../config/redis.js')
      await cache.clear('api.*')

      const totalBalance = parseFloat(wallet.balance || 0) + 
                          parseFloat(wallet.balance_bonus || 0) + 
                          newBalanceWithdrawal

      console.log('[Webhook PlayFiver] Refund processado:', {
        user_code,
        round_id,
        refund: refundAmount,
        balance: totalBalance,
      })

      res.json({
        msg: '',
        balance: totalBalance.toFixed(2),
      })
    }

    // Tipo desconhecido
    res.status(400).json({
      msg: 'Unknown type',
    })
  } catch (error) {
    console.error('[Webhook PlayFiver] Erro:', error)
    res.status(500).json({
      msg: 'Internal server error',
    })
  }
}


