import mysql from 'mysql2/promise'
import dotenv from 'dotenv'

dotenv.config()

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'betgenius',
  waitForConnections: true,
  connectionLimit: 5, // Reduzir para evitar muitas conexões
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  connectTimeout: 30000, // 30 segundos para conectar (Railway pode ser mais lento)
  // acquireTimeout não existe no mysql2, removido
  // timeout não existe no mysql2, removido (causa warning)
  ssl: process.env.DB_SSL === 'true' || process.env.DB_SSL === '1' ? {
    rejectUnauthorized: false
  } : false,
})

export default pool
