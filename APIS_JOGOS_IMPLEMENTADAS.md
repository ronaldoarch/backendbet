# 🎮 APIs de Jogos Implementadas

## ✅ Status das Integrações

### 1. PlayFiver ✅ (Já existia)
- **Status**: ✅ Implementado e funcional
- **Documentação**: https://api.playfivers.com/docs/api
- **Endpoints**: 
  - Lançamento de jogos
  - Listagem de jogos
  - Webhooks

### 2. iGameWin ✅ (RECÉM IMPLEMENTADO)
- **Status**: ✅ Implementado conforme documentação
- **Documentação**: https://igamewin.com/docs
- **Endpoints**: Todos implementados

---

## 📋 Funcionalidades Implementadas

### iGameWin - Funcionalidades Completas

#### ✅ Gerenciamento de Usuários
- `createUser(username, isDemo)` - Criar usuário
- `createUser(username, true)` - Criar usuário demo

#### ✅ Transações
- `deposit(username, amount)` - Depositar saldo (em centavos)
- `withdraw(username, amount)` - Sacar saldo (em centavos)
- `getBalance(username)` - Obter saldo do usuário

#### ✅ Jogos
- `launchGame(username, provider, gameCode, lang)` - Lançar jogo específico
- `launchGame(username, provider, null, lang)` - Lançar lobby (sem gameCode)
- `getProviderList()` - Listar provedores disponíveis
- `getGameList(provider)` - Listar jogos de um provedor

#### ✅ Autenticação
- Busca credenciais do banco de dados
- Validação de credenciais antes de cada requisição
- Tratamento de erros completo

---

## 📁 Arquivos Criados/Modificados

### Novos Arquivos (iGameWin)
1. **`src/services/igamewin.js`** ✅
   - Serviço completo de integração
   - Todos os métodos da API implementados
   - Tratamento de erros
   - Conversão automática de valores (centavos ↔ reais)

2. **`src/controllers/igamewinKeysController.js`** ✅
   - GET `/api/admin/igamewin-keys` - Buscar credenciais
   - PUT `/api/admin/igamewin-keys` - Atualizar credenciais
   - GET `/api/admin/igamewin-keys/info` - Informações (sem token)

3. **`src/database/add_igamewin_columns.js`** ✅
   - Script para adicionar colunas no banco
   - Verificação de colunas existentes

4. **`src/database/add_igamewin_columns.sql`** ✅
   - SQL para migração manual

5. **`IGAMEWIN_INTEGRATION.md`** ✅
   - Documentação completa da integração

6. **`EXECUTAR_MIGRACAO_IGAMEWIN.md`** ✅
   - Guia de migração

7. **`migracao_igamewin.sql`** ✅
   - Script SQL pronto para executar

### Arquivos Modificados
1. **`src/routes/adminRoutes.js`** ✅
   - Rotas do iGameWin adicionadas

2. **`src/controllers/gameController.js`** ✅
   - Detecção automática de provedor (iGameWin vs PlayFiver)
   - Lançamento automático usando serviço correto
   - Tratamento de erros específico por provedor

---

## 🔧 Como Funciona

### Detecção Automática de Provedor

O sistema detecta automaticamente qual API usar baseado em:

1. **Provider Code**: Se `provider_code === 'IGAMEWIN'`
2. **Distribution**: Se `distribution` contém `'igamewin'`

```javascript
// Exemplo de detecção no gameController.js
const providerCode = (game.provider_code || '').toUpperCase()
const distribution = (game.distribution || '').toLowerCase()
const isIgamewin = providerCode === 'IGAMEWIN' || 
                   distribution === 'igamewin' || 
                   distribution.includes('igamewin')
```

### Fluxo de Lançamento

```
POST /api/games/:id/launch
  ↓
Verifica provider_code/distribution
  ↓
Se iGameWin:
  → Busca credenciais iGameWin
  → Chama igamewinLaunch()
  → Retorna launch_url
  ↓
Se PlayFiver (padrão):
  → Busca credenciais PlayFiver
  → Chama playFiverLaunch()
  → Retorna launch_url
```

