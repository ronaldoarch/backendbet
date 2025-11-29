import pool from '../config/database.js'

async function checkStructure() {
  try {
    const [columns] = await pool.execute('DESCRIBE games_keys')
    console.log('Colunas da tabela games_keys:')
    columns.forEach(col => {
      console.log(`  - ${col.Field}: ${col.Type} ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'}`)
    })
    process.exit(0)
  } catch (error) {
    console.error('Erro:', error.message)
    process.exit(1)
  }
}

checkStructure()

