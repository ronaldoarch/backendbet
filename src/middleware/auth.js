import jwt from 'jsonwebtoken'
import pool from '../config/database.js'

export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]

    if (!token) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Token não fornecido',
        status: false,
      })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key')
    
    // Buscar usuário no banco
    const [users] = await pool.execute(
      'SELECT id, name, email, phone, avatar, banned FROM users WHERE id = ?',
      [decoded.userId]
    )

    if (!users || users.length === 0) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Usuário não encontrado',
        status: false,
      })
    }

    const user = users[0]

    if (user.banned) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Usuário banido',
        status: false,
      })
    }

    req.user = user
    next()
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Token expirado',
        status: false,
      })
    }
    
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Token inválido',
      status: false,
    })
  }
}

export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key')
      const [users] = await pool.execute(
        'SELECT id, name, email, phone, avatar, banned FROM users WHERE id = ?',
        [decoded.userId]
      )
      if (users && users.length > 0 && !users[0].banned) {
        req.user = users[0]
      }
    }
    next()
  } catch (error) {
    next()
  }
}


