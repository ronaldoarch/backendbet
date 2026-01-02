import express from 'express'
import * as walletController from '../controllers/walletController.js'
import { authenticateToken } from '../middleware/auth.js'

const router = express.Router()

// Todas as rotas de wallet requerem autenticação
router.use(authenticateToken)

// Rotas de carteira
router.get('/balance', walletController.getBalance)
router.get('/wallet', walletController.getBalance) // Rota alternativa para compatibilidade

// Rotas de depósito e saque (redirecionam para paymentController)
router.post('/deposit', walletController.deposit)
router.post('/withdraw', walletController.withdraw)

export default router

