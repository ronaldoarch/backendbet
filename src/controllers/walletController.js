import pool from '../config/database.js'

export const getWallet = async (req, res) => {
  try {
    const userId = req.user.id

    const [wallets] = await pool.execute(
      'SELECT * FROM wallets WHERE user_id = ?',
      [userId]
    )

    if (!wallets || wallets.length === 0) {
      return res.status(404).json({
        error: 'Carteira não encontrada',
        status: false,
      })
    }

    const wallet = wallets[0]
    const totalBalance = parseFloat(wallet.balance || 0) + 
                        parseFloat(wallet.balance_bonus || 0) + 
                        parseFloat(wallet.balance_withdrawal || 0)

    res.json({
      wallet: {
        ...wallet,
        total_balance: totalBalance,
      },
    })
  } catch (error) {
    console.error('Erro ao buscar carteira:', error)
    res.status(500).json({
      error: 'Erro ao buscar carteira',
      status: false,
    })
  }
}


