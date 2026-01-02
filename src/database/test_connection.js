import pool from '../config/database.mysql.js'
import dotenv from 'dotenv'

dotenv.config()

async function testConnection() {
  try {
    console.log('🔍 TESTANDO CONEXÃO COM O BANCO DE DADOS\n')
    
    // Mostrar configuração (sem senha completa)
    console.log('📋 Configuração de conexão:')
    console.log(`   Host: ${process.env.DB_HOST || process.env.MYSQLHOST || 'localhost'}`)
    console.log(`   Port: ${process.env.DB_PORT || process.env.MYSQLPORT || '3306'}`)
    console.log(`   User: ${process.env.DB_USER || process.env.MYSQLUSER || 'root'}`)
    console.log(`   Database: ${process.env.DB_NAME || process.env.MYSQLDATABASE || 'railway'}`)
    console.log(`   SSL: ${process.env.DB_SSL === 'true' ? 'Sim' : 'Não'}\n`)
    
    // Testar conexão
    console.log('🔄 Tentando conectar...')
    const connection = await pool.getConnection()
    
    console.log('✅ Conexão estabelecida com sucesso!\n')
    
    // Testar query simples
    console.log('🔄 Testando query SELECT...')
    const [rows] = await connection.execute('SELECT DATABASE() as current_db, NOW() as server_time')
    
    console.log('✅ Query executada com sucesso!')
    console.log(`   Database atual: ${rows[0].current_db}`)
    console.log(`   Hora do servidor: ${rows[0].server_time}\n`)
    
    // Verificar se tabelas principais existem
    console.log('🔄 Verificando tabelas principais...')
    const [tables] = await connection.execute(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME IN ('users', 'games', 'games_keys', 'wallets', 'transactions')
      ORDER BY TABLE_NAME
    `)
    
    if (tables.length > 0) {
      console.log('✅ Tabelas encontradas:')
      tables.forEach(table => {
        console.log(`   - ${table.TABLE_NAME}`)
      })
    } else {
      console.log('⚠️  Nenhuma tabela principal encontrada')
    }
    
    // Verificar se há dados nas tabelas principais
    console.log('\n🔄 Verificando dados nas tabelas...')
    
    const [userCount] = await connection.execute('SELECT COUNT(*) as count FROM users')
    const [gameCount] = await connection.execute('SELECT COUNT(*) as count FROM games')
    const [keyCount] = await connection.execute('SELECT COUNT(*) as count FROM games_keys')
    
    console.log(`   Usuários: ${userCount[0].count}`)
    console.log(`   Jogos: ${gameCount[0].count}`)
    console.log(`   Chaves PlayFiver: ${keyCount[0].count}`)
    
    connection.release()
    
    console.log('\n✅ Teste de conexão concluído com sucesso!')
    process.exit(0)
  } catch (error) {
    console.error('\n❌ ERRO AO CONECTAR AO BANCO DE DADOS:')
    console.error(`   Mensagem: ${error.message}`)
    console.error(`   Código: ${error.code || 'N/A'}`)
    
    if (error.code === 'ECONNREFUSED') {
      console.error('\n💡 Possíveis causas:')
      console.error('   - Servidor MySQL não está rodando')
      console.error('   - Host ou porta incorretos')
      console.error('   - Firewall bloqueando a conexão')
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('\n💡 Possíveis causas:')
      console.error('   - Usuário ou senha incorretos')
      console.error('   - Usuário não tem permissão para acessar o banco')
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      console.error('\n💡 Possíveis causas:')
      console.error('   - Banco de dados não existe')
      console.error('   - Nome do banco de dados incorreto')
    } else if (error.code === 'ENOTFOUND') {
      console.error('\n💡 Possíveis causas:')
      console.error('   - Host não encontrado (DNS)')
      console.error('   - URL do host incorreta')
    }
    
    console.error('\n📋 Verifique as variáveis de ambiente:')
    console.error('   DB_HOST ou MYSQLHOST')
    console.error('   DB_PORT ou MYSQLPORT')
    console.error('   DB_USER ou MYSQLUSER')
    console.error('   DB_PASSWORD ou MYSQLPASSWORD')
    console.error('   DB_NAME ou MYSQLDATABASE')
    
    process.exit(1)
  }
}

testConnection()

