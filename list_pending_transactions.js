import pool from './src/config/database.js'

/**
 * Script para listar transações pendentes
 */

console.log('🔍 Buscando transações pendentes...\n')

try {
  const [transactions] = await pool.execute(
    `SELECT 
      t.id,
      t.user_id,
      t.payment_id,
      t.amount,
      t.status,
      t.gateway,
      t.created_at,
      u.email as user_email
    FROM transactions t
    LEFT JOIN users u ON t.user_id = u.id
    WHERE t.status = 'pending'
    ORDER BY t.created_at DESC
    LIMIT 10`
  )

  if (transactions.length === 0) {
    console.log('❌ Nenhuma transação pendente encontrada.')
  } else {
    console.log(`✅ Encontradas ${transactions.length} transações pendentes:\n`)
    
    transactions.forEach((tx, index) => {
      console.log(`${index + 1}. Transação:`)
      console.log(`   ID: ${tx.id}`)
      console.log(`   Payment ID: ${tx.payment_id}`)
      console.log(`   Usuário: ${tx.user_email} (ID: ${tx.user_id})`)
      console.log(`   Valor: R$ ${parseFloat(tx.amount).toFixed(2)}`)
      console.log(`   Gateway: ${tx.gateway}`)
      console.log(`   Status: ${tx.status}`)
      console.log(`   Criado em: ${tx.created_at}`)
      console.log('')
    })

    console.log('📝 Para testar o webhook, use o Payment ID de uma das transações acima.')
    console.log('   Exemplo: node test_webhook.js <payment_id>')
  }

  process.exit(0)
} catch (error) {
  console.error('❌ Erro ao buscar transações:', error.message)
  process.exit(1)
}

