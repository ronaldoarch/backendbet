import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'

// Carregar variáveis de ambiente
dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000

// Middleware de segurança
app.use(helmet())

// Configurar CORS
const corsOptions = {
  origin: (origin, callback) => {
    // Lista de origens permitidas
    const allowedOrigins = process.env.CORS_ORIGIN 
      ? process.env.CORS_ORIGIN.split(',').map(o => o.trim())
      : ['*']
    
    // Se for '*', permitir todas as origens
    if (allowedOrigins.includes('*') || !origin) {
      return callback(null, true)
    }
    
    // Verificar se a origem está na lista permitida
    if (allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
}
app.use(cors(corsOptions))

// Trust proxy (importante para funcionar atrás de proxy reverso)
app.set('trust proxy', 1)

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100 // limite de 100 requests por IP
})
app.use('/api/', limiter)

// Body parser
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Importar rotas (com tratamento de erro)
import('./routes/index.js')
  .then((routesModule) => {
    const routes = routesModule.default || routesModule
    app.use('/api', routes)
  })
  .catch((error) => {
    console.warn('⚠️  Rotas não encontradas, usando rotas básicas:', error.message)
    // Rotas básicas se o arquivo não existir
    app.get('/api', (req, res) => {
      res.json({
        message: 'API Backend Fortune Vegas',
        version: '1.0.0',
        status: 'online'
      })
    })
  })

// Rota 404
app.use((req, res) => {
  res.status(404).json({ error: 'Rota não encontrada' })
})

// Error handler
app.use((err, req, res, next) => {
  console.error('Erro:', err)
  res.status(err.status || 500).json({
    error: err.message || 'Erro interno do servidor',
    status: false
  })
})

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`)
  console.log(`📡 Ambiente: ${process.env.NODE_ENV || 'development'}`)
})
