import pool from '../config/database.js'

/**
 * GET /api/admin/users
 * Listar todos os usuários
 */
export const getAllUsers = async (req, res) => {
  try {
    const [users] = await pool.execute(
      `SELECT 
        id,
        name,
        email,
        phone,
        avatar,
        banned,
        is_admin,
        affiliate_code,
        created_at,
        updated_at
      FROM users
      ORDER BY created_at DESC`
    )

    res.json({
      status: true,
      data: users,
    })
  } catch (error) {
    console.error('[AdminUserController] Erro ao listar usuários:', error)
    res.status(500).json({
      error: 'Erro ao listar usuários',
      message: error.message,
      status: false,
    })
  }
}

/**
 * GET /api/admin/users/:id
 * Obter detalhes de um usuário específico
 */
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params

    const [users] = await pool.execute(
      `SELECT 
        id,
        name,
        email,
        phone,
        avatar,
        banned,
        is_admin,
        affiliate_code,
        created_at,
        updated_at
      FROM users
      WHERE id = ?`,
      [id]
    )

    if (!users || users.length === 0) {
      return res.status(404).json({
        error: 'Usuário não encontrado',
        status: false,
      })
    }

    res.json({
      status: true,
      data: users[0],
    })
  } catch (error) {
    console.error('[AdminUserController] Erro ao buscar usuário:', error)
    res.status(500).json({
      error: 'Erro ao buscar usuário',
      message: error.message,
      status: false,
    })
  }
}

/**
 * PUT /api/admin/users/:id
 * Atualizar usuário (apenas campos permitidos, SEM alterar senha)
 */
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params
    const {
      name,
      email,
      phone,
      avatar,
      banned,
      is_admin,
      affiliate_code,
    } = req.body

    // Verificar se usuário existe
    const [existing] = await pool.execute(
      'SELECT id FROM users WHERE id = ?',
      [id]
    )

    if (!existing || existing.length === 0) {
      return res.status(404).json({
        error: 'Usuário não encontrado',
        status: false,
      })
    }

    // Construir query UPDATE apenas com campos fornecidos (NUNCA incluir password)
    const updates = []
    const values = []

    if (name !== undefined) {
      updates.push('name = ?')
      values.push(name)
    }

    if (email !== undefined) {
      // Verificar se email já existe em outro usuário
      const [emailCheck] = await pool.execute(
        'SELECT id FROM users WHERE email = ? AND id != ?',
        [email, id]
      )

      if (emailCheck && emailCheck.length > 0) {
        return res.status(400).json({
          error: 'Email já está em uso por outro usuário',
          status: false,
        })
      }

      updates.push('email = ?')
      values.push(email)
    }

    if (phone !== undefined) {
      updates.push('phone = ?')
      values.push(phone)
    }

    if (avatar !== undefined) {
      updates.push('avatar = ?')
      values.push(avatar)
    }

    if (banned !== undefined) {
      updates.push('banned = ?')
      values.push(banned ? 1 : 0)
    }

    if (is_admin !== undefined) {
      updates.push('is_admin = ?')
      values.push(is_admin ? 1 : 0)
    }

    if (affiliate_code !== undefined) {
      updates.push('affiliate_code = ?')
      values.push(affiliate_code)
    }

    if (updates.length === 0) {
      return res.status(400).json({
        error: 'Nenhum campo para atualizar',
        status: false,
      })
    }

    // IMPORTANTE: NUNCA atualizar o campo password aqui!
    // Se precisar alterar senha, deve ser feito em uma rota separada com validação adequada
    updates.push('updated_at = NOW()')
    values.push(id)

    await pool.execute(
      `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
      values
    )

    // Buscar usuário atualizado
    const [updated] = await pool.execute(
      `SELECT 
        id,
        name,
        email,
        phone,
        avatar,
        banned,
        is_admin,
        affiliate_code,
        created_at,
        updated_at
      FROM users
      WHERE id = ?`,
      [id]
    )

    res.json({
      status: true,
      message: 'Usuário atualizado com sucesso',
      data: updated[0],
    })
  } catch (error) {
    console.error('[AdminUserController] Erro ao atualizar usuário:', error)
    res.status(500).json({
      error: 'Erro ao atualizar usuário',
      message: error.message,
      status: false,
    })
  }
}

/**
 * PUT /api/admin/users/:id/password
 * Atualizar senha do usuário (rota separada com validação)
 */
export const updatePassword = async (req, res) => {
  try {
    const { id } = req.params
    const { new_password, admin_password } = req.body

    // Validar campos obrigatórios
    if (!new_password || new_password.length < 6) {
      return res.status(400).json({
        error: 'Nova senha deve ter pelo menos 6 caracteres',
        status: false,
      })
    }

    // TODO: Validar admin_password (2FA) se necessário
    if (!admin_password) {
      return res.status(400).json({
        error: 'Senha de administrador é obrigatória',
        status: false,
      })
    }

    // Verificar se usuário existe
    const [existing] = await pool.execute(
      'SELECT id FROM users WHERE id = ?',
      [id]
    )

    if (!existing || existing.length === 0) {
      return res.status(404).json({
        error: 'Usuário não encontrado',
        status: false,
      })
    }

    // Hash da nova senha
    const bcrypt = await import('bcryptjs')
    const hashedPassword = await bcrypt.default.hash(new_password, 10)

    // Atualizar senha
    await pool.execute(
      'UPDATE users SET password = ?, updated_at = NOW() WHERE id = ?',
      [hashedPassword, id]
    )

    res.json({
      status: true,
      message: 'Senha atualizada com sucesso',
    })
  } catch (error) {
    console.error('[AdminUserController] Erro ao atualizar senha:', error)
    res.status(500).json({
      error: 'Erro ao atualizar senha',
      message: error.message,
      status: false,
    })
  }
}

export default {
  getAllUsers,
  getUserById,
  updateUser,
  updatePassword,
}

