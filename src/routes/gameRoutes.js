import express from 'express'
import * as gameController from '../controllers/gameController.js'
import { authenticateToken, optionalAuth } from '../middleware/auth.js'

const router = express.Router()

// Rotas diretas
router.get('/all', gameController.getAllGames)
router.get('/single/:id', authenticateToken, gameController.getSingleGame)
router.get('/favorites', authenticateToken, gameController.getFavorites)
router.post('/favorite/:id', authenticateToken, gameController.toggleFavorite)
router.post('/like/:id', authenticateToken, gameController.toggleLike)

// Rotas com prefixos (usadas com router.use('/featured', ...), etc)
router.get('/games', gameController.getFeaturedGames) // Para /featured/games
router.get('/games', optionalAuth, gameController.getCasinoGames) // Para /casinos/games  
router.get('/games', gameController.getSourceGames) // Para /source/games

export default router

