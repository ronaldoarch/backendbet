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
  connectTimeout: 5000, // 5 segundos para conectar
  acquireTimeout: 5000, // 5 segundos para adquirir conexão
  timeout: 5000, // 5 segundos para queries
  ssl: process.env.DB_SSL === 'true' ? {
    rejectUnauthorized: false
  } : false,
})

export default pool
