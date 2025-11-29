# 🔑 Configurar Credenciais Arkama

## ✅ Sistema Implementado

O sistema de gerenciamento de credenciais Arkama foi implementado no painel admin!

## 📋 Como Configurar

### Opção 1: Via Painel Admin (Recomendado)

1. Acesse o painel admin: `https://betgeniusbr.com/admin`
2. Vá em **"Chaves Arkama"** ou **"Arkama Keys"**
3. Preencha os campos:
   - **Token da API:** Seu token da Arkama
   - **Ambiente:** Sandbox (testes) ou Production (produção)
   - **URL Base:** (opcional, será definida automaticamente baseado no ambiente)
4. Clique em **"Salvar"**

### Opção 2: Via API

#### Buscar Credenciais

```bash
GET /api/admin/arkama-keys
```

#### Salvar Credenciais

```bash
POST /api/admin/arkama-keys
Content-Type: application/json

{
  "arkama_api_token": "seu_token_aqui",
  "arkama_environment": "sandbox", // ou "production" ou "beta"
  "arkama_base_url": "https://sandbox.arkama.com.br/api/v1" // opcional
}
```

## 🔧 Obter Token da Arkama

1. Acesse o painel da Arkama
2. Vá em **"API"** no menu
3. Copie seu **API Token**
4. Cole no painel admin

## 🌐 Ambientes Disponíveis

### Sandbox (Testes)
- **URL Base:** `https://sandbox.arkama.com.br/api/v1`
- **Uso:** Para testar integração sem cobranças reais

### Production (Produção)
- **URL Base:** `https://app.arkama.com.br/api/v1`
- **Uso:** Para pagamentos reais

### Beta
- **URL Base:** `https://beta.arkama.com.br/api/v1`
- **Uso:** Para testar novas funcionalidades

## 📊 Como Funciona

1. **Credenciais são salvas no banco:**
   - Tabela: `settings`
   - Chaves: `arkama_api_token`, `arkama_base_url`, `arkama_environment`

2. **Serviço busca credenciais dinamicamente:**
   - O serviço `arkama.js` busca as credenciais do banco
   - Se não encontrar, usa variáveis de ambiente como fallback

3. **Prioridade:**
   - 1º: Credenciais do banco (via admin)
   - 2º: Variáveis de ambiente (Coolify)

## ⚙️ Variáveis de Ambiente (Fallback)

Se não configurar via admin, o sistema usa variáveis de ambiente:

```env
ARKAMA_API_TOKEN=seu_token
ARKAMA_BASE_URL=https://sandbox.arkama.com.br/api/v1
```

## 🧪 Testar Credenciais

Após salvar, você pode testar:

1. **Criar um depósito de teste:**
   ```bash
   POST /api/payments/deposit
   {
     "amount": 10.00
   }
   ```

2. **Verificar logs:**
   - Procure por: `[Arkama] Criando compra`
   - Se houver erro de autenticação, o token está incorreto

## ✅ Checklist

- [ ] Token da Arkama obtido
- [ ] Credenciais salvas no painel admin
- [ ] Ambiente selecionado (Sandbox para testes)
- [ ] Testado criar depósito
- [ ] Verificado logs (sem erros de autenticação)

## 🆘 Problemas Comuns

### Erro: "Invalid token"

**Solução:**
- Verifique se o token está correto
- Verifique se copiou o token completo (sem espaços)
- Verifique se o token está ativo no painel da Arkama

### Erro: "Unauthorized"

**Solução:**
- Verifique se o token tem permissões de API
- Verifique se está usando o ambiente correto (sandbox vs production)

### Credenciais não estão sendo usadas

**Solução:**
- Verifique se salvou no painel admin
- Verifique se o serviço está buscando do banco
- Verifique os logs para ver qual fonte está sendo usada


