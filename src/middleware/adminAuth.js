import jwt from 'jsonwebtoken'
import pool from '../config/database.js'

export const authenticateAdmin = async (req, res, next) => {
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
    
    // Buscar usuário no banco (MySQL)
    const [users] = await pool.execute(
      'SELECT id, name, email, phone, avatar, banned, is_admin FROM users WHERE id = ?',
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

    // Verificar se é admin
    if (!user.is_admin) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Acesso negado. Apenas administradores podem acessar esta rota.',
        status: false,
      })
    }

    req.user = user
    req.admin = true
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

