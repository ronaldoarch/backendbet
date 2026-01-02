import axios from 'axios'
import https from 'https'

/**
 * Script para descobrir o IP atual do servidor Vercel
 * 
 * IMPORTANTE: Vercel usa IPs dinâmicos que mudam a cada deploy.
 * Este script mostra o IP atual, mas ele pode mudar.
 */

async function getServerIP() {
  try {
    console.log('🔍 Descobrindo IP do servidor...\n')

    // Tentar múltiplos serviços para descobrir o IP
    const ipServices = [
      'https://api.ipify.org?format=json',
      'https://ipapi.co/json/',
      'https://api.myip.com',
      'https://ifconfig.me/all.json',
    ]

    const agent = new https.Agent({
      rejectUnauthorized: false,
    })

    for (const service of ipServices) {
      try {
        console.log(`Tentando ${service}...`)
        const response = await axios.get(service, {
          httpsAgent: agent,
          timeout: 5000,
        })

        let ip = null
        if (response.data.ip) {
          ip = response.data.ip
        } else if (response.data.query) {
          ip = response.data.query
        } else if (typeof response.data === 'string' && /^\d+\.\d+\.\d+\.\d+$/.test(response.data.trim())) {
          ip = response.data.trim()
        }

        if (ip) {
          console.log(`\n✅ IP encontrado: ${ip}\n`)
          console.log('📋 Informações:')
          console.log(`  IP: ${ip}`)
          
          if (response.data.country) {
            console.log(`  País: ${response.data.country}`)
          }
          if (response.data.city) {
            console.log(`  Cidade: ${response.data.city}`)
          }
          if (response.data.org) {
            console.log(`  Organização: ${response.data.org}`)
          }

          console.log('\n⚠️  IMPORTANTE:')
          console.log('  - Vercel usa IPs dinâmicos que mudam a cada deploy')
          console.log('  - Este é o IP ATUAL, mas pode mudar')
          console.log('  - Você precisará adicionar este IP à whitelist da PlayFiver')
          console.log('  - Se o IP mudar, você precisará atualizar a whitelist novamente')
          console.log('\n💡 Alternativas:')
          console.log('  1. Solicitar à PlayFiver um range de IPs do Vercel')
          console.log('  2. Usar um servidor com IP fixo (Hostinger, AWS, etc.)')
          console.log('  3. Usar um proxy com IP fixo')

          return ip
        }
      } catch (error) {
        console.log(`  ❌ Falhou: ${error.message}`)
        continue
      }
    }

    console.error('\n❌ Não foi possível descobrir o IP')
    return null
  } catch (error) {
    console.error('❌ Erro:', error.message)
    return null
  }
}

// Executar
getServerIP().then(ip => {
  if (ip) {
    console.log(`\n📝 Para adicionar à whitelist da PlayFiver, envie este IP: ${ip}`)
  }
  process.exit(ip ? 0 : 1)
})

