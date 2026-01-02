import { authenticateToken } from './auth.js'

/**
 * Middleware para verificar se o usuário é admin
 * Alias para authenticateAdmin usando authenticateToken
 */
export const authenticateAdmin = (req, res, next) => {
  authenticateToken(req, res, () => {
    if (!req.user || !req.user.is_admin) {
      return res.status(403).json({ 
        error: 'Acesso negado. Apenas administradores.',
        status: false 
      })
    }
    next()
  })
}
