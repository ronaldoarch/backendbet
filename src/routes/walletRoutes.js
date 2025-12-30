import express from 'express'

const router = express.Router()

// Rotas de carteira
router.get('/balance', (req, res) => {
  res.json({ message: 'Get balance endpoint - implementar' })
})

router.post('/deposit', (req, res) => {
  res.json({ message: 'Deposit endpoint - implementar' })
})

router.post('/withdraw', (req, res) => {
  res.json({ message: 'Withdraw endpoint - implementar' })
})

export default router

