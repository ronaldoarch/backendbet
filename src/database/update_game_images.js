import pool from '../config/database.js'
import dotenv from 'dotenv'

dotenv.config()

// Imagem placeholder SVG em base64 (300x400px com gradiente e texto)
const placeholderImage = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8ZGVmcz4KICAgIDxsaW5lYXJHcmFkaWVudCBpZD0iZ3JhZCIgeDE9IjAlIiB5MT0iMCUiIHgyPSIxMDAlIiB5Mj0iMTAwJSI+CiAgICAgIDxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiMxYjI3NDEiLz4KICAgICAgPHN0b3Agb2Zmc2V0PSIxMDAlIiBzdG9wLWNvbG9yPSIjMGExZTM3Ii8+CiAgICA8L2xpbmVhckdyYWRpZW50PgogIDwvZGVmcz4KICA8cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyYWQpIi8+CiAgPHRleHQgeD0iNTAlIiB5PSI0NSUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIyNCIgZm9udC13ZWlnaHQ9ImJvbGQiIGZpbGw9IiNmZmYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5Kb2dvPC90ZXh0PgogIDx0ZXh0IHg9IjUwJSIgeT0iNTUlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC43IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+QWRpY2lvbmUgYSBpbWFnZW0gbm8gYWRtaW48L3RleHQ+Cjwvc3ZnPgo='

async function updateGameImages() {
  try {
    console.log('🖼️  Atualizando imagens dos jogos...\n')
    
    // Buscar todos os jogos
    const [games] = await pool.execute(
      'SELECT id, game_name, cover FROM games WHERE status = 1'
    )
    
    console.log(`📋 Encontrados ${games.length} jogos\n`)
    
    let updated = 0
    let skipped = 0
    
    for (const game of games) {
      // Verificar se a imagem é muito pequena (placeholder antigo de 1x1 pixel)
      // O placeholder antigo tem ~100 caracteres, o novo tem ~500+
      const isOldPlaceholder = !game.cover || 
                               game.cover.length < 200 || 
                               game.cover === 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
      
      if (isOldPlaceholder) {
        try {
          await pool.execute(
            'UPDATE games SET cover = ? WHERE id = ?',
            [placeholderImage, game.id]
          )
          console.log(`  ✅ Atualizado: "${game.game_name}" (ID: ${game.id})`)
          updated++
        } catch (error) {
          console.error(`  ❌ Erro ao atualizar "${game.game_name}":`, error.message)
        }
      } else {
        console.log(`  ⏭️  Mantido: "${game.game_name}" (já tem imagem)`)
        skipped++
      }
    }
    
    console.log(`\n📊 Resumo:`)
    console.log(`  ✅ Jogos atualizados: ${updated}`)
    console.log(`  ⏭️  Jogos mantidos: ${skipped}`)
    console.log(`\n✨ Atualização concluída!`)
    
    process.exit(0)
  } catch (error) {
    console.error('\n❌ Erro ao atualizar imagens:', error)
    process.exit(1)
  }
}

updateGameImages()

