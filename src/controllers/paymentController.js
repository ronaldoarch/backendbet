import pool from '../config/database.js'
import arkamaService from '../services/arkama.js'

/**
 * POST /api/payments/deposit
 * Criar um depósito via Arkama
 */
export const createDeposit = async (req, res) => {
  try {
    const userId = req.user.id
    const { amount, description } = req.body

    // Validações
    if (!amount || amount <= 0) {
      return res.status(400).json({
        error: 'Valor inválido',
        status: false,
      })
    }

    if (amount < 10) {
      return res.status(400).json({
        error: 'Valor mínimo de depósito é R$ 10,00',
        status: false,
      })
    }

    // Buscar usuário
    const [users] = await pool.execute(
      'SELECT id, email, name FROM users WHERE id = ?',
      [userId]
    )

    if (!users || users.length === 0) {
      return res.status(404).json({
        error: 'Usuário não encontrado',
        status: false,
      })
    }

    const user = users[0]

    // URL base do backend
    const baseUrl = process.env.APP_URL || 
                   process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 
                   'https://qoo8wgogo4ow4gsg0k0wk4g4.agenciamidas.com'

    // Criar compra na Arkama
    const arkamaResponse = await arkamaService.createOrder({
      amount: parseFloat(amount).toFixed(2),
      user_email: user.email,
      user_name: user.name || user.email,
      description: description || `Depósito de R$ ${amount.toFixed(2)}`,
      callback_url: `${baseUrl}/api/payments/arkama-webhook`,
      return_url: `${baseUrl}/wallet?payment=success`,
    })

    if (!arkamaResponse.success) {
      return res.status(500).json({
        error: 'Erro ao criar pagamento',
        details: arkamaResponse.error,
        status: false,
      })
    }

    const orderData = arkamaResponse.data

    // Criar registro de transação pendente
    const [result] = await pool.execute(
      `INSERT INTO transactions 
       (user_id, type, amount, status, payment_method, payment_id, payment_data, created_at, updated_at)
       VALUES (?, 'deposit', ?, 'pending', 'arkama', ?, ?, NOW(), NOW())`,
      [
        userId,
        amount,
        orderData.id || orderData.order_id,
        JSON.stringify(orderData),
      ]
    )

    const transactionId = result.insertId

    // Retornar URL de pagamento
    res.json({
      success: true,
      transaction_id: transactionId,
      payment_url: orderData.payment_url || orderData.url,
      order_id: orderData.id || orderData.order_id,
      status: orderData.status,
      message: 'Pagamento criado com sucesso. Redirecione o usuário para a URL de pagamento.',
    })
  } catch (error) {
    console.error('[PaymentController] Erro ao criar depósito:', error)
    res.status(500).json({
      error: 'Erro ao processar depósito',
      status: false,
    })
  }
}

/**
 * POST /api/payments/arkama-webhook
 * Webhook para receber notificações da Arkama
 */
export const arkamaWebhook = async (req, res) => {
  try {
    const webhookData = req.body

    console.log('[PaymentController] Webhook Arkama recebido:', {
      order_id: webhookData.id || webhookData.order_id,
      status: webhookData.status,
    })

    // Buscar transação pelo payment_id
    const orderId = webhookData.id || webhookData.order_id
    const [transactions] = await pool.execute(
      'SELECT * FROM transactions WHERE payment_id = ?',
      [orderId]
    )

    if (!transactions || transactions.length === 0) {
      console.warn('[PaymentController] Transação não encontrada:', orderId)
      return res.status(404).json({
        error: 'Transação não encontrada',
      })
    }

    const transaction = transactions[0]

    // Se já foi processada, retornar sucesso
    if (transaction.status === 'completed') {
      return res.json({
        success: true,
        message: 'Transação já processada',
      })
    }

    // Processar conforme status
    const status = webhookData.status?.toLowerCase()

    if (status === 'paid' || status === 'approved' || status === 'completed') {
      // Pagamento aprovado - creditar na carteira
      const [wallets] = await pool.execute(
        'SELECT * FROM wallets WHERE user_id = ?',
        [transaction.user_id]
      )

      if (wallets && wallets.length > 0) {
        const wallet = wallets[0]
        const newBalance = parseFloat(wallet.balance || 0) + parseFloat(transaction.amount)

        await pool.execute(
          `UPDATE wallets 
           SET balance = ?, updated_at = NOW()
           WHERE user_id = ?`,
          [newBalance, transaction.user_id]
        )

        // Atualizar transação
        await pool.execute(
          `UPDATE transactions 
           SET status = 'completed', updated_at = NOW()
           WHERE id = ?`,
          [transaction.id]
        )

        console.log('[PaymentController] Depósito processado:', {
          user_id: transaction.user_id,
          amount: transaction.amount,
          new_balance: newBalance,
        })
      }
    } else if (status === 'cancelled' || status === 'refunded' || status === 'failed') {
      // Pagamento cancelado/falhou
      await pool.execute(
        `UPDATE transactions 
         SET status = 'failed', updated_at = NOW()
         WHERE id = ?`,
        [transaction.id]
      )

      console.log('[PaymentController] Depósito cancelado/falhou:', {
        transaction_id: transaction.id,
        status,
      })
    }

    res.json({
      success: true,
      message: 'Webhook processado',
    })
  } catch (error) {
    console.error('[PaymentController] Erro ao processar webhook:', error)
    res.status(500).json({
      error: 'Erro ao processar webhook',
    })
  }
}

