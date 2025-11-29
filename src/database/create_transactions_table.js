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
      console.log('✅ Tabela transactions já existe!')
      return
    }

    // Criar tabela
    await pool.execute(`
      CREATE TABLE transactions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        type ENUM('deposit', 'withdrawal') NOT NULL,
        amount DECIMAL(10, 2) NOT NULL,
        status ENUM('pending', 'completed', 'failed', 'cancelled') DEFAULT 'pending',
        payment_method VARCHAR(50) DEFAULT 'arkama',
        payment_id VARCHAR(255) NULL,
        payment_data TEXT NULL,
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

