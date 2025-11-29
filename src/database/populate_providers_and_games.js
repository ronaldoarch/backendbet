import pool from '../config/database.js'
import dotenv from 'dotenv'

dotenv.config()

// Provedores mais populares
const providers = [
  {
    code: 'evolution',
    name: 'Evolution',
    distribution: 'Evolution',
    rtp: 96,
    status: 1,
    views: 0,
  },
  {
    code: 'pragmatic',
    name: 'Pragmatic Play',
    distribution: 'Pragmatic Play',
    rtp: 96,
    status: 1,
    views: 0,
  },
  {
    code: 'playngo',
    name: "Play'n GO",
    distribution: "Play'n GO",
    rtp: 96,
    status: 1,
    views: 0,
  },
  {
    code: 'netent',
    name: 'NetEnt',
    distribution: 'NetEnt',
    rtp: 96,
    status: 1,
    views: 0,
  },
  {
    code: 'microgaming',
    name: 'Microgaming',
    distribution: 'Microgaming',
    rtp: 96,
    status: 1,
    views: 0,
  },
  {
    code: 'redtiger',
    name: 'Red Tiger',
    distribution: 'Red Tiger',
    rtp: 96,
    status: 1,
    views: 0,
  },
  {
    code: 'yggdrasil',
    name: 'Yggdrasil',
    distribution: 'Yggdrasil',
    rtp: 96,
    status: 1,
    views: 0,
  },
  {
    code: 'quickspin',
    name: 'Quickspin',
    distribution: 'Quickspin',
    rtp: 96,
    status: 1,
    views: 0,
  },
  {
    code: 'pushgaming',
    name: 'Push Gaming',
    distribution: 'Push Gaming',
    rtp: 96,
    status: 1,
    views: 0,
  },
  {
    code: 'bgaming',
    name: 'BGaming',
    distribution: 'BGaming',
    rtp: 96,
    status: 1,
    views: 0,
  },
]

