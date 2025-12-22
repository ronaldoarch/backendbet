import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import dotenv from 'dotenv'
import rateLimit from 'express-rate-limit'

// Importar configurações (mesmo que não sejam usadas, devem existir)
import redisClient from './config/redis.js'
import pool from './config/database.js'

// Importar rotas
import routes from './routes/index.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

// Middleware de segurança
app.use(helmet())

// CORS - Configurar origins permitidos
const corsOptions = {
  origin: process.env.CORS_ORIGIN 
    ? process.env.CORS_ORIGIN.split(',').map(origin => origin.trim())
    : ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}

app.use(cors(corsOptions))

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 requisições por IP
  message: 'Muitas requisições deste IP, tente novamente mais tarde.',
  standardHeaders: true,
  legacyHeaders: false,
})

app.use('/api/', limiter)

// Body parser
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Health check
app.get('/health', async (req, res) => {
  try {
    // Testar conexão com banco
    await pool.query('SELECT 1')
    
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: 'connected',
      redis: redisClient && redisClient.isReady ? 'connected' : 'not configured',
    })
  } catch (error) {
    res.status(503).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      database: 'disconnected',
      error: error.message,
    })
  }
})

// Rotas da API
app.use('/api', routes)

// Rota raiz
app.get('/', (req, res) => {
  res.json({
    message: 'BetGenius API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: '/health',
      api: '/api',
    },
  })
})

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Rota ${req.method} ${req.path} não encontrada`,
  })
})

// Error handler
app.use((err, req, res, next) => {
  console.error('❌ Erro:', err)
  
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    status: false,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  })
})

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`)
  console.log(`📡 Ambiente: ${process.env.NODE_ENV || 'development'}`)
  console.log(`🌐 CORS Origin: ${process.env.CORS_ORIGIN || 'localhost'}`)
  console.log(`💾 Database: PostgreSQL`)
})

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('🛑 Recebido SIGTERM, encerrando servidor...')
  
  // Fechar pool do banco
  await pool.end()
  
  // Fechar Redis se estiver conectado
  if (redisClient && redisClient.isReady) {
    await redisClient.quit()
  }
  
  process.exit(0)
})

process.on('SIGINT', async () => {
  console.log('🛑 Recebido SIGINT, encerrando servidor...')
  
  // Fechar pool do banco
  await pool.end()
  
  // Fechar Redis se estiver conectado
  if (redisClient && redisClient.isReady) {
    await redisClient.quit()
  }
  
  process.exit(0)
})

