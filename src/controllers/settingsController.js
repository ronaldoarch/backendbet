// Controller de configurações
export const getSettings = async (req, res) => {
  try {
    res.json({ message: 'Get settings endpoint - implementar', status: true, data: {} })
  } catch (error) {
    res.status(500).json({ error: error.message, status: false })
  }
}

export default {
  getSettings,
}