// Jogos populares por provedor
const games = {
  evolution: [
    { game_id: 'lightning_roulette', game_code: 'lightning_roulette', game_name: 'Lightning Roulette', game_type: 'live', is_featured: true, show_home: true, original: 1 },
    { game_id: 'lightning_dice', game_code: 'lightning_dice', game_name: 'Lightning Dice', game_type: 'live', is_featured: true, show_home: true, original: 1 },
    { game_id: 'mega_ball', game_code: 'mega_ball', game_name: 'Mega Ball', game_type: 'live', is_featured: false, show_home: true, original: 1 },
    { game_id: 'crazy_time', game_code: 'crazy_time', game_name: 'Crazy Time', game_type: 'live', is_featured: true, show_home: true, original: 1 },
    { game_id: 'monopoly_live', game_code: 'monopoly_live', game_name: 'Monopoly Live', game_type: 'live', is_featured: true, show_home: true, original: 1 },
  ],
  pragmatic: [
    { game_id: 'gates-of-olympus', game_code: 'gates-of-olympus', game_name: 'Gates of Olympus', game_type: 'slot', is_featured: true, show_home: true, original: 1 },
    { game_id: 'sweet-bonanza', game_code: 'sweet-bonanza', game_name: 'Sweet Bonanza', game_type: 'slot', is_featured: true, show_home: true, original: 1 },
    { game_id: 'big-bass-bonanza', game_code: 'big-bass-bonanza', game_name: 'Big Bass Bonanza', game_type: 'slot', is_featured: true, show_home: true, original: 1 },
    { game_id: 'the-dog-house', game_code: 'the-dog-house', game_name: 'The Dog House', game_type: 'slot', is_featured: false, show_home: true, original: 1 },
    { game_id: 'wild-west-gold', game_code: 'wild-west-gold', game_name: 'Wild West Gold', game_type: 'slot', is_featured: false, show_home: true, original: 1 },
    { game_id: 'joker-jewels', game_code: 'joker-jewels', game_name: 'Joker Jewels', game_type: 'slot', is_featured: false, show_home: true, original: 1 },
    { game_id: 'fruit-party', game_code: 'fruit-party', game_name: 'Fruit Party', game_type: 'slot', is_featured: false, show_home: true, original: 1 },
    { game_id: 'wolf-gold', game_code: 'wolf-gold', game_name: 'Wolf Gold', game_type: 'slot', is_featured: false, show_home: true, original: 1 },
  ],
  playngo: [
    { game_id: 'book-of-dead', game_code: 'book-of-dead', game_name: 'Book of Dead', game_type: 'slot', is_featured: true, show_home: true, original: 1 },
    { game_id: 'reactoonz', game_code: 'reactoonz', game_name: 'Reactoonz', game_type: 'slot', is_featured: true, show_home: true, original: 1 },
    { game_id: 'fire-joker', game_code: 'fire-joker', game_name: 'Fire Joker', game_type: 'slot', is_featured: false, show_home: true, original: 1 },
    { game_id: 'razor-shark', game_code: 'razor-shark', game_name: 'Razor Shark', game_type: 'slot', is_featured: false, show_home: true, original: 1 },
  ],
  netent: [
    { game_id: 'starburst', game_code: 'starburst', game_name: 'Starburst', game_type: 'slot', is_featured: true, show_home: true, original: 1 },
    { game_id: 'gonzos-quest', game_code: 'gonzos-quest', game_name: "Gonzo's Quest", game_type: 'slot', is_featured: true, show_home: true, original: 1 },
    { game_id: 'dead-or-alive-2', game_code: 'dead-or-alive-2', game_name: 'Dead or Alive 2', game_type: 'slot', is_featured: false, show_home: true, original: 1 },
    { game_id: 'jumanji', game_code: 'jumanji', game_name: 'Jumanji', game_type: 'slot', is_featured: false, show_home: true, original: 1 },
  ],
  microgaming: [
    { game_id: 'mega-moolah', game_code: 'mega-moolah', game_name: 'Mega Moolah', game_type: 'slot', is_featured: true, show_home: true, original: 1 },
    { game_id: 'immortal-romance', game_code: 'immortal-romance', game_name: 'Immortal Romance', game_type: 'slot', is_featured: false, show_home: true, original: 1 },
    { game_id: 'thunderstruck-ii', game_code: 'thunderstruck-ii', game_name: 'Thunderstruck II', game_type: 'slot', is_featured: false, show_home: true, original: 1 },
  ],
  redtiger: [
    { game_id: 'dragon-tiger', game_code: 'dragon-tiger', game_name: 'Dragon Tiger', game_type: 'live', is_featured: true, show_home: true, original: 1 },
    { game_id: 'lightning-roulette', game_code: 'lightning-roulette-rt', game_name: 'Lightning Roulette', game_type: 'live', is_featured: true, show_home: true, original: 1 },
    { game_id: 'dream-catcher', game_code: 'dream-catcher', game_name: 'Dream Catcher', game_type: 'live', is_featured: false, show_home: true, original: 1 },
  ],
  yggdrasil: [
    { game_id: 'valley-of-the-gods', game_code: 'valley-of-the-gods', game_name: 'Valley of the Gods', game_type: 'slot', is_featured: true, show_home: true, original: 1 },
    { game_id: 'vikings-go-berzerk', game_code: 'vikings-go-berzerk', game_name: 'Vikings Go Berzerk', game_type: 'slot', is_featured: false, show_home: true, original: 1 },
  ],
  quickspin: [
    { game_id: 'big-bad-wolf', game_code: 'big-bad-wolf', game_name: 'Big Bad Wolf', game_type: 'slot', is_featured: true, show_home: true, original: 1 },
    { game_id: 'sakura-fortune', game_code: 'sakura-fortune', game_name: 'Sakura Fortune', game_type: 'slot', is_featured: false, show_home: true, original: 1 },
  ],
  pushgaming: [
    { game_id: 'fat-rabbit', game_code: 'fat-rabbit', game_name: 'Fat Rabbit', game_type: 'slot', is_featured: true, show_home: true, original: 1 },
    { game_id: 'jammin-jars', game_code: 'jammin-jars', game_name: 'Jammin Jars', game_type: 'slot', is_featured: false, show_home: true, original: 1 },
  ],
  bgaming: [
    { game_id: 'plinko', game_code: 'plinko', game_name: 'Plinko', game_type: 'slot', is_featured: true, show_home: true, original: 1 },
    { game_id: 'dice', game_code: 'dice', game_name: 'Dice', game_type: 'slot', is_featured: false, show_home: true, original: 1 },
  ],
}

// Imagem placeholder SVG em base64 (300x400px com gradiente e texto)
// Esta imagem será substituída quando o usuário adicionar imagens reais pelo admin
const placeholderImage = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8ZGVmcz4KICAgIDxsaW5lYXJHcmFkaWVudCBpZD0iZ3JhZCIgeDE9IjAlIiB5MT0iMCUiIHgyPSIxMDAlIiB5Mj0iMTAwJSI+CiAgICAgIDxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiMxYjI3NDEiLz4KICAgICAgPHN0b3Agb2Zmc2V0PSIxMDAlIiBzdG9wLWNvbG9yPSIjMGExZTM3Ii8+CiAgICA8L2xpbmVhckdyYWRpZW50PgogIDwvZGVmcz4KICA8cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyYWQpIi8+CiAgPHRleHQgeD0iNTAlIiB5PSI0NSUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIyNCIgZm9udC13ZWlnaHQ9ImJvbGQiIGZpbGw9IiNmZmYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5Kb2dvPC90ZXh0PgogIDx0ZXh0IHg9IjUwJSIgeT0iNTUlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC43IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+QWRpY2lvbmUgYSBpbWFnZW0gbm8gYWRtaW48L3RleHQ+Cjwvc3ZnPgo='

