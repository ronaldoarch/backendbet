import pool from '../config/database.js'

/**
 * Script para criar tabela de configurações de chave-valor (app_settings)
 * Execute: node src/database/create_app_settings_table.js
 */

async function createAppSettingsTable() {
  try {
    console.log('🔧 CRIANDO TABELA APP_SETTINGS\n')

    // Verificar se a tabela já existe
    const [tables] = await pool.execute(
      "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'app_settings'"
    )

    if (tables.length > 0) {
      console.log('✅ Tabela app_settings já existe!')
      return
    }

    // Criar tabela
    await pool.execute(`
      CREATE TABLE app_settings (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        setting_key VARCHAR(255) NOT NULL UNIQUE,
        setting_value TEXT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_setting_key (setting_key)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `)

    console.log('✅ Tabela app_settings criada com sucesso!')
  } catch (error) {
    console.error('❌ Erro ao criar tabela:', error.message)
    throw error
  } finally {
    await pool.end()
  }
}

createAppSettingsTable()

