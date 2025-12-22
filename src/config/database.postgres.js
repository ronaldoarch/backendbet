import pkg from 'pg'
import dotenv from 'dotenv'

const { Pool } = pkg
dotenv.config()

// Configuração do pool PostgreSQL
// Suporta Railway (DATABASE_URL ou variáveis individuais)
let poolConfig

// Se DATABASE_URL estiver disponível (Railway fornece isso)
if (process.env.DATABASE_URL) {
  poolConfig = {
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL.includes('railway.app') || process.env.DB_SSL === 'true' ? {
      rejectUnauthorized: false
    } : false,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000, // Aumentado para conexões remotas
  }
} else {
  // Usar variáveis individuais (suporta Railway PGHOST, PGPORT, etc.)
  const host = process.env.PGHOST || process.env.DB_HOST || 'localhost'
  const port = parseInt(process.env.PGPORT || process.env.DB_PORT || '5432')
  const user = process.env.PGUSER || process.env.DB_USER || 'postgres'
  const password = process.env.PGPASSWORD || process.env.DB_PASSWORD || ''
  const database = process.env.PGDATABASE || process.env.DB_NAME || 'postgres'
  
  // Detectar se é Railway (hosts .railway.app ou .proxy.rlwy.net)
  const isRailway = host.includes('railway.app') || host.includes('proxy.rlwy.net')
  
  poolConfig = {
    host,
    port,
    user,
    password,
    database,
    // SSL obrigatório para Railway
    ssl: isRailway || process.env.DB_SSL === 'true' ? {
      rejectUnauthorized: false
    } : false,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000, // Aumentado para conexões remotas
  }
}

const pool = new Pool(poolConfig)

// Testar conexão
pool.on('connect', (client) => {
  console.log('✅ Conectado ao PostgreSQL')
  if (process.env.NODE_ENV === 'development') {
    console.log(`   Host: ${poolConfig.host || 'DATABASE_URL'}`)
    console.log(`   Database: ${poolConfig.database || 'from URL'}`)
  }
})

pool.on('error', (err) => {
  console.error('❌ Erro inesperado no pool PostgreSQL:', err.message)
  console.error('   Detalhes:', err)
})

// Função para testar conexão manualmente
export const testConnection = async () => {
  try {
    const client = await pool.connect()
    const result = await client.query('SELECT NOW()')
    console.log('✅ Teste de conexão PostgreSQL OK:', result.rows[0].now)
    client.release()
    return true
  } catch (error) {
    console.error('❌ Erro ao testar conexão PostgreSQL:', error.message)
    return false
  }
}

export default pool

