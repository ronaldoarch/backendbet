import pool from '../config/database.js'
import dotenv from 'dotenv'

dotenv.config()

/**
 * Script para criar carteiras para todos os usuários que não têm uma
 * Uso: node src/database/create_wallets_for_users.js
 */

async function createWalletsForUsers() {
  try {
    console.log('\n🔍 Buscando usuários sem carteira...\n')

    // Buscar todos os usuários
    const [users] = await pool.execute(
      'SELECT id, name, email FROM users ORDER BY id'
    )

    if (!users || users.length === 0) {
      console.log('⚠️  Nenhum usuário encontrado no banco de dados')
      process.exit(0)
    }

    console.log(`📊 Total de usuários encontrados: ${users.length}\n`)

    let createdCount = 0
    let existingCount = 0
    let errorCount = 0

    // Para cada usuário, verificar se tem wallet e criar se não tiver
    for (const user of users) {
      try {
        // Verificar se já tem wallet
        const [wallets] = await pool.execute(
          'SELECT id FROM wallets WHERE user_id = ?',
          [user.id]
        )

        if (wallets && wallets.length > 0) {
          existingCount++
          console.log(`✓ Usuário ${user.email} já tem carteira (ID: ${wallets[0].id})`)
        } else {
          // Criar wallet
          await pool.execute(
            `INSERT INTO wallets (user_id, balance, balance_bonus, balance_withdrawal, created_at, updated_at)
             VALUES (?, 0.00, 0.00, 0.00, NOW(), NOW())`,
            [user.id]
          )
          createdCount++
          console.log(`✅ Carteira criada para ${user.email} (User ID: ${user.id})`)
        }
      } catch (error) {
        errorCount++
        console.error(`❌ Erro ao processar usuário ${user.email}:`, error.message)
      }
    }

    console.log('\n📊 Resumo:')
    console.log(`   Carteiras criadas: ${createdCount}`)
    console.log(`   Carteiras já existentes: ${existingCount}`)
    console.log(`   Erros: ${errorCount}`)
    console.log(`   Total processado: ${users.length}\n`)

    if (createdCount > 0) {
      console.log('✅ Processo concluído com sucesso!\n')
    } else if (existingCount === users.length) {
      console.log('ℹ️  Todos os usuários já têm carteiras.\n')
    }

    await pool.end()
    process.exit(0)
  } catch (error) {
    console.error('❌ Erro ao criar carteiras:', error.message)
    console.error(error.stack)
    await pool.end()
    process.exit(1)
  }
}

createWalletsForUsers()

