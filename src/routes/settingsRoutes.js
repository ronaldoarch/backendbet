import express from 'express'

const router = express.Router()

// Rotas de configurações
router.get('/data', (req, res) => {
  res.json({ message: 'Get settings endpoint - implementar' })
})

export default router

