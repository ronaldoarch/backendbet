import pool from '../config/database.js'
import arkamaService from '../services/arkama.js'
import cartwavehubService from '../services/cartwavehub.js'

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

    console.log('[PaymentController] ==========================================')
    console.log('[PaymentController] Dados recebidos do frontend:', {
      amount,
      description,
      gateway: gateway || 'NÃO ENVIADO',
      body_completo: req.body,
    })
    
    // FORÇAR cartwavehub se gateway não for especificado ou for undefined/null
    const finalGateway = (gateway && typeof gateway === 'string' && gateway.trim() !== '') 
      ? gateway.trim().toLowerCase() 
      : 'cartwavehub'
    
    console.log('[PaymentController] Gateway final após validação:', finalGateway)
    console.log('[PaymentController] ==========================================')

    console.log('[PaymentController] Dados recebidos:', {
      amount,
      amountType: typeof amount,
      description,
      gateway,
      finalGateway,
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

    if (amountValue < 1) {
      console.error('[PaymentController] ❌ Valor abaixo do mínimo:', amountValue)
      return res.status(400).json({
        error: 'Valor mínimo de depósito é R$ 1,00',
        message: 'O valor mínimo para depósito é R$ 1,00',
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

    // Escolher gateway (cartwavehub ou arkama)
    // Usar finalGateway que já foi validado acima
    const selectedGateway = finalGateway
    
    console.log('[PaymentController] ==========================================')
    console.log('[PaymentController] Gateway selecionado:', selectedGateway)
    console.log('[PaymentController] Gateway original recebido:', gateway)
    console.log('[PaymentController] ==========================================')
    
    let paymentResponse = null
    
    if (selectedGateway === 'cartwavehub') {
      console.log('[PaymentController] ✅ Usando CARTWAVEHUB como gateway')
      // Criar transação PIX no Cartwavehub
      console.log('[PaymentController] Chamando Cartwavehub API...')
      console.log('[PaymentController] Dados enviados:', {
        amount: finalAmount,
        user_email: user.email,
        user_id: userId,
        description: description || `Depósito de R$ ${finalAmount.toFixed(2)}`,
        callback_url: `${baseUrl}/api/payments/cartwavehub-webhook`,
        ip: clientIp,
      })
      
      paymentResponse = await cartwavehubService.createPixTransaction({
        amount: finalAmount,
        user_email: user.email,
        user_id: userId,
        description: description || `Depósito de R$ ${finalAmount.toFixed(2)}`,
        callback_url: `${baseUrl}/api/payments/cartwavehub-webhook`,
        ip: clientIp,
      })
    } else {
      // Criar compra na Arkama (fallback)
      console.log('[PaymentController] ⚠️ Usando ARKAMA como gateway (fallback)')
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
      
      paymentResponse = await arkamaService.createOrder({
        amount: finalAmount.toFixed(2),
        user_email: user.email,
        user_name: user.name || user.email,
        user_phone: user.phone || null,
        description: description || `Depósito de R$ ${finalAmount.toFixed(2)}`,
        callback_url: `${baseUrl}/api/payments/arkama-webhook`,
        return_url: `${baseUrl}/wallet?payment=success`,
        ip: clientIp,
        shipping_address: 'Endereço não informado',
      })
    }

    console.log(`[PaymentController] Resposta do ${selectedGateway}:`, {
      success: paymentResponse.success,
      hasData: !!paymentResponse.data,
      error: paymentResponse.error,
    })

    if (!paymentResponse.success) {
      console.error(`[PaymentController] ❌ Erro no ${selectedGateway}:`, {
        error: paymentResponse.error,
        details: paymentResponse.details,
        status: paymentResponse.status,
        fullResponse: JSON.stringify(paymentResponse, null, 2),
      })
      
      // Tentar extrair o erro real
      let realError = paymentResponse.error || ''
      let extractedError = null
      
      // Se for Cartwavehub, não precisa extrair erro mascarado
      if (selectedGateway === 'cartwavehub') {
        realError = paymentResponse.error || 'Erro ao processar pagamento'
      } else if (realError.includes('Error on pix payment')) {
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
      if (paymentResponse.status === 422 && paymentResponse.details?.errors) {
        const errorMessages = Object.values(paymentResponse.details.errors).flat().join(', ')
        return res.status(422).json({
          error: 'Erro de validação',
          message: errorMessages || realError || 'Erro ao criar pagamento',
          errors: paymentResponse.details.errors,
          details: paymentResponse.details,
          status: false,
        })
      }
      
      // Erro 500 do servidor (problema interno do gateway)
      if (paymentResponse.status === 500) {
        console.error(`[PaymentController] ⚠️ Erro 500 do ${selectedGateway} - Gateway temporariamente indisponível`)
        console.error('[PaymentController] Erro real extraído:', realError)
        console.error('[PaymentController] Detalhes completos do erro:', JSON.stringify(paymentResponse, null, 2))
        
        // Se o erro real for sobre pagamento PIX, pode ser problema nos dados ou configuração
        if (realError && (realError.toLowerCase().includes('pix') || realError.toLowerCase().includes('payment'))) {
          // Se o contexto mostra exception vazio, pode ser problema de configuração (apenas Arkama)
          const hasEmptyException = selectedGateway === 'arkama' && paymentResponse.error?.includes('"exception":{}')
          
          // Mensagem mais específica baseada no erro
          let userMessage = 'Não foi possível processar o pagamento. Entre em contato com o suporte.'
          let suggestion = 'O gateway informou que não há problema. Verifique as credenciais e tente novamente.'
          
          if (hasEmptyException) {
            userMessage = 'Erro ao processar pagamento. O gateway pode estar com problemas temporários.'
            suggestion = 'Tente novamente em alguns instantes. Se o problema persistir, entre em contato com o suporte.'
          }
          
          // Retornar como 503 (Service Unavailable) ao invés de 400, pois é erro do gateway
          return res.status(503).json({
            error: 'Erro ao processar pagamento',
            message: userMessage,
            details: {
              suggestion: suggestion,
              troubleshooting: [
                'Tente novamente em alguns instantes',
                'Verifique se as credenciais estão corretas',
                'Entre em contato com o suporte se o problema persistir',
              ],
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
      
      // Erro 400 do servidor (dados inválidos)
      if (paymentResponse.status === 400) {
        console.error(`[PaymentController] ⚠️ Erro 400 do ${selectedGateway} - Dados inválidos`)
        console.error('[PaymentController] Detalhes completos do erro:', JSON.stringify(paymentResponse, null, 2))
        
        const errorMessage = paymentResponse.error || 
                            paymentResponse.details?.message ||
                            realError ||
                            'Dados inválidos para processar o pagamento'
        
        return res.status(400).json({
          error: 'Erro ao processar pagamento',
          message: errorMessage,
          details: paymentResponse.details || paymentResponse.error,
          status: false,
        })
      }
      
      // Erro de conexão/timeout
      if (!paymentResponse.status || paymentResponse.status >= 500) {
        console.error(`[PaymentController] ⚠️ Erro de conexão ou servidor do ${selectedGateway}`)
        return res.status(503).json({
          error: 'Serviço temporariamente indisponível',
          message: 'Não foi possível conectar ao gateway de pagamento. Por favor, tente novamente em alguns instantes.',
          details: paymentResponse.error || 'Erro de conexão com o gateway',
          status: false,
        })
      }
      
      // Outros erros (401, 403, etc.)
      const errorMessage = paymentResponse.error || 
                          (paymentResponse.details?.message) ||
                          'Erro ao criar pagamento'
      
      return res.status(paymentResponse.status || 500).json({
        error: 'Erro ao criar pagamento',
        message: errorMessage,
        details: paymentResponse.details,
        status: false,
      })
    }

    const orderData = paymentResponse.data

    // Criar registro de transação pendente
    console.log('[PaymentController] Criando registro de transação...')
    const [result] = await pool.execute(
      `INSERT INTO transactions 
       (user_id, type, amount, currency, gateway, status, payment_id, description, metadata, created_at, updated_at)
       VALUES (?, 'deposit', ?, 'BRL', ?, 'pending', ?, ?, ?, NOW(), NOW())`,
      [
        userId,
        finalAmount,
        selectedGateway,
        orderData.id || orderData.order_id || orderData.transaction_id,
        description || `Depósito de R$ ${finalAmount.toFixed(2)}`,
        JSON.stringify(orderData),
      ]
    )

    const transactionId = result.insertId

    // Extrair dados do pagamento da resposta do gateway
    console.log(`[PaymentController] Resposta completa do ${selectedGateway}:`, JSON.stringify(orderData, null, 2))
    
    let paymentUrl = null
    let qrCode = null
    let pixCode = null
    
    if (selectedGateway === 'cartwavehub') {
      // Cartwavehub retorna: id, pix.encodedImage (QR Code base64), pix.payload (PIX Copia e Cola)
      qrCode = orderData.pix?.encodedImage || orderData.encodedImage || null
      pixCode = orderData.pix?.payload || orderData.payload || null
      // Cartwavehub não retorna payment_url, apenas QR code e PIX code
    } else {
      // Arkama: buscar payment_url (prioridade - integração normal)
      paymentUrl = orderData.payment_url || 
                   orderData.url || 
                   orderData.link ||
                   orderData.payment?.url ||
                   orderData.payment?.link ||
                   null

      // Buscar PIX copia e cola (opcional - apenas se disponível)
      pixCode = orderData.pix_copia_cola || 
                orderData.pix?.pix_copia_cola ||
                orderData.pix_code ||
                orderData.pix?.pix_code ||
                orderData.pix?.payload ||
                orderData.payload ||
                null
    }

    // Log do que foi encontrado
    if (selectedGateway === 'cartwavehub') {
      if (qrCode) {
        console.log('[PaymentController] ✅ QR Code encontrado (base64)')
      } else {
        console.warn('[PaymentController] ⚠️ QR Code NÃO encontrado na resposta')
      }
      
      if (pixCode) {
        console.log('[PaymentController] ✅ PIX copia e cola encontrado:', pixCode.substring(0, 50) + '...')
      } else {
        console.warn('[PaymentController] ⚠️ PIX copia e cola NÃO encontrado na resposta')
      }
      
      // Para Cartwavehub, QR code ou PIX code são obrigatórios
      if (!qrCode && !pixCode) {
        console.error('[PaymentController] ❌ ERRO: QR Code e PIX Code não encontrados na resposta do Cartwavehub')
        console.error('[PaymentController] Resposta completa:', JSON.stringify(orderData, null, 2))
        
        return res.status(500).json({
          error: 'Erro ao processar pagamento',
          message: 'Não foi possível obter o QR Code ou código PIX. Tente novamente.',
          status: false,
        })
      }
    } else {
      // Para Arkama, payment_url é obrigatório
      if (paymentUrl) {
        console.log('[PaymentController] ✅ Payment URL encontrado:', paymentUrl)
      } else {
        console.warn('[PaymentController] ⚠️ Payment URL NÃO encontrado na resposta')
      }
      
      if (pixCode) {
        console.log('[PaymentController] ✅ PIX copia e cola encontrado:', pixCode.substring(0, 50) + '...')
      } else {
        console.log('[PaymentController] ℹ️ PIX copia e cola não disponível (normal para integração sem QR code)')
      }
      
      // Se não houver payment_url, retornar erro
      if (!paymentUrl) {
        console.error('[PaymentController] ❌ ERRO: Payment URL não encontrado na resposta da Arkama')
        console.error('[PaymentController] Resposta completa:', JSON.stringify(orderData, null, 2))
        
        return res.status(500).json({
          error: 'Erro ao processar pagamento',
          message: 'Não foi possível obter o link de pagamento. Tente novamente.',
          status: false,
        })
      }
    }

    // Retornar dados de pagamento
    const response = {
      success: true,
      transaction_id: transactionId,
      payment_id: orderData.id || orderData.order_id || orderData.transaction_id,
      payment_url: paymentUrl,
      pix_code: pixCode,
      qr_code: qrCode,
      message: selectedGateway === 'cartwavehub'
        ? (qrCode 
          ? 'Depósito criado com sucesso. Escaneie o QR Code ou copie o código PIX.'
          : 'Depósito criado com sucesso. Copie o código PIX para pagar.')
        : (pixCode 
          ? 'Depósito criado com sucesso. Use o link de pagamento ou o código PIX copia e cola para pagar.'
          : 'Depósito criado com sucesso. Use o link de pagamento para concluir.'),
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

    // Buscar transação atualizada (já atualizada pelo webhook)
    // Não precisa consultar gateway externo - o webhook já faz isso
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
    console.log('[PaymentController] getTransactionHistory chamado')
    const userId = req.user?.id
    
    if (!userId) {
      console.error('[PaymentController] Usuário não autenticado')
      return res.status(401).json({
        error: 'Usuário não autenticado',
        status: false,
      })
    }

    const { page = 1, limit = 20, type } = req.query
    console.log('[PaymentController] Parâmetros:', { userId, page, limit, type })

    // Garantir que são números válidos
    const pageNum = parseInt(page, 10) || 1
    const limitNum = parseInt(limit, 10) || 20
    const offsetNum = (pageNum - 1) * limitNum

    // Construir query base
    let query = `
      SELECT id, type, amount, status, description, currency, gateway, 
             metadata, created_at, updated_at
      FROM transactions 
      WHERE user_id = ?
    `
    const params = [userId]
    const countParams = [userId]

    // Filtro por tipo se fornecido
    if (type && type !== 'all' && type !== 'todos') {
      // Mapear 'withdraw' para 'withdrawal' para compatibilidade com banco
      const dbType = type === 'withdraw' ? 'withdrawal' : type
      query += ' AND type = ?'
      params.push(dbType)
      countParams.push(dbType)
    }

    // Ordenação e paginação
    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?'
    params.push(limitNum, offsetNum)

    console.log('[PaymentController] Executando query:', query.substring(0, 200))
    console.log('[PaymentController] Parâmetros:', params)
    
    const [transactions] = await pool.execute(query, params)
    console.log('[PaymentController] Transações encontradas:', transactions.length)

    // Contar total (com filtro de tipo se aplicável)
    let countQuery = 'SELECT COUNT(*) as total FROM transactions WHERE user_id = ?'
    if (type && type !== 'all' && type !== 'todos') {
      countQuery += ' AND type = ?'
    }
    
    console.log('[PaymentController] Executando countQuery:', countQuery)
    console.log('[PaymentController] CountParams:', countParams)
    
    const [countResult] = await pool.execute(countQuery, countParams)
    const total = countResult[0]?.total || 0
    console.log('[PaymentController] Total de transações:', total)

    // Função auxiliar para descrição padrão (dentro do escopo)
    const getDefaultDescription = (type) => {
      switch (type) {
        case 'deposit':
          return 'Depósito via PIX'
        case 'withdraw':
        case 'withdrawal':
          return 'Saque via PIX'
        case 'bet':
          return 'Aposta em jogo'
        case 'win':
          return 'Vitória em jogo'
        case 'bonus':
          return 'Bônus creditado'
        case 'refund':
          return 'Reembolso'
        default:
          return 'Transação'
      }
    }

    // Função para mapear status do banco para o formato do frontend
    const mapStatus = (status) => {
      // Mapear 'completed' para 'approved' para compatibilidade com frontend
      if (status === 'completed') return 'approved'
      if (status === 'canceled') return 'cancelled'
      if (status === 'failed') return 'rejected'
      return status || 'pending'
    }

    // Função para mapear tipo do banco para o formato do frontend
    const mapType = (type) => {
      // Mapear 'withdrawal' para 'withdraw' para compatibilidade com frontend
      if (type === 'withdrawal') return 'withdraw'
      return type || 'unknown'
    }

    // Mapear transações com tratamento de erros
    const mappedTransactions = transactions.map(tx => {
      let metadata = null
      try {
        if (tx.metadata) {
          metadata = typeof tx.metadata === 'string' ? JSON.parse(tx.metadata) : tx.metadata
        }
      } catch (metadataError) {
        console.warn(`[PaymentController] Erro ao parsear metadata da transação ${tx.id}:`, metadataError)
        metadata = null
      }

      const mappedType = mapType(tx.type)
      const mappedStatus = mapStatus(tx.status)

      return {
        id: tx.id,
        type: mappedType,
        amount: parseFloat(tx.amount || 0),
        status: mappedStatus,
        description: tx.description || getDefaultDescription(mappedType),
        currency: tx.currency || 'BRL',
        gateway: tx.gateway || null,
        metadata: metadata,
        created_at: tx.created_at,
        updated_at: tx.updated_at || tx.created_at,
      }
    })

    res.json({
      transactions: mappedTransactions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        total_pages: Math.ceil(total / parseInt(limit)),
      },
      status: true,
    })
  } catch (error) {
    console.error('[PaymentController] ❌ Erro ao buscar histórico:', error)
    console.error('[PaymentController] Erro completo:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      code: error.code,
    })
    
    // Se for erro de SQL, retornar mensagem mais específica
    if (error.code === 'ER_NO_SUCH_TABLE') {
      return res.status(500).json({
        error: 'Tabela de transações não encontrada',
        message: 'A tabela "transactions" não existe no banco de dados. Execute a migração.',
        status: false,
      })
    }
    
    res.status(500).json({
      error: 'Erro ao buscar histórico',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Erro interno do servidor',
      status: false,
      details: process.env.NODE_ENV === 'development' ? {
        code: error.code,
        name: error.name,
      } : undefined,
    })
  }
}