async function populateProviders() {
  console.log('📦 Adicionando provedores...')
  
  const insertedProviders = {}
  
  for (const provider of providers) {
    try {
      // Verificar se já existe
      const [existing] = await pool.execute(
        'SELECT id FROM providers WHERE code = ?',
        [provider.code]
      )
      
      if (existing && existing.length > 0) {
        console.log(`  ⏭️  Provedor "${provider.name}" já existe (ID: ${existing[0].id})`)
        insertedProviders[provider.code] = existing[0].id
        continue
      }
      
      // Inserir provedor
      const [result] = await pool.execute(
        `INSERT INTO providers (code, name, distribution, rtp, status, views, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [
          provider.code,
          provider.name,
          provider.distribution,
          provider.rtp,
          provider.status,
          provider.views,
        ]
      )
      
      insertedProviders[provider.code] = result.insertId
      console.log(`  ✅ Provedor "${provider.name}" adicionado (ID: ${result.insertId})`)
    } catch (error) {
      console.error(`  ❌ Erro ao adicionar provedor "${provider.name}":`, error.message)
    }
  }
  
  return insertedProviders
}

async function populateGames(providerMap) {
  console.log('\n🎮 Adicionando jogos...')
  
  let totalAdded = 0
  let totalSkipped = 0
  
  for (const [providerCode, providerId] of Object.entries(providerMap)) {
    const providerGames = games[providerCode] || []
    
    if (providerGames.length === 0) {
      console.log(`  ⏭️  Nenhum jogo para "${providerCode}"`)
      continue
    }
    
    console.log(`\n  📂 Provedor: ${providerCode} (${providerGames.length} jogos)`)
    
    for (const game of providerGames) {
      try {
        // Verificar se já existe
        const [existing] = await pool.execute(
          'SELECT id FROM games WHERE game_code = ?',
          [game.game_code]
        )
        
        if (existing && existing.length > 0) {
          console.log(`    ⏭️  Jogo "${game.game_name}" já existe`)
          totalSkipped++
          continue
        }
        
        // Inserir jogo
        const [result] = await pool.execute(
          `INSERT INTO games (
            provider_id, game_id, game_code, game_name, game_type,
            cover, status, distribution, rtp, views,
            is_featured, show_home, original,
            created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
          [
            providerId,
            game.game_id,
            game.game_code,
            game.game_name,
            game.game_type || 'slot',
            placeholderImage,
            1, // status: ativo
            providerCode === 'evolution' ? 'Evolution' : 
            providerCode === 'pragmatic' ? 'Pragmatic Play' :
            providerCode === 'playngo' ? "Play'n GO" :
            providerCode === 'netent' ? 'NetEnt' :
            providerCode === 'microgaming' ? 'Microgaming' :
            providerCode === 'redtiger' ? 'Red Tiger' :
            providerCode === 'yggdrasil' ? 'Yggdrasil' :
            providerCode === 'quickspin' ? 'Quickspin' :
            providerCode === 'pushgaming' ? 'Push Gaming' :
            providerCode === 'bgaming' ? 'BGaming' : providerCode,
            96, // RTP padrão
            0, // views
            game.is_featured ? 1 : 0,
            game.show_home ? 1 : 0,
            game.original || 0,
          ]
        )
        
        console.log(`    ✅ Jogo "${game.game_name}" adicionado (ID: ${result.insertId})`)
        totalAdded++
      } catch (error) {
        console.error(`    ❌ Erro ao adicionar jogo "${game.game_name}":`, error.message)
      }
    }
  }
  
  console.log(`\n📊 Resumo:`)
  console.log(`  ✅ Jogos adicionados: ${totalAdded}`)
  console.log(`  ⏭️  Jogos já existentes: ${totalSkipped}`)
}

async function main() {
  try {
    console.log('🚀 Iniciando população de provedores e jogos...\n')
    
    // Testar conexão
    await pool.execute('SELECT 1')
    console.log('✅ Conexão com banco de dados estabelecida\n')
    
    // Adicionar provedores
    const providerMap = await populateProviders()
    
    // Adicionar jogos
    await populateGames(providerMap)
    
    console.log('\n✨ População concluída com sucesso!')
    process.exit(0)
  } catch (error) {
    console.error('\n❌ Erro ao popular banco de dados:', error)
    process.exit(1)
  }
}

main()

