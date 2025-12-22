import express from 'express'
import * as webhookController from '../controllers/webhookController.js'

const router = express.Router()

// Rota /webhook (mantida para compatibilidade)
router.post('/webhook', webhookController.playfiverWebhook)

// Rota /callback (usada pela URL de callback do PlayFiver)
router.post('/callback', webhookController.playfiverWebhook)

export default router


