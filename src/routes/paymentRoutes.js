import express from 'express'
import * as paymentController from '../controllers/paymentController.js'
import { authenticateToken } from '../middleware/auth.js'

const router = express.Router()

// Criar depósito
router.post('/deposit', authenticateToken, paymentController.createDeposit)

// Webhook da Arkama (público, sem autenticação)
router.post('/arkama-webhook', paymentController.arkamaWebhook)

// Verificar status de transação
router.get('/status/:transactionId', authenticateToken, paymentController.getTransactionStatus)

// Histórico de transações
router.get('/history', authenticateToken, paymentController.getTransactionHistory)

export default router

