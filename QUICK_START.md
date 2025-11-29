# 🚀 Quick Start - Backend API

## Passo 1: Criar Banco de Dados

Execute no terminal MySQL:

```bash
mysql -u root -p
```

Depois execute:

```sql
CREATE DATABASE betgenius;
EXIT;
```

## Passo 2: Configurar .env

O arquivo `.env` já foi criado. Edite-o e configure sua senha do MySQL:

```bash
nano .env
# ou
code .env
```

Altere a linha:
```
DB_PASSWORD=
```

Para:
```
DB_PASSWORD=sua_senha_mysql
```

## Passo 3: Executar Migrations

```bash
npm run migrate
```

## Passo 4: Iniciar Servidor

```bash
npm run dev
```

O servidor estará rodando em: `http://localhost:3001`

---

## 🔧 Alternativa: Usar Script Automático

```bash
./setup.sh
```

O script irá:
1. Criar o arquivo .env (se não existir)
2. Pedir para você configurar a senha
3. Criar o banco de dados
4. Executar as migrations

---

## ✅ Verificar se está funcionando

```bash
curl http://localhost:3001/health
```

Deve retornar:
```json
{"status":"ok","timestamp":"..."}
```


