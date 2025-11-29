import pool from '../config/database.js'
import arkamaService from '../services/arkama.js'

/**
 * POST /api/payments/deposit
 * Criar um depósito via Arkama
 */
export const createDeposit = async (req, res) => {
  try {
    console.log('[PaymentController] Criando depósito:', {
      user: req.user,
      body: req.body,
    })

    // Verificar autenticação
    if (!req.user || !req.user.id) {
      console.error('[PaymentController] Usuário não autenticado')
      return res.status(401).json({
        error: 'Usuário não autenticado',
        status: false,
      })
    }

    const userId = req.user.id
    const { amount, description, gateway } = req.body

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
    console.log('[PaymentController] Chamando Arkama API...')
    const arkamaResponse = await arkamaService.createOrder({
      amount: parseFloat(amount).toFixed(2),
      user_email: user.email,
      user_name: user.name || user.email,
      description: description || `Depósito de R$ ${amount.toFixed(2)}`,
      callback_url: `${baseUrl}/api/payments/arkama-webhook`,
      return_url: `${baseUrl}/wallet?payment=success`,
    })

    console.log('[PaymentController] Resposta da Arkama:', {
      success: arkamaResponse.success,
      hasData: !!arkamaResponse.data,
      error: arkamaResponse.error,
    })

    if (!arkamaResponse.success) {
      console.error('[PaymentController] Erro na Arkama:', arkamaResponse.error)
      return res.status(500).json({
        error: 'Erro ao criar pagamento',
        message: arkamaResponse.error || 'Erro desconhecido',
        details: arkamaResponse.details,
        status: false,
      })
    }

    const orderData = arkamaResponse.data

    // Criar registro de transação pendente
    console.log('[PaymentController] Criando registro de transação...')
    const [result] = await pool.execute(
      `INSERT INTO transactions 
       (user_id, type, amount, currency, gateway, status, payment_id, description, metadata, created_at, updated_at)
       VALUES (?, 'deposit', ?, 'BRL', 'arkama', 'pending', ?, ?, ?, NOW(), NOW())`,
      [
        userId,
        amount,
        orderData.id || orderData.order_id,
        description || `Depósito de R$ ${amount.toFixed(2)}`,
        JSON.stringify(orderData),
      ]
    )

    const transactionId = result.insertId

    // Extrair dados do PIX da resposta da Arkama
    // A Arkama pode retornar: qr_code, pix_code, qr_code_base64, pix_copia_cola, etc.
    const qrCode = orderData.qr_code || 
                   orderData.qr_code_base64 || 
                   orderData.qrcode || 
                   orderData.qrCode ||
                   orderData.pix?.qr_code ||
                   orderData.pix?.qr_code_base64 ||
                   null

    const pixCode = orderData.pix_code || 
                    orderData.pix_copia_cola || 
                    orderData.pixCode ||
                    orderData.pix?.pix_copia_cola ||
                    orderData.pix?.payload ||
                    orderData.pix?.pix_code ||
                    null

    // Retornar dados de pagamento
    res.json({
      success: true,
      transaction_id: transactionId,
      payment_url: orderData.payment_url || orderData.url || orderData.link,
      qr_code: qrCode,
      pix_code: pixCode,
      order_id: orderData.id || orderData.order_id,
      status: orderData.status,
      message: 'Pagamento criado com sucesso.',
    })
  } catch (error) {
    console.error('[PaymentController] Erro ao criar depósito:', error)
    console.error('[PaymentController] Stack trace:', error.stack)
    res.status(500).json({
      error: 'Erro ao processar depósito',
      message: error.message || 'Erro desconhecido',
      status: false,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    })
  }
}

/**
 * POST /api/payments/arkama-webhook
 * Webhook para receber notificações da Arkama
 */
export const arkamaWebhook = async (req, res) => {
  try {
    // Responder imediatamente para validação de postback
    // A Arkama pode fazer requisições de teste antes de salvar
    res.status(200).json({
      success: true,
      message: 'Webhook recebido',
    })

    const webhookData = req.body

    // Se não houver dados, é apenas uma validação
    if (!webhookData || Object.keys(webhookData).length === 0) {
      console.log('[PaymentController] Validação de postback recebida')
      return
    }

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

    // Já respondemos no início, então não precisa responder novamente
    // Mas vamos logar o sucesso
    console.log('[PaymentController] Webhook processado com sucesso')
  } catch (error) {
    console.error('[PaymentController] Erro ao processar webhook:', error)
    // Se ainda não respondeu, responder com erro
    if (!res.headersSent) {
      res.status(500).json({
        error: 'Erro ao processar webhook',
      })
    }
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

