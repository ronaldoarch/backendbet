// Controller de stories
export const listStories = async (req, res) => {
  try {
    res.json({ message: 'List stories endpoint - implementar', status: true, data: [] })
  } catch (error) {
    res.status(500).json({ error: error.message, status: false })
  }
}

export const createStory = async (req, res) => {
  try {
    res.json({ message: 'Create story endpoint - implementar', status: true })
  } catch (error) {
    res.status(500).json({ error: error.message, status: false })
  }
}

export default {
  listStories,
  createStory,
}

