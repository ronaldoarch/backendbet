import express from 'express'
import * as walletController from '../controllers/walletController.js'
import { authenticateToken } from '../middleware/auth.js'

const router = express.Router()

router.get('/wallet', authenticateToken, walletController.getWallet)

export default router


