import pool from '../config/database.js'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'

// Controller de autenticação
export const login = async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({
        error: 'Email e senha são obrigatórios',
        status: false,
      })
    }

    // Buscar usuário no banco
    const [users] = await pool.execute(
      'SELECT id, name, email, phone, avatar, password, banned FROM users WHERE email = ?',
      [email]
    )

    if (!users || users.length === 0) {
      return res.status(401).json({
        error: 'Credenciais inválidas',
        status: false,
      })
    }

    const user = users[0]

    if (user.banned) {
      return res.status(403).json({
        error: 'Usuário banido',
        status: false,
      })
    }

    // Verificar senha
    const isValidPassword = await bcrypt.compare(password, user.password)
    if (!isValidPassword) {
      return res.status(401).json({
        error: 'Credenciais inválidas',
        status: false,
      })
    }

    // Gerar token JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    )

    // Remover senha da resposta
    delete user.password

    res.json({
      message: 'Login realizado com sucesso',
      status: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        avatar: user.avatar,
      },
    })
  } catch (error) {
    console.error('Erro no login:', error)
    res.status(500).json({ error: error.message, status: false })
  }
}

export const register = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body

    if (!name || !email || !password) {
      return res.status(400).json({
        error: 'Nome, email e senha são obrigatórios',
        status: false,
      })
    }

    // Verificar se email já existe
    const [existingUsers] = await pool.execute(
      'SELECT id FROM users WHERE email = ?',
      [email]
    )

    if (existingUsers && existingUsers.length > 0) {
      return res.status(400).json({
        error: 'Email já cadastrado',
        status: false,
      })
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(password, 10)

    // Criar usuário
    const [result] = await pool.execute(
      'INSERT INTO users (name, email, password, phone) VALUES (?, ?, ?, ?)',
      [name, email, hashedPassword, phone || null]
    )

    // Gerar token JWT
    const token = jwt.sign(
      { userId: result.insertId, email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    )

    res.status(201).json({
      message: 'Usuário criado com sucesso',
      status: true,
      token,
      user: {
        id: result.insertId,
        name,
        email,
        phone: phone || null,
      },
    })
  } catch (error) {
    console.error('Erro no registro:', error)
    res.status(500).json({ error: error.message, status: false })
  }
}

export const logout = async (req, res) => {
  try {
    // Em uma implementação completa, você invalidaria o token aqui
    // Por enquanto, apenas retorna sucesso
    res.json({
      message: 'Logout realizado com sucesso',
      status: true,
    })
  } catch (error) {
    res.status(500).json({ error: error.message, status: false })
  }
}

// Obter dados do usuário autenticado
export const me = async (req, res) => {
  try {
    // req.user é definido pelo middleware authenticateToken
    if (!req.user) {
      return res.status(401).json({
        error: 'Não autenticado',
        status: false,
      })
    }

    // Buscar dados atualizados do usuário
    const [users] = await pool.execute(
      'SELECT id, name, email, phone, avatar, banned FROM users WHERE id = ?',
      [req.user.id]
    )

    if (!users || users.length === 0) {
      return res.status(404).json({
        error: 'Usuário não encontrado',
        status: false,
      })
    }

    const user = users[0]

    res.json({
      status: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        avatar: user.avatar,
      },
    })
  } catch (error) {
    console.error('Erro ao obter dados do usuário:', error)
    res.status(500).json({ error: error.message, status: false })
  }
}

export default {
  login,
  register,
  logout,
  me,
}

