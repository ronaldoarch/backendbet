import express from 'express'
import * as paymentController from '../controllers/paymentController.js'
// Webhooks desativados - usando apenas SuitPay
// import * as cartwavehubWebhookController from '../controllers/cartwavehubWebhookController.js'
import { authenticateToken } from '../middleware/auth.js'

const router = express.Router()

// Rotas de pagamentos (autenticadas)
router.post('/deposit', authenticateToken, paymentController.createDeposit)
router.get('/status/:transactionId', authenticateToken, paymentController.getTransactionStatus)
router.get('/history', authenticateToken, paymentController.getTransactionHistory)

// Webhooks (públicos - não precisam autenticação)
// Webhooks desativados - usando apenas SuitPay
// router.post('/cartwavehub-webhook', cartwavehubWebhookController.callback)
// router.post('/arkama-webhook', paymentController.arkamaWebhook)
router.post('/suitpay-webhook', paymentController.suitpayWebhook)

export default router
