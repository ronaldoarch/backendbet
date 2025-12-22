import express from 'express'
import * as authController from '../controllers/authController.js'
import { authenticateToken } from '../middleware/auth.js'

const router = express.Router()

router.post('/login', authController.login)
router.post('/register', authController.register)
router.get('/verify', authenticateToken, authController.verify)
router.post('/me', authenticateToken, authController.me)
router.post('/logout', authenticateToken, authController.logout)

export default router


