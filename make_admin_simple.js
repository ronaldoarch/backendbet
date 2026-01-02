// Script simples para tornar usuário ID 1 admin
// Execute: node make_admin_simple.js

import mysql from 'mysql2/promise'
import dotenv from 'dotenv'

dotenv.config()

async function makeAdmin() {
  let connection
  try {
    console.log('🔧 Conectando ao banco de dados...\n')
    
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306'),
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'betgenius',
      ssl: process.env.DB_SSL === 'true' || process.env.DB_SSL === '1' ? {
        rejectUnauthorized: false
      } : false,
    })

    console.log('✅ Conectado!\n')

    // Verificar se campo is_admin existe
    console.log('🔍 Verificando campo is_admin...')
    try {
      const [columns] = await connection.execute(
        `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
         WHERE TABLE_SCHEMA = DATABASE() 
         AND TABLE_NAME = 'users' 
         AND COLUMN_NAME = 'is_admin'`
      )

      if (columns.length === 0) {
        console.log('⚠️  Campo não existe. Adicionando...')
        await connection.execute(`
          ALTER TABLE users 
          ADD COLUMN is_admin TINYINT(1) DEFAULT 0 NOT NULL COMMENT '1=admin, 0=usuário normal'
          AFTER banned
        `)
        console.log('✅ Campo is_admin adicionado!\n')
      } else {
        console.log('✅ Campo is_admin já existe!\n')
      }
    } catch (err) {
      console.log('⚠️  Erro ao verificar/adicionar campo (pode já existir):', err.message)
    }

    // Verificar usuário ID 1
    console.log('🔍 Verificando usuário ID 1...')
    const [users] = await connection.execute(
      'SELECT id, name, email, is_admin FROM users WHERE id = 1'
    )

    if (users.length === 0) {
      console.error('❌ Usuário com ID 1 não encontrado!')
      process.exit(1)
    }

    const user = users[0]
    console.log('📋 Usuário encontrado:')
    console.log(`   ID: ${user.id}`)
    console.log(`   Nome: ${user.name || 'N/A'}`)
    console.log(`   Email: ${user.email || 'N/A'}`)
    console.log(`   Admin atual: ${user.is_admin ? 'SIM ✅' : 'NÃO ❌'}\n`)

    if (user.is_admin === 1 || user.is_admin === true) {
      console.log('✅ Usuário já é admin!')
    } else {
      // Tornar admin
      console.log('🔧 Tornando usuário admin...')
      await connection.execute(
        'UPDATE users SET is_admin = 1 WHERE id = 1'
      )
      console.log('✅ Usuário agora é ADMIN!\n')

      // Verificar resultado
      const [updated] = await connection.execute(
        'SELECT id, name, email, is_admin FROM users WHERE id = 1'
      )
      
      console.log('📊 Status final:')
      console.log(`   ID: ${updated[0].id}`)
      console.log(`   Nome: ${updated[0].name || 'N/A'}`)
      console.log(`   Email: ${updated[0].email || 'N/A'}`)
      console.log(`   Admin: ${updated[0].is_admin ? '✅ SIM' : '❌ NÃO'}`)
    }

  } catch (error) {
    console.error('❌ Erro:', error.message)
    console.error('Stack:', error.stack)
    process.exit(1)
  } finally {
    if (connection) {
      await connection.end()
    }
  }
}

makeAdmin()

