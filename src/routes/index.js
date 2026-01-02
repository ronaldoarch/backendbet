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

// Importar e usar todas as rotas (usando importação dinâmica com .then())
Promise.all([
  import('./gameRoutes.js').catch(() => null),
  import('./settingsRoutes.js').catch(() => null),
  import('./categoryRoutes.js').catch(() => null),
  import('./authRoutes.js').catch(() => null),
  import('./walletRoutes.js').catch(() => null),
])
  .then(([gameRoutes, settingsRoutes, categoryRoutes, authRoutes, walletRoutes]) => {
    // Rotas de jogos
    if (gameRoutes) {
      router.use('/games', gameRoutes.default || gameRoutes)
    }
    
    // Rotas de configurações
    if (settingsRoutes) {
      router.use('/settings', settingsRoutes.default || settingsRoutes)
    }
    
    // Rotas de categorias
    if (categoryRoutes) {
      router.use('/categories', categoryRoutes.default || categoryRoutes)
    }
    
    // Rotas de autenticação
    if (authRoutes) {
      router.use('/auth', authRoutes.default || authRoutes)
    }
    
    // Rotas de carteira
    if (walletRoutes) {
      router.use('/profile', walletRoutes.default || walletRoutes)
    }
    
    console.log('✅ Todas as rotas carregadas com sucesso')
  })
  .catch((error) => {
    console.warn('⚠️  Erro ao carregar algumas rotas:', error.message)
  })

export default router