---

## 🚀 Endpoints Disponíveis

### Administrativos (Requerem autenticação admin)

#### iGameWin
- `GET /api/admin/igamewin-keys` - Buscar credenciais
- `PUT /api/admin/igamewin-keys` - Atualizar credenciais
- `POST /api/admin/igamewin-keys` - Atualizar credenciais (alternativo)
- `GET /api/admin/igamewin-keys/info` - Informações (sem token)

#### PlayFiver
- `GET /api/admin/playfiver-keys` - Buscar credenciais
- `PUT /api/admin/playfiver-keys` - Atualizar credenciais
- `GET /api/admin/playfiver-keys/info` - Informações

### Públicos

- `POST /api/games/:id/launch` - Lançar jogo (detecta automaticamente o provedor)
- `GET /api/games` - Listar jogos
- `GET /api/games/:id` - Detalhes do jogo

---

## 📊 Banco de Dados

### Tabela `games_keys`

Colunas necessárias para iGameWin:
```sql
igamewin_agent_code VARCHAR(255) NULL
igamewin_agent_token VARCHAR(255) NULL
```

**Migração pendente**: Execute `migracao_igamewin.sql` ou o script Node.js

---

## ⚙️ Configuração

### 1. Executar Migração
```sql
ALTER TABLE games_keys
ADD COLUMN igamewin_agent_code VARCHAR(255) NULL,
ADD COLUMN igamewin_agent_token VARCHAR(255) NULL;
```

### 2. Configurar Credenciais
```bash
PUT /api/admin/igamewin-keys
{
  "igamewin_agent_code": "SEU_AGENT_CODE",
  "igamewin_agent_token": "SEU_AGENT_TOKEN"
}
```

### 3. Configurar Provedores
Criar/atualizar provedores com:
- `code = 'IGAMEWIN'` OU
- `distribution = 'igamewin'`

---

## ✅ Checklist de Implementação

- [x] Serviço de integração (`src/services/igamewin.js`)
- [x] Controller de chaves (`src/controllers/igamewinKeysController.js`)
- [x] Rotas administrativas (`src/routes/adminRoutes.js`)
- [x] Integração no gameController (`src/controllers/gameController.js`)
- [x] Script de migração (`src/database/add_igamewin_columns.js`)
- [x] SQL de migração (`migracao_igamewin.sql`)
- [x] Documentação (`IGAMEWIN_INTEGRATION.md`)
- [ ] **Migração executada no banco** ⚠️
- [ ] **Credenciais configuradas** ⚠️
- [ ] **Provedores configurados** ⚠️
- [ ] **Testes realizados** ⚠️

---

## 🧪 Como Testar

### 1. Testar Credenciais
```bash
GET /api/admin/igamewin-keys
```

### 2. Testar Lançamento
```bash
POST /api/games/:id/launch
Authorization: Bearer <token>
```

O sistema detectará automaticamente se é iGameWin ou PlayFiver.

### 3. Verificar Logs
Os logs mostrarão qual provedor está sendo usado:
```
[GameController] Usando iGameWin: true/false
```

---

## 📝 Notas Importantes

1. **Valores em Centavos**: A API do iGameWin trabalha com centavos. O serviço faz conversão automática.

2. **Criação Automática**: O sistema cria usuários automaticamente quando necessário.

3. **Lobby vs Jogo**: 
   - Para jogos específicos: forneça `gameCode`
   - Para lobby (ex: Evolution): não forneça `gameCode` (ou passe `null`)

4. **Idioma**: O sistema usa `pt` (português) por padrão.

---

## 🔗 Referências

- [Documentação Oficial iGameWin](https://igamewin.com/docs)
- [Documentação PlayFiver](https://api.playfivers.com/docs/api)

---

**Status**: ✅ **IMPLEMENTADO E PRONTO PARA USO**

**Pendências**: 
- ⚠️ Executar migração do banco de dados
- ⚠️ Configurar credenciais via API admin
- ⚠️ Configurar provedores no banco

