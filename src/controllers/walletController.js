import pool from '../config/database.js'
import { authenticateToken } from '../middleware/auth.js'

/**
 * GET /api/wallet/balance
 * GET /api/profile/wallet (compatibilidade)
 * Obter saldo da carteira do usuário autenticado
 */
export const getBalance = async (req, res) => {
  try {
    const userId = req.user?.id

    if (!userId) {
      return res.status(401).json({
        error: 'Usuário não autenticado',
        status: false,
      })
    }

    // Buscar carteira do usuário
    const [wallets] = await pool.execute(
      `SELECT 
        balance,
        balance_bonus,
        balance_withdrawal,
        created_at,
        updated_at
      FROM wallets 
      WHERE user_id = ?`,
      [userId]
    )

    if (!wallets || wallets.length === 0) {
      // Criar carteira se não existir
      await pool.execute(
        `INSERT INTO wallets (user_id, balance, balance_bonus, balance_withdrawal, created_at, updated_at)
         VALUES (?, 0.00, 0.00, 0.00, NOW(), NOW())`,
        [userId]
      )

      return res.json({
        status: true,
        wallet: {
          balance: 0.00,
          balance_bonus: 0.00,
          balance_withdrawal: 0.00,
        },
      })
    }

    const wallet = wallets[0]

    res.json({
      status: true,
      wallet: {
        balance: parseFloat(wallet.balance || 0),
        balance_bonus: parseFloat(wallet.balance_bonus || 0),
        balance_withdrawal: parseFloat(wallet.balance_withdrawal || 0),
      },
    })
  } catch (error) {
    console.error('[WalletController] Erro ao buscar saldo:', error)
    res.status(500).json({
      error: 'Erro ao buscar saldo',
      message: error.message,
      status: false,
    })
  }
}

/**
 * POST /api/wallet/deposit
 * Criar depósito (redireciona para paymentController)
 */
export const deposit = async (req, res) => {
  // Esta função redireciona para o paymentController
  // Mantida para compatibilidade
  res.status(501).json({
    error: 'Use /api/payments/deposit',
    status: false,
  })
}

/**
 * POST /api/wallet/withdraw
 * Criar saque (redireciona para paymentController)
 */
export const withdraw = async (req, res) => {
  // Esta função redireciona para o paymentController
  // Mantida para compatibilidade
  res.status(501).json({
    error: 'Use /api/payments/withdraw',
    status: false,
  })
}

export default {
  getBalance,
  deposit,
  withdraw,
}
