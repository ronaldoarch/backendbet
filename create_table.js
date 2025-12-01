// Script simplificado para criar tabela de transações
// Execute: node create_table.js (de qualquer lugar no Coolify)

import { createConnection } from 'mysql2/promise'
import dotenv from 'dotenv'

dotenv.config()

async function createTransactionsTable() {
  let connection
  
  try {
    console.log('🔧 Conectando ao banco de dados...\n')
    
    // Criar conexão direta
    connection = await createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306'),
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'betgenius',
      ssl: process.env.DB_SSL === 'true' || process.env.DB_SSL === '1' ? {
        rejectUnauthorized: false
      } : false,
    })

    console.log('✅ Conectado ao banco de dados!\n')
    console.log('🔧 Criando tabela transactions...\n')

    // Verificar se a tabela já existe
    const [tables] = await connection.execute(
      "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'transactions'"
    )

    if (tables.length > 0) {
      console.log('⚠️  Tabela transactions já existe!')
      console.log('🔍 Verificando estrutura...')
      
      const [columns] = await connection.execute(
        `SELECT COLUMN_TYPE 
         FROM INFORMATION_SCHEMA.COLUMNS 
         WHERE TABLE_SCHEMA = DATABASE() 
         AND TABLE_NAME = 'transactions' 
         AND COLUMN_NAME = 'user_id'`
      )
      
      if (columns.length > 0) {
        const columnType = columns[0].COLUMN_TYPE
        if (columnType.includes('bigint') && columnType.includes('unsigned')) {
          console.log('✅ Tabela já está correta!')
          return
        } else {
          console.log('⚠️  Estrutura incorreta, recriando...')
          await connection.execute('DROP TABLE IF EXISTS transactions')
        }
      }
    }

    // Criar tabela
    await connection.execute(`
      CREATE TABLE transactions (
        id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        user_id BIGINT UNSIGNED NOT NULL,
        type ENUM('deposit', 'withdrawal', 'bonus', 'win', 'bet', 'refund') NOT NULL,
        amount DECIMAL(10, 2) NOT NULL,
        currency VARCHAR(10) DEFAULT 'BRL',
        gateway VARCHAR(50) NOT NULL DEFAULT 'arkama',
        status ENUM('pending', 'completed', 'failed', 'canceled', 'refunded', 'processing') DEFAULT 'pending',
        payment_id VARCHAR(255) NULL UNIQUE,
        description TEXT NULL,
        metadata JSON NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_user_id (user_id),
        INDEX idx_status (status),
        INDEX idx_payment_id (payment_id),
        INDEX idx_type (type),
        INDEX idx_created_at (created_at),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `)

    console.log('✅ Tabela transactions criada com sucesso!\n')
    
    // Verificar
    const [verify] = await connection.execute('SELECT COUNT(*) as count FROM transactions')
    console.log(`📊 Tabela criada! Total de registros: ${verify[0].count}`)
    
  } catch (error) {
    console.error('❌ Erro ao criar tabela:', error.message)
    console.error('Stack:', error.stack)
    process.exit(1)
  } finally {
    if (connection) {
      await connection.end()
    }
  }
}

createTransactionsTable()

