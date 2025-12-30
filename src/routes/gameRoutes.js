import express from 'express'
import * as gameController from '../controllers/gameController.js'
import { authenticateToken } from '../middleware/auth.js'

const router = express.Router()

// Rotas públicas de jogos
router.get('/all', gameController.getAllGames)
router.get('/featured', gameController.getFeaturedGames)
router.get('/source', gameController.getSourceGames)
router.get('/casinos', gameController.getCasinoGames)

// Rotas autenticadas de jogos
router.get('/single/:id', authenticateToken, gameController.getSingleGame)
router.get('/favorites', authenticateToken, gameController.getFavorites)
router.post('/favorite/:id', authenticateToken, gameController.toggleFavorite)
router.post('/like/:id', authenticateToken, gameController.toggleLike)

export default router

