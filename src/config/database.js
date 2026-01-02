import mysql from 'mysql2/promise'
import dotenv from 'dotenv'

dotenv.config()

// Configuração do pool MySQL para Railway
const pool = mysql.createPool({
  host: process.env.DB_HOST || process.env.MYSQLHOST || 'localhost',
  port: parseInt(process.env.DB_PORT || process.env.MYSQLPORT || '3306'),
  user: process.env.DB_USER || process.env.MYSQLUSER || process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || process.env.MYSQLPASSWORD || '',
  database: process.env.DB_NAME || process.env.MYSQLDATABASE || process.env.DB_DATABASE || 'railway',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ssl: process.env.DB_SSL === 'true' ? {
    rejectUnauthorized: false
  } : false,
})

// Testar conexão
pool.getConnection()
  .then((connection) => {
    console.log('✅ Conectado ao MySQL')
    connection.release()
  })
  .catch((err) => {
    console.error('❌ Erro ao conectar ao MySQL:', err.message)
  })

export default pool

