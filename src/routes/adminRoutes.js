import express from 'express'
import * as adminGameController from '../controllers/adminGameController.js'
import * as playfiverKeysController from '../controllers/playfiverKeysController.js'
import * as arkamaKeysController from '../controllers/arkamaKeysController.js'
import * as cartwavehubKeysController from '../controllers/cartwavehubKeysController.js'
import * as providerController from '../controllers/providerController.js'
import * as bannerController from '../controllers/bannerController.js'
import * as adminStoryController from '../controllers/adminStoryController.js'
// import { authenticateToken } from '../middleware/auth.js'

const router = express.Router()

// Autenticação desabilitada temporariamente para desenvolvimento
// TODO: Habilitar autenticação em produção
// router.use(authenticateToken)

router.get('/games', adminGameController.getAllGames)
router.post('/games', adminGameController.createGame)
router.put('/games/:id', adminGameController.updateGame)
router.delete('/games/:id', adminGameController.deleteGame)

// PlayFiver Keys
router.get('/playfiver-keys', playfiverKeysController.getPlayfiverKeys)
router.post('/playfiver-keys', playfiverKeysController.savePlayfiverKeys)
router.put('/playfiver-keys/info', playfiverKeysController.updatePlayfiverInfo)

// Arkama Keys
router.get('/arkama-keys', arkamaKeysController.getArkamaKeys)
router.post('/arkama-keys', arkamaKeysController.saveArkamaKeys)

// Cartwavehub Keys
router.get('/cartwavehub-keys', cartwavehubKeysController.getCartwavehubKeys)
router.post('/cartwavehub-keys', cartwavehubKeysController.saveCartwavehubKeys)

// Providers
router.get('/providers', providerController.getAllProviders)
router.post('/providers', providerController.createProvider)
router.put('/providers/:id', providerController.updateProvider)
router.delete('/providers/:id', providerController.deleteProvider)

// Banners
router.get('/banners', bannerController.getAllBanners)
router.get('/banners/:id', bannerController.getBanner)
router.post('/banners', bannerController.createBanner)
router.put('/banners/:id', bannerController.updateBanner)
router.delete('/banners/:id', bannerController.deleteBanner)

// Stories
router.get('/stories', adminStoryController.getAllStories)
router.post('/stories', adminStoryController.createStory)
router.put('/stories/:id', adminStoryController.updateStory)
router.delete('/stories/:id', adminStoryController.deleteStory)

export default router

