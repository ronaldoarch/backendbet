import { createClient } from 'redis'
import dotenv from 'dotenv'

dotenv.config()

let redisClient = null

export const getRedisClient = async () => {
  // No Vercel, Redis não está disponível - retornar null imediatamente
  if (process.env.VERCEL === '1' || !process.env.REDIS_HOST) {
    return null
  }

  if (redisClient && redisClient.isOpen) {
    return redisClient
  }

  try {
    redisClient = createClient({
      socket: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
        connectTimeout: 1000, // 1 segundo para conectar
      },
      password: process.env.REDIS_PASSWORD || undefined,
    })

    redisClient.on('error', (err) => {
      console.warn('Redis Client Error:', err)
    })

    // Timeout para conexão
    await Promise.race([
      redisClient.connect(),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Redis connection timeout')), 1000))
    ])
    return redisClient
  } catch (error) {
    console.warn('Redis não disponível, usando cache em memória:', error.message)
    return null
  }
}

// Cache em memória como fallback
const memoryCache = new Map()

export const cache = {
  async get(key) {
    try {
      const client = await getRedisClient()
      if (client) {
        const value = await client.get(key)
        return value ? JSON.parse(value) : null
      }
    } catch (error) {
      console.warn('Erro ao buscar do Redis:', error.message)
    }
    return memoryCache.get(key) || null
  },

  async set(key, value, ttl = 600) {
    try {
      const client = await getRedisClient()
      if (client) {
        await client.setEx(key, ttl, JSON.stringify(value))
        return
      }
    } catch (error) {
      console.warn('Erro ao salvar no Redis:', error.message)
    }
    memoryCache.set(key, value)
    // Limpar após TTL (simplificado)
    setTimeout(() => memoryCache.delete(key), ttl * 1000)
  },

  async del(key) {
    try {
      const client = await getRedisClient()
      if (client) {
        await client.del(key)
        return
      }
    } catch (error) {
      console.warn('Erro ao deletar do Redis:', error.message)
    }
    memoryCache.delete(key)
  },

  async keys(pattern) {
    try {
      const client = await getRedisClient()
      if (client) {
        return await client.keys(pattern)
      }
    } catch (error) {
      console.warn('Erro ao buscar chaves do Redis:', error.message)
    }
    // Retornar chaves do cache em memória que correspondem ao padrão
    const regex = new RegExp(pattern.replace('*', '.*'))
    return Array.from(memoryCache.keys()).filter(key => regex.test(key))
  },

  async clear(pattern) {
    try {
      const client = await getRedisClient()
      if (client) {
        const keys = await client.keys(pattern)
        if (keys.length > 0) {
          await client.del(keys)
        }
        return
      }
    } catch (error) {
      console.warn('Erro ao limpar cache:', error.message)
    }
    // Limpar do cache em memória
    const regex = new RegExp(pattern.replace('*', '.*'))
    for (const key of memoryCache.keys()) {
      if (regex.test(key)) {
        memoryCache.delete(key)
      }
    }
  },
}

