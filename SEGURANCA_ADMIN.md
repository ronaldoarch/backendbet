# 🔒 Segurança do Painel Admin

## ⚠️ IMPORTANTE: Proteção Implementada

As rotas de admin agora estão **PROTEGIDAS**. Apenas usuários com `is_admin = 1` na tabela `users` podem acessar.

## Como Funciona

### Backend
- **Middleware `requireAdmin`**: Verifica se o usuário está autenticado E tem `is_admin = 1`
- **Todas as rotas `/api/admin/*`** estão protegidas
- Se um usuário não admin tentar acessar, receberá erro 403 (Forbidden)

### Frontend
- **Componente `ProtectedAdminRoute`**: Redireciona para `/admin/login` se não autenticado
- Verifica autenticação via `adminStore`

## Configuração Inicial

### 1. Adicionar Campo `is_admin` na Tabela

Execute o script para adicionar o campo (se não existir):

```bash
npm run add-is-admin-field
```

Ou diretamente:

```bash
node src/database/add_is_admin_field.js
```

### 2. Tornar um Usuário Admin

Execute no banco de dados:

```sql
UPDATE users SET is_admin = 1 WHERE email = 'seu-email@exemplo.com';
```

Ou via SQL direto no Coolify/phpMyAdmin:

```sql
-- Verificar se o campo existe
SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = DATABASE() 
AND TABLE_NAME = 'users' 
AND COLUMN_NAME = 'is_admin';

-- Se não existir, adicionar:
ALTER TABLE users 
ADD COLUMN is_admin TINYINT(1) DEFAULT 0 NOT NULL COMMENT '1=admin, 0=usuário normal'
AFTER banned;

-- Tornar um usuário admin
UPDATE users SET is_admin = 1 WHERE email = 'admin@exemplo.com';
```

### 3. Verificar Admins Existentes

```sql
SELECT id, name, email, is_admin FROM users WHERE is_admin = 1;
```

## Teste de Segurança

### Teste 1: Acesso sem Token
```bash
curl http://localhost:3001/api/admin/games
# Deve retornar: 401 Unauthorized
```

### Teste 2: Acesso com Token de Usuário Normal
```bash
# Obter token de um usuário normal (is_admin = 0)
TOKEN="seu-token-aqui"
curl -H "Authorization: Bearer $TOKEN" http://localhost:3001/api/admin/games
# Deve retornar: 403 Forbidden - "Acesso negado. Apenas administradores podem acessar esta área."
```

### Teste 3: Acesso com Token de Admin
```bash
# Obter token de um usuário admin (is_admin = 1)
TOKEN="token-do-admin"
curl -H "Authorization: Bearer $TOKEN" http://localhost:3001/api/admin/games
# Deve retornar: 200 OK com lista de jogos
```

## Rotas Protegidas

Todas as rotas abaixo estão protegidas:

- `GET /api/admin/games` - Listar jogos
- `POST /api/admin/games` - Criar jogo
- `PUT /api/admin/games/:id` - Atualizar jogo
- `DELETE /api/admin/games/:id` - Deletar jogo
- `GET /api/admin/playfiver-keys` - Ver chaves PlayFiver
- `POST /api/admin/playfiver-keys` - Salvar chaves PlayFiver
- `GET /api/admin/arkama-keys` - Ver chaves Arkama
- `POST /api/admin/arkama-keys` - Salvar chaves Arkama
- `GET /api/admin/cartwavehub-keys` - Ver chaves Cartwavehub
- `POST /api/admin/cartwavehub-keys` - Salvar chaves Cartwavehub
- `GET /api/admin/providers` - Listar provedores
- `POST /api/admin/providers` - Criar provedor
- `PUT /api/admin/providers/:id` - Atualizar provedor
- `DELETE /api/admin/providers/:id` - Deletar provedor
- `GET /api/admin/banners` - Listar banners
- `POST /api/admin/banners` - Criar banner
- `PUT /api/admin/banners/:id` - Atualizar banner
- `DELETE /api/admin/banners/:id` - Deletar banner
- `GET /api/admin/stories` - Listar stories
- `POST /api/admin/stories` - Criar story
- `PUT /api/admin/stories/:id` - Atualizar story
- `DELETE /api/admin/stories/:id` - Deletar story

## Logs de Segurança

O middleware registra tentativas de acesso não autorizado:

```
[AdminAuth] Tentativa de acesso não autorizado: User ID 123 (usuario@exemplo.com)
```

## Próximos Passos (Opcional)

1. **Adicionar logs de auditoria**: Registrar todas as ações de admin
2. **2FA para admin**: Implementar autenticação de dois fatores
3. **Rate limiting**: Limitar tentativas de acesso
4. **IP whitelist**: Permitir apenas IPs específicos para admin

## Troubleshooting

### Erro: "Campo is_admin não existe"
Execute: `npm run add-is-admin-field`

### Erro: "Acesso negado" mesmo sendo admin
Verifique se `is_admin = 1` no banco:
```sql
SELECT id, email, is_admin FROM users WHERE email = 'seu-email@exemplo.com';
```

### Erro: "Token inválido"
- Verifique se o token está sendo enviado no header `Authorization: Bearer <token>`
- Verifique se o token não expirou
- Faça login novamente

