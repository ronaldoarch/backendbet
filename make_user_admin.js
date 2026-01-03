// Script para tornar um usuário admin
// Execute: node make_user_admin.js <user_id>
// Exemplo: node make_user_admin.js 1

import pool from './src/config/database.js'

async function makeUserAdmin(userId) {
  try {
    console.log(`🔧 Tornando usuário ID ${userId} como admin...\n`)

    // Verificar se o campo is_admin existe
    const [columns] = await pool.execute(
      `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
       WHERE TABLE_SCHEMA = DATABASE() 
       AND TABLE_NAME = 'users' 
       AND COLUMN_NAME = 'is_admin'`
    )

    if (columns.length === 0) {
      console.log('⚠️  Campo is_admin não existe. Adicionando...')
      await pool.execute(`
        ALTER TABLE users 
        ADD COLUMN is_admin TINYINT(1) DEFAULT 0 NOT NULL COMMENT '1=admin, 0=usuário normal'
        AFTER banned
      `)
      console.log('✅ Campo is_admin adicionado!\n')
    }

    // Verificar se o usuário existe
    const [users] = await pool.execute(
      'SELECT id, name, email, is_admin FROM users WHERE id = ?',
      [userId]
    )

    if (users.length === 0) {
      console.error(`❌ Usuário com ID ${userId} não encontrado!`)
      process.exit(1)
    }

    const user = users[0]
    console.log(`📋 Usuário encontrado:`)
    console.log(`   ID: ${user.id}`)
    console.log(`   Nome: ${user.name}`)
    console.log(`   Email: ${user.email}`)
    console.log(`   Admin atual: ${user.is_admin ? 'SIM' : 'NÃO'}\n`)

    if (user.is_admin === 1 || user.is_admin === true) {
      console.log('✅ Usuário já é admin!')
    } else {
      // Tornar admin
      await pool.execute(
        'UPDATE users SET is_admin = 1 WHERE id = ?',
        [userId]
      )
      console.log('✅ Usuário agora é ADMIN!\n')
    }

    // Verificar resultado
    const [updated] = await pool.execute(
      'SELECT id, name, email, is_admin FROM users WHERE id = ?',
      [userId]
    )
    
    console.log('📊 Status final:')
    console.log(`   ID: ${updated[0].id}`)
    console.log(`   Nome: ${updated[0].name}`)
    console.log(`   Email: ${updated[0].email}`)
    console.log(`   Admin: ${updated[0].is_admin ? '✅ SIM' : '❌ NÃO'}`)

  } catch (error) {
    console.error('❌ Erro ao tornar usuário admin:', error.message)
    console.error('Stack:', error.stack)
    process.exit(1)
  } finally {
    await pool.end()
  }
}

// Obter ID do usuário dos argumentos da linha de comando
const userId = process.argv[2]

if (!userId || isNaN(parseInt(userId))) {
  console.error('❌ Uso: node make_user_admin.js <user_id>')
  console.error('Exemplo: node make_user_admin.js 1')
  process.exit(1)
}

makeUserAdmin(parseInt(userId))

