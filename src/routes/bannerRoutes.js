import express from 'express'
import * as bannerController from '../controllers/bannerController.js'

const router = express.Router()

// Rotas públicas de banners
router.get('/', bannerController.getBanners)

export default router

