import express from 'express'
import pool from '../config/database.js'

const router = express.Router()

/**
 * ⚠️ ROTA TEMPORÁRIA - REMOVER APÓS MIGRAÇÃO
 * POST /api/migrate/igamewin
 * Executa migração para adicionar colunas do iGameWin
 */
router.post('/igamewin', async (req, res) => {
  try {
    console.log('🔧 Executando migração iGameWin...')
    
    // Verificar se as colunas já existem
    const [columns] = await pool.execute(`
      SELECT COLUMN_NAME
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'games_keys'
        AND COLUMN_NAME IN ('igamewin_agent_code', 'igamewin_agent_token')
    `)

    const existingColumns = columns.map(col => col.COLUMN_NAME)
    
    if (existingColumns.includes('igamewin_agent_code') && 
        existingColumns.includes('igamewin_agent_token')) {
      return res.json({
        status: true,
        message: '✅ Migração já executada - colunas já existem',
        columns: existingColumns,
        action: 'none'
      })
    }

    // Adicionar colunas que não existem
    const queries = []
    
    if (!existingColumns.includes('igamewin_agent_code')) {
      queries.push('ADD COLUMN igamewin_agent_code VARCHAR(255) NULL')
    }
    
    if (!existingColumns.includes('igamewin_agent_token')) {
      queries.push('ADD COLUMN igamewin_agent_token VARCHAR(255) NULL')
    }

    if (queries.length > 0) {
      await pool.execute(`
        ALTER TABLE games_keys
        ${queries.join(', ')}
      `)

      res.json({
        status: true,
        message: '✅ Migração executada com sucesso!',
        columns_added: queries.length,
        columns: ['igamewin_agent_code', 'igamewin_agent_token']
      })
    } else {
      res.json({
        status: true,
        message: '✅ Todas as colunas já existem',
        columns: existingColumns
      })
    }
  } catch (error) {
    console.error('❌ Erro na migração:', error)
    
    // Se for erro de coluna duplicada, está ok
    if (error.message.includes('Duplicate column') || error.code === 'ER_DUP_FIELDNAME') {
      return res.json({
        status: true,
        message: '✅ Colunas já existem (migração já foi executada)',
        warning: error.message,
        action: 'none'
      })
    }
    
    res.status(500).json({
      status: false,
      error: error.message,
      code: error.code,
      sqlState: error.sqlState
    })
  }
})

/**
 * GET /api/migrate/igamewin/check
 * Verificar status da migração sem executar
 */
router.get('/igamewin/check', async (req, res) => {
  try {
    const [columns] = await pool.execute(`
      SELECT 
        COLUMN_NAME,
        DATA_TYPE,
        IS_NULLABLE
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'games_keys'
        AND COLUMN_NAME IN ('igamewin_agent_code', 'igamewin_agent_token')
    `)

    const existingColumns = columns.map(col => col.COLUMN_NAME)
    const allColumnsExist = existingColumns.includes('igamewin_agent_code') && 
                            existingColumns.includes('igamewin_agent_token')

    res.json({
      status: true,
      migration_complete: allColumnsExist,
      existing_columns: existingColumns,
      required_columns: ['igamewin_agent_code', 'igamewin_agent_token'],
      needs_migration: !allColumnsExist
    })
  } catch (error) {
    res.status(500).json({
      status: false,
      error: error.message
    })
  }
})

export default router

