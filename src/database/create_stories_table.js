import pool from '../config/database.js'

async function createStoriesTable() {
  try {
    console.log('🔧 CRIANDO TABELA STORIES\n')
    
    // Verificar se a tabela já existe
    const [tables] = await pool.execute(
      "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'stories'"
    )
    
    if (tables.length > 0) {
      console.log('✅ Tabela stories já existe!')
      return
    }
    
    // Criar tabela stories
    await pool.execute(`
      CREATE TABLE stories (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        image MEDIUMTEXT NULL COMMENT 'Imagem do story (base64 ou URL)',
        link VARCHAR(500) NULL COMMENT 'Link ao clicar no story',
        color VARCHAR(50) NULL COMMENT 'Cor de fundo (hex)',
        icon VARCHAR(100) NULL COMMENT 'Ícone/emoji do story',
        order_index INT DEFAULT 0 COMMENT 'Ordem de exibição',
        status TINYINT(1) DEFAULT 1 COMMENT '1=ativo, 0=inativo',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_status (status),
        INDEX idx_order (order_index)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `)
    
    console.log('✅ Tabela stories criada com sucesso!')
    
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
      console.log('⏭️  Dados iniciais já existem, pulando inserção.')
    }
    
    console.log('✅ Dados iniciais inseridos!')
    
  } catch (error) {
    console.error('❌ Erro ao criar tabela:', error.message)
    throw error
  } finally {
    await pool.end()
  }
}

createStoriesTable()

