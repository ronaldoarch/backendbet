# Integração iGameWin

Documentação da integração com a API de jogos do iGameWin conforme [documentação oficial](https://igamewin.com/docs).

## 📋 Pré-requisitos

1. Conta ativa no iGameWin
2. Credenciais de acesso (`agent_code` e `agent_token`)
3. Banco de dados configurado

## 🚀 Instalação

### 1. Executar Migração do Banco de Dados

Execute o script para adicionar as colunas necessárias:

```bash
node src/database/add_igamewin_columns.js
```

Ou execute o SQL manualmente:

```sql
ALTER TABLE games_keys
ADD COLUMN igamewin_agent_code VARCHAR(255) NULL,
ADD COLUMN igamewin_agent_token VARCHAR(255) NULL;
```

### 2. Configurar Credenciais

Configure as credenciais do iGameWin através da API administrativa:

**GET** `/api/admin/igamewin-keys` - Buscar credenciais
**PUT** `/api/admin/igamewin-keys` - Atualizar credenciais

Exemplo de requisição:

```json
{
  "igamewin_agent_code": "SEU_AGENT_CODE",
  "igamewin_agent_token": "SEU_AGENT_TOKEN"
}
```

## 📚 Funcionalidades Implementadas

### 1. Gerenciamento de Usuários

- ✅ Criar usuário (`createUser`)
- ✅ Criar usuário demo (`createUser` com `isDemo: true`)

### 2. Transações

- ✅ Depositar saldo (`deposit`)
- ✅ Sacar saldo (`withdraw`)
- ✅ Obter saldo (`getBalance`)

### 3. Jogos

- ✅ Lançar jogo específico (`launchGame`)
- ✅ Lançar lobby do provedor (`launchGame` sem `gameCode`)
- ✅ Listar provedores disponíveis (`getProviderList`)
- ✅ Listar jogos de um provedor (`getGameList`)

## 🎮 Como Usar

### Lançamento Automático de Jogos

O sistema detecta automaticamente se um jogo é do iGameWin baseado em:

1. **Provider Code**: Se o `provider_code` for `IGAMEWIN`
2. **Distribution**: Se o `distribution` contiver `igamewin`

Quando um jogo é identificado como iGameWin, o sistema:
- Busca as credenciais do iGameWin
- Cria o usuário automaticamente (se não existir)
- Lança o jogo usando a API do iGameWin
- Retorna a URL de lançamento

### Exemplo de Requisição

```bash
POST /api/games/:id/launch
Authorization: Bearer <token>
```

O sistema detectará automaticamente o provedor e usará o serviço apropriado.

## 🔧 Configuração de Provedores

Para que um jogo use o iGameWin, configure o provedor com:

- **Código**: `IGAMEWIN` (ou qualquer código que contenha "igamewin")
- **Distribution**: `igamewin` (ou qualquer valor que contenha "igamewin")

Exemplo:

```sql
INSERT INTO providers (name, code, distribution, status) 
VALUES ('iGameWin', 'IGAMEWIN', 'igamewin', 1);
```

## 📡 Endpoints da API

### Administrativos (Requerem autenticação de admin)

- `GET /api/admin/igamewin-keys` - Buscar credenciais
- `PUT /api/admin/igamewin-keys` - Atualizar credenciais
- `POST /api/admin/igamewin-keys` - Atualizar credenciais (alternativo)
- `GET /api/admin/igamewin-keys/info` - Buscar informações (sem token)

### Públicos

- `POST /api/games/:id/launch` - Lançar jogo (detecta automaticamente o provedor)

## 🔐 Segurança

- As credenciais são armazenadas de forma segura no banco de dados
- O `agent_token` nunca é exposto em respostas públicas
- Todas as requisições à API do iGameWin usam HTTPS
- Validação de credenciais antes de cada requisição

## 🐛 Tratamento de Erros

O sistema trata os seguintes erros:

- **Credenciais não configuradas**: Retorna erro 500 com mensagem clara
- **Timeout**: Retorna erro após 15 segundos
- **Erros da API**: Retorna mensagem de erro da API do iGameWin
- **Erros de conexão**: Retorna erro de conexão SSL/TLS

## 📝 Notas Importantes

1. **Valores em Centavos**: A API do iGameWin trabalha com valores em centavos. O serviço faz a conversão automaticamente.

2. **Criação Automática de Usuários**: O sistema cria usuários automaticamente quando necessário. Use o email do usuário como `username`.

3. **Lobby vs Jogo Específico**: 
   - Para jogos específicos, forneça o `gameCode`
   - Para lobby (ex: Evolution), não forneça `gameCode` (ou passe `null`)

4. **Idioma**: O sistema usa `pt` (português) por padrão. Pode ser alterado no código.

## 🔗 Referências

- [Documentação Oficial iGameWin](https://igamewin.com/docs)
- [SDK PHP iGameWin](https://github.com/igamewin/sdk-php) (referência para entender a API)

## ✅ Checklist de Implementação

- [x] Serviço de integração (`src/services/igamewin.js`)
- [x] Controller de chaves (`src/controllers/igamewinKeysController.js`)
- [x] Rotas administrativas (`src/routes/adminRoutes.js`)
- [x] Integração no gameController (`src/controllers/gameController.js`)
- [x] Script de migração (`src/database/add_igamewin_columns.js`)
- [x] Documentação

## 🚨 Troubleshooting

### Erro: "Credenciais iGameWin não configuradas"

**Solução**: Configure as credenciais através da API administrativa:
```bash
PUT /api/admin/igamewin-keys
```

### Erro: "Timeout ao lançar jogo"

**Solução**: Verifique a conexão com a API do iGameWin e as credenciais.

### Jogo não está usando iGameWin

**Solução**: Verifique se o `provider_code` ou `distribution` está configurado corretamente como `IGAMEWIN` ou contém `igamewin`.

