import pool from '../config/database.js'

/**
 * Script para adicionar/alterar colunas de imagem na tabela settings
 * Execute: node src/database/fix_settings_columns.js
 */
async function fixSettingsColumns() {
  try {
    console.log('🔧 CORRIGINDO COLUNAS DA TABELA SETTINGS\n')
    
    // Verificar colunas existentes
    const [columns] = await pool.execute(
      "SELECT COLUMN_NAME, COLUMN_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'settings' AND COLUMN_NAME LIKE 'software%'"
    )
    
    console.log('Colunas existentes:')
    columns.forEach(col => {
      console.log(`  - ${col.COLUMN_NAME}: ${col.COLUMN_TYPE}`)
    })
    
    // Adicionar software_favicon se não existir
    const hasFavicon = columns.some(col => col.COLUMN_NAME === 'software_favicon')
    if (!hasFavicon) {
      console.log('\nAdicionando coluna software_favicon...')
      await pool.execute(
        'ALTER TABLE settings ADD COLUMN software_favicon MEDIUMTEXT NULL'
      )
      console.log('✅ Coluna software_favicon adicionada!')
    } else {
      console.log('\nColuna software_favicon já existe, alterando para MEDIUMTEXT...')
      await pool.execute(
        'ALTER TABLE settings MODIFY COLUMN software_favicon MEDIUMTEXT NULL'
      )
      console.log('✅ Coluna software_favicon alterada para MEDIUMTEXT!')
    }
    
    // Alterar software_logo_white para MEDIUMTEXT
    const hasLogoWhite = columns.some(col => col.COLUMN_NAME === 'software_logo_white')
    if (hasLogoWhite) {
      console.log('\nAlterando coluna software_logo_white para MEDIUMTEXT...')
      await pool.execute(
        'ALTER TABLE settings MODIFY COLUMN software_logo_white MEDIUMTEXT NULL'
      )
      console.log('✅ Coluna software_logo_white alterada para MEDIUMTEXT!')
    } else {
      console.log('\nAdicionando coluna software_logo_white...')
      await pool.execute(
        'ALTER TABLE settings ADD COLUMN software_logo_white MEDIUMTEXT NULL'
      )
      console.log('✅ Coluna software_logo_white adicionada!')
    }
    
    // Alterar software_logo_black para MEDIUMTEXT
    const hasLogoBlack = columns.some(col => col.COLUMN_NAME === 'software_logo_black')
    if (hasLogoBlack) {
      console.log('\nAlterando coluna software_logo_black para MEDIUMTEXT...')
      await pool.execute(
        'ALTER TABLE settings MODIFY COLUMN software_logo_black MEDIUMTEXT NULL'
      )
      console.log('✅ Coluna software_logo_black alterada para MEDIUMTEXT!')
    } else {
      console.log('\nAdicionando coluna software_logo_black...')
      await pool.execute(
        'ALTER TABLE settings ADD COLUMN software_logo_black MEDIUMTEXT NULL'
      )
      console.log('✅ Coluna software_logo_black adicionada!')
    }
    
    // Verificar resultado final
    const [finalColumns] = await pool.execute(
      "SELECT COLUMN_NAME, COLUMN_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'settings' AND COLUMN_NAME LIKE 'software%'"
    )
    
    console.log('\n✅ Estrutura final da tabela settings:')
    finalColumns.forEach(col => {
      console.log(`  - ${col.COLUMN_NAME}: ${col.COLUMN_TYPE}`)
    })
    
    console.log('\n✅ Todas as colunas foram corrigidas com sucesso!')
    process.exit(0)
  } catch (error) {
    console.error('❌ Erro ao corrigir colunas:', error.message)
    console.error('Código:', error.code)
    process.exit(1)
  }
}

fixSettingsColumns()

