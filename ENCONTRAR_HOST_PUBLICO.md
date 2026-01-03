# 🔍 Como Encontrar Host Público do Railway

## O Problema

O `MYSQLHOST=mysql.railway.internal` é **interno** e só funciona dentro do Railway.

Para conectar do Vercel (externo), você precisa do **host público**.

## Como Encontrar

### Método 1: Aba "Connect" ou "Public Networking"

1. No Railway, clique no serviço **MySQL**
2. Procure por uma aba chamada:
   - **"Connect"**
   - **"Public Networking"**
   - **"External Connection"**
3. Procure por:
   - **"Public URL"**
   - **"External Host"**
   - **"Public Hostname"**
4. O host será algo como: `containers-us-west-xxx.railway.app`

### Método 2: Habilitar Public Networking

1. No MySQL, vá em **"Settings"**
2. Procure por **"Public Networking"**
3. Clique em **"Generate Public URL"** ou **"Enable Public Access"**
4. Copie o host público gerado

### Método 3: Verificar MYSQL_PUBLIC_URL

1. Na lista de variáveis, procure por `MYSQL_PUBLIC_URL`
2. Se existir, ela contém a connection string pública
3. Extraia o host dessa URL

### Método 4: Criar Serviço Node.js no Railway

Se não houver host público disponível:

1. No mesmo projeto Railway, clique em **"New"** → **"GitHub Repo"**
2. Conecte seu repositório `ronaldoarch/backendbet`
3. O Railway vai fazer deploy automaticamente
4. Configure as variáveis:
   - Use `mysql.railway.internal` como host (funciona dentro do Railway)
   - Use as mesmas credenciais que você já tem

## Variáveis para Vercel (se encontrar host público)

```env
DB_HOST=containers-us-west-xxx.railway.app
DB_PORT=3306
DB_USER=root
DB_PASSWORD=XNtNSnKSwGddVKdrHMcUrGhMUgrvKXSj
DB_NAME=railway
DB_SSL=false
```

## Variáveis para Railway (se deployar no Railway)

```env
DB_HOST=mysql.railway.internal
DB_PORT=3306
DB_USER=root
DB_PASSWORD=XNtNSnKSwGddVKdrHMcUrGhMUgrvKXSj
DB_NAME=railway
DB_SSL=false
```

## Recomendação

**Se não encontrar host público:** Deploy no Railway é mais simples e funciona perfeitamente!

Avise o que você encontrou!

