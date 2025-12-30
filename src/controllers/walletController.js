// Controller de carteira
export const getBalance = async (req, res) => {
  try {
    res.json({ message: 'Get balance endpoint - implementar', status: true, balance: 0 })
  } catch (error) {
    res.status(500).json({ error: error.message, status: false })
  }
}

export const deposit = async (req, res) => {
  try {
    res.json({ message: 'Deposit endpoint - implementar', status: true })
  } catch (error) {
    res.status(500).json({ error: error.message, status: false })
  }
}

export const withdraw = async (req, res) => {
  try {
    res.json({ message: 'Withdraw endpoint - implementar', status: true })
  } catch (error) {
    res.status(500).json({ error: error.message, status: false })
  }
}

export default {
  getBalance,
  deposit,
  withdraw,
}

