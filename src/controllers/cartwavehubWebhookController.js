import pool from '../config/database.js'

/**
 * POST /api/payments/cartwavehub-webhook
 * Webhook para receber callbacks do Cartwavehub
 * Documentação: https://cartwavehub.notion.site
 */
export const cartwavehubWebhook = async (req, res) => {
  try {
    console.log('[Cartwavehub Webhook] Recebido:', JSON.stringify(req.body, null, 2))
    
    const { code, externalCode, orderId, status, endToEnd, amount, payer } = req.body

    // Validar campos obrigatórios
    if (!code || !status) {
      console.warn('[Cartwavehub Webhook] Campos obrigatórios faltando:', { code, status })
      return res.status(400).json({
        error: 'Campos obrigatórios faltando',
        message: 'code e status são obrigatórios',
      })
    }

    // Buscar transação pelo código externo ou orderId
    const transactionCode = externalCode || orderId || code
    console.log('[Cartwavehub Webhook] Buscando transação:', transactionCode)

    // Buscar transação no banco
    const [transactions] = await pool.execute(
      `SELECT t.*, u.email, u.id as user_id 
       FROM transactions t
       JOIN users u ON t.user_id = u.id
       WHERE t.payment_id = ? OR t.metadata LIKE ?`,
      [transactionCode, `%${transactionCode}%`]
    )

    if (!transactions || transactions.length === 0) {
      console.warn('[Cartwavehub Webhook] Transação não encontrada:', transactionCode)
      // Retornar 200 mesmo se não encontrar, para evitar retentativas
      return res.status(200).json({
        success: true,
        message: 'Webhook recebido, mas transação não encontrada',
      })
    }

    const transaction = transactions[0]
    console.log('[Cartwavehub Webhook] Transação encontrada:', {
      id: transaction.id,
      status_atual: transaction.status,
      novo_status: status,
    })

    // Converter valor de centavos para reais
    const amountInReais = amount ? parseFloat(amount) / 100 : parseFloat(transaction.amount)

    // Mapear status do Cartwavehub para status interno
    // Status possíveis: paid, refused, refunded, infraction
    let newStatus = transaction.status
    let shouldUpdateBalance = false

    switch (status.toLowerCase()) {
      case 'paid':
        newStatus = 'approved'
        shouldUpdateBalance = true
        break
      case 'refused':
        newStatus = 'refused'
        break
      case 'refunded':
        newStatus = 'refunded'
        break
      case 'infraction':
        newStatus = 'refused'
        break
      default:
        console.warn('[Cartwavehub Webhook] Status desconhecido:', status)
        newStatus = 'processing'
    }

    // Atualizar transação
    await pool.execute(
      `UPDATE transactions 
       SET status = ?, 
           metadata = JSON_SET(COALESCE(metadata, '{}'), 
             '$.webhook_status', ?,
             '$.endToEnd', ?,
             '$.payer', ?,
             '$.updated_at', NOW())
       WHERE id = ?`,
      [
        newStatus,
        status,
        endToEnd || null,
        payer ? JSON.stringify(payer) : null,
        transaction.id,
      ]
    )

    console.log('[Cartwavehub Webhook] Transação atualizada:', {
      transaction_id: transaction.id,
      old_status: transaction.status,
      new_status: newStatus,
    })

    // Se o pagamento foi aprovado, atualizar saldo do usuário
    if (shouldUpdateBalance && newStatus === 'approved') {
      // Verificar se já foi creditado (evitar duplicação)
      if (transaction.status !== 'approved') {
        console.log('[Cartwavehub Webhook] Creditando saldo ao usuário:', {
          user_id: transaction.user_id,
          amount: amountInReais,
        })

        // Buscar ou criar carteira
        let [wallets] = await pool.execute(
          'SELECT * FROM wallets WHERE user_id = ?',
          [transaction.user_id]
        )

        if (!wallets || wallets.length === 0) {
          // Criar carteira se não existir
          await pool.execute(
            `INSERT INTO wallets (user_id, balance, balance_bonus, balance_withdrawal, created_at, updated_at)
             VALUES (?, 0.00, 0.00, 0.00, NOW(), NOW())`,
            [transaction.user_id]
          )
          wallets = [{ balance: 0, balance_bonus: 0, balance_withdrawal: 0 }]
        }

        const wallet = wallets[0]
        const currentBalance = parseFloat(wallet.balance || 0)
        const newBalance = currentBalance + amountInReais

        // Atualizar saldo
        await pool.execute(
          'UPDATE wallets SET balance = ?, updated_at = NOW() WHERE user_id = ?',
          [newBalance, transaction.user_id]
        )

        console.log('[Cartwavehub Webhook] Saldo atualizado:', {
          user_id: transaction.user_id,
          old_balance: currentBalance,
          new_balance: newBalance,
          amount_added: amountInReais,
        })
      } else {
        console.log('[Cartwavehub Webhook] Saldo já foi creditado anteriormente, ignorando...')
      }
    }

    // Retornar sucesso
    return res.status(200).json({
      success: true,
      message: 'Webhook processado com sucesso',
      transaction_id: transaction.id,
      status: newStatus,
    })
  } catch (error) {
    console.error('[Cartwavehub Webhook] Erro ao processar webhook:', {
      error: error.message,
      stack: error.stack,
      body: req.body,
    })

    // Retornar 200 mesmo em caso de erro, para evitar retentativas
    // (ou retornar 500 se quiser que o gateway tente novamente)
    return res.status(200).json({
      success: false,
      error: 'Erro ao processar webhook',
      message: error.message,
    })
  }
}

