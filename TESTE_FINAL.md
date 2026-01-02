# ✅ Teste Final - Verificar se Tudo Está Funcionando

## 🎉 Status Atual

- ✅ Backend deployado no Coolify
- ✅ IP da VPS adicionado à whitelist da PlayFiver
- ✅ Frontend buildado com nova URL da API
- ✅ Subdomínio temporário: `https://qoo8wgogo4ow4gsg0k0wk4g4.agenciamidas.com`

## 🧪 Checklist de Testes

### 1. Testar Backend (API)

#### Health Check
```bash
curl https://qoo8wgogo4ow4gsg0k0wk4g4.agenciamidas.com/api/health
```

**Resposta esperada:**
```json
{
  "status": "ok",
  "timestamp": "..."
}
```

#### Testar Banners
```bash
curl https://qoo8wgogo4ow4gsg0k0wk4g4.agenciamidas.com/api/banners
```

#### Testar Jogos
```bash
curl https://qoo8wgogo4ow4gsg0k0wk4g4.agenciamidas.com/api/casinos/games?page=1&per_page=12
```

#### Testar Categorias
```bash
curl https://qoo8wgogo4ow4gsg0k0wk4g4.agenciamidas.com/api/categories
```

### 2. Testar Lançamento de Jogo

#### Via Script Local (Recomendado)

```bash
cd backend-api
npm run test-game-launch 37
```

**Resposta esperada:**
- ✅ Status: 200
- ✅ Mensagem: SUCCESS
- ✅ Launch URL presente

#### Via Navegador

1. Acesse o frontend
2. Faça login
3. Tente abrir um jogo
4. Verifique se o jogo carrega corretamente

### 3. Verificar Logs do Coolify

No painel do Coolify:
1. Vá em **"Logs"**
2. Procure por:
   - ✅ `🚀 Servidor rodando na porta 3001`
   - ✅ Sem erros de conexão com banco
   - ✅ Sem erros de "IP Não permitido"

### 4. Verificar Frontend

1. Acesse o frontend no navegador
2. Abra o console (F12)
3. Verifique se as requisições estão indo para:
   - `https://qoo8wgogo4ow4gsg0k0wk4g4.agenciamidas.com/api/...`
4. Verifique se não há erros de CORS

## 🐛 Problemas Comuns

### Erro: "IP Não permitido"

**Solução:**
- Verifique se o IP correto foi adicionado à whitelist
- O IP deve ser o da VPS, não o da sua máquina local
- Aguarde alguns minutos após adicionar (pode levar tempo para propagar)

### Erro: "Erro ao conectar com o provedor de jogos"

**Solução:**
1. Verifique os logs do Coolify
2. Verifique se as credenciais PlayFiver estão corretas no Coolify (variáveis de ambiente)
3. Teste com `npm run test-game-launch 37` localmente

### Erro: CORS

**Solução:**
1. No Coolify, verifique a variável `CORS_ORIGIN`
2. Deve incluir o domínio do frontend:
   ```
   CORS_ORIGIN=https://betgeniusbr.com,http://betgeniusbr.com
   ```
3. Reinicie a aplicação no Coolify

### Jogo não carrega

**Solução:**
1. Verifique se o usuário está logado
2. Verifique se o jogo existe e está ativo no banco
3. Verifique os logs do Coolify
4. Teste com `npm run test-game-launch` localmente

## 📋 Próximos Passos (Opcional)

### 1. Configurar DNS do `api.betgeniusbr.com`

Para produção, configure o DNS:
- **Registro A:** `api` → `IP_DA_VPS`
- Aguarde propagação (5-30 minutos)
- Atualize o frontend para usar `https://api.betgeniusbr.com/api`

### 2. Atualizar Frontend

Depois de configurar o DNS:
1. Atualize `.env.local`:
   ```env
   VITE_API_URL=https://api.betgeniusbr.com/api
   ```
2. Rebuild:
   ```bash
   npm run build
   ```
3. Faça upload do `dist` atualizado

### 3. Monitorar

- Verifique os logs do Coolify regularmente
- Monitore se o IP da VPS muda (geralmente não muda)
- Teste os jogos periodicamente

## ✅ Checklist Final

- [ ] Health check funcionando
- [ ] Banners carregando
- [ ] Jogos listando
- [ ] Categorias carregando
- [ ] Teste de lançamento de jogo funcionando (Status 200)
- [ ] Frontend se comunicando com backend
- [ ] Jogos abrindo no navegador
- [ ] Sem erros nos logs do Coolify
- [ ] IP adicionado à whitelist da PlayFiver

## 🎯 Se Tudo Estiver Funcionando

Parabéns! 🎉 Seu sistema está funcionando:

- ✅ Backend rodando no Coolify
- ✅ Banco de dados no Railway
- ✅ Frontend conectado ao backend
- ✅ PlayFiver configurado e funcionando
- ✅ Jogos podem ser abertos

## 🆘 Se Algo Não Estiver Funcionando

1. Verifique os logs do Coolify
2. Teste com `npm run test-game-launch` localmente
3. Verifique as variáveis de ambiente no Coolify
4. Verifique se o IP está correto na whitelist da PlayFiver
5. Compartilhe os erros específicos para ajudar a resolver


