import pool from '../config/database.js'

/**
 * Script para FORÇAR a alteração da coluna para MEDIUMTEXT
 * Execute: node src/database/force_fix_banner_column.js
 */
async function forceFixBannerColumn() {
  try {
    console.log('🔧 FORÇANDO ALTERAÇÃO DA COLUNA PARA MEDIUMTEXT\n')
    
    // 1. Verificar tipo atual
    const [columns] = await pool.execute(
      "SELECT COLUMN_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'banners' AND COLUMN_NAME = 'image'"
    )
    
    console.log(`Tipo atual: ${columns[0].COLUMN_TYPE}`)
    
    // 2. Forçar alteração para MEDIUMTEXT
    console.log('\nAlterando para MEDIUMTEXT...')
    await pool.execute('ALTER TABLE banners MODIFY COLUMN image MEDIUMTEXT NOT NULL')
    
    // 3. Verificar novamente
    const [newColumns] = await pool.execute(
      "SELECT COLUMN_TYPE, CHARACTER_MAXIMUM_LENGTH FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'banners' AND COLUMN_NAME = 'image'"
    )
    
    console.log(`Novo tipo: ${newColumns[0].COLUMN_TYPE}`)
    console.log(`Tamanho máximo: ${newColumns[0].CHARACTER_MAXIMUM_LENGTH || 'N/A'}`)
    
    // 4. Testar inserção
    console.log('\nTestando inserção...')
    const testImage = 'data:image/png;base64,' + 'A'.repeat(100000)
    const [result] = await pool.execute(
      'INSERT INTO banners (link, image, type, description, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, NOW(), NOW())',
      [null, testImage, 'home', 'Teste', 0]
    )
    
    const [saved] = await pool.execute(
      'SELECT LENGTH(image) as image_length FROM banners WHERE id = ?',
      [result.insertId]
    )
    
    if (saved[0].image_length === testImage.length) {
      console.log('✅ Teste passou! Imagem salva completamente.')
    } else {
      console.log(`❌ Teste falhou! Esperado: ${testImage.length}, Salvo: ${saved[0].image_length}`)
    }
    
    // Limpar
    await pool.execute('DELETE FROM banners WHERE id = ?', [result.insertId])
    
    console.log('\n✅ Coluna corrigida com sucesso!')
    process.exit(0)
  } catch (error) {
    console.error('❌ Erro:', error.message)
    process.exit(1)
  }
}

forceFixBannerColumn()

