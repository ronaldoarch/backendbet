// Script para criar tabela category_games se não existir
// Execute: node create_category_games_table.js

import { createConnection } from 'mysql2/promise'
import dotenv from 'dotenv'

dotenv.config()

async function createCategoryGamesTable() {
  let connection
  
  try {
    console.log('🔧 Verificando/criando tabela category_games...\n')
    
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

    // Verificar se a tabela já existe
    const [tables] = await connection.execute(
      "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'category_games'"
    )

    if (tables.length > 0) {
      console.log('✅ Tabela category_games já existe!')
      
      // Verificar estrutura
      const [columns] = await connection.execute(
        `SELECT COLUMN_NAME, COLUMN_TYPE 
         FROM INFORMATION_SCHEMA.COLUMNS 
         WHERE TABLE_SCHEMA = DATABASE() 
         AND TABLE_NAME = 'category_games'`
      )
      
      console.log('📋 Estrutura atual:')
      columns.forEach(col => {
        console.log(`   ${col.COLUMN_NAME}: ${col.COLUMN_TYPE}`)
      })
      
      // Contar registros
      const [count] = await connection.execute('SELECT COUNT(*) as total FROM category_games')
      console.log(`\n📊 Total de relacionamentos: ${count[0].total}`)
      
      return
    }

    console.log('🔧 Criando tabela category_games...\n')

    // Criar tabela
    await connection.execute(`
      CREATE TABLE category_games (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        game_id INT UNSIGNED NOT NULL,
        category_id INT UNSIGNED NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY unique_game_category (game_id, category_id),
        INDEX idx_game_id (game_id),
        INDEX idx_category_id (category_id),
        FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE,
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `)

    console.log('✅ Tabela category_games criada com sucesso!\n')
    
  } catch (error) {
    console.error('❌ Erro ao criar tabela:', error.message)
    console.error('Stack:', error.stack)
    
    if (error.code === 'ER_NO_SUCH_TABLE') {
      console.error('\n⚠️  Erro: Uma das tabelas referenciadas (games ou categories) não existe!')
      console.error('   Certifique-se de que as tabelas games e categories existem antes de criar category_games.')
    }
    
    process.exit(1)
  } finally {
    if (connection) {
      await connection.end()
    }
  }
}

createCategoryGamesTable()

