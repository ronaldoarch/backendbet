import pool from '../config/database.js'

/**
 * Teste direto de inserção de banner com imagem grande
 * Execute: node src/database/test_banner_insert.js
 */
async function testBannerInsert() {
  try {
    console.log('🧪 TESTE DE INSERÇÃO DE BANNER\n')
    
    // Criar uma imagem base64 de teste (100KB)
    const testImage = 'data:image/png;base64,' + 'A'.repeat(100000)
    console.log(`Tamanho da imagem de teste: ${testImage.length} caracteres (${(testImage.length / 1024).toFixed(2)} KB)`)
    
    // Verificar tipo da coluna
    const [columns] = await pool.execute(
      "SELECT COLUMN_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'banners' AND COLUMN_NAME = 'image'"
    )
    console.log(`Tipo da coluna: ${columns[0].COLUMN_TYPE}`)
    
    // Tentar inserir
    console.log('\nInserindo banner...')
    const [result] = await pool.execute(
      'INSERT INTO banners (link, image, type, description, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, NOW(), NOW())',
      [null, testImage, 'home', 'Teste de inserção', 0]
    )
    
    const bannerId = result.insertId
    console.log(`Banner inserido com ID: ${bannerId}`)
    
    // Verificar o que foi salvo
    const [saved] = await pool.execute(
      'SELECT id, LENGTH(image) as image_length, LEFT(image, 50) as image_preview FROM banners WHERE id = ?',
      [bannerId]
    )
    
    const savedLength = saved[0].image_length
    console.log(`\nTamanho da imagem salva: ${savedLength} caracteres`)
    console.log(`Preview: ${saved[0].image_preview}...`)
    
    if (savedLength === testImage.length) {
      console.log('✅ SUCESSO! Imagem foi salva completamente.')
    } else {
      console.log(`❌ FALHA! Esperado: ${testImage.length}, Salvo: ${savedLength}`)
      console.log(`Diferença: ${testImage.length - savedLength} caracteres perdidos`)
      
      // Verificar se foi truncado exatamente em 65535
      if (savedLength === 65535) {
        console.log('\n⚠️ TRUNCAMENTO EM 65535 DETECTADO!')
        console.log('Isso indica que a coluna ainda está como TEXT ou há um limite no driver.')
        
        // Tentar alterar novamente
        console.log('\nTentando alterar coluna para MEDIUMTEXT novamente...')
        try {
          await pool.execute('ALTER TABLE banners MODIFY COLUMN image MEDIUMTEXT NOT NULL')
          console.log('✅ Coluna alterada para MEDIUMTEXT')
          
          // Tentar inserir novamente
          console.log('\nTentando inserir novamente após alteração...')
          const [result2] = await pool.execute(
            'INSERT INTO banners (link, image, type, description, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, NOW(), NOW())',
            [null, testImage, 'home', 'Teste após alteração', 0]
          )
          
          const [saved2] = await pool.execute(
            'SELECT id, LENGTH(image) as image_length FROM banners WHERE id = ?',
            [result2.insertId]
          )
          
          if (saved2[0].image_length === testImage.length) {
            console.log('✅ SUCESSO após alteração!')
          } else {
            console.log(`❌ Ainda truncado após alteração: ${saved2[0].image_length}`)
          }
          
          // Limpar teste 2
          await pool.execute('DELETE FROM banners WHERE id = ?', [result2.insertId])
        } catch (alterError) {
          console.error('❌ Erro ao alterar:', alterError.message)
        }
      }
    }
    
    // Limpar teste
    await pool.execute('DELETE FROM banners WHERE id = ?', [bannerId])
    console.log('\nTeste removido do banco.')
    
    process.exit(0)
  } catch (error) {
    console.error('❌ Erro no teste:', error)
    console.error('Código:', error.code)
    console.error('Mensagem:', error.message)
    process.exit(1)
  }
}

testBannerInsert()

