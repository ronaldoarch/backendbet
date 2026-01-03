import pool from '../config/database.js'

async function checkTriggers() {
  try {
    console.log('🔍 VERIFICANDO TRIGGERS NO BANCO DE DADOS\n')
    
    // Verificar triggers na tabela users
    const [triggers] = await pool.execute(`
      SELECT 
        TRIGGER_NAME,
        EVENT_MANIPULATION,
        EVENT_OBJECT_TABLE,
        ACTION_STATEMENT,
        ACTION_TIMING
      FROM INFORMATION_SCHEMA.TRIGGERS
      WHERE EVENT_OBJECT_SCHEMA = DATABASE()
      AND EVENT_OBJECT_TABLE = 'users'
    `)
    
    if (triggers.length === 0) {
      console.log('✅ Nenhum trigger encontrado na tabela users')
    } else {
      console.log(`⚠️  ${triggers.length} trigger(s) encontrado(s) na tabela users:\n`)
      triggers.forEach(trigger => {
        console.log(`   Nome: ${trigger.TRIGGER_NAME}`)
        console.log(`   Evento: ${trigger.EVENT_MANIPULATION}`)
        console.log(`   Timing: ${trigger.ACTION_TIMING}`)
        console.log(`   Statement: ${trigger.ACTION_STATEMENT.substring(0, 200)}...`)
        console.log('')
      })
    }
    
    // Verificar se há algum campo que pode estar causando o problema
    console.log('🔍 Verificando estrutura da tabela users...')
    const [columns] = await pool.execute('DESCRIBE users')
    
    console.log('\n📋 Colunas da tabela users:')
    columns.forEach(col => {
      console.log(`   - ${col.Field}: ${col.Type} ${col.Null === 'YES' ? '(NULL)' : '(NOT NULL)'} ${col.Default !== null ? `DEFAULT ${col.Default}` : ''}`)
    })
    
    process.exit(0)
  } catch (error) {
    console.error('❌ Erro:', error.message)
    process.exit(1)
  }
}

checkTriggers()

