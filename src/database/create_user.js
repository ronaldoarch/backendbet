import pool from '../config/database.js'
import bcrypt from 'bcryptjs'
import dotenv from 'dotenv'

dotenv.config()

/**
 * Script para criar um usuário
 * Uso: node src/database/create_user.js <nome> <email> <senha> <telefone>
 * Exemplo: node src/database/create_user.js "Ronaldo" "ronaldohunter54@gmail.com" "senha123" "11999999999"
 */

async function createUser() {
  try {
    const name = process.argv[2]
    const email = process.argv[3]
    const password = process.argv[4]
    const phone = process.argv[5] || '11999999999'

    if (!name || !email || !password) {
      console.error('❌ Uso: node src/database/create_user.js <nome> <email> <senha> [telefone]')
      console.error('   Exemplo: node src/database/create_user.js "Ronaldo" "ronaldohunter54@gmail.com" "senha123" "11999999999"')
      process.exit(1)
    }

    console.log(`\n👤 Criando usuário...`)
    console.log(`   Nome: ${name}`)
    console.log(`   Email: ${email}`)
    console.log(`   Telefone: ${phone}\n`)

    // Verificar se usuário já existe
    const [existing] = await pool.execute(
      'SELECT id, name, email FROM users WHERE email = ?',
      [email]
    )

    if (existing && existing.length > 0) {
      console.log(`⚠️  Usuário já existe: ${existing[0].name} (ID: ${existing[0].id})`)
      process.exit(0)
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(password, 10)
    console.log('🔐 Senha hasheada com sucesso')

    // Criar usuário
    const [result] = await pool.execute(
      'INSERT INTO users (name, email, password, phone, created_at, updated_at) VALUES (?, ?, ?, ?, NOW(), NOW())',
      [name, email, hashedPassword, phone]
    )

    const userId = result.insertId
    console.log(`✅ Usuário criado com sucesso! ID: ${userId}`)

    // Criar wallet para o usuário
    await pool.execute(
      'INSERT INTO wallets (user_id, balance, balance_bonus, balance_withdrawal, created_at, updated_at) VALUES (?, 0, 0, 0, NOW(), NOW())',
      [userId]
    )

    console.log(`💰 Carteira criada para o usuário`)

    // Gerar código de afiliado único
    const affiliateCode = `AFF${userId.toString().padStart(6, '0')}`
    await pool.execute(
      'UPDATE users SET affiliate_code = ? WHERE id = ?',
      [affiliateCode, userId]
    )

    console.log(`🎁 Código de afiliado: ${affiliateCode}`)

    console.log(`\n✅ Usuário criado com sucesso!`)
    console.log(`   ID: ${userId}`)
    console.log(`   Email: ${email}`)
    console.log(`   Código de Afiliado: ${affiliateCode}`)
    console.log(`\n💡 Agora você pode fazer login com:`)
    console.log(`   Email: ${email}`)
    console.log(`   Senha: ${password}\n`)

  } catch (error) {
    console.error('❌ Erro ao criar usuário:', error.message)
    console.error('Stack:', error.stack)
    throw error
  } finally {
    await pool.end()
  }
}

createUser()

