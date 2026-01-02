import pool from '../config/database.js'

async function fixStoriesImageColumn() {
  try {
    console.log('🔧 CORRIGINDO COLUNA IMAGE DA TABELA STORIES\n')
    
    // Verificar tipo atual da coluna
    const [columns] = await pool.execute(
      `SELECT COLUMN_TYPE, CHARACTER_MAXIMUM_LENGTH 
       FROM INFORMATION_SCHEMA.COLUMNS 
       WHERE TABLE_SCHEMA = DATABASE() 
       AND TABLE_NAME = 'stories' 
       AND COLUMN_NAME = 'image'`
    )
    
    if (columns.length > 0) {
      console.log('📋 Tipo atual da coluna image:', columns[0].COLUMN_TYPE)
    }
    
    // Alterar para MEDIUMTEXT (suporta até 16MB)
    await pool.execute(`
      ALTER TABLE stories 
      MODIFY COLUMN image MEDIUMTEXT NULL COMMENT 'Imagem do story (base64 ou URL)'
    `)
    
    console.log('✅ Coluna image alterada para MEDIUMTEXT!')
    
    // Verificar tipo após alteração
    const [columnsAfter] = await pool.execute(
      `SELECT COLUMN_TYPE, CHARACTER_MAXIMUM_LENGTH 
       FROM INFORMATION_SCHEMA.COLUMNS 
       WHERE TABLE_SCHEMA = DATABASE() 
       AND TABLE_NAME = 'stories' 
       AND COLUMN_NAME = 'image'`
    )
    
    if (columnsAfter.length > 0) {
      console.log('📋 Novo tipo da coluna image:', columnsAfter[0].COLUMN_TYPE)
    }
    
  } catch (error) {
    console.error('❌ Erro ao corrigir coluna:', error.message)
    throw error
  } finally {
    await pool.end()
  }
}

fixStoriesImageColumn()

