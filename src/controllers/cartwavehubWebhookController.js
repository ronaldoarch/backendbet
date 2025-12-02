import pool from '../config/database.js'

export const cartwavehubWebhook = async (req, res) => {
  try {
    console.log('[Webhook] ========== WEBHOOK RECEBIDO ==========')
    console.log('[Webhook] Body:', JSON.stringify(req.body, null, 2))
    
    const { code, externalCode, orderId, status, endToEnd, amount, payer } = req.body

    if (!code || !status) {
      console.warn('[Webhook] Campos faltando:', { code, status })
      return res.status(400).json({
        error: 'Campos obrigatórios faltando',
        message: 'code e status são obrigatórios',
      })
    }

    console.log('[Webhook] Códigos:', { code, externalCode, orderId })
    
    // Buscar transação - tentar com code primeiro
    let transactions = []
    console.log('[Webhook] Buscando por payment_id =', code)
    const [tx1] = await pool.execute(
      'SELECT t.*, u.id as user_id FROM transactions t JOIN users u ON t.user_id = u.id WHERE t.payment_id = ?',
      [code]
    )
    
    if (tx1 && tx1.length > 0) {
      transactions = tx1
      console.log('[Webhook] ✅ Encontrado por code')
    } else if (externalCode) {
      console.log('[Webhook] Buscando por externalCode =', externalCode)
      const [tx2] = await pool.execute(
        'SELECT t.*, u.id as user_id FROM transactions t JOIN users u ON t.user_id = u.id WHERE t.payment_id = ?',
        [externalCode]
      )
      if (tx2 && tx2.length > 0) {
        transactions = tx2
        console.log('[Webhook] ✅ Encontrado por externalCode')
      }
    }

    if (transactions.length === 0) {
      console.warn('[Webhook] ❌ Transação não encontrada')
      const [recent] = await pool.execute(
        'SELECT id, payment_id, amount, status FROM transactions WHERE status = "pending" ORDER BY created_at DESC LIMIT 5'
      )
      console.warn('[Webhook] Últimas pendentes:', recent)
      return res.status(200).json({
        success: true,
        message: 'Webhook recebido, mas transação não encontrada',
      })
    }

    const transaction = transactions[0]
    console.log('[Webhook] Transação:', {
      id: transaction.id,
      payment_id: transaction.payment_id,
      status_atual: transaction.status,
      novo_status: status,
      amount: transaction.amount,
      user_id: transaction.user_id,
    })

    const amountInReais = amount ? parseFloat(amount) / 100 : parseFloat(transaction.amount)

    let newStatus = transaction.status
    let shouldUpdateBalance = false

    if (status.toLowerCase() === 'paid') {
      newStatus = 'approved'
      shouldUpdateBalance = true
    } else if (status.toLowerCase() === 'refused') {
      newStatus = 'refused'
    } else if (status.toLowerCase() === 'refunded') {
      newStatus = 'refunded'
    } else if (status.toLowerCase() === 'infraction') {
      newStatus = 'refused'
    } else {
      newStatus = 'processing'
    }

    await pool.execute(
      'UPDATE transactions SET status = ?, metadata = JSON_SET(COALESCE(metadata, "{}"), "$.webhook_status", ?, "$.endToEnd", ?, "$.payer", ?) WHERE id = ?',
      [newStatus, status, endToEnd || null, payer ? JSON.stringify(payer) : null, transaction.id]
    )

    console.log('[Webhook] ✅ Status atualizado:', newStatus)

    if (shouldUpdateBalance && transaction.status !== 'approved' && transaction.status !== 'completed') {
      console.log('[Webhook] 💰 Creditando saldo...')

      let [wallets] = await pool.execute(
        'SELECT * FROM wallets WHERE user_id = ?',
        [transaction.user_id]
      )

      if (!wallets || wallets.length === 0) {
        await pool.execute(
          'INSERT INTO wallets (user_id, balance, balance_bonus, balance_withdrawal, created_at, updated_at) VALUES (?, 0.00, 0.00, 0.00, NOW(), NOW())',
          [transaction.user_id]
        )
        wallets = [{ balance: 0 }]
      }

      const wallet = wallets[0]
      const currentBalance = parseFloat(wallet.balance || 0)
      const newBalance = currentBalance + amountInReais

      await pool.execute(
        'UPDATE wallets SET balance = ?, updated_at = NOW() WHERE user_id = ?',
        [newBalance, transaction.user_id]
      )

      console.log('[Webhook] ========== SALDO ATUALIZADO ==========')
      console.log('[Webhook] Usuário:', transaction.user_id)
      console.log('[Webhook] Saldo anterior:', currentBalance)
      console.log('[Webhook] Valor adicionado:', amountInReais)
      console.log('[Webhook] Novo saldo:', newBalance)
      console.log('[Webhook] =====================================')
    } else {
      console.log('[Webhook] Saldo já creditado ou status não é "paid"')
    }

    return res.status(200).json({
      success: true,
      message: 'Webhook processado com sucesso',
      transaction_id: transaction.id,
      status: newStatus,
    })
  } catch (error) {
    console.error('[Webhook] ❌ ERRO:', error.message)
    console.error('[Webhook] Stack:', error.stack)
    return res.status(200).json({
      success: false,
      error: 'Erro ao processar webhook',
      message: error.message,
    })
  }
}
