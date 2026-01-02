import pool from '../config/database.js'

/**
 * Script para atualizar o callback_url do PlayFiver no banco de dados
 * 
 * Uso: node src/database/update_callback_url.js
 */

async function updateCallbackUrl() {
  try {
    const newCallbackUrl = 'https://fortunevegas.site/playfiver/callback'
    
    console.log('🔄 Atualizando callback_url para:', newCallbackUrl)
    
    // Verificar se existe registro
    const [existing] = await pool.execute(
      'SELECT id, callback_url FROM games_keys LIMIT 1'
    )
    
    if (!existing || existing.length === 0) {
      console.log('⚠️  Nenhum registro encontrado na tabela games_keys')
      console.log('💡 Crie as configurações primeiro pelo painel admin')
      process.exit(1)
    }
    
    const recordId = existing[0].id
    const oldCallbackUrl = existing[0].callback_url || '(vazio)'
    
    console.log('📋 Registro encontrado:')
    console.log('   ID:', recordId)
    console.log('   Callback URL atual:', oldCallbackUrl)
    
    // Atualizar
    await pool.execute(
      'UPDATE games_keys SET callback_url = ?, updated_at = NOW() WHERE id = ?',
      [newCallbackUrl, recordId]
    )
    
    console.log('✅ Callback URL atualizado com sucesso!')
    console.log('   Antes:', oldCallbackUrl)
    console.log('   Depois:', newCallbackUrl)
    
    // Verificar atualização
    const [updated] = await pool.execute(
      'SELECT callback_url FROM games_keys WHERE id = ?',
      [recordId]
    )
    
    console.log('🔍 Verificação:', updated[0].callback_url)
    
    process.exit(0)
  } catch (error) {
    console.error('❌ Erro ao atualizar callback_url:', error)
    process.exit(1)
  }
}

updateCallbackUrl()

