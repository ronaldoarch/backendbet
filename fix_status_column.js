import pool from './src/config/database.js'

/**
 * Script para corrigir tamanho da coluna 'status' na tabela transactions
 */

console.log('🔧 Corrigindo coluna status da tabela transactions...\n')

try {
  // Verificar estrutura atual
  console.log('📋 Verificando estrutura atual...')
  const [columns] = await pool.execute(`
    SHOW COLUMNS FROM transactions WHERE Field = 'status'
  `)
  
  if (columns.length > 0) {
    console.log('✅ Coluna atual:', columns[0])
    console.log('')
  }

  // Alterar coluna para VARCHAR(20)
  console.log('🔨 Alterando coluna para VARCHAR(20)...')
  await pool.execute(`
    ALTER TABLE transactions 
    MODIFY COLUMN status VARCHAR(20) NOT NULL DEFAULT 'pending'
  `)
  
  console.log('✅ Coluna alterada com sucesso!')
  console.log('')

  // Verificar nova estrutura
  console.log('📋 Verificando nova estrutura...')
  const [newColumns] = await pool.execute(`
    SHOW COLUMNS FROM transactions WHERE Field = 'status'
  `)
  
  if (newColumns.length > 0) {
    console.log('✅ Nova coluna:', newColumns[0])
  }

  console.log('')
  console.log('✅ Correção concluída! Agora você pode testar o webhook novamente.')
  
  process.exit(0)
} catch (error) {
  console.error('❌ Erro ao corrigir coluna:', error.message)
  console.error(error)
  process.exit(1)
}

