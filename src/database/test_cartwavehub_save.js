import pool from '../config/database.js'

async function testCartwavehubSave() {
  try {
    console.log('🧪 TESTANDO SALVAMENTO DO CARTWAVEHUB\n')
    
    // 1. Verificar se a tabela existe
    const [tables] = await pool.execute(
      "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'app_settings'"
    )
    
    if (tables.length === 0) {
      console.error('❌ Tabela app_settings não existe!')
      console.log('💡 Execute: npm run create-app-settings-table')
      return
    }
    
    console.log('✅ Tabela app_settings existe')
    
    // 2. Tentar salvar uma credencial de teste
    const testSecret = 'test_secret_' + Date.now()
    const testPublic = 'test_public_' + Date.now()
    const testUrl = 'https://api.cartwavehub.com.br'
    
    console.log('\n📝 Tentando salvar credenciais de teste...')
    console.log('Secret:', testSecret)
    console.log('Public:', testPublic)
    console.log('URL:', testUrl)
    
    const credentials = [
      { key: 'cartwavehub_api_secret', value: testSecret },
      { key: 'cartwavehub_api_public', value: testPublic },
      { key: 'cartwavehub_base_url', value: testUrl },
    ]
    
    for (const cred of credentials) {
      const [result] = await pool.execute(
        `INSERT INTO app_settings (setting_key, setting_value, updated_at)
         VALUES (?, ?, NOW())
         ON DUPLICATE KEY UPDATE 
         setting_value = VALUES(setting_value),
         updated_at = NOW()`,
        [cred.key, cred.value]
      )
      console.log(`✅ ${cred.key} salvo (affectedRows: ${result.affectedRows})`)
    }
    
    // 3. Verificar se foi salvo
    console.log('\n🔍 Verificando se foi salvo corretamente...')
    const [settings] = await pool.execute(
      `SELECT setting_key, setting_value 
       FROM app_settings 
       WHERE setting_key IN ('cartwavehub_api_secret', 'cartwavehub_api_public', 'cartwavehub_base_url')`
    )
    
    console.log('\n📋 Configurações encontradas:')
    settings.forEach(setting => {
      console.log(`  ${setting.setting_key}: ${setting.setting_value?.substring(0, 50)}...`)
    })
    
    // 4. Limpar dados de teste
    console.log('\n🧹 Limpando dados de teste...')
    await pool.execute(
      `DELETE FROM app_settings 
       WHERE setting_key IN ('cartwavehub_api_secret', 'cartwavehub_api_public', 'cartwavehub_base_url')
       AND setting_value LIKE 'test_%'`
    )
    console.log('✅ Dados de teste removidos')
    
    console.log('\n✅ Teste concluído com sucesso!')
    
  } catch (error) {
    console.error('❌ Erro no teste:', error.message)
    console.error('Stack:', error.stack)
  } finally {
    await pool.end()
  }
}

testCartwavehubSave()

