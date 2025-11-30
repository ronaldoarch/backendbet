import pool from '../config/database.js'

async function fixStoriesTable() {
  try {
    console.log('🔧 CORRIGINDO TABELA STORIES\n')
    
    // Alterar campo image para permitir NULL
    await pool.execute(`
      ALTER TABLE stories 
      MODIFY COLUMN image TEXT NULL COMMENT 'Imagem do story (base64 ou URL)'
    `)
    
    console.log('✅ Campo image alterado para permitir NULL!')
    
    // Verificar se já existem stories antes de inserir
    const [existing] = await pool.execute('SELECT COUNT(*) as count FROM stories')
    
    if (existing[0].count === 0) {
      // Inserir dados iniciais (IPHONE, XIAOMI, SEXTOU)
      await pool.execute(`
        INSERT INTO stories (title, color, icon, order_index, status, image) VALUES
        ('IPHONE', '#ec4899', '📱', 1, 1, NULL),
        ('XIAOMI', '#16a34a', '📱', 2, 1, NULL),
        ('SEXTOU', '#ea580c', '▶️', 3, 1, NULL)
      `)
      
      console.log('✅ Dados iniciais inseridos!')
    } else {
      console.log('⏭️  Stories já existem na tabela.')
    }
    
  } catch (error) {
    console.error('❌ Erro ao corrigir tabela:', error.message)
    throw error
  } finally {
    await pool.end()
  }
}

fixStoriesTable()

