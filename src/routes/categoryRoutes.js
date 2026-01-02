import express from 'express'
import * as categoryController from '../controllers/categoryController.js'

const router = express.Router()

// Rotas de categorias
router.get('/', categoryController.listCategories)

export default router

