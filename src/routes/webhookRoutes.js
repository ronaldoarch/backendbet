import express from 'express'

const router = express.Router()

// Rotas de webhooks
router.post('/cartwave', (req, res) => {
  res.json({ message: 'Cartwave webhook endpoint - implementar' })
})

router.post('/arkama', (req, res) => {
  res.json({ message: 'Arkama webhook endpoint - implementar' })
})

export default router

