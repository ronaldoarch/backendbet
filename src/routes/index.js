import express from 'express'
import authRoutes from './authRoutes.js'
import gameRoutes from './gameRoutes.js'
import categoryRoutes from './categoryRoutes.js'
import settingsRoutes from './settingsRoutes.js'
import walletRoutes from './walletRoutes.js'
import paymentRoutes from './paymentRoutes.js'
import webhookRoutes from './webhookRoutes.js'
import bannerRoutes from './bannerRoutes.js'
import providerRoutes from './providerRoutes.js'
import adminRoutes from './adminRoutes.js'
import * as playfiverWebhookController from '../controllers/playfiverWebhookController.js'

const router = express.Router()

// Rotas públicas
router.use('/auth', authRoutes)
router.use('/games', gameRoutes)
router.use('/categories', categoryRoutes)
router.use('/settings', settingsRoutes)
router.use('/wallet', walletRoutes)
router.use('/payments', paymentRoutes)
router.use('/webhooks', webhookRoutes)
router.use('/banners', bannerRoutes)
router.use('/providers', providerRoutes)

// Rota direta do PlayFiver webhook (sem prefixo /webhooks)
router.post('/playfiver/callback', playfiverWebhookController.callback)
router.get('/playfiver/callback', playfiverWebhookController.callback)

// Rotas administrativas
router.use('/admin', adminRoutes)

// Rota de teste
router.get('/', (req, res) => {
  res.json({
    message: 'BetGenius API v1.0.0',
    status: 'running',
    endpoints: {
      auth: '/api/auth',
      games: '/api/games',
      categories: '/api/categories',
      settings: '/api/settings',
      wallet: '/api/wallet',
      payments: '/api/payments',
      webhooks: '/api/webhooks',
      providers: '/api/providers',
      admin: '/api/admin',
    },
  })
})

export default router

