// Arquivo de compatibilidade - redireciona para MySQL
// Mantido para compatibilidade com código que ainda usa database.js
import pool from './database.mysql.js'

// Exportar o pool do MySQL
export default pool

