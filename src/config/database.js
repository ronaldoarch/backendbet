// Arquivo de compatibilidade - redireciona para PostgreSQL
// Mantido para compatibilidade com código que ainda usa database.js
import pool from './database.postgres.js'

// Exportar o pool do PostgreSQL
export default pool

