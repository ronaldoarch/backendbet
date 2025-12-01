import jwt from 'jsonwebtoken'
import pool from '../config/database.js'

/**
 * Middleware para verificar se o usuário está autenticado E é admin
 * Verifica se o usuário tem o campo is_admin = 1 na tabela users
 */
export const requireAdmin = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]

    if (!token) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Token não fornecido. Faça login para acessar esta área.',
        status: false,
      })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key')
    
    // Buscar usuário no banco com verificação de admin
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

    // Verificar se o usuário é admin
    // is_admin pode ser 1, true, '1', ou qualquer valor truthy
    const isAdmin = user.is_admin === 1 || 
                   user.is_admin === true || 
                   user.is_admin === '1' ||
                   String(user.is_admin).toLowerCase() === 'true'

    if (!isAdmin) {
      console.warn(`[AdminAuth] Tentativa de acesso não autorizado: User ID ${user.id} (${user.email})`)
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Acesso negado. Apenas administradores podem acessar esta área.',
        status: false,
      })
    }

    req.user = user
    next()
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Token expirado. Faça login novamente.',
        status: false,
      })
    }
    
    console.error('[AdminAuth] Erro ao verificar autenticação:', error)
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Token inválido',
      status: false,
    })
  }
}

