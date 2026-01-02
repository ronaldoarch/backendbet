// Controller de categorias
export const listCategories = async (req, res) => {
  try {
    res.json({ message: 'List categories endpoint - implementar', status: true, data: [] })
  } catch (error) {
    res.status(500).json({ error: error.message, status: false })
  }
}

export default {
  listCategories,
}

