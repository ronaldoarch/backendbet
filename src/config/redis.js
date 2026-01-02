import { createClient } from 'redis'
import dotenv from 'dotenv'

dotenv.config()

// Configuração do cliente Redis (opcional)
let redisClient = null

// Criar cliente Redis apenas se as variáveis estiverem configuradas
if (process.env.REDIS_URL || (process.env.REDIS_HOST && process.env.REDIS_PORT)) {
  try {
    const redisConfig = process.env.REDIS_URL 
      ? { url: process.env.REDIS_URL }
      : {
          socket: {
            host: process.env.REDIS_HOST || 'localhost',
            port: parseInt(process.env.REDIS_PORT || '6379'),
          },
          password: process.env.REDIS_PASSWORD || undefined,
        }

    redisClient = createClient(redisConfig)

    redisClient.on('error', (err) => {
      console.error('❌ Erro no cliente Redis:', err.message)
    })

    redisClient.on('connect', () => {
      console.log('✅ Conectado ao Redis')
    })

    redisClient.on('ready', () => {
      console.log('✅ Redis pronto para uso')
    })

    // Conectar (async, mas não bloqueia)
    redisClient.connect().catch((err) => {
      console.warn('⚠️ Redis não disponível, continuando sem cache:', err.message)
      redisClient = null
    })
  } catch (error) {
    console.warn('⚠️ Redis não configurado, continuando sem cache:', error.message)
    redisClient = null
  }
} else {
  console.log('ℹ️ Redis não configurado (opcional)')
}

// Função helper para verificar se Redis está disponível
export const isRedisAvailable = () => {
  return redisClient !== null && redisClient.isReady
}

// Função helper para usar Redis de forma segura
export const getRedisClient = () => {
  return redisClient
}

// Objeto cache com métodos helper
export const cache = {
  /**
   * Obter valor do cache
   * @param {string} key - Chave do cache
   * @returns {Promise<any|null>} Valor do cache ou null
   */
  async get(key) {
    if (!redisClient || !redisClient.isReady) {
      return null
    }
    try {
      const value = await redisClient.get(key)
      return value ? JSON.parse(value) : null
    } catch (error) {
      console.warn('[Cache] Erro ao buscar:', error.message)
      return null
    }
  },

  /**
   * Definir valor no cache
   * @param {string} key - Chave do cache
   * @param {any} value - Valor a ser armazenado
   * @param {number} ttl - Tempo de vida em segundos
   * @returns {Promise<void>}
   */
  async set(key, value, ttl = 300) {
    if (!redisClient || !redisClient.isReady) {
      return
    }
    try {
      await redisClient.setEx(key, ttl, JSON.stringify(value))
    } catch (error) {
      console.warn('[Cache] Erro ao salvar:', error.message)
    }
  },

  /**
   * Limpar cache por padrão
   * @param {string} pattern - Padrão de chaves (ex: 'api.games.*')
   * @returns {Promise<void>}
   */
  async clear(pattern) {
    if (!redisClient || !redisClient.isReady) {
      return
    }
    try {
      // Redis não suporta wildcards diretamente, então vamos ignorar por enquanto
      // ou implementar uma busca por padrão se necessário
      console.log('[Cache] Limpar cache:', pattern, '(não implementado)')
    } catch (error) {
      console.warn('[Cache] Erro ao limpar:', error.message)
    }
  },
}

// Exportar cliente (pode ser null)
export default redisClient

