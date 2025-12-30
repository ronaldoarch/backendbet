import pool from '../config/database.js'

/**
 * Webhook Controller para Cartwavehub
 * Processa callbacks de pagamentos aprovados/reprovados
 */
export const callback = async (req, res) => {
  try {
    console.log('[CartwavehubWebhook] Webhook recebido:', req.body)

    // Responder imediatamente para evitar retry infinito
    res.status(200).json({
      success: true,
      message: 'Webhook recebido',
    })

    const webhookData = req.body

    // Se não houver dados, é apenas uma validação
    if (!webhookData || Object.keys(webhookData).length === 0) {
      console.log('[CartwavehubWebhook] Validação de webhook recebida')
      return
    }

    // Extrair dados do webhook
    const transactionId = webhookData.id || webhookData.transaction_id
    const status = webhookData.status?.toLowerCase()
    const amount = parseFloat(webhookData.amount || 0)

    console.log('[CartwavehubWebhook] Processando webhook:', {
      transactionId,
      status,
      amount,
    })

    // Buscar transação pelo payment_id
    const [transactions] = await pool.execute(
      'SELECT * FROM transactions WHERE payment_id = ?',
      [transactionId]
    )

    if (!transactions || transactions.length === 0) {
      console.warn('[CartwavehubWebhook] Transação não encontrada:', transactionId)
      return
    }

    const transaction = transactions[0]

    // Se já foi processada, não processar novamente
    if (transaction.status === 'completed') {
      console.log('[CartwavehubWebhook] Transação já processada:', transactionId)
      return
    }

    // Processar conforme status
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

        console.log('[CartwavehubWebhook] Depósito processado:', {
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

      console.log('[CartwavehubWebhook] Depósito cancelado/falhou:', {
        transaction_id: transaction.id,
        status,
      })
    }

    console.log('[CartwavehubWebhook] Webhook processado com sucesso')
  } catch (error) {
    console.error('[CartwavehubWebhook] Erro ao processar webhook:', error)
    // Sempre retornar 200 para evitar retry infinito
    if (!res.headersSent) {
      res.status(200).json({
        success: false,
        error: 'Erro ao processar webhook',
      })
    }
  }
}

export default {
  callback,
}

