import pool from './src/config/database.js'

/**
 * Script para verificar status de uma transação e saldo do usuário
 */

const transactionId = process.argv[2] || '14'

console.log(`🔍 Verificando transação ID: ${transactionId}\n`)

try {
  // Buscar transação
  const [transactions] = await pool.execute(
    `SELECT 
      t.*,
      u.email,
      u.name
    FROM transactions t
    LEFT JOIN users u ON t.user_id = u.id
    WHERE t.id = ?`,
    [transactionId]
  )

  if (transactions.length === 0) {
    console.log('❌ Transação não encontrada.')
    process.exit(1)
  }

  const tx = transactions[0]
  
  console.log('📊 Dados da Transação:')
  console.log(`   ID: ${tx.id}`)
  console.log(`   Payment ID: ${tx.payment_id}`)
  console.log(`   Usuário: ${tx.name || tx.email} (ID: ${tx.user_id})`)
  console.log(`   Tipo: ${tx.type}`)
  console.log(`   Valor: R$ ${parseFloat(tx.amount).toFixed(2)}`)
  console.log(`   Status: ${tx.status}`)
  console.log(`   Gateway: ${tx.gateway}`)
  console.log(`   Criado em: ${tx.created_at}`)
  console.log(`   Atualizado em: ${tx.updated_at}`)
  console.log('')

  // Buscar saldo do usuário
  const [wallets] = await pool.execute(
    `SELECT * FROM wallets WHERE user_id = ?`,
    [tx.user_id]
  )

  if (wallets.length > 0) {
    const wallet = wallets[0]
    console.log('💰 Carteira do Usuário:')
    console.log(`   Saldo: R$ ${parseFloat(wallet.balance).toFixed(2)}`)
    console.log(`   Saldo Bônus: R$ ${parseFloat(wallet.balance_bonus || 0).toFixed(2)}`)
    console.log(`   Atualizado em: ${wallet.updated_at}`)
  } else {
    console.log('⚠️  Carteira não encontrada para este usuário.')
  }

  console.log('')
  
  if (tx.status === 'approved' || tx.status === 'completed') {
    console.log('✅ Transação APROVADA! Saldo deve ter sido creditado.')
  } else if (tx.status === 'pending') {
    console.log('⏳ Transação ainda PENDENTE.')
  } else {
    console.log(`❌ Transação com status: ${tx.status}`)
  }

  process.exit(0)
} catch (error) {
  console.error('❌ Erro:', error.message)
  process.exit(1)
}

