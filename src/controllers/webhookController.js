// Controller de webhooks
export const cartwaveWebhook = async (req, res) => {
  try {
    res.json({ message: 'Cartwave webhook endpoint - implementar', status: true })
  } catch (error) {
    res.status(500).json({ error: error.message, status: false })
  }
}

export const arkamaWebhook = async (req, res) => {
  try {
    res.json({ message: 'Arkama webhook endpoint - implementar', status: true })
  } catch (error) {
    res.status(500).json({ error: error.message, status: false })
  }
}

export default {
  cartwaveWebhook,
  arkamaWebhook,
}

