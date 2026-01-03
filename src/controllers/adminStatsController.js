import pool from '../config/database.js'

/**
 * GET /api/admin/stats
 * Estatísticas do dashboard administrativo
 */
export const getDashboardStats = async (req, res) => {
  try {
    console.log('[AdminStatsController] Buscando estatísticas do dashboard...')

    // Total de usuários
    const [usersCount] = await pool.execute('SELECT COUNT(*) as total FROM users')
    const totalUsers = usersCount[0]?.total || 0

    // Total de jogos
    const [gamesCount] = await pool.execute('SELECT COUNT(*) as total FROM games WHERE status = 1')
    const totalGames = gamesCount[0]?.total || 0

    // Total de depósitos (transações do tipo 'deposit' com status 'completed')
    const [depositsResult] = await pool.execute(
      `SELECT COALESCE(SUM(amount), 0) as total 
       FROM transactions 
       WHERE type = 'deposit' AND status = 'completed'`
    )
    const totalDeposits = parseFloat(depositsResult[0]?.total || 0)

    // Total de saques (transações do tipo 'withdrawal' ou 'withdraw' com status 'completed')
    const [withdrawalsResult] = await pool.execute(
      `SELECT COALESCE(SUM(amount), 0) as total 
       FROM transactions 
       WHERE (type = 'withdrawal' OR type = 'withdraw') AND status = 'completed'`
    )
    const totalWithdrawals = parseFloat(withdrawalsResult[0]?.total || 0)

    // Total depositado hoje
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const [depositsTodayResult] = await pool.execute(
      `SELECT COALESCE(SUM(amount), 0) as total 
       FROM transactions 
       WHERE type = 'deposit' 
       AND status = 'completed' 
       AND DATE(created_at) = DATE(?)`,
      [today]
    )
    const totalDepositedToday = parseFloat(depositsTodayResult[0]?.total || 0)

    // Total sacado hoje
    const [withdrawalsTodayResult] = await pool.execute(
      `SELECT COALESCE(SUM(amount), 0) as total 
       FROM transactions 
       WHERE (type = 'withdrawal' OR type = 'withdraw') 
       AND status = 'completed' 
       AND DATE(created_at) = DATE(?)`,
      [today]
    )
    const totalWithdrawnToday = parseFloat(withdrawalsTodayResult[0]?.total || 0)

    // Saldo total dos players (soma de todos os saldos das carteiras)
    const [balanceResult] = await pool.execute(
      `SELECT COALESCE(SUM(balance), 0) as total FROM wallets`
    )
    const totalPlayerBalance = parseFloat(balanceResult[0]?.total || 0)

    // Saldo total dos afiliados (por enquanto 0, pode ser implementado depois)
    const totalAffiliateBalance = 0

    // Usuários cadastrados hoje
    const [newUsersTodayResult] = await pool.execute(
      `SELECT COUNT(*) as total 
       FROM users 
       WHERE DATE(created_at) = DATE(?)`,
      [today]
    )
    const newUsersToday = newUsersTodayResult[0]?.total || 0

    // Contagem de depósitos por usuário
    const [depositCountsResult] = await pool.execute(
      `SELECT user_id, COUNT(*) as count 
       FROM transactions 
       WHERE type = 'deposit' AND status = 'completed'
       GROUP BY user_id`
    )

    let usersWithOneDeposit = 0
    let usersWithTwoDeposits = 0
    let usersWithThreeDeposits = 0
    let usersWithFourOrMoreDeposits = 0

    depositCountsResult.forEach((row: any) => {
      const count = row.count
      if (count === 1) usersWithOneDeposit++
      else if (count === 2) usersWithTwoDeposits++
      else if (count === 3) usersWithThreeDeposits++
      else if (count >= 4) usersWithFourOrMoreDeposits++
    })

    // Usuários ativos (com saldo > 0)
    const [activeUsersResult] = await pool.execute(
      `SELECT COUNT(DISTINCT w.user_id) as total 
       FROM wallets w 
       WHERE w.balance > 0`
    )
    const activeUsers = activeUsersResult[0]?.total || 0

    // Total de visualizações de jogos
    const [viewsResult] = await pool.execute(
      `SELECT COALESCE(SUM(views), 0) as total FROM games`
    )
    const gamesPlayed = viewsResult[0]?.total || 0

    const stats = {
      totalUsers,
      totalGames,
      totalDeposits,
      totalWithdrawals,
      activeUsers,
      totalBalance: totalPlayerBalance,
      gamesPlayed,
      newUsersToday,
      totalDepositedToday,
      totalWithdrawnToday,
      totalPlayerBalance,
      totalAffiliateBalance,
      usersWithOneDeposit,
      usersWithTwoDeposits,
      usersWithThreeDeposits,
      usersWithFourOrMoreDeposits,
    }

    console.log('[AdminStatsController] Estatísticas calculadas:', stats)

    res.json({
      status: true,
      stats,
    })
  } catch (error) {
    console.error('[AdminStatsController] Erro ao buscar estatísticas:', error)
    res.status(500).json({
      error: 'Erro ao buscar estatísticas',
      message: error.message,
      status: false,
    })
  }
}

export default {
  getDashboardStats,
}

