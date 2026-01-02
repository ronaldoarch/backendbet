// Script para verificar se as tabelas necessárias existem
// Execute: node check_tables.js

import { createConnection } from 'mysql2/promise'
import dotenv from 'dotenv'

dotenv.config()

async function checkTables() {
  let connection
  
  try {
    console.log('🔍 Verificando tabelas necessárias...\n')
    
    connection = await createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306'),
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'betgenius',
      ssl: process.env.DB_SSL === 'true' || process.env.DB_SSL === '1' ? {
        rejectUnauthorized: false
      } : false,
    })

    console.log('✅ Conectado ao banco de dados!\n')

    const requiredTables = [
      'games',
      'providers',
      'categories',
      'category_games',
      'transactions',
      'users',
    ]

    console.log('📋 Verificando tabelas:\n')
    console.log('─'.repeat(80))

    for (const tableName of requiredTables) {
      const [tables] = await connection.execute(
        "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?",
        [tableName]
      )

      if (tables.length > 0) {
        // Contar registros
        const [count] = await connection.execute(`SELECT COUNT(*) as total FROM ${tableName}`)
        console.log(`✅ ${tableName.padEnd(20)} | Existe | ${count[0].total.toString().padStart(6)} registros`)
      } else {
        console.log(`❌ ${tableName.padEnd(20)} | NÃO EXISTE | ⚠️  CRÍTICO`)
      }
    }

    console.log('─'.repeat(80))
    
    // Verificar relacionamentos
    console.log('\n🔗 Verificando relacionamentos:\n')
    
    // Verificar se há jogos sem provedor
    try {
      const [orphanGames] = await connection.execute(
        `SELECT COUNT(*) as total FROM games g 
         LEFT JOIN providers p ON g.provider_id = p.id 
         WHERE p.id IS NULL`
      )
      if (orphanGames[0].total > 0) {
        console.log(`⚠️  ${orphanGames[0].total} jogos sem provedor associado`)
      } else {
        console.log('✅ Todos os jogos têm provedor')
      }
    } catch (e) {
      console.log('⚠️  Não foi possível verificar jogos órfãos')
    }

    // Verificar se há jogos sem categorias
    try {
      const [gamesWithoutCategories] = await connection.execute(
        `SELECT COUNT(DISTINCT g.id) as total FROM games g 
         LEFT JOIN category_games cg ON g.id = cg.game_id 
         WHERE cg.game_id IS NULL AND g.status = 1`
      )
      if (gamesWithoutCategories[0].total > 0) {
        console.log(`⚠️  ${gamesWithoutCategories[0].total} jogos ativos sem categorias`)
      } else {
        console.log('✅ Todos os jogos ativos têm categorias')
      }
    } catch (e) {
      console.log('⚠️  Não foi possível verificar jogos sem categorias')
    }

  } catch (error) {
    console.error('❌ Erro ao verificar tabelas:', error.message)
    console.error('Stack:', error.stack)
    process.exit(1)
  } finally {
    if (connection) {
      await connection.end()
    }
  }
}

checkTables()

