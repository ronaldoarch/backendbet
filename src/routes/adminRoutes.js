import express from 'express'
import * as adminGameController from '../controllers/adminGameController.js'
import * as playfiverKeysController from '../controllers/playfiverKeysController.js'
import * as arkamaKeysController from '../controllers/arkamaKeysController.js'
import * as cartwavehubKeysController from '../controllers/cartwavehubKeysController.js'
import * as bannerController from '../controllers/bannerController.js'
import * as providerController from '../controllers/providerController.js'
import * as storyController from '../controllers/storyController.js'
import * as adminStoryController from '../controllers/adminStoryController.js'
import * as adminUserController from '../controllers/adminUserController.js'
import { authenticateAdmin } from '../middleware/adminAuth.js'

const router = express.Router()

// Todas as rotas administrativas requerem autenticação de admin
router.use(authenticateAdmin)

// Rotas de jogos administrativos
router.get('/games', adminGameController.getAllGames)

// Rotas de chaves de APIs
router.get('/keys/playfiver', playfiverKeysController.getKeys)
router.put('/keys/playfiver', playfiverKeysController.updateKeys)
// Rotas alternativas para compatibilidade com frontend
router.get('/playfiver-keys', playfiverKeysController.getKeys)
router.put('/playfiver-keys', playfiverKeysController.updateKeys)
router.post('/playfiver-keys', playfiverKeysController.updateKeys) // POST também suportado
router.get('/playfiver-keys/info', playfiverKeysController.getInfo)
router.post('/playfiver-keys/info', playfiverKeysController.updateInfo)
router.put('/playfiver-keys/info', playfiverKeysController.updateInfo) // PUT também suportado
// Rotas dos gateways temporariamente desabilitadas - serão adicionadas depois
// router.get('/keys/arkama', arkamaKeysController.getArkamaKeys)
// router.put('/keys/arkama', arkamaKeysController.saveArkamaKeys)
// router.get('/keys/cartwavehub', cartwavehubKeysController.getCartwavehubKeys)
// router.put('/keys/cartwavehub', cartwavehubKeysController.saveCartwavehubKeys)

// Rotas de banners
router.get('/banners', bannerController.getAllBanners)
router.post('/banners', bannerController.createBanner)

// Rotas de provedores - temporariamente desabilitadas
// router.get('/providers', providerController.listProviders)
// router.get('/providers/:id', providerController.getProviderById)

// Rotas de stories - temporariamente desabilitadas
// router.get('/stories', adminStoryController.listAdminStories)

// Rotas de usuários
router.get('/users', adminUserController.getAllUsers)
router.get('/users/:id', adminUserController.getUserById)
router.put('/users/:id', adminUserController.updateUser)
router.put('/users/:id/password', adminUserController.updatePassword)

export default router
