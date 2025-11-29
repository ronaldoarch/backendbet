import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import pool from '../config/database.js'
import validator from 'validator'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'
const JWT_EXPIRATION = parseInt(process.env.JWT_EXPIRATION || '3600')

export const login = async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({
        error: 'Check credentials',
        status: false,
      })
    }

    const [users] = await pool.execute(
      'SELECT id, name, email, phone, password, banned FROM users WHERE email = ?',
      [email]
    )

    if (!users || users.length === 0) {
      return res.status(400).json({
        error: 'Check credentials',
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

    const validPassword = await bcrypt.compare(password, user.password)

    if (!validPassword) {
      return res.status(400).json({
        error: 'Check credentials',
        status: false,
      })
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRATION }
    )

    res.json({
      access_token: token,
      token_type: 'bearer',
      expires_in: JWT_EXPIRATION,
    })
  } catch (error) {
    console.error('Erro no login:', error)
    res.status(500).json({
      error: 'Erro interno do servidor',
      status: false,
    })
  }
}

export const register = async (req, res) => {
  try {
    const { name, email, phone, password, cupom, reference_code, affiliate_code } = req.body

    // Validações
    const errors = {}

    if (!name || name.length > 255) {
      errors.name = ['O nome é obrigatório e deve ter no máximo 255 caracteres']
    }

    if (!email || !validator.isEmail(email)) {
      errors.email = ['Email inválido']
    }

    // Telefone é opcional, mas se fornecido deve ser válido
    if (phone && (phone.length < 10 || phone.length > 15)) {
      errors.phone = ['Telefone inválido (10-15 caracteres)']
    }

    if (!password || password.length < 6) {
      errors.password = ['Senha deve ter no mínimo 6 caracteres']
    }

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({
        ...errors,
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
        email: ['The email has already been taken.'],
        status: false,
      })
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(password, 10)

    // Gerar código de afiliado único
    const affiliateCode = `AFF${Date.now()}${Math.random().toString(36).substr(2, 5).toUpperCase()}`

    // Criar usuário
    // Usar reference_code ou affiliate_code (o frontend envia affiliate_code)
    const inviterCode = reference_code || affiliate_code || null
    
    const [result] = await pool.execute(
      `INSERT INTO users (name, email, phone, password, affiliate_code, inviter_code, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [name, email, phone || '', hashedPassword, affiliateCode, inviterCode]
    )

    const userId = result.insertId

    // Criar carteira
    await pool.execute(
      `INSERT INTO wallets (user_id, balance, balance_bonus, balance_withdrawal, created_at, updated_at)
       VALUES (?, 0, 0, 0, NOW(), NOW())`,
      [userId]
    )

    // Processar cupom se fornecido
    if (cupom) {
      // TODO: Implementar lógica de cupom
    }

    // Gerar token
    const token = jwt.sign(
      { userId, email },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRATION }
    )

    res.status(201).json({
      access_token: token,
      token_type: 'bearer',
      expires_in: JWT_EXPIRATION,
    })
  } catch (error) {
    console.error('Erro no registro:', error)
    res.status(500).json({
      error: 'Erro interno do servidor',
      status: false,
    })
  }
}

export const verify = async (req, res) => {
  try {
    const user = req.user
    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
    })
  } catch (error) {
    res.status(401).json({
      error: 'Unauthorized',
      status: false,
    })
  }
}

export const me = async (req, res) => {
  try {
    const user = req.user
    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      avatar: user.avatar || null,
    })
  } catch (error) {
    res.status(401).json({
      error: 'Unauthorized',
      status: false,
    })
  }
}

export const logout = async (req, res) => {
  res.json({
    message: 'Successfully logged out',
  })
}

