import express from 'express'
import * as adminGameController from '../controllers/adminGameController.js'
import * as playfiverKeysController from '../controllers/playfiverKeysController.js'
import * as arkamaKeysController from '../controllers/arkamaKeysController.js'
import * as cartwavehubKeysController from '../controllers/cartwavehubKeysController.js'
import * as bannerController from '../controllers/bannerController.js'
import * as providerController from '../controllers/providerController.js'
import * as storyController from '../controllers/storyController.js'
import * as adminStoryController from '../controllers/adminStoryController.js'
import { authenticateAdmin } from '../middleware/adminAuth.js'

const router = express.Router()

// Todas as rotas administrativas requerem autenticação de admin
router.use(authenticateAdmin)

// Rotas de jogos administrativos
router.get('/games', adminGameController.listAdminGames)

// Rotas de chaves de APIs
router.get('/keys/playfiver', playfiverKeysController.getKeys)
router.put('/keys/playfiver', playfiverKeysController.updateKeys)
router.get('/keys/arkama', arkamaKeysController.getKeys)
router.put('/keys/arkama', arkamaKeysController.updateKeys)
router.get('/keys/cartwavehub', cartwavehubKeysController.getKeys)
router.put('/keys/cartwavehub', cartwavehubKeysController.updateKeys)

// Rotas de banners
router.get('/banners', bannerController.listBanners)
router.post('/banners', bannerController.createBanner)

// Rotas de provedores
router.get('/providers', providerController.listProviders)
router.get('/providers/:id', providerController.getProviderById)

// Rotas de stories
router.get('/stories', adminStoryController.listAdminStories)

export default router
