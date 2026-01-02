import pool from '../config/database.js'

/**
 * Script para criar tabela de transações (depósitos/saques)
 * Execute: node src/database/create_transactions_table.js
 */

async function createTransactionsTable() {
  try {
    console.log('🔧 CRIANDO TABELA DE TRANSAÇÕES\n')

    // Verificar se a tabela já existe
    const [tables] = await pool.execute(
      "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'transactions'"
    )

    if (tables.length > 0) {
      console.log('⚠️  Tabela transactions já existe!')
      console.log('🔍 Verificando estrutura da tabela...')
      
      // Verificar se a coluna user_id é BIGINT UNSIGNED
      const [columns] = await pool.execute(
        `SELECT COLUMN_TYPE 
         FROM INFORMATION_SCHEMA.COLUMNS 
         WHERE TABLE_SCHEMA = DATABASE() 
         AND TABLE_NAME = 'transactions' 
         AND COLUMN_NAME = 'user_id'`
      )
      
      if (columns.length > 0) {
        const columnType = columns[0].COLUMN_TYPE
        if (columnType.includes('bigint') && columnType.includes('unsigned')) {
          console.log('✅ Tabela transactions já está com a estrutura correta!')
          return
        } else {
          console.log(`⚠️  Coluna user_id é ${columnType}, precisa ser BIGINT UNSIGNED`)
          console.log('🗑️  Removendo tabela antiga...')
          await pool.execute('DROP TABLE IF EXISTS transactions')
          console.log('✅ Tabela antiga removida!')
        }
      } else {
        console.log('⚠️  Coluna user_id não encontrada, recriando tabela...')
        await pool.execute('DROP TABLE IF EXISTS transactions')
      }
    }

    // Criar tabela
    await pool.execute(`
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
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `)

    console.log('✅ Tabela transactions criada com sucesso!')
  } catch (error) {
    console.error('❌ Erro ao criar tabela:', error.message)
    throw error
  } finally {
    await pool.end()
  }
}

createTransactionsTable()

