import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import dotenv from 'dotenv'
import routes from './routes/index.js'
import webhookRoutes from './routes/webhookRoutes.js'
import { getRedisClient } from './config/redis.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

// Trust proxy - necessário quando está atrás de um proxy reverso (Apache/Nginx)
// Em desenvolvimento, usar false. Em produção (Vercel, etc), usar true ou número específico
if (process.env.NODE_ENV === 'production' || process.env.VERCEL === '1') {
  app.set('trust proxy', 1) // Confiar apenas no primeiro proxy
} else {
  app.set('trust proxy', false) // Desabilitar em desenvolvimento
}

// Middleware de segurança
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" }
}))

// CORS - Permitir múltiplas origens
const allowedOrigins = [
  'https://betgeniusbr.com',
  'http://betgeniusbr.com',
  'http://localhost:3000',
  'http://localhost:5173',
  'http://localhost:5174',
]

// Adicionar CORS_ORIGIN do .env se existir
if (process.env.CORS_ORIGIN) {
  const origins = process.env.CORS_ORIGIN.split(',').map(o => o.trim())
  allowedOrigins.push(...origins)
}

// Handler explícito para OPTIONS (preflight) - DEVE VIR ANTES DO RATE LIMITING
app.options('*', (req, res) => {
  const origin = req.headers.origin
  
  if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV === 'development') {
    res.header('Access-Control-Allow-Origin', origin || '*')
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH')
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With')
    res.header('Access-Control-Allow-Credentials', 'true')
    res.header('Access-Control-Max-Age', '86400') // 24 horas
    return res.status(204).send()
  }
  
  res.status(403).json({ error: 'CORS not allowed' })
})

app.use(cors({
  origin: (origin, callback) => {
    // Permitir requisições sem origin (mobile apps, Postman, etc)
    if (!origin) {
      return callback(null, true)
    }
    
    // Verificar se a origem está na lista permitida
    if (allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      // Em desenvolvimento, permitir qualquer origem
      if (process.env.NODE_ENV === 'development') {
        callback(null, true)
      } else {
        console.warn(`[CORS] Origem bloqueada: ${origin}`)
        callback(new Error('Not allowed by CORS'))
      }
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Type'],
  preflightContinue: false,
  optionsSuccessStatus: 204,
  maxAge: 86400, // 24 horas
}))

// Rate limiting - NÃO aplicar a requisições OPTIONS
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 60, // 60 requisições por minuto
  message: 'Muitas requisições, tente novamente mais tarde.',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.method === 'OPTIONS', // Pular rate limit para OPTIONS
  validate: {
    trustProxy: false,
  },
})

const authLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 5, // 5 tentativas por minuto
  message: 'Muitas tentativas de login, tente novamente mais tarde.',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.method === 'OPTIONS', // Pular rate limit para OPTIONS
  validate: {
    trustProxy: false,
  },
})

app.use('/api/auth/login', authLimiter)
app.use('/api/auth/register', authLimiter)
app.use('/api', limiter)

// Body parser - aumentar limite para 20MB (para imagens base64 grandes)
// Base64 aumenta o tamanho em ~33%, então 20MB permite imagens de ~15MB
app.use(express.json({ limit: '20mb' }))
app.use(express.urlencoded({ extended: true, limit: '20mb' }))

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Health check com prefixo /api
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Rotas da API
app.use('/api', routes)

// Rota pública para webhook PlayFiver (sem prefixo /api)
// Permite que a URL de callback seja: https://betgeniusbr.com/playfiver/callback
app.use('/playfiver', webhookRoutes)

// Middleware de erro
app.use((err, req, res, next) => {
  console.error('Erro:', err)
  res.status(err.status || 500).json({
    error: err.message || 'Erro interno do servidor',
    status: false,
  })
})

// 404
app.use((req, res) => {
  res.status(404).json({
    error: 'Rota não encontrada',
    status: false,
  })
})

// Inicializar Redis (sem bloquear startup)
// No Vercel, Redis pode não estar disponível, então não bloqueamos
if (process.env.VERCEL !== '1') {
  getRedisClient().catch(() => {
    console.warn('Redis não disponível, usando cache em memória')
  })
}

// Iniciar servidor (apenas se não estiver no Vercel)
// No Vercel, o servidor é gerenciado automaticamente
if (process.env.VERCEL !== '1') {
  app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`)
    console.log(`📡 Ambiente: ${process.env.APP_ENV || 'development'}`)
    console.log(`🌐 URL: ${process.env.APP_URL || `http://localhost:${PORT}`}`)
  })
}

// Exportar app para Vercel
export default app

