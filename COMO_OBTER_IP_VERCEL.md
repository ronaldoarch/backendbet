# 🔍 Como Obter o IP do Vercel

## ⚠️ Importante sobre IPs do Vercel

**Vercel usa IPs dinâmicos** que mudam a cada deploy. Isso significa:
- ❌ Não há um IP fixo único
- ❌ O IP pode mudar a qualquer momento
- ❌ Você precisará atualizar a whitelist se o IP mudar

## 🚀 Como Descobrir o IP Atual

### Opção 1: Usar o Script (Recomendado)

Execute o script que criamos:

```bash
cd backend-api
npm run get-ip
```

O script mostrará:
- ✅ IP atual do servidor
- 📋 Informações adicionais (país, cidade, etc.)
- ⚠️ Avisos sobre IPs dinâmicos

### Opção 2: Verificar nos Logs do Vercel

1. Acesse o dashboard do Vercel
2. Vá em "Functions" → "Logs"
3. Procure por requisições recentes
4. O IP de origem pode aparecer nos logs

### Opção 3: Usar Serviço Online

Você pode criar um endpoint temporário no backend que retorna o IP:

```javascript
app.get('/api/get-ip', (req, res) => {
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress
  res.json({ ip })
})
```

Depois acesse: `https://backendbet.vercel.app/api/get-ip`

## 📋 O que Fazer com o IP

1. **Anote o IP** que o script retornou
2. **Entre em contato com o suporte da PlayFiver**
3. **Solicite adicionar este IP à whitelist**
4. **Mencione que é do Vercel** e que o IP pode mudar

## ⚠️ Problema com IPs Dinâmicos

Como o IP muda, você tem algumas opções:

### Opção A: Solicitar Range de IPs
- Pergunte à PlayFiver se há um range de IPs do Vercel
- Eles podem ter uma lista de IPs que o Vercel usa
- Isso evitaria ter que atualizar a cada mudança

### Opção B: Usar Servidor com IP Fixo
- Configure o backend no Hostinger (ou outro servidor)
- Servidores tradicionais têm IP fixo
- Mais estável para whitelist

### Opção C: Atualizar Manualmente
- Sempre que o IP mudar, atualize a whitelist
- Não é ideal, mas funciona

## 🔧 Script de Teste

Execute para descobrir o IP atual:

```bash
npm run get-ip
```

## 💡 Recomendação

**Melhor solução**: Use um servidor com IP fixo (Hostinger) para o backend, especialmente se você precisa de whitelist de IP.

**Alternativa**: Solicite à PlayFiver um range de IPs do Vercel ou uma forma de autenticação que não dependa de IP.

