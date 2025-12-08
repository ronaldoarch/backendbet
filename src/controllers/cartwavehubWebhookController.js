import pool from '../config/database.js'
import crypto from 'crypto'

/**
 * Validar assinatura HMAC do webhook (se configurado)
 * @param {Object} payload - Payload do webhook
 * @param {string} signature - Assinatura recebida
 * @param {string} secret - Secret HMAC
 * @returns {boolean}
 */
function validateWebhookHMAC(payload, signature, secret) {
  if (!signature || !secret) {
    return true // Se não configurado, aceitar
  }

  try {
    const hmac = crypto.createHmac('sha256', secret)
    hmac.update(JSON.stringify(payload))
    const calculatedSignature = hmac.digest('hex')
    return calculatedSignature === signature
  } catch (error) {
    console.error('[Webhook] Erro ao validar HMAC:', error)
    return false
  }
}

export const cartwavehubWebhook = async (req, res) => {
  try {
    console.log('[Webhook] ========== WEBHOOK RECEBIDO ==========')
    console.log('[Webhook] Body:', JSON.stringify(req.body, null, 2))
    
    // Detectar formato do webhook (novo ou antigo)
    const isNewFormat = req.body.event && req.body.data
    let webhookData = null
    let transactionId = null
    let status = null
    let amount = null
    let endToEnd = null
    let payer = null
    let externalId = null

    if (isNewFormat) {
      // ========== NOVO FORMATO (event + data) ==========
      console.log('[Webhook] 📋 Formato: NOVO (event + data)')
      const { event, data, signature, timestamp } = req.body

      // Validar HMAC se configurado
      const hmacSecret = process.env.CARTWAVE_HMAC_SECRET
      if (hmacSecret && signature) {
        const isValid = validateWebhookHMAC(req.body, signature, hmacSecret)
        if (!isValid) {
          console.error('[Webhook] ❌ Assinatura HMAC inválida!')
          return res.status(401).json({
            error: 'Invalid signature',
            message: 'Assinatura HMAC inválida',
          })
        }
        console.log('[Webhook] ✅ Assinatura HMAC válida')
      }

      webhookData = data
      transactionId = data.id
      status = data.status
      amount = data.amount // Já está em centavos
      endToEnd = data.endToEnd
      payer = data.payer
      externalId = data.metadata?.externalId || data.metadata?.externalCode

      console.log('[Webhook] Evento:', event)
      console.log('[Webhook] Dados:', {
        transactionId,
        status,
        amount,
        externalId,
      })

      // Mapear eventos para status
      if (event === 'pix.cash-in.paid') {
        status = 'paid'
      } else if (event === 'pix.cash-in.refused') {
        status = 'refused'
      } else if (event === 'pix.cash-in.refunded') {
        status = 'refunded'
      }
    } else {
      // ========== FORMATO ANTIGO (campos diretos) ==========
      console.log('[Webhook] 📋 Formato: ANTIGO (campos diretos)')
      const { code, externalCode, orderId, status: oldStatus, endToEnd: oldEndToEnd, amount: oldAmount, payer: oldPayer } = req.body

      if (!code || !oldStatus) {
        console.warn('[Webhook] Campos faltando:', { code, status: oldStatus })
        return res.status(400).json({
          error: 'Campos obrigatórios faltando',
          message: 'code e status são obrigatórios',
        })
      }

      transactionId = code
      status = oldStatus
      amount = oldAmount
      endToEnd = oldEndToEnd
      payer = oldPayer
      externalId = externalCode || orderId

      console.log('[Webhook] Códigos:', { code, externalCode, orderId })
    }

    // Buscar transação
    let transactions = []
    
    // Tentar buscar por transactionId primeiro
    if (transactionId) {
      console.log('[Webhook] Buscando por payment_id =', transactionId)
      const [tx1] = await pool.execute(
        'SELECT t.*, u.id as user_id FROM transactions t JOIN users u ON t.user_id = u.id WHERE t.payment_id = ?',
        [transactionId]
      )
      
      if (tx1 && tx1.length > 0) {
        transactions = tx1
        console.log('[Webhook] ✅ Encontrado por transactionId')
      }
    }
    
    // Se não encontrou, tentar por externalId
    if (transactions.length === 0 && externalId) {
      console.log('[Webhook] Buscando por externalId =', externalId)
      const [tx2] = await pool.execute(
        'SELECT t.*, u.id as user_id FROM transactions t JOIN users u ON t.user_id = u.id WHERE t.payment_id = ?',
        [externalId]
      )
      if (tx2 && tx2.length > 0) {
        transactions = tx2
        console.log('[Webhook] ✅ Encontrado por externalId')
      }
    }
    
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

    // Converter amount para reais (se estiver em centavos)
    // Na nova API, amount já vem em centavos. Na antiga, pode variar
    const amountInReais = amount 
      ? (isNewFormat ? parseFloat(amount) / 100 : parseFloat(amount) / 100) // Nova API sempre em centavos
      : parseFloat(transaction.amount)

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
