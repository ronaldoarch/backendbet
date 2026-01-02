# 🔍 Verificar e Testar CORS

## ✅ Correções Aplicadas

1. ✅ Handler explícito para requisições OPTIONS (preflight)
2. ✅ Rate limiting não bloqueia requisições OPTIONS
3. ✅ Múltiplas origens permitidas (betgeniusbr.com, localhost, etc.)
4. ✅ Headers CORS configurados corretamente

## 🚀 Aguardar Deploy do Vercel

O código foi enviado para o GitHub. O Vercel faz deploy automático, mas pode levar 1-3 minutos.

### Verificar se o Deploy Foi Concluído

1. Acesse: https://vercel.com/dashboard
2. Vá no projeto `backendbet`
3. Verifique se o último deploy está com status "Ready" (verde)

## 🧪 Testar CORS

### Opção 1: Testar no Navegador

1. Abra o DevTools (F12)
2. Vá na aba "Console"
3. Execute este comando:

```javascript
fetch('https://backendbet.vercel.app/api/health', {
  method: 'GET',
  headers: {
    'Origin': 'https://betgeniusbr.com'
  }
})
.then(r => r.json())
.then(console.log)
.catch(console.error)
```

Se funcionar, você verá: `{ status: 'ok', timestamp: '...' }`

### Opção 2: Testar com curl

```bash
curl -X OPTIONS https://backendbet.vercel.app/api/admin/playfiver-keys \
  -H "Origin: https://betgeniusbr.com" \
  -H "Access-Control-Request-Method: PUT" \
  -H "Access-Control-Request-Headers: Content-Type,Authorization" \
  -v
```

Você deve ver os headers:
- `Access-Control-Allow-Origin: https://betgeniusbr.com`
- `Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS, PATCH`
- `Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With`

### Opção 3: Testar no Admin

1. Acesse: https://betgeniusbr.com/admin/playfiver-keys
2. Abra o DevTools (F12) > Console
3. Tente salvar as credenciais
4. Verifique se não há mais erros de CORS

## 🔧 Se Ainda Não Funcionar

### 1. Limpar Cache do Navegador

- Pressione `Ctrl+Shift+Delete` (Windows/Linux) ou `Cmd+Shift+Delete` (Mac)
- Selecione "Imagens e arquivos em cache"
- Clique em "Limpar dados"

### 2. Testar em Modo Anônimo

- Abra uma janela anônima/privada
- Acesse: https://betgeniusbr.com/admin/playfiver-keys
- Tente novamente

### 3. Verificar Logs do Vercel

1. Acesse: https://vercel.com/dashboard
2. Vá no projeto `backendbet`
3. Clique em "Functions" > "View Function Logs"
4. Verifique se há erros relacionados a CORS

### 4. Verificar Variáveis de Ambiente no Vercel

1. Acesse: https://vercel.com/dashboard
2. Vá no projeto `backendbet`
3. Clique em "Settings" > "Environment Variables"
4. Verifique se `CORS_ORIGIN` está configurado (opcional, não é necessário)

## 📝 Headers Esperados

Quando funcionar corretamente, as requisições devem retornar:

```
Access-Control-Allow-Origin: https://betgeniusbr.com
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS, PATCH
Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With
Access-Control-Allow-Credentials: true
Access-Control-Max-Age: 86400
```

## ⚠️ Nota Importante

Se o deploy do Vercel ainda não foi concluído, aguarde alguns minutos e tente novamente. O Vercel geralmente faz deploy automático em 1-3 minutos após o push para o GitHub.

