# 🚀 Executar Script via SSH

## Passo a Passo

### 1. Conectar via SSH

```bash
ssh -p 65002 u127271520@212.85.6.24
```

### 2. Navegar para o diretório do backend

```bash
cd ~/backend-api
```

### 3. Verificar se o Node.js está disponível

```bash
# Carregar NVM (se necessário)
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Verificar versão do Node.js
node --version
npm --version
```

### 4. Executar o script

```bash
npm run populate-providers-games
```

## ⚠️ Se o script não existir no servidor

Se você ainda não fez upload do código atualizado para o servidor, você tem duas opções:

### Opção A: Fazer upload do código atualizado

```bash
# No seu computador local
cd /Users/ronaldodiasdesousa/Desktop/teste05/backend-api
scp -P 65002 -r src/database/populate_providers_and_games.js u127271520@212.85.6.24:~/backend-api/src/database/
scp -P 65002 package.json u127271520@212.85.6.24:~/backend-api/
```

### Opção B: Executar diretamente no Railway (Recomendado)

Como o banco de dados está no Railway, é melhor executar o script localmente apontando para o Railway:

1. **No seu computador local**, edite o `.env` para apontar para o Railway:

```env
DB_HOST=nozomi.proxy.rlwy.net
DB_PORT=40823
DB_USER=root
DB_PASSWORD=XNtNSnKSwGddVKdrHMcUrGhMUgrvKXSj
DB_NAME=railway
DB_SSL=false
```

2. **Execute o script localmente**:

```bash
cd backend-api
npm run populate-providers-games
```

## ✅ Verificar se funcionou

Após executar o script, você verá uma saída como:

```
🚀 Iniciando população de provedores e jogos...

✅ Conexão com banco de dados estabelecida

📦 Adicionando provedores...
  ✅ Provedor "Evolution" adicionado (ID: 1)
  ...

📊 Resumo:
  ✅ Jogos adicionados: 35
  ⏭️  Jogos já existentes: 0

✨ População concluída com sucesso!
```

## 🔍 Verificar no Admin

1. Acesse: https://betgeniusbr.com/admin
2. Vá em "Provedores" - deve ver os 10 provedores
3. Vá em "Jogos" - deve ver os 35+ jogos

