# Como Criar a Tabela no Coolify

## Método 1: Via npm script (Mais Fácil)

No terminal do Coolify, execute:

```bash
npm run create-table
```

## Método 2: Executar o script diretamente

No terminal do Coolify, execute:

```bash
node create_table.js
```

## Método 3: Se não encontrar o arquivo, procure-o

```bash
# Ver onde você está
pwd

# Listar arquivos
ls -la

# Procurar o arquivo
find . -name "create_table.js" 2>/dev/null

# Quando encontrar, execute
node [caminho_completo]/create_table.js
```

## Método 4: Criar o arquivo manualmente no Coolify

Se nenhum método funcionar, crie o arquivo `create_table.js` na raiz do projeto no Coolify com o conteúdo do arquivo que acabei de criar.

## Verificar se funcionou

Após executar, você verá mensagens de sucesso no terminal. O script:
- ✅ Conecta ao banco de dados
- ✅ Verifica se a tabela existe
- ✅ Cria a tabela se não existir
- ✅ Mostra confirmação

## Se der erro de conexão

Verifique se as variáveis de ambiente estão configuradas no Coolify:
- `DB_HOST`
- `DB_PORT`
- `DB_USER`
- `DB_PASSWORD`
- `DB_NAME`
- `DB_SSL` (se necessário)

