import pool from '../config/database.js'

async function fixStoriesTable() {
  try {
    console.log('🔧 CORRIGINDO TABELA STORIES\n')
    
    // Verificar se a tabela existe
    const [tables] = await pool.execute(
      "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'stories'"
    )
    
    if (tables.length === 0) {
      console.log('⚠️  Tabela stories não existe. Execute create_stories_table.js primeiro.')
      return
    }
    
    // Verificar se o campo image permite NULL
    const [columns] = await pool.execute(
      `SELECT IS_NULLABLE, COLUMN_TYPE 
       FROM INFORMATION_SCHEMA.COLUMNS 
       WHERE TABLE_SCHEMA = DATABASE() 
       AND TABLE_NAME = 'stories' 
       AND COLUMN_NAME = 'image'`
    )
    
    if (columns.length > 0) {
      const column = columns[0]
      console.log(`📋 Campo image atual: IS_NULLABLE=${column.IS_NULLABLE}, TYPE=${column.COLUMN_TYPE}`)
      
      if (column.IS_NULLABLE === 'NO') {
        console.log('🔧 Alterando campo image para permitir NULL...')
        await pool.execute(`
          ALTER TABLE stories 
          MODIFY COLUMN image MEDIUMTEXT NULL COMMENT 'Imagem do story (base64 ou URL)'
        `)
        console.log('✅ Campo image alterado para permitir NULL!')
      } else {
        console.log('✅ Campo image já permite NULL!')
      }
    } else {
      console.log('⚠️  Campo image não encontrado. Adicionando...')
      await pool.execute(`
        ALTER TABLE stories 
        ADD COLUMN image MEDIUMTEXT NULL COMMENT 'Imagem do story (base64 ou URL)' AFTER title
      `)
      console.log('✅ Campo image adicionado!')
    }
    
    // Verificar se já existem stories antes de inserir
    const [existing] = await pool.execute('SELECT COUNT(*) as count FROM stories')
    
    if (existing[0].count === 0) {
      console.log('📝 Inserindo dados iniciais...')
      // Inserir dados iniciais (IPHONE, XIAOMI, SEXTOU) - image explícito como NULL
      await pool.execute(`
        INSERT INTO stories (title, image, color, icon, order_index, status) VALUES
        ('IPHONE', NULL, '#ec4899', '📱', 1, 1),
        ('XIAOMI', NULL, '#16a34a', '📱', 2, 1),
        ('SEXTOU', NULL, '#ea580c', '▶️', 3, 1)
      `)
      
      console.log('✅ Dados iniciais inseridos!')
    } else {
      console.log(`⏭️  Stories já existem na tabela (${existing[0].count} registros).`)
    }
    
  } catch (error) {
    console.error('❌ Erro ao corrigir tabela:', error.message)
    console.error('Stack:', error.stack)
    throw error
  } finally {
    await pool.end()
  }
}

fixStoriesTable()

