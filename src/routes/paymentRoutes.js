import express from 'express'
import * as paymentController from '../controllers/paymentController.js'
import { authenticateToken } from '../middleware/auth.js'

const router = express.Router()

// Criar depósito
router.post('/deposit', authenticateToken, paymentController.createDeposit)

// Webhook da Arkama (público, sem autenticação)
// Aceita GET para validação e POST para webhooks
router.get('/arkama-webhook', (req, res) => {
  // Responder para validação de postback (GET)
  res.status(200).json({
    success: true,
    message: 'Webhook endpoint está ativo',
  })
})

router.post('/arkama-webhook', paymentController.arkamaWebhook)

// Webhook do Cartwavehub (público, sem autenticação)
router.get('/cartwavehub-webhook', (req, res) => {
  // Responder para validação de postback (GET)
  res.status(200).json({
    success: true,
    message: 'Webhook endpoint está ativo',
  })
})

import * as cartwavehubWebhookController from '../controllers/cartwavehubWebhookController.js'
router.post('/cartwavehub-webhook', cartwavehubWebhookController.cartwavehubWebhook)

// Verificar status de transação
router.get('/status/:transactionId', authenticateToken, paymentController.getTransactionStatus)

// Histórico de transações
router.get('/history', authenticateToken, paymentController.getTransactionHistory)

export default router

