import express from 'express'

const router = express.Router()

// Rotas de categorias
router.get('/', (req, res) => {
  res.json({ message: 'List categories endpoint - implementar' })
})

export default router

