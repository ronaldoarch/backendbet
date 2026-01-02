import express from 'express'
import * as providerController from '../controllers/providerController.js'

const router = express.Router()

// Rota pública - lista apenas provedores ativos
router.get('/', providerController.getProviders)

export default router

