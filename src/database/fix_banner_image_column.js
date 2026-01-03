import pool from '../config/database.js'

/**
 * Script para alterar a coluna image da tabela banners para MEDIUMTEXT
 * Execute: node src/database/fix_banner_image_column.js
 */
async function fixBannerImageColumn() {
  try {
    console.log('Verificando estrutura da tabela banners...')
    
    // Verificar tipo atual da coluna
    const [columns] = await pool.execute(
      "SELECT COLUMN_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'banners' AND COLUMN_NAME = 'image'"
    )
    
    if (columns.length === 0) {
      console.error('Tabela banners ou coluna image não encontrada!')
      process.exit(1)
    }
    
    const currentType = columns[0].COLUMN_TYPE
    console.log(`Tipo atual da coluna image: ${currentType}`)
    
    if (currentType.includes('mediumtext') || currentType.includes('longtext')) {
      console.log('✅ Coluna já está como MEDIUMTEXT ou LONGTEXT. Nada a fazer.')
      process.exit(0)
    }
    
    console.log('Alterando coluna image para MEDIUMTEXT...')
    
    // Alterar coluna para MEDIUMTEXT
    await pool.execute(
      'ALTER TABLE banners MODIFY COLUMN image MEDIUMTEXT NOT NULL'
    )
    
    console.log('✅ Coluna image alterada para MEDIUMTEXT com sucesso!')
    console.log('Agora você pode salvar banners com imagens maiores.')
    
    process.exit(0)
  } catch (error) {
    console.error('❌ Erro ao alterar coluna:', error.message)
    process.exit(1)
  }
}

fixBannerImageColumn()


