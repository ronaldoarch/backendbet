import express from 'express'
import * as settingsController from '../controllers/settingsController.js'

const router = express.Router()

// Rotas de configurações
router.get('/data', settingsController.getSettings)

export default router