/**
 * GET /api/payments/status/:transactionId
 * Verificar status de uma transação
 */
export const getTransactionStatus = async (req, res) => {
  try {
    const userId = req.user.id
    const { transactionId } = req.params

    const [transactions] = await pool.execute(
      'SELECT * FROM transactions WHERE id = ? AND user_id = ?',
      [transactionId, userId]
    )

    if (!transactions || transactions.length === 0) {
      return res.status(404).json({
        error: 'Transação não encontrada',
        status: false,
      })
    }

    const transaction = transactions[0]

    // Se tiver payment_id, buscar status atualizado na Arkama
    if (transaction.payment_id && transaction.status === 'pending') {
      const arkamaResponse = await arkamaService.getOrder(transaction.payment_id)
      
      if (arkamaResponse.success) {
        const orderData = arkamaResponse.data
        const status = orderData.status?.toLowerCase()

        // Atualizar status se mudou
        if (status === 'paid' || status === 'approved' || status === 'completed') {
          // Processar pagamento (mesma lógica do webhook)
          const [wallets] = await pool.execute(
            'SELECT * FROM wallets WHERE user_id = ?',
            [userId]
          )

          if (wallets && wallets.length > 0 && transaction.status === 'pending') {
            const wallet = wallets[0]
            const newBalance = parseFloat(wallet.balance || 0) + parseFloat(transaction.amount)

            await pool.execute(
              `UPDATE wallets 
               SET balance = ?, updated_at = NOW()
               WHERE user_id = ?`,
              [newBalance, userId]
            )

            await pool.execute(
              `UPDATE transactions 
               SET status = 'completed', updated_at = NOW()
               WHERE id = ?`,
              [transaction.id]
            )
          }
        }
      }
    }

    // Buscar transação atualizada
    const [updatedTransactions] = await pool.execute(
      'SELECT * FROM transactions WHERE id = ?',
      [transactionId]
    )

    res.json({
      transaction: updatedTransactions[0],
      status: true,
    })
  } catch (error) {
    console.error('[PaymentController] Erro ao buscar status:', error)
    res.status(500).json({
      error: 'Erro ao buscar status da transação',
      status: false,
    })
  }
}

/**
 * GET /api/payments/history
 * Histórico de transações do usuário
 */
export const getTransactionHistory = async (req, res) => {
  try {
    const userId = req.user.id
    const { page = 1, limit = 20 } = req.query

    const offset = (parseInt(page) - 1) * parseInt(limit)

    const [transactions] = await pool.execute(
      `SELECT * FROM transactions 
       WHERE user_id = ? 
       ORDER BY created_at DESC 
       LIMIT ? OFFSET ?`,
      [userId, parseInt(limit), offset]
    )

    const [countResult] = await pool.execute(
      'SELECT COUNT(*) as total FROM transactions WHERE user_id = ?',
      [userId]
    )

    const total = countResult[0].total

    res.json({
      transactions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        total_pages: Math.ceil(total / parseInt(limit)),
      },
      status: true,
    })
  } catch (error) {
    console.error('[PaymentController] Erro ao buscar histórico:', error)
    res.status(500).json({
      error: 'Erro ao buscar histórico',
      status: false,
    })
  }
}

