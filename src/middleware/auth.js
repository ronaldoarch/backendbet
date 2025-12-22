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
    
    // Buscar usuário no banco (PostgreSQL usa $1, $2, etc.)
    const result = await pool.query(
      'SELECT id, name, email, phone, avatar, banned FROM users WHERE id = $1',
      [decoded.userId]
    )

    if (!result.rows || result.rows.length === 0) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Usuário não encontrado',
        status: false,
      })
    }

    const user = result.rows[0]

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
      const result = await pool.query(
        'SELECT id, name, email, phone, avatar, banned FROM users WHERE id = $1',
        [decoded.userId]
      )
      if (result.rows && result.rows.length > 0 && !result.rows[0].banned) {
        req.user = result.rows[0]
      }
    }
    next()
  } catch (error) {
    next()
  }
}


