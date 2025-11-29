import pkg from 'pg'
import dotenv from 'dotenv'

const { Pool } = pkg
dotenv.config()

// Remover protocolo (https://) do host se presente
// O host do Supabase deve ser apenas: db.xxxxx.supabase.co (sem https://)
let dbHost = process.env.DB_HOST || 'localhost'
dbHost = dbHost.replace(/^https?:\/\//, '') // Remove https:// ou http://
dbHost = dbHost.replace(/\/.*$/, '') // Remove qualquer path após o host

const pool = new Pool({
  host: dbHost,
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'postgres',
  ssl: process.env.DB_SSL === 'true' ? {
    rejectUnauthorized: false,
    require: true
  } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000, // Aumentar timeout para 10 segundos
  keepAlive: true,
  keepAliveInitialDelayMillis: 10000,
})

// Converter placeholders MySQL (?) para PostgreSQL ($1, $2, ...)
function convertPlaceholders(query, params) {
  let paramIndex = 1
  const convertedQuery = query.replace(/\?/g, () => `$${paramIndex++}`)
  return { query: convertedQuery, params }
}

// Wrapper para manter compatibilidade com mysql2
const poolWrapper = {
  async execute(query, params = []) {
    try {
      const { query: pgQuery, params: pgParams } = convertPlaceholders(query, params)
      const result = await pool.query(pgQuery, pgParams)
      
      const rows = result.rows || []
      const fields = result.fields || []
      
      // Criar objeto de resultado compatível com mysql2
      const resultObj = {
        insertId: null,
        affectedRows: result.rowCount || 0,
        changedRows: result.rowCount || 0,
      }
      
      // Se for INSERT e retornou ID, pegar o primeiro ID
      if (query.trim().toUpperCase().startsWith('INSERT')) {
        if (rows.length > 0) {
          // Se a query retornou um ID (via RETURNING id)
          if (rows[0].id) {
            resultObj.insertId = rows[0].id
          } else if (rows[0] && typeof rows[0] === 'object') {
            // Tentar pegar qualquer campo numérico que pareça ser ID
            const idField = Object.keys(rows[0]).find(key => 
              key.toLowerCase().includes('id') && typeof rows[0][key] === 'number'
            )
            if (idField) {
              resultObj.insertId = rows[0][idField]
            }
          }
        }
      }
      
      // Adicionar propriedades ao array (mysql2 faz isso)
      // No mysql2, quando você faz const [result] = await pool.execute(...)
      // o result é o array de rows, mas com propriedades insertId, affectedRows, etc.
      Object.assign(rows, resultObj)
      
      // Retornar no formato [rows, fields] como mysql2
      return [rows, fields]
    } catch (error) {
      console.error('Erro na query PostgreSQL:', error)
      throw error
    }
  },
  
  async query(query, params = []) {
    const { query: pgQuery, params: pgParams } = convertPlaceholders(query, params)
    return await pool.query(pgQuery, pgParams)
  },
  
  getConnection() {
    return pool
  },
  
  end() {
    return pool.end()
  }
}

// Testar conexão
pool.on('connect', () => {
  console.log('✅ Conectado ao PostgreSQL')
})

pool.on('error', (err) => {
  console.error('❌ Erro inesperado no pool PostgreSQL:', err)
})

export default poolWrapper
