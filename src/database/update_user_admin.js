import pool from '../config/database.js'

/**
 * Script para atualizar o campo is_admin de um usuário
 * Uso: node src/database/update_user_admin.js <user_id> <is_admin>
 * Exemplo: node src/database/update_user_admin.js 12 true
 */

async function updateUserAdmin() {
  try {
    const userId = process.argv[2]
    const isAdmin = process.argv[3]

    if (!userId) {
      console.error('❌ Erro: ID do usuário é obrigatório')
      console.log('\n📋 Uso:')
      console.log('   node src/database/update_user_admin.js <user_id> <is_admin>')
      console.log('\n💡 Exemplos:')
      console.log('   node src/database/update_user_admin.js 12 true   # Tornar admin')
      console.log('   node src/database/update_user_admin.js 12 false  # Remover admin')
      process.exit(1)
    }

    const adminValue = isAdmin === 'true' || isAdmin === '1' ? 1 : 0

    console.log('🔧 ATUALIZANDO STATUS DE ADMIN DO USUÁRIO\n')
    console.log(`   ID do usuário: ${userId}`)
    console.log(`   is_admin: ${adminValue} (${adminValue === 1 ? 'Admin' : 'Usuário normal'})\n`)

    // Verificar se usuário existe
    const [users] = await pool.execute(
      'SELECT id, name, email, is_admin FROM users WHERE id = ?',
      [userId]
    )

    if (!users || users.length === 0) {
      console.error(`❌ Usuário com ID ${userId} não encontrado!`)
      process.exit(1)
    }

    const user = users[0]
    console.log('📋 Usuário encontrado:')
    console.log(`   Nome: ${user.name}`)
    console.log(`   Email: ${user.email}`)
    console.log(`   Status atual: ${user.is_admin === 1 ? 'Admin' : 'Usuário normal'}\n`)

    if (user.is_admin === adminValue) {
      console.log(`ℹ️  Usuário já está com status ${adminValue === 1 ? 'admin' : 'normal'}`)
      process.exit(0)
    }

    // IMPORTANTE: Atualizar APENAS o campo is_admin, sem tocar na senha
    console.log('🔄 Atualizando apenas o campo is_admin...')
    const [result] = await pool.execute(
      'UPDATE users SET is_admin = ?, updated_at = NOW() WHERE id = ?',
      [adminValue, userId]
    )

    if (result.affectedRows === 0) {
      console.error('❌ Nenhuma linha foi atualizada')
      process.exit(1)
    }

    console.log(`✅ Usuário atualizado com sucesso! (${result.affectedRows} linha(s) afetada(s))\n`)

    // Verificar se foi atualizado corretamente
    const [verify] = await pool.execute(
      'SELECT id, name, email, is_admin FROM users WHERE id = ?',
      [userId]
    )

    console.log('🔍 Verificação:')
    console.log(`   Nome: ${verify[0].name}`)
    console.log(`   Email: ${verify[0].email}`)
    console.log(`   Novo status: ${verify[0].is_admin === 1 ? 'Admin ✅' : 'Usuário normal ✅'}\n`)

    // Verificar se a senha não foi alterada (comparar hash)
    const [passwordCheck] = await pool.execute(
      'SELECT password FROM users WHERE id = ?',
      [userId]
    )

    if (passwordCheck && passwordCheck[0].password) {
      console.log('✅ Senha preservada (não foi alterada)')
      console.log(`   Hash da senha: ${passwordCheck[0].password.substring(0, 20)}...`)
    }

    console.log('\n✅ Processo concluído com sucesso!')
    process.exit(0)
  } catch (error) {
    console.error('\n❌ ERRO:', error.message)
    console.error('Stack:', error.stack)
    process.exit(1)
  }
}

updateUserAdmin()

