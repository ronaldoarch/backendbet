import pool from '../config/database.js'
import dotenv from 'dotenv'

dotenv.config()

/**
 * Script para adicionar saldo a um usuário
 * Uso: node src/database/add_balance.js <email> <valor>
 * Exemplo: node src/database/add_balance.js teste02@teste.com 1000
 */

async function addBalance() {
  try {
    const email = process.argv[2]
    const amount = parseFloat(process.argv[3])

    if (!email || !amount || isNaN(amount) || amount <= 0) {
      console.error('❌ Uso: node src/database/add_balance.js <email> <valor>')
      console.error('   Exemplo: node src/database/add_balance.js teste02@teste.com 1000')
      process.exit(1)
    }

    console.log(`\n💰 Adicionando saldo ao usuário...`)
    console.log(`   Email: ${email}`)
    console.log(`   Valor: R$ ${amount.toFixed(2)}\n`)

    // Buscar usuário
    const [users] = await pool.execute(
      'SELECT id, name, email FROM users WHERE email = ?',
      [email]
    )

    if (!users || users.length === 0) {
      console.error(`❌ Usuário não encontrado: ${email}`)
      process.exit(1)
    }

    const user = users[0]
    console.log(`✅ Usuário encontrado: ${user.name} (ID: ${user.id})`)

    // Verificar se wallet existe
    const [wallets] = await pool.execute(
      'SELECT id, balance, balance_bonus FROM wallets WHERE user_id = ?',
      [user.id]
    )

    let walletId
    let oldBalance = 0

    if (wallets && wallets.length > 0) {
      // Wallet existe, atualizar saldo
      walletId = wallets[0].id
      oldBalance = parseFloat(wallets[0].balance) || 0
      
      await pool.execute(
        'UPDATE wallets SET balance = balance + ?, updated_at = NOW() WHERE user_id = ?',
        [amount, user.id]
      )
      
      console.log(`✅ Saldo atualizado:`)
      console.log(`   Saldo anterior: R$ ${oldBalance.toFixed(2)}`)
      console.log(`   Valor adicionado: R$ ${amount.toFixed(2)}`)
      console.log(`   Novo saldo: R$ ${(oldBalance + amount).toFixed(2)}`)
    } else {
      // Wallet não existe, criar
      const [result] = await pool.execute(
        `INSERT INTO wallets (user_id, balance, balance_bonus, balance_withdrawal, created_at, updated_at)
         VALUES (?, ?, 0.00, 0.00, NOW(), NOW())`,
        [user.id, amount]
      )
      
      walletId = result.insertId
      console.log(`✅ Wallet criada com saldo: R$ ${amount.toFixed(2)}`)
    }

    // Criar registro de transação
    await pool.execute(
      `INSERT INTO transactions 
       (user_id, type, amount, currency, gateway, status, description, created_at, updated_at)
       VALUES (?, 'deposit', ?, 'BRL', 'manual', 'approved', ?, NOW(), NOW())`,
      [
        user.id,
        amount,
        `Saldo adicionado manualmente - R$ ${amount.toFixed(2)}`
      ]
    )

    console.log(`✅ Transação registrada`)

    // Verificar saldo final
    const [finalWallet] = await pool.execute(
      'SELECT balance, balance_bonus FROM wallets WHERE user_id = ?',
      [user.id]
    )

    if (finalWallet && finalWallet.length > 0) {
      const totalBalance = parseFloat(finalWallet[0].balance) + parseFloat(finalWallet[0].balance_bonus || 0)
      console.log(`\n📊 Saldo final:`)
      console.log(`   Saldo principal: R$ ${parseFloat(finalWallet[0].balance).toFixed(2)}`)
      console.log(`   Saldo bônus: R$ ${parseFloat(finalWallet[0].balance_bonus || 0).toFixed(2)}`)
      console.log(`   Total: R$ ${totalBalance.toFixed(2)}`)
    }

    console.log(`\n✅ Saldo adicionado com sucesso!\n`)
    
    await pool.end()
    process.exit(0)
  } catch (error) {
    console.error('❌ Erro ao adicionar saldo:', error.message)
    console.error(error.stack)
    await pool.end()
    process.exit(1)
  }
}

addBalance()

