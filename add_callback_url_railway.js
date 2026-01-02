import mysql from 'mysql2/promise'
import dotenv from 'dotenv'

dotenv.config()

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'betgenius',
  ssl: process.env.DB_SSL === 'true' ? {
    rejectUnauthorized: false
  } : false,
  connectTimeout: 10000,
})

async function addCallbackUrlColumn() {
  try {
    console.log('🔍 Verificando se a coluna callback_url existe...')
    
    // Verificar se a coluna já existe
    const [columns] = await pool.execute(
      "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'games_keys' AND COLUMN_NAME = 'callback_url'"
    )
    
    if (columns && columns.length > 0) {
      console.log('✅ Coluna callback_url já existe!')
      return
    }
    
    console.log('➕ Adicionando coluna callback_url...')
    
    // Adicionar coluna
    await pool.execute(
      'ALTER TABLE games_keys ADD COLUMN callback_url VARCHAR(500) NULL'
    )
    
    console.log('✅ Coluna callback_url adicionada com sucesso!')
    
    // Verificar novamente
    const [verify] = await pool.execute(
      "SELECT COLUMN_NAME, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'games_keys' AND COLUMN_NAME = 'callback_url'"
    )
    
    if (verify && verify.length > 0) {
      console.log('✅ Verificação:', verify[0])
    }
    
  } catch (error) {
    console.error('❌ Erro:', error.message)
    if (error.code === 'ER_DUP_FIELDNAME') {
      console.log('ℹ️ Coluna já existe (erro ignorado)')
    } else {
      throw error
    }
  } finally {
    await pool.end()
  }
}

addCallbackUrlColumn()
  .then(() => {
    console.log('✅ Concluído!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Erro fatal:', error)
    process.exit(1)
  })

