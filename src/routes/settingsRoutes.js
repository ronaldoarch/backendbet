import express from 'express'
import * as settingsController from '../controllers/settingsController.js'

const router = express.Router()

router.get('/data', settingsController.getSettings)
router.get('/banners', settingsController.getBanners)

// Admin routes
router.get('/admin', settingsController.getAdminSettings)
router.put('/admin', settingsController.updateSettings)

export default router


