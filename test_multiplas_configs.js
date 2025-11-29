import pkg from 'pg'
import dotenv from 'dotenv'

const { Pool } = pkg
dotenv.config()

// Configurações para testar
const configs = [
  {
    name: 'Host com db. + Porta 5432 + SSL',
    host: 'db.slrkerlrcvntxynfjbyh.supabase.co',
    port: 5432,
    ssl: { rejectUnauthorized: false, require: true }
  },
  {
    name: 'Host com db. + Porta 5432 + Sem SSL',
    host: 'db.slrkerlrcvntxynfjbyh.supabase.co',
    port: 5432,
    ssl: false
  },
  {
    name: 'Host com db. + Porta 6543 (Pooler) + SSL',
    host: 'db.slrkerlrcvntxynfjbyh.supabase.co',
    port: 6543,
    ssl: { rejectUnauthorized: false, require: true }
  },
  {
    name: 'Host sem db. + Porta 5432 + SSL',
    host: 'slrkerlrcvntxynfjbyh.supabase.co',
    port: 5432,
    ssl: { rejectUnauthorized: false, require: true }
  },
  {
    name: 'Host sem db. + Porta 5432 + Sem SSL',
    host: 'slrkerlrcvntxynfjbyh.supabase.co',
    port: 5432,
    ssl: false
  },
  {
    name: 'Host sem db. + Porta 6543 (Pooler) + SSL',
    host: 'slrkerlrcvntxynfjbyh.supabase.co',
    port: 6543,
    ssl: { rejectUnauthorized: false, require: true }
  },
]

async function testConfig(config) {
  const pool = new Pool({
    host: config.host,
    port: config.port,
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'postgres',
    ssl: config.ssl,
    connectionTimeoutMillis: 5000,
  })

  try {
    console.log(`\n🔍 Testando: ${config.name}`)
    console.log(`   Host: ${config.host}:${config.port}`)
    
    const result = await pool.query('SELECT NOW() as current_time')
    console.log(`   ✅ SUCESSO! Hora atual: ${result.rows[0].current_time}`)
    
    await pool.end()
    return { success: true, config }
  } catch (error) {
    console.log(`   ❌ Erro: ${error.message}`)
    await pool.end()
    return { success: false, config, error: error.message }
  }
}

async function testAll() {
  console.log('🚀 Testando múltiplas configurações...\n')
  console.log(`📝 Usando credenciais:`)
  console.log(`   User: ${process.env.DB_USER || 'postgres'}`)
  console.log(`   Database: ${process.env.DB_NAME || 'postgres'}`)
  console.log(`   Password: ${process.env.DB_PASSWORD ? '***' : 'NÃO CONFIGURADA'}`)
  
  if (!process.env.DB_PASSWORD) {
    console.log('\n⚠️  ATENÇÃO: DB_PASSWORD não está configurada no .env!')
    console.log('   Configure a senha do banco no .env antes de testar.')
    process.exit(1)
  }

  const results = []
  for (const config of configs) {
    const result = await testConfig(config)
    results.push(result)
    
    // Se encontrou uma que funciona, para aqui
    if (result.success) {
      console.log(`\n🎉 CONFIGURAÇÃO QUE FUNCIONA:`)
      console.log(`   DB_HOST=${result.config.host}`)
      console.log(`   DB_PORT=${result.config.port}`)
      console.log(`   DB_SSL=${result.config.ssl ? 'true' : 'false'}`)
      break
    }
    
    // Pequeno delay entre testes
    await new Promise(resolve => setTimeout(resolve, 500))
  }

  const successful = results.find(r => r.success)
  if (!successful) {
    console.log('\n❌ Nenhuma configuração funcionou.')
    console.log('\n💡 Verifique:')
    console.log('   1. A senha do banco está correta no .env?')
    console.log('   2. O projeto Supabase está ativo (não pausado)?')
    console.log('   3. Há restrições de IP no Supabase?')
  }
}

testAll()

