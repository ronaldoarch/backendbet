# 🔍 Descobrir IP Real do Vercel

## ❌ Problema

O script `npm run get-ip` executa **localmente** na sua máquina, então retorna o IP da sua conexão de internet, **não o IP do Vercel**.

## ✅ Solução

Agora temos um endpoint no backend que retorna o IP real do Vercel!

## 📋 Como Usar

### Passo 1: Aguardar o Deploy

Aguarde alguns segundos para o Vercel fazer o deploy automático.

### Passo 2: Acessar o Endpoint

Abra no navegador ou use `curl`:

```bash
curl https://backendbet.vercel.app/api/get-ip
```

Ou acesse diretamente no navegador:
```
https://backendbet.vercel.app/api/get-ip
```

### Passo 3: Ver o IP

A resposta será algo como:

```json
{
  "publicIP": "45.184.217.146",
  "requestIP": "::ffff:45.184.217.146",
  "forwardedFor": "45.184.217.146",
  "realIP": null,
  "headers": {
    "x-forwarded-for": "45.184.217.146",
    "x-real-ip": null,
    "cf-connecting-ip": null,
    "x-vercel-forwarded-for": null
  },
  "message": "Use o publicIP para adicionar à whitelist da PlayFiver"
}
```

### Passo 4: Usar o IP

Use o campo `publicIP` para adicionar à whitelist da PlayFiver.

## ⚠️ Importante

- O IP do Vercel pode mudar a cada deploy
- Execute este endpoint **após cada deploy** para verificar se o IP mudou
- Se o IP mudar, adicione o novo IP à whitelist da PlayFiver

## 🔄 Verificar Após Deploy

Sempre que fizer um deploy, execute:

```bash
curl https://backendbet.vercel.app/api/get-ip | grep -o '"publicIP":"[^"]*"'
```

Ou acesse no navegador e copie o `publicIP`.

## 💡 Alternativa: Verificar nos Logs

Quando o backend faz uma requisição para a PlayFiver e recebe "IP Não permitido", os logs do Vercel podem mostrar qual IP está sendo usado.

Verifique os logs do Vercel quando tentar abrir um jogo e veja se há mensagens sobre IP.

