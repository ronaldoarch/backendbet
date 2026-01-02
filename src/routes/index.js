import express from 'express'

const router = express.Router()

// Rota raiz da API
router.get('/', (req, res) => {
  res.json({
    message: 'API Backend Fortune Vegas',
    version: '1.0.0',
    status: 'online'
  })
})

// Importar e usar todas as rotas
try {
  // Rotas de jogos
  const gameRoutes = await import('./gameRoutes.js')
  router.use('/games', gameRoutes.default || gameRoutes)
  
  // Rotas de configurações
  const settingsRoutes = await import('./settingsRoutes.js')
  router.use('/settings', settingsRoutes.default || settingsRoutes)
  
  // Rotas de categorias
  const categoryRoutes = await import('./categoryRoutes.js')
  router.use('/categories', categoryRoutes.default || categoryRoutes)
  
  // Rotas de autenticação
  const authRoutes = await import('./authRoutes.js')
  router.use('/auth', authRoutes.default || authRoutes)
  
  // Rotas de carteira
  const walletRoutes = await import('./walletRoutes.js')
  router.use('/profile', walletRoutes.default || walletRoutes)
  
  console.log('✅ Todas as rotas carregadas com sucesso')
} catch (error) {
  console.warn('⚠️  Erro ao carregar algumas rotas:', error.message)
}

export default router
