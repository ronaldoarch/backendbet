import pool from '../config/database.js'

/**
 * Script de diagnóstico para verificar o problema de truncamento de banners
 * Execute: node src/database/diagnose_banner_column.js
 */
async function diagnoseBannerColumn() {
  try {
    console.log('🔍 DIAGNÓSTICO DA COLUNA DE BANNERS\n')
    
    // 1. Verificar tipo da coluna
    console.log('1️⃣ Verificando tipo da coluna image...')
    const [columns] = await pool.execute(
      "SELECT COLUMN_TYPE, CHARACTER_MAXIMUM_LENGTH, DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'banners' AND COLUMN_NAME = 'image'"
    )
    
    if (columns.length === 0) {
      console.error('❌ Tabela banners ou coluna image não encontrada!')
      process.exit(1)
    }
    
    const columnInfo = columns[0]
    console.log(`   Tipo: ${columnInfo.COLUMN_TYPE}`)
    console.log(`   Tipo de dados: ${columnInfo.DATA_TYPE}`)
    console.log(`   Tamanho máximo: ${columnInfo.CHARACTER_MAXIMUM_LENGTH || 'N/A'}`)
    
    // 2. Verificar banners existentes
    console.log('\n2️⃣ Verificando banners existentes...')
    const [banners] = await pool.execute(
      'SELECT id, LENGTH(image) as image_length, type, status FROM banners ORDER BY id DESC LIMIT 5'
    )
    
    if (banners.length === 0) {
      console.log('   Nenhum banner encontrado.')
    } else {
      console.log(`   Encontrados ${banners.length} banners:`)
      banners.forEach(banner => {
        const isTruncated = banner.image_length === 65535 || banner.image_length === 65534
        console.log(`   - Banner ID ${banner.id}: ${banner.image_length} caracteres ${isTruncated ? '⚠️ TRUNCADO' : '✅'}`)
      })
    }
    
    // 3. Tentar alterar a coluna para MEDIUMTEXT
    console.log('\n3️⃣ Verificando se precisa alterar para MEDIUMTEXT...')
    if (!columnInfo.COLUMN_TYPE.includes('mediumtext') && !columnInfo.COLUMN_TYPE.includes('longtext')) {
      console.log('   ⚠️ Coluna não é MEDIUMTEXT! Tentando alterar...')
      try {
        await pool.execute('ALTER TABLE banners MODIFY COLUMN image MEDIUMTEXT NOT NULL')
        console.log('   ✅ Coluna alterada para MEDIUMTEXT com sucesso!')
        
        // Verificar novamente
        const [newColumns] = await pool.execute(
          "SELECT COLUMN_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'banners' AND COLUMN_NAME = 'image'"
        )
        console.log(`   Novo tipo: ${newColumns[0].COLUMN_TYPE}`)
      } catch (alterError) {
        console.error('   ❌ Erro ao alterar coluna:', alterError.message)
        console.error('   Código do erro:', alterError.code)
      }
    } else {
      console.log('   ✅ Coluna já está como MEDIUMTEXT ou LONGTEXT')
    }
    
    // 4. Teste de inserção
    console.log('\n4️⃣ Testando inserção de imagem grande...')
    const testImage = 'data:image/png;base64,' + 'A'.repeat(100000) // 100KB de teste
    console.log(`   Tamanho do teste: ${testImage.length} caracteres`)
    
    try {
      const [testResult] = await pool.execute(
        'INSERT INTO banners (link, image, type, description, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, NOW(), NOW())',
        [null, testImage, 'home', 'Teste', 0]
      )
      
      const [savedTest] = await pool.execute(
        'SELECT id, LENGTH(image) as image_length FROM banners WHERE id = ?',
        [testResult.insertId]
      )
      
      const savedLength = savedTest[0].image_length
      console.log(`   Imagem salva: ${savedLength} caracteres`)
      
      if (savedLength === testImage.length) {
        console.log('   ✅ Teste passou! Imagem foi salva completamente.')
      } else {
        console.log(`   ❌ Teste falhou! Esperado: ${testImage.length}, Salvo: ${savedLength}`)
        console.log(`   Diferença: ${testImage.length - savedLength} caracteres perdidos`)
      }
      
      // Limpar teste
      await pool.execute('DELETE FROM banners WHERE id = ?', [testResult.insertId])
      console.log('   Teste removido do banco.')
    } catch (testError) {
      console.error('   ❌ Erro no teste:', testError.message)
      console.error('   Código do erro:', testError.code)
    }
    
    console.log('\n✅ Diagnóstico concluído!')
    process.exit(0)
  } catch (error) {
    console.error('❌ Erro no diagnóstico:', error)
    process.exit(1)
  }
}

diagnoseBannerColumn()

