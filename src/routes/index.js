import express from 'express'
import authRoutes from './authRoutes.js'
import gameRoutes from './gameRoutes.js'
import categoryRoutes from './categoryRoutes.js'
import settingsRoutes from './settingsRoutes.js'
import walletRoutes from './walletRoutes.js'
import webhookRoutes from './webhookRoutes.js'
import adminRoutes from './adminRoutes.js'
import * as providerController from '../controllers/providerController.js'
import * as gameController from '../controllers/gameController.js'
import * as bannerController from '../controllers/bannerController.js'

const router = express.Router()

router.use('/auth', authRoutes)
router.use('/games', gameRoutes)
router.use('/categories', categoryRoutes)
router.use('/settings', settingsRoutes)
router.use('/profile', walletRoutes)
router.use('/playfiver', webhookRoutes)
router.use('/admin', adminRoutes)
router.get('/providers', providerController.getProviders)
router.get('/banners', bannerController.getBanners) // Public banners route

// Rotas específicas de jogos com prefixos
router.get('/featured/games', gameController.getFeaturedGames)
router.get('/casinos/games', gameController.getCasinoGames)
router.get('/source/games', gameController.getSourceGames)

export default router

