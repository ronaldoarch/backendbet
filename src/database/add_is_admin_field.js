// Script para adicionar campo is_admin na tabela users
// Execute: node src/database/add_is_admin_field.js

import pool from '../config/database.js'

async function addIsAdminField() {
  try {
    console.log('🔧 VERIFICANDO/ADICIONANDO CAMPO is_admin NA TABELA users\n')

    // Verificar se o campo já existe
    const [columns] = await pool.execute(
      `SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE, COLUMN_DEFAULT
       FROM INFORMATION_SCHEMA.COLUMNS 
       WHERE TABLE_SCHEMA = DATABASE() 
       AND TABLE_NAME = 'users' 
       AND COLUMN_NAME = 'is_admin'`
    )

    if (columns.length > 0) {
      console.log('✅ Campo is_admin já existe!')
      console.log(`   Tipo: ${columns[0].COLUMN_TYPE}`)
      console.log(`   Permite NULL: ${columns[0].IS_NULLABLE}`)
      console.log(`   Valor padrão: ${columns[0].COLUMN_DEFAULT || 'NULL'}`)
    } else {
      console.log('🔧 Adicionando campo is_admin...')
      
      // Adicionar campo is_admin (TINYINT(1) DEFAULT 0)
      await pool.execute(`
        ALTER TABLE users 
        ADD COLUMN is_admin TINYINT(1) DEFAULT 0 NOT NULL COMMENT '1=admin, 0=usuário normal'
        AFTER banned
      `)
      
      console.log('✅ Campo is_admin adicionado com sucesso!')
    }

    // Verificar quantos admins existem
    const [admins] = await pool.execute(
      'SELECT COUNT(*) as total FROM users WHERE is_admin = 1'
    )
    
    console.log(`\n📊 Total de administradores: ${admins[0].total}`)
    
    if (admins[0].total === 0) {
      console.log('\n⚠️  Nenhum administrador encontrado!')
      console.log('💡 Para tornar um usuário admin, execute:')
      console.log('   UPDATE users SET is_admin = 1 WHERE email = \'seu-email@exemplo.com\';')
    } else {
      // Listar admins
      const [adminUsers] = await pool.execute(
        'SELECT id, name, email, is_admin FROM users WHERE is_admin = 1'
      )
      console.log('\n👑 Administradores:')
      adminUsers.forEach(user => {
        console.log(`   - ${user.name} (${user.email})`)
      })
    }

  } catch (error) {
    console.error('❌ Erro ao adicionar campo is_admin:', error.message)
    console.error('Stack:', error.stack)
    throw error
  } finally {
    await pool.end()
  }
}

addIsAdminField()

