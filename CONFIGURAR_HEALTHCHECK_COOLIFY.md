# 🔧 Configurar Health Check no Coolify

## ⚠️ Problema Identificado

O status mostra "Running (unknown)" com um aviso. Isso geralmente significa que o **Health Check** não está configurado corretamente no Coolify.

## ✅ Solução

### Passo 1: Verificar Health Check no Backend

O backend já tem health check configurado em:
- ✅ `/health` - Health check completo
- ✅ `/api/health` - Não existe (precisa adicionar ou configurar Coolify)

### Passo 2: Configurar no Coolify

1. **No Coolify, vá em "Configuration"**
2. **Role até a seção "Healthcheck"** (no menu lateral esquerdo)
3. **Configure:**
   - **Path:** `/health` (ou `/api/health` se preferir)
   - **Port:** `3001` (ou a porta configurada)
   - **Interval:** `30` segundos
   - **Timeout:** `10` segundos
   - **Retries:** `3`

### Passo 3: Adicionar Rota `/api/health` (Opcional)

Se preferir usar `/api/health` para consistência, adicione no `server.js`:

```javascript
// Health check na rota /api também
app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1')
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: 'connected',
    })
  } catch (error) {
    res.status(503).json({
      status: 'error',
      error: error.message,
    })
  }
})
```

### Passo 4: Testar Health Check

Teste manualmente:

```bash
# Testar /health
curl https://qoo8wgogo4ow4gsg0k0wk4g4.agenciamidas.com/health

# Ou se preferir /api/health
curl https://qoo8wgogo4ow4gsg0k0wk4g4.agenciamidas.com/api/health
```

**Resposta esperada:**
```json
{
  "status": "ok",
  "timestamp": "2024-12-31T...",
  "database": "connected (MySQL)",
  "redis": "not configured"
}
```

### Passo 5: Verificar Logs

1. No Coolify, vá em **"Logs"**
2. Procure por:
   - ✅ `🚀 Servidor rodando na porta 3001`
   - ✅ Sem erros de conexão com banco
   - ✅ Health check respondendo

## 🔍 Verificações Adicionais

### Verificar se o Backend Está Respondendo

```bash
# Testar rota raiz
curl https://qoo8wgogo4ow4gsg0k0wk4g4.agenciamidas.com/

# Testar API
curl https://qoo8wgogo4ow4gsg0k0wk4g4.agenciamidas.com/api/banners
```

### Verificar Variáveis de Ambiente

No Coolify, verifique se estão configuradas:
- ✅ `PORT=3001`
- ✅ `NODE_ENV=production`
- ✅ `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`
- ✅ `CORS_ORIGIN` (deve incluir `fortunevegas.site`)

## 📝 Após Configurar

1. **Salve as configurações** no Coolify
2. **O status deve mudar** de "Running (unknown)" para "Running" (sem aviso)
3. **O health check será verificado automaticamente** a cada 30 segundos

## ⚠️ Se o Aviso Persistir

1. Verifique os logs do Coolify para erros específicos
2. Verifique se a porta está correta
3. Tente fazer um "Redeploy" após configurar o health check
4. Verifique se o firewall não está bloqueando a porta

