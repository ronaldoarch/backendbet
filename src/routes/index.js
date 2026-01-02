import express from 'express'
import gameRoutes from './gameRoutes.js'
import settingsRoutes from './settingsRoutes.js'
import categoryRoutes from './categoryRoutes.js'
import authRoutes from './authRoutes.js'
import walletRoutes from './walletRoutes.js'

const router = express.Router()

// Rota raiz da API
router.get('/', (req, res) => {
  res.json({
    message: 'API Backend Fortune Vegas',
    version: '1.0.0',
    status: 'online'
  })
})

// Registrar todas as rotas
router.use('/games', gameRoutes)
router.use('/settings', settingsRoutes)
router.use('/categories', categoryRoutes)
router.use('/auth', authRoutes)
router.use('/profile', walletRoutes)

console.log('✅ Todas as rotas registradas com sucesso')

export default router
