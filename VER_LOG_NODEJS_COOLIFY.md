# Como Ver Logs da Aplicação Node.js no Coolify

## Método 1: Usar a Aba "Terminal"

1. No Coolify, vá na aba **"Terminal"**
2. Execute o comando para ver os logs em tempo real:
   ```bash
   tail -f /proc/1/fd/1
   ```
   Ou:
   ```bash
   pm2 logs
   ```
   Ou se estiver usando npm start:
   ```bash
   npm run start 2>&1 | tee -a /tmp/app.log
   tail -f /tmp/app.log
   ```

## Método 2: Filtrar Logs por Palavra-chave

Na aba "Logs", use o campo de busca/filtro para procurar por:
- `[Arkama]`
- `[PaymentController]`
- `Erro`
- `Error`
- `422`
- `500`

## Método 3: Verificar Logs do Container

1. Vá na aba **"Terminal"**
2. Execute:
   ```bash
   # Ver processos Node.js rodando
   ps aux | grep node
   
   # Ver últimas linhas do stdout/stderr
   tail -100 /proc/1/fd/1
   tail -100 /proc/1/fd/2
   ```

## Método 4: Verificar se a Aplicação Está Rodando

No Terminal do Coolify, execute:
```bash
# Verificar se Node.js está rodando
ps aux | grep node

# Verificar porta 3001
netstat -tulpn | grep 3001
# ou
ss -tulpn | grep 3001

# Testar endpoint
curl http://localhost:3001/api/health
```

## O que Procurar nos Logs

Quando você tentar fazer um depósito, procure por estas mensagens:

1. `[PaymentController] Criando depósito:` - Início do processo
2. `[Arkama] Enviando requisição:` - Dados enviados para Arkama
3. `[Arkama] Erro ao criar compra:` - Erro da API Arkama
4. `[PaymentController] Erro na Arkama:` - Erro processado

Os logs devem mostrar:
- A requisição completa enviada para a Arkama
- A resposta de erro da Arkama (com os campos faltantes)
- O stack trace do erro

## Se Não Ver Logs da Aplicação

1. Verifique se o deploy foi concluído com sucesso
2. Verifique se a aplicação está rodando (status "Running")
3. Tente fazer um "Redeploy" no Coolify
4. Verifique as variáveis de ambiente no Coolify

