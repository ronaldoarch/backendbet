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

export default router
