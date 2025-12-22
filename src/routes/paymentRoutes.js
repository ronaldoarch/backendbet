import express from 'express'
import * as paymentController from '../controllers/paymentController.js'
import * as cartwavehubWebhookController from '../controllers/cartwavehubWebhookController.js'
import { authenticateToken } from '../middleware/auth.js'

const router = express.Router()

// Rotas de pagamentos (autenticadas)
router.post('/deposit', authenticateToken, paymentController.createDeposit)
router.get('/status/:transactionId', authenticateToken, paymentController.getTransactionStatus)
router.get('/history', authenticateToken, paymentController.getTransactionHistory)

// Webhooks (públicos - não precisam autenticação)
router.post('/cartwavehub-webhook', cartwavehubWebhookController.callback)
router.post('/arkama-webhook', paymentController.arkamaWebhook)

export default router
