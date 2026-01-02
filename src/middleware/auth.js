import jwt from 'jsonwebtoken'

/**
 * Middleware para autenticar tokens JWT
 */
export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1] // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ 
      error: 'Token de acesso requerido',
      status: false 
    })
  }

  jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, decoded) => {
    if (err) {
      return res.status(403).json({ 
        error: 'Token inválido ou expirado',
        status: false 
      })
    }

    // Mapear userId para id para compatibilidade com os controllers
    req.user = {
      id: decoded.userId || decoded.id,
      userId: decoded.userId || decoded.id,
      email: decoded.email,
      is_admin: decoded.is_admin || false
    }
    next()
  })
}

/**
 * Middleware para verificar se o usuário é admin
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

