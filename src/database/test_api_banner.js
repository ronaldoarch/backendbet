import axios from 'axios'

/**
 * Teste direto da API para verificar se está truncando
 * Execute: node src/database/test_api_banner.js
 */
async function testAPIBanner() {
  try {
    console.log('🧪 TESTE DA API DE BANNERS\n')
    
    // Criar uma imagem base64 de teste (similar ao tamanho que está sendo enviado)
    const testImage = 'data:image/png;base64,' + 'A'.repeat(1100000) // ~1.1MB
    console.log(`Tamanho da imagem de teste: ${testImage.length} caracteres (${(testImage.length / 1024).toFixed(2)} KB)`)
    
    // Testar criação via API
    console.log('\nEnviando requisição para API...')
    const response = await axios.post('http://localhost:3001/api/admin/banners', {
      image: testImage,
      type: 'home',
      description: 'Teste via API',
      status: true,
    }, {
      headers: {
        'Content-Type': 'application/json',
      },
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
    })
    
    console.log('✅ Banner criado via API!')
    console.log(`ID do banner: ${response.data.banner.id}`)
    
    // Verificar o que foi salvo
    const getResponse = await axios.get(`http://localhost:3001/api/admin/banners/${response.data.banner.id}`)
    const savedImage = getResponse.data.banner.image
    const savedLength = savedImage ? savedImage.length : 0
    
    console.log(`\nTamanho da imagem salva: ${savedLength} caracteres (${(savedLength / 1024).toFixed(2)} KB)`)
    
    if (savedLength === testImage.length) {
      console.log('✅ SUCESSO! Imagem foi salva completamente via API.')
    } else {
      console.log(`❌ FALHA! Esperado: ${testImage.length}, Salvo: ${savedLength}`)
      console.log(`Diferença: ${testImage.length - savedLength} caracteres perdidos`)
    }
    
    // Limpar
    await axios.delete(`http://localhost:3001/api/admin/banners/${response.data.banner.id}`)
    console.log('\nTeste removido do banco.')
    
    process.exit(0)
  } catch (error) {
    console.error('❌ Erro no teste:', error.message)
    if (error.response) {
      console.error('Resposta do servidor:', error.response.data)
    }
    process.exit(1)
  }
}

testAPIBanner()

