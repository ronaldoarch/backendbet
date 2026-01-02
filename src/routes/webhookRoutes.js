import express from 'express'
import * as playfiverWebhookController from '../controllers/playfiverWebhookController.js'

const router = express.Router()

// Rotas de webhooks
router.post('/cartwave', (req, res) => {
  res.json({ message: 'Cartwave webhook endpoint - implementar' })
})

router.post('/arkama', (req, res) => {
  res.json({ message: 'Arkama webhook endpoint - implementar' })
})

// Webhook PlayFiver
router.post('/playfiver/callback', playfiverWebhookController.callback)
router.get('/playfiver/callback', playfiverWebhookController.callback) // Alguns webhooks podem usar GET

export default router

