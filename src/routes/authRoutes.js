import express from 'express'
import * as authController from '../controllers/authController.js'
import { authenticateToken } from '../middleware/auth.js'

const router = express.Router()

// Rotas de autenticação
router.post('/login', authController.login)
router.post('/register', authController.register)
router.post('/logout', authenticateToken, authController.logout)

// Rota para obter dados do usuário autenticado (suporta GET e POST)
router.get('/me', authenticateToken, authController.me)
router.post('/me', authenticateToken, authController.me)

// Rota de compatibilidade para /profile/wallet
import * as walletController from '../controllers/walletController.js'
router.get('/profile/wallet', authenticateToken, walletController.getBalance)

export default router

