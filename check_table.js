// Script para verificar se a tabela transactions existe
// Execute: node check_table.js

import { createConnection } from 'mysql2/promise'
import dotenv from 'dotenv'

dotenv.config()

async function checkTable() {
  let connection
  
  try {
    console.log('🔍 Verificando se a tabela transactions existe...\n')
    
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

    // Verificar se a tabela existe
    const [tables] = await connection.execute(
      "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'transactions'"
    )

    if (tables.length > 0) {
      console.log('✅ Tabela transactions EXISTE!\n')
      
      // Verificar estrutura
      const [columns] = await connection.execute(
        `SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE, COLUMN_DEFAULT
         FROM INFORMATION_SCHEMA.COLUMNS 
         WHERE TABLE_SCHEMA = DATABASE() 
         AND TABLE_NAME = 'transactions'
         ORDER BY ORDINAL_POSITION`
      )
      
      console.log('📋 Estrutura da tabela:')
      console.log('─'.repeat(80))
      columns.forEach(col => {
        console.log(`  ${col.COLUMN_NAME.padEnd(20)} | ${col.COLUMN_TYPE.padEnd(30)} | ${col.IS_NULLABLE} | ${col.COLUMN_DEFAULT || 'NULL'}`)
      })
      console.log('─'.repeat(80))
      
      // Verificar se user_id é BIGINT UNSIGNED
      const userIdColumn = columns.find(c => c.COLUMN_NAME === 'user_id')
      if (userIdColumn) {
        if (userIdColumn.COLUMN_TYPE.includes('bigint') && userIdColumn.COLUMN_TYPE.includes('unsigned')) {
          console.log('\n✅ Coluna user_id está correta (BIGINT UNSIGNED)')
        } else {
          console.log(`\n⚠️  Coluna user_id está como: ${userIdColumn.COLUMN_TYPE}`)
          console.log('   Precisa ser: BIGINT UNSIGNED')
        }
      }
      
      // Contar registros
      const [count] = await connection.execute('SELECT COUNT(*) as total FROM transactions')
      console.log(`\n📊 Total de registros: ${count[0].total}`)
      
      // Verificar índices
      const [indexes] = await connection.execute(
        `SHOW INDEXES FROM transactions`
      )
      console.log(`\n🔑 Índices: ${indexes.length}`)
      indexes.forEach(idx => {
        console.log(`   - ${idx.Key_name} (${idx.Column_name})`)
      })
      
    } else {
      console.log('❌ Tabela transactions NÃO EXISTE!\n')
      console.log('💡 Execute: npm run create-table')
    }
    
  } catch (error) {
    console.error('❌ Erro ao verificar tabela:', error.message)
    console.error('Stack:', error.stack)
    process.exit(1)
  } finally {
    if (connection) {
      await connection.end()
    }
  }
}

checkTable()

