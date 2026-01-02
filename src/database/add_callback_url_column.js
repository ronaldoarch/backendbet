import pool from '../config/database.js'

/**
 * Script para adicionar coluna callback_url na tabela games_keys
 * Execute: node src/database/add_callback_url_column.js
 */
async function addCallbackUrlColumn() {
  try {
    console.log('🔧 ADICIONANDO COLUNA CALLBACK_URL\n')
    
    // Verificar se a coluna já existe
    const [columns] = await pool.execute(
      "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'games_keys' AND COLUMN_NAME = 'callback_url'"
    )
    
    if (columns && columns.length > 0) {
      console.log('✅ Coluna callback_url já existe!')
      process.exit(0)
    }
    
    // Adicionar coluna
    console.log('Adicionando coluna callback_url...')
    await pool.execute(
      'ALTER TABLE games_keys ADD COLUMN callback_url VARCHAR(500) NULL AFTER playfiver_code'
    )
    
    console.log('✅ Coluna callback_url adicionada com sucesso!')
    
    // Verificar estrutura final
    const [finalColumns] = await pool.execute('DESCRIBE games_keys')
    console.log('\nEstrutura final da tabela games_keys:')
    finalColumns.forEach(col => {
      if (col.Field.includes('callback') || col.Field.includes('playfiver')) {
        console.log(`  - ${col.Field}: ${col.Type}`)
      }
    })
    
    process.exit(0)
  } catch (error) {
    console.error('❌ Erro:', error.message)
    process.exit(1)
  }
}

addCallbackUrlColumn()

