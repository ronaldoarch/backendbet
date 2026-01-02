// Script para popular a tabela category_games associando jogos às categorias
// Execute: node populate_category_games.js

import pool from './src/config/database.js'

async function populateCategoryGames() {
  try {
    console.log('🔧 POPULANDO TABELA CATEGORY_GAMES\n')

    // 1. Buscar todas as categorias
    const [categories] = await pool.execute(
      'SELECT id, name, slug FROM categories WHERE status = 1'
    )
    console.log(`✅ Encontradas ${categories.length} categorias:`)
    categories.forEach(cat => {
      console.log(`   - ${cat.name} (${cat.slug})`)
    })

    if (categories.length === 0) {
      console.log('⚠️  Nenhuma categoria encontrada. Criando categorias padrão...')
      
      // Criar categorias padrão
      const defaultCategories = [
        { name: 'Slots', slug: 'slots' },
        { name: 'Ao Vivo', slug: 'ao-vivo' },
        { name: 'Roleta', slug: 'roleta' },
        { name: 'Crash', slug: 'crash' },
        { name: 'Caixas', slug: 'caixas' },
      ]

      for (const cat of defaultCategories) {
        try {
          const [result] = await pool.execute(
            'INSERT INTO categories (name, slug, status, created_at, updated_at) VALUES (?, ?, 1, NOW(), NOW())',
            [cat.name, cat.slug]
          )
          console.log(`   ✅ Categoria "${cat.name}" criada (ID: ${result.insertId})`)
        } catch (err) {
          if (err.code === 'ER_DUP_ENTRY') {
            console.log(`   ⚠️  Categoria "${cat.name}" já existe`)
          } else {
            console.error(`   ❌ Erro ao criar categoria "${cat.name}":`, err.message)
          }
        }
      }

      // Buscar categorias novamente
      const [newCategories] = await pool.execute(
        'SELECT id, name, slug FROM categories WHERE status = 1'
      )
      categories.push(...newCategories)
    }

    // 2. Buscar todos os jogos
    const [games] = await pool.execute(
      'SELECT id, game_name, game_code, distribution FROM games WHERE status = 1'
    )
    console.log(`\n✅ Encontrados ${games.length} jogos\n`)

    if (games.length === 0) {
      console.log('⚠️  Nenhum jogo encontrado!')
      return
    }

    // 3. Limpar associações existentes (opcional - comentado para não perder dados)
    // await pool.execute('DELETE FROM category_games')
    // console.log('🗑️  Associações antigas removidas\n')

    // 4. Associar jogos às categorias baseado em regras
    let associationsCreated = 0
    let associationsSkipped = 0

    for (const game of games) {
      const gameName = (game.game_name || '').toLowerCase()
      const gameCode = (game.game_code || '').toLowerCase()
      const distribution = (game.distribution || '').toLowerCase()

      const categoriesToAssign = []

      // Regras de associação
      for (const category of categories) {
        const categorySlug = category.slug.toLowerCase()
        let shouldAssign = false

        // Slots: jogos que não são ao vivo, crash, roleta ou caixas
        if (categorySlug === 'slots') {
          if (
            !gameName.includes('live') &&
            !gameName.includes('ao vivo') &&
            !gameName.includes('crash') &&
            !gameName.includes('mines') &&
            !gameName.includes('aviator') &&
            !gameName.includes('spaceman') &&
            !gameName.includes('roleta') &&
            !gameName.includes('roulette') &&
            !gameName.includes('baccarat') &&
            !gameName.includes('blackjack') &&
            !gameName.includes('poker') &&
            !gameName.includes('caixa') &&
            !gameName.includes('box')
          ) {
            shouldAssign = true
          }
        }

        // Ao Vivo / Roleta
        if (categorySlug === 'ao-vivo' || categorySlug === 'roleta') {
          if (
            gameName.includes('live') ||
            gameName.includes('ao vivo') ||
            gameName.includes('roleta') ||
            gameName.includes('roulette') ||
            gameName.includes('baccarat') ||
            gameName.includes('blackjack') ||
            gameName.includes('poker') ||
            distribution.includes('evolution') ||
            distribution.includes('live')
          ) {
            shouldAssign = true
          }
        }

        // Crash
        if (categorySlug === 'crash') {
          if (
            gameName.includes('crash') ||
            gameName.includes('aviator') ||
            gameName.includes('spaceman') ||
            gameName.includes('mines')
          ) {
            shouldAssign = true
          }
        }

        // Caixas
        if (categorySlug === 'caixas') {
          if (
            gameName.includes('caixa') ||
            gameName.includes('box') ||
            gameName.includes('surpresa')
          ) {
            shouldAssign = true
          }
        }

        if (shouldAssign) {
          categoriesToAssign.push(category.id)
        }
      }

      // Se nenhuma categoria foi encontrada, atribuir "Slots" como padrão
      if (categoriesToAssign.length === 0) {
        const slotsCategory = categories.find(c => c.slug === 'slots')
        if (slotsCategory) {
          categoriesToAssign.push(slotsCategory.id)
        }
      }

      // Inserir associações
      for (const categoryId of categoriesToAssign) {
        try {
          await pool.execute(
            'INSERT INTO category_games (game_id, category_id, created_at) VALUES (?, ?, NOW()) ON DUPLICATE KEY UPDATE created_at = created_at',
            [game.id, categoryId]
          )
          associationsCreated++
        } catch (err) {
          if (err.code === 'ER_DUP_ENTRY') {
            associationsSkipped++
          } else {
            console.error(`   ❌ Erro ao associar jogo ${game.id} à categoria ${categoryId}:`, err.message)
          }
        }
      }
    }

    console.log(`\n✅ Processo concluído!`)
    console.log(`   - Associações criadas: ${associationsCreated}`)
    console.log(`   - Associações já existentes (ignoradas): ${associationsSkipped}`)

    // 5. Verificar resultado
    const [stats] = await pool.execute(`
      SELECT c.name, c.slug, COUNT(cg.game_id) as total_jogos
      FROM categories c
      LEFT JOIN category_games cg ON c.id = cg.category_id
      WHERE c.status = 1
      GROUP BY c.id, c.name, c.slug
      ORDER BY total_jogos DESC
    `)

    console.log(`\n📊 Estatísticas por categoria:`)
    stats.forEach(stat => {
      console.log(`   - ${stat.name} (${stat.slug}): ${stat.total_jogos} jogos`)
    })

  } catch (error) {
    console.error('❌ Erro ao popular category_games:', error.message)
    console.error('Stack:', error.stack)
    throw error
  } finally {
    await pool.end()
  }
}

populateCategoryGames()

