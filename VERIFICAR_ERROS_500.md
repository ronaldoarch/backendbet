# Verificar Erros 500 no Coolify

## Problema:
Dois endpoints estão retornando erro 500:
- `GET /api/settings/data`
- `POST /api/auth/login`

## Possíveis Causas:

### 1. Tabelas não existem no banco
- `settings`
- `custom_layouts`
- `users`

### 2. Problema de conexão com banco de dados
- Credenciais incorretas
- Host/porta incorretos
- Banco não acessível

### 3. Erros não tratados no código

## Solução:

### 1. Verificar logs do Coolify:

No terminal do Coolify, execute:

```bash
# Ver logs em tempo real
tail -f /proc/1/fd/1

# Ou verificar logs do PM2
pm2 logs

# Ou verificar processos Node.js
ps aux | grep node
```

### 2. Testar conexão com banco:

```bash
# Testar conexão MySQL
mysql -h localhost -u u127271520_boraganhar -p u127271520_boraganhar

# Ou testar via Node.js
node -e "
const mysql = require('mysql2/promise');
(async () => {
  try {
    const conn = await mysql.createConnection({
      host: 'localhost',
      user: 'u127271520_boraganhar',
      password: '2403Auror@',
      database: 'u127271520_boraganhar'
    });
    console.log('✅ Conexão OK');
    await conn.end();
  } catch (e) {
    console.error('❌ Erro:', e.message);
  }
})();
"
```

### 3. Verificar se as tabelas existem:

```bash
# Conectar ao MySQL e verificar tabelas
mysql -h localhost -u u127271520_boraganhar -p u127271520_boraganhar -e "SHOW TABLES;"

# Verificar estrutura da tabela settings
mysql -h localhost -u u127271520_boraganhar -p u127271520_boraganhar -e "DESCRIBE settings;"

# Verificar estrutura da tabela custom_layouts
mysql -h localhost -u u127271520_boraganhar -p u127271520_boraganhar -e "DESCRIBE custom_layouts;"
```

### 4. Verificar variáveis de ambiente:

```bash
# Verificar variáveis DB
env | grep -E "DB_|MYSQL"

# Verificar JWT_SECRET
echo $JWT_SECRET
```

### 5. Testar endpoints diretamente:

```bash
# Testar health check
curl http://localhost:3001/api/health

# Testar settings (deve retornar erro 500)
curl http://localhost:3001/api/settings/data

# Testar login (deve retornar erro 500)
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"teste@teste.com","password":"123456"}'
```

## Próximos Passos:

1. **Verificar logs** para ver o erro específico
2. **Verificar conexão com banco** de dados
3. **Verificar se as tabelas existem**
4. **Corrigir o problema** encontrado

