# Backend API REST - BetGenius

Backend API REST standalone para a plataforma de cassino online BetGenius.

## 🚀 Tecnologias

- **Node.js** + **Express**
- **MySQL** (banco de dados)
- **Redis** (cache - opcional)
- **JWT** (autenticação)
- **bcryptjs** (hash de senhas)

## 📋 Pré-requisitos

- Node.js 18+
- MySQL 8.0+
- Redis (opcional, mas recomendado)

## 🔧 Instalação

1. Instale as dependências:
```bash
npm install
```

2. Configure o arquivo `.env`:
```bash
cp .env.example .env
# Edite o .env com suas configurações
```

3. Crie o banco de dados:
```bash
mysql -u root -p
CREATE DATABASE betgenius;
```

4. Execute as migrations:
```bash
npm run migrate
```

## 🏃 Executar

### Desenvolvimento
```bash
npm run dev
```

### Produção
```bash
npm start
```

O servidor estará rodando em `http://localhost:3001`

## 📡 Endpoints da API

### Autenticação
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Registro
- `GET /api/auth/verify` - Verificar token
- `POST /api/auth/me` - Dados do usuário
- `POST /api/auth/logout` - Logout

### Jogos
- `GET /api/games/all` - Lista todos os provedores com jogos
- `GET /api/featured/games` - Jogos em destaque
- `GET /api/casinos/games` - Lista paginada de jogos (com filtros)
- `GET /api/games/single/:id` - Detalhes de um jogo e URL de lançamento
- `POST /api/games/favorite/:id` - Toggle favorito
- `POST /api/games/like/:id` - Toggle like
- `GET /api/source/games` - Lista todos os jogos ativos

### Categorias
- `GET /api/categories` - Lista todas as categorias

### Configurações
- `GET /api/settings/data` - Configurações gerais
- `GET /api/settings/banners` - Banners da homepage

### Carteira
- `GET /api/profile/wallet` - Saldo da carteira

### Webhook PlayFiver
- `POST /api/playfiver/webhook` - Webhook para transações

## 🔐 Autenticação

A maioria dos endpoints requer autenticação via JWT. Envie o token no header:

```
Authorization: Bearer {token}
```

## 🎮 Integração PlayFiver

Para que os jogos funcionem, é necessário configurar as credenciais PlayFiver no banco de dados:

```sql
INSERT INTO games_keys (playfiver_token, playfiver_secret, playfiver_code, created_at, updated_at)
VALUES ('seu_token', 'seu_secret', 'seu_code', NOW(), NOW());
```

## 📝 Estrutura do Banco de Dados

O banco de dados inclui as seguintes tabelas:
- `users` - Usuários
- `wallets` - Carteiras
- `games` - Jogos
- `providers` - Provedores de jogos
- `categories` - Categorias
- `category_games` - Relação jogos-categorias
- `game_favorites` - Favoritos
- `game_likes` - Likes
- `orders` - Transações
- `games_keys` - Chaves de API (PlayFiver)
- `settings` - Configurações
- `custom_layouts` - Customizações de layout
- `banners` - Banners

## 🧪 Testes

Para testar a API, você pode usar ferramentas como:
- Postman
- Insomnia
- curl
- Thunder Client (VS Code)

## 📦 Variáveis de Ambiente

Veja `.env.example` para todas as variáveis disponíveis.

## 🔒 Segurança

- Rate limiting implementado
- CORS configurado
- Helmet para headers de segurança
- Validação de entrada
- SQL injection prevenido (prepared statements)
- Senhas hasheadas com bcrypt

## 📚 Documentação

Para mais detalhes sobre os endpoints, consulte a especificação completa no prompt original.


