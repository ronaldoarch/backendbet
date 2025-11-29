import pool from './src/config/database.js'

async function testConnection() {
  try {
    console.log('🔍 Testando conexão com PostgreSQL...')
    
    // Testar conexão básica
    const result = await pool.query('SELECT NOW() as current_time, version() as version')
    console.log('✅ Conexão estabelecida!')
    console.log('⏰ Hora atual:', result.rows[0].current_time)
    console.log('📦 Versão PostgreSQL:', result.rows[0].version.split(',')[0])
    
    // Verificar se as tabelas existem
    console.log('\n🔍 Verificando tabelas...')
    const tables = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `)
    
    if (tables.rows.length === 0) {
      console.log('⚠️  Nenhuma tabela encontrada!')
      console.log('💡 Execute o script database_supabase.sql no SQL Editor do Supabase')
    } else {
      console.log(`✅ ${tables.rows.length} tabela(s) encontrada(s):`)
      tables.rows.forEach(row => {
        console.log(`   - ${row.table_name}`)
      })
    }
    
    // Verificar tabelas específicas
    const requiredTables = ['banners', 'settings', 'games', 'providers', 'categories', 'users', 'games_keys']
    console.log('\n🔍 Verificando tabelas necessárias...')
    const existingTables = tables.rows.map(r => r.table_name)
    
    requiredTables.forEach(table => {
      if (existingTables.includes(table)) {
        console.log(`✅ ${table}`)
      } else {
        console.log(`❌ ${table} - NÃO ENCONTRADA`)
      }
    })
    
    process.exit(0)
  } catch (error) {
    console.error('❌ Erro na conexão:', error.message)
    console.error('Detalhes:', error)
    process.exit(1)
  }
}

testConnection()

