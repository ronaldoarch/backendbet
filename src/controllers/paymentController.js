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

    console.log('[PaymentController] Dados recebidos:', {
      amount,
      amountType: typeof amount,
      description,
      gateway,
    })

    // Validações
    const amountValue = parseFloat(amount)
    
    if (!amount || isNaN(amountValue) || amountValue <= 0) {
      console.error('[PaymentController] ❌ Valor inválido:', amount)
      return res.status(400).json({
        error: 'Valor inválido',
        message: 'O valor do depósito deve ser um número maior que zero',
        status: false,
      })
    }

    if (amountValue < 10) {
      console.error('[PaymentController] ❌ Valor abaixo do mínimo:', amountValue)
      return res.status(400).json({
        error: 'Valor mínimo de depósito é R$ 10,00',
        message: 'O valor mínimo para depósito é R$ 10,00',
        status: false,
      })
    }

    // Usar amountValue nas operações
    const finalAmount = amountValue

    // Buscar usuário
    const [users] = await pool.execute(
      'SELECT id, email, name, phone FROM users WHERE id = ?',
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

    // Obter IP do cliente
    const clientIp = req.ip || 
                    req.headers['x-forwarded-for']?.split(',')[0] || 
                    req.headers['x-real-ip'] || 
                    req.connection.remoteAddress || 
                    '0.0.0.0'

    // Criar compra na Arkama
    console.log('[PaymentController] Chamando Arkama API...')
    console.log('[PaymentController] Dados enviados:', {
      amount: finalAmount.toFixed(2),
      user_email: user.email,
      user_name: user.name || user.email,
      user_phone: user.phone || null,
      description: description || `Depósito de R$ ${finalAmount.toFixed(2)}`,
      callback_url: `${baseUrl}/api/payments/arkama-webhook`,
      return_url: `${baseUrl}/wallet?payment=success`,
      ip: clientIp,
    })
    
    const arkamaResponse = await arkamaService.createOrder({
      amount: finalAmount.toFixed(2),
      user_email: user.email,
      user_name: user.name || user.email,
      user_phone: user.phone || null,
      description: description || `Depósito de R$ ${finalAmount.toFixed(2)}`,
      callback_url: `${baseUrl}/api/payments/arkama-webhook`,
      return_url: `${baseUrl}/wallet?payment=success`,
      ip: clientIp,
      shipping_address: 'Endereço não informado', // Endereço padrão para produtos digitais
    })

    console.log('[PaymentController] Resposta da Arkama:', {
      success: arkamaResponse.success,
      hasData: !!arkamaResponse.data,
      error: arkamaResponse.error,
    })

    if (!arkamaResponse.success) {
      console.error('[PaymentController] ❌ Erro na Arkama:', {
        error: arkamaResponse.error,
        details: arkamaResponse.details,
        status: arkamaResponse.status,
        fullResponse: JSON.stringify(arkamaResponse, null, 2),
      })
      
      // Tentar extrair o erro real que pode estar mascarado por problemas de log
      let realError = arkamaResponse.error || ''
      let extractedError = null
      
      // Procurar por "Error on pix payment" mesmo que esteja mascarado por erros de log
      if (realError.includes('Error on pix payment')) {
        // Extrair o contexto JSON
        const contextMatch = realError.match(/Context:\s*({[^}]+})/)
        if (contextMatch) {
          try {
            const context = JSON.parse(contextMatch[1])
            // Se houver exception com detalhes, usar
            if (context.exception && Object.keys(context.exception).length > 0) {
              extractedError = `Erro no pagamento PIX: ${JSON.stringify(context.exception)}`
            } else {
              // Exception vazio geralmente indica problema de configuração ou dados
              extractedError = 'Erro ao processar pagamento PIX. Verifique se a conta Arkama está configurada corretamente para PIX.'
            }
          } catch (e) {
            extractedError = 'Erro ao processar pagamento PIX. Verifique os dados enviados.'
          }
        } else {
          extractedError = 'Erro ao processar pagamento PIX. Verifique os dados enviados.'
        }
      }
      
      // Se encontrou erro de permissão de log, mas não extraiu o erro real ainda
      if (realError.includes('Permission denied') && !extractedError) {
        // Tentar extrair "Error on pix payment" mesmo com erro de log
        if (realError.includes('Error on pix payment')) {
          extractedError = 'Erro ao processar pagamento PIX. Verifique se a conta Arkama está configurada corretamente para PIX.'
        } else {
          extractedError = 'Erro interno do gateway de pagamento. Tente novamente em alguns instantes.'
        }
      }
      
      // Usar o erro extraído se encontrou, senão usar o erro original
      realError = extractedError || realError
      
      // Se o erro ainda contém informações sobre log, limpar
      if (realError.includes('Permission denied') && realError.includes('storage/logs')) {
        realError = 'Erro ao processar pagamento PIX. O gateway está com problemas temporários. Tente novamente ou entre em contato com o suporte.'
      }
      
      // Retornar erros de validação (422) com mais detalhes
      if (arkamaResponse.status === 422 && arkamaResponse.details?.errors) {
        const errorMessages = Object.values(arkamaResponse.details.errors).flat().join(', ')
        return res.status(422).json({
          error: 'Erro de validação',
          message: errorMessages || realError || 'Erro ao criar pagamento',
          errors: arkamaResponse.details.errors,
          details: arkamaResponse.details,
          status: false,
        })
      }
      
      // Erro 500 do servidor Arkama (problema interno deles)
      if (arkamaResponse.status === 500) {
        console.error('[PaymentController] ⚠️ Erro 500 da Arkama - Gateway temporariamente indisponível')
        console.error('[PaymentController] Erro real extraído:', realError)
        console.error('[PaymentController] Detalhes completos do erro:', JSON.stringify(arkamaResponse, null, 2))
        
        // Se o erro real for sobre pagamento PIX, pode ser problema nos dados ou configuração
        if (realError && (realError.toLowerCase().includes('pix') || realError.toLowerCase().includes('payment'))) {
          // Se o contexto mostra exception vazio, pode ser problema de configuração
          const hasEmptyException = arkamaResponse.error?.includes('"exception":{}')
          
          return res.status(400).json({
            error: 'Erro ao processar pagamento PIX',
            message: hasEmptyException 
              ? 'Não foi possível processar o pagamento PIX. Verifique se a conta Arkama está configurada corretamente para PIX ou entre em contato com o suporte.'
              : (realError || 'Não foi possível processar o pagamento PIX. Verifique os dados e tente novamente.'),
            details: {
              originalError: arkamaResponse.error,
              extractedError: realError,
              suggestion: hasEmptyException 
                ? 'O erro pode estar relacionado à configuração da conta Arkama. Verifique se o PIX está habilitado na sua conta.'
                : 'Verifique os dados enviados e tente novamente.',
            },
            status: false,
          })
        }
        
        return res.status(503).json({
          error: 'Serviço temporariamente indisponível',
          message: 'O gateway de pagamento está temporariamente indisponível. Por favor, tente novamente em alguns instantes.',
          details: realError || 'Erro interno do servidor do gateway de pagamento',
          status: false,
        })
      }
      
      // Erro 400 do servidor Arkama (dados inválidos)
      if (arkamaResponse.status === 400) {
        console.error('[PaymentController] ⚠️ Erro 400 da Arkama - Dados inválidos')
        console.error('[PaymentController] Detalhes completos do erro:', JSON.stringify(arkamaResponse, null, 2))
        
        const errorMessage = arkamaResponse.error || 
                            arkamaResponse.details?.message ||
                            realError ||
                            'Dados inválidos para processar o pagamento'
        
        return res.status(400).json({
          error: 'Erro ao processar pagamento',
          message: errorMessage,
          details: arkamaResponse.details || arkamaResponse.error,
          status: false,
        })
      }
      
      // Erro de conexão/timeout
      if (!arkamaResponse.status || arkamaResponse.status >= 500) {
        console.error('[PaymentController] ⚠️ Erro de conexão ou servidor da Arkama')
        return res.status(503).json({
          error: 'Serviço temporariamente indisponível',
          message: 'Não foi possível conectar ao gateway de pagamento. Por favor, tente novamente em alguns instantes.',
          details: arkamaResponse.error || 'Erro de conexão com o gateway',
          status: false,
        })
      }
      
      // Outros erros (400, 401, 403, etc.)
      const errorMessage = arkamaResponse.error || 
                          (arkamaResponse.details?.message) ||
                          'Erro ao criar pagamento'
      
      return res.status(arkamaResponse.status || 500).json({
        error: 'Erro ao criar pagamento',
        message: errorMessage,
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
        finalAmount,
        orderData.id || orderData.order_id,
        description || `Depósito de R$ ${finalAmount.toFixed(2)}`,
        JSON.stringify(orderData),
      ]
    )

    const transactionId = result.insertId

    // Extrair dados do PIX da resposta da Arkama
    // A Arkama pode retornar: qr_code, pix_code, qr_code_base64, pix_copia_cola, etc.
    // Priorizar sempre o PIX copia e cola, pois é mais confiável
    console.log('[PaymentController] Resposta completa da Arkama:', JSON.stringify(orderData, null, 2))
    
    // Buscar PIX copia e cola em todos os campos possíveis (prioridade)
    let pixCode = orderData.pix_copia_cola || 
                  orderData.pix?.pix_copia_cola ||
                  orderData.pix_copia_cola_pix ||
                  orderData.pixCode ||
                  orderData.pix_code ||
                  orderData.pix?.pix_code ||
                  orderData.pix?.payload ||
                  orderData.payload ||
                  orderData.pix_payload ||
                  orderData.pix?.emvqrcps ||
                  orderData.emvqrcps ||
                  orderData.qr_code_string ||
                  orderData.pix?.qr_code_string ||
                  null

    // Buscar QR code (imagem) em todos os campos possíveis
    let qrCode = orderData.qr_code_base64 || 
                 orderData.pix?.qr_code_base64 ||
                 orderData.qr_code ||
                 orderData.pix?.qr_code ||
                 orderData.qrcode || 
                 orderData.qrCode ||
                 orderData.pix?.qrcode ||
                 null

    // Se não encontrou PIX code, tentar extrair de outros campos
    if (!pixCode) {
      // Tentar buscar em campos aninhados
      if (orderData.payment) {
        pixCode = orderData.payment.pix_copia_cola ||
                  orderData.payment.pix_code ||
                  orderData.payment.payload ||
                  null
      }
      
      // Tentar buscar em dados de pagamento
      if (!pixCode && orderData.payment_data) {
        pixCode = orderData.payment_data.pix_copia_cola ||
                  orderData.payment_data.pix_code ||
                  orderData.payment_data.payload ||
                  null
      }
      
      // Se ainda não encontrou, tentar extrair de qualquer campo que contenha "pix" ou "qr"
      if (!pixCode) {
        for (const key in orderData) {
          if (typeof orderData[key] === 'string' && 
              (key.toLowerCase().includes('pix') || key.toLowerCase().includes('qr')) &&
              orderData[key].length > 20 && // PIX codes são longos
              !orderData[key].startsWith('data:image')) { // Não é base64 de imagem
            pixCode = orderData[key]
            console.log(`[PaymentController] PIX code encontrado no campo: ${key}`)
            break
          }
        }
      }
    }

    // Log do que foi encontrado
    if (pixCode) {
      console.log('[PaymentController] ✅ PIX copia e cola encontrado:', pixCode.substring(0, 50) + '...')
    } else {
      console.warn('[PaymentController] ⚠️ PIX copia e cola NÃO encontrado na resposta')
    }
    
    if (qrCode) {
      console.log('[PaymentController] ✅ QR code encontrado')
    } else {
      console.warn('[PaymentController] ⚠️ QR code NÃO encontrado na resposta')
    }

    // Se não houver QR code mas houver PIX code, informar que o QR code não está disponível
    // mas o PIX copia e cola está disponível
    if (!qrCode && pixCode) {
      console.log('[PaymentController] QR code não disponível, mas PIX copia e cola está disponível')
    }
    
    // Se não encontrou PIX code ainda, tentar buscar em todos os campos recursivamente
    if (!pixCode) {
      const searchInObject = (obj, depth = 0) => {
        if (depth > 3) return null // Limitar profundidade
        
        for (const key in obj) {
          if (obj[key] === null || obj[key] === undefined) continue
          
          // Se for string e parecer um PIX code
          if (typeof obj[key] === 'string') {
            const value = obj[key].trim()
            // PIX codes geralmente começam com "000201" ou têm mais de 100 caracteres
            if (value.length > 50 && 
                (value.startsWith('000201') || 
                 value.includes('BR.GOV.BCB.PIX') ||
                 key.toLowerCase().includes('pix') ||
                 key.toLowerCase().includes('copia') ||
                 key.toLowerCase().includes('cola') ||
                 key.toLowerCase().includes('payload'))) {
              return value
            }
          }
          
          // Se for objeto, buscar recursivamente
          if (typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
            const found = searchInObject(obj[key], depth + 1)
            if (found) return found
          }
          
          // Se for array, buscar em cada item
          if (Array.isArray(obj[key])) {
            for (const item of obj[key]) {
              if (typeof item === 'object') {
                const found = searchInObject(item, depth + 1)
                if (found) return found
              }
            }
          }
        }
        return null
      }
      
      pixCode = searchInObject(orderData)
      if (pixCode) {
        console.log('[PaymentController] ✅ PIX code encontrado via busca recursiva!')
      }
    }

    // Se não houver nenhum dos dois, retornar erro
    if (!qrCode && !pixCode) {
      console.error('[PaymentController] ❌ ERRO: Nem QR code nem PIX copia e cola encontrados na resposta da Arkama')
      console.error('[PaymentController] Resposta completa:', JSON.stringify(orderData, null, 2))
      
      // Mesmo sem PIX code, retornar sucesso se houver payment_url
      if (orderData.payment_url || orderData.url || orderData.link) {
        return res.json({
          success: true,
          transaction_id: transactionId,
          payment_url: orderData.payment_url || orderData.url || orderData.link,
          qr_code: null,
          pix_code: null,
          order_id: orderData.id || orderData.order_id,
          status: orderData.status,
          message: 'Pagamento criado. Use o link de pagamento para concluir.',
        })
      }
      
      return res.status(500).json({
        error: 'Erro ao processar pagamento',
        message: 'Não foi possível obter os dados de pagamento. Tente novamente.',
        status: false,
      })
    }

    // Retornar dados de pagamento
    // Sempre retornar PIX copia e cola se disponível, mesmo sem QR code
    const response = {
      success: true,
      transaction_id: transactionId,
      payment_url: orderData.payment_url || orderData.url || orderData.link,
      qr_code: qrCode,
      pix_code: pixCode,
      order_id: orderData.id || orderData.order_id,
      status: orderData.status,
    }
    
    // Mensagem baseada no que está disponível
    if (qrCode && pixCode) {
      response.message = 'Pagamento criado com sucesso. Escaneie o QR code ou use o código PIX copia e cola.'
    } else if (pixCode) {
      response.message = 'Pagamento criado. Use o código PIX copia e cola para pagar.'
    } else if (qrCode) {
      response.message = 'Pagamento criado com sucesso. Escaneie o QR code para pagar.'
    } else {
      response.message = 'Pagamento criado. Use o link de pagamento para concluir.'
    }
    
    res.json(response)
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

