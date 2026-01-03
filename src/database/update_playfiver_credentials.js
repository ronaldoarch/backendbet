import pool from '../config/database.js'

/**
 * Script para atualizar credenciais PlayFiver manualmente no banco de dados
 * Execute: node src/database/update_playfiver_credentials.js
 */

const CREDENTIALS = {
  playfiver_code: 'betgenius',
  playfiver_token: '670dafb4-5653-4be4-ac57-91da595f08a5',
  playfiver_secret: '17c5843f-6d80-4935-8df2-42b530ef9af2',
  callback_url: 'https://betgeniusbr.com/playfiver/callback',
}

async function updateCredentials() {
  try {
    console.log('🔧 ATUALIZANDO CREDENCIAIS PLAYFIVER NO BANCO DE DADOS\n')
    console.log('Credenciais a serem salvas:')
    console.log(`  Código: ${CREDENTIALS.playfiver_code}`)
    console.log(`  Token: ${CREDENTIALS.playfiver_token.substring(0, 20)}...`)
    console.log(`  Secret: ${CREDENTIALS.playfiver_secret.substring(0, 20)}...\n`)
    
    // Verificar se já existe registro
    const [existing] = await pool.execute(
      'SELECT id, playfiver_code, playfiver_token, playfiver_secret FROM games_keys ORDER BY id DESC LIMIT 1'
    )
    
    if (existing && existing.length > 0) {
      const record = existing[0]
      console.log('📋 Registro existente encontrado:')
      console.log(`  ID: ${record.id}`)
      console.log(`  Código atual: ${record.playfiver_code || 'null'}`)
      console.log(`  Token atual: ${record.playfiver_token ? record.playfiver_token.substring(0, 20) + '...' : 'null'}`)
      console.log(`  Secret atual: ${record.playfiver_secret ? record.playfiver_secret.substring(0, 20) + '...' : 'null'}\n`)
      
      // Atualizar registro existente
      console.log('🔄 Atualizando registro existente...')
      const [result] = await pool.execute(
        `UPDATE games_keys SET
          playfiver_code = ?,
          playfiver_token = ?,
          playfiver_secret = ?,
          callback_url = ?,
          updated_at = NOW()
        WHERE id = ?`,
        [
          CREDENTIALS.playfiver_code,
          CREDENTIALS.playfiver_token,
          CREDENTIALS.playfiver_secret,
          CREDENTIALS.callback_url,
          record.id,
        ]
      )
      
      console.log(`✅ Registro atualizado! Linhas afetadas: ${result.affectedRows}\n`)
    } else {
      // Criar novo registro
      console.log('📝 Nenhum registro encontrado. Criando novo registro...')
      const [result] = await pool.execute(
        `INSERT INTO games_keys (
          playfiver_code, playfiver_token, playfiver_secret, callback_url, created_at, updated_at
        ) VALUES (?, ?, ?, ?, NOW(), NOW())`,
        [
          CREDENTIALS.playfiver_code,
          CREDENTIALS.playfiver_token,
          CREDENTIALS.playfiver_secret,
          CREDENTIALS.callback_url,
        ]
      )
      
      console.log(`✅ Novo registro criado! ID: ${result.insertId}\n`)
    }
    
    // Verificar se foi salvo corretamente
    console.log('🔍 Verificando valores salvos...')
    const [verify] = await pool.execute(
      'SELECT id, playfiver_code, playfiver_token, playfiver_secret, callback_url FROM games_keys ORDER BY id DESC LIMIT 1'
    )
    
    if (verify && verify.length > 0) {
      const saved = verify[0]
      console.log('✅ Valores salvos no banco:')
      console.log(`  ID: ${saved.id}`)
      console.log(`  Código: ${saved.playfiver_code}`)
      console.log(`  Token: ${saved.playfiver_token ? saved.playfiver_token.substring(0, 20) + '...' : 'null'}`)
      console.log(`  Secret: ${saved.playfiver_secret ? saved.playfiver_secret.substring(0, 20) + '...' : 'null'}`)
      console.log(`  Callback URL: ${saved.callback_url || 'null'}\n`)
      
      // Verificar se os valores estão corretos
      if (
        saved.playfiver_code === CREDENTIALS.playfiver_code &&
        saved.playfiver_token === CREDENTIALS.playfiver_token &&
        saved.playfiver_secret === CREDENTIALS.playfiver_secret
      ) {
        console.log('✅ Credenciais salvas corretamente!')
        console.log('   Agora você pode recarregar a página e as credenciais devem aparecer.\n')
      } else {
        console.log('⚠️  ATENÇÃO: Os valores salvos não correspondem aos valores esperados!')
        console.log('   Verifique se houve algum erro durante o salvamento.\n')
      }
    } else {
      console.log('❌ Erro: Não foi possível verificar os valores salvos\n')
    }
    
    process.exit(0)
  } catch (error) {
    console.error('❌ Erro ao atualizar credenciais:', error.message)
    console.error('Stack:', error.stack)
    process.exit(1)
  }
}

updateCredentials()

