# 🚀 Comando para Executar no Terminal do Coolify

## 📋 Opção 1: Usando MySQL Client (se disponível)

Cole este comando completo no terminal do Coolify:

```bash
HOST="${DB_HOST:-${MYSQL_HOST}}" && \
PORT="${DB_PORT:-${MYSQL_PORT:-3306}}" && \
USER="${DB_USER:-${MYSQL_USER}}" && \
PASSWORD="${DB_PASSWORD:-${MYSQL_PASSWORD}}" && \
DATABASE="${DB_NAME:-${MYSQL_DATABASE}}" && \
mysql -h "$HOST" -P "$PORT" -u "$USER" -p"$PASSWORD" "$DATABASE" <<'EOF'
INSERT INTO app_settings (setting_key, setting_value, created_at, updated_at) 
VALUES ('cartwave_client_id', 'SEU_CLIENT_ID_AQUI', NOW(), NOW())
ON DUPLICATE KEY UPDATE setting_value = 'SEU_CLIENT_ID_AQUI', updated_at = NOW();

INSERT INTO app_settings (setting_key, setting_value, created_at, updated_at) 
VALUES ('cartwave_client_secret', 'SEU_CLIENT_SECRET_AQUI', NOW(), NOW())
ON DUPLICATE KEY UPDATE setting_value = 'SEU_CLIENT_SECRET_AQUI', updated_at = NOW();

INSERT INTO app_settings (setting_key, setting_value, created_at, updated_at) 
VALUES ('cartwave_base_url', 'https://api.cartwave.com.br', NOW(), NOW())
ON DUPLICATE KEY UPDATE setting_value = 'https://api.cartwave.com.br', updated_at = NOW();
EOF
```

**⚠️ IMPORTANTE:** Substitua `SEU_CLIENT_ID_AQUI` e `SEU_CLIENT_SECRET_AQUI` pelos valores reais antes de executar!

---

## 📋 Opção 2: Usando Node.js (Recomendado - sempre disponível)

Cole este comando no terminal do Coolify:

```bash
node -e "
const mysql = require('mysql2/promise');
(async () => {
  try {
    const conn = await mysql.createConnection({
      host: process.env.DB_HOST || process.env.MYSQL_HOST,
      port: process.env.DB_PORT || process.env.MYSQL_PORT || 3306,
      user: process.env.DB_USER || process.env.MYSQL_USER,
      password: process.env.DB_PASSWORD || process.env.MYSQL_PASSWORD,
      database: process.env.DB_NAME || process.env.MYSQL_DATABASE
    });
    
    console.log('✅ Conectado ao banco!');
    
    // IMPORTANTE: Substitua os valores abaixo pelos seus dados reais!
    await conn.query(\`
      INSERT INTO app_settings (setting_key, setting_value, created_at, updated_at) 
      VALUES ('cartwave_client_id', 'SEU_CLIENT_ID_AQUI', NOW(), NOW())
      ON DUPLICATE KEY UPDATE setting_value = 'SEU_CLIENT_ID_AQUI', updated_at = NOW();
    \`);
    
    await conn.query(\`
      INSERT INTO app_settings (setting_key, setting_value, created_at, updated_at) 
      VALUES ('cartwave_client_secret', 'SEU_CLIENT_SECRET_AQUI', NOW(), NOW())
      ON DUPLICATE KEY UPDATE setting_value = 'SEU_CLIENT_SECRET_AQUI', updated_at = NOW();
    \`);
    
    await conn.query(\`
      INSERT INTO app_settings (setting_key, setting_value, created_at, updated_at) 
      VALUES ('cartwave_base_url', 'https://api.cartwave.com.br', NOW(), NOW())
      ON DUPLICATE KEY UPDATE setting_value = 'https://api.cartwave.com.br', updated_at = NOW();
    \`);
    
    console.log('✅ Configuração aplicada com sucesso!');
    
    // Verificar
    const [rows] = await conn.query(\`
      SELECT 
        setting_key,
        CASE 
          WHEN setting_key LIKE '%secret%' OR setting_key LIKE '%_secret' THEN 
            CONCAT(LEFT(setting_value, 4), '...', RIGHT(setting_value, 4))
          ELSE 
            setting_value 
        END as setting_value_masked,
        updated_at
      FROM app_settings
      WHERE setting_key LIKE 'cartwave%'
      ORDER BY setting_key
    \`);
    
    console.log('\\n📊 Configuração atual:');
    console.table(rows);
    
    await conn.end();
  } catch (error) {
    console.error('❌ Erro:', error.message);
    process.exit(1);
  }
})();
"
```

**⚠️ IMPORTANTE:** Substitua `SEU_CLIENT_ID_AQUI` e `SEU_CLIENT_SECRET_AQUI` pelos valores reais antes de executar!

---

## 📋 Opção 3: Comando Simplificado (Editar valores depois)

1. **Cole este comando primeiro (sem editar):**

```bash
cd /app && node -e "
const mysql = require('mysql2/promise');
(async () => {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || process.env.MYSQL_HOST,
    port: process.env.DB_PORT || process.env.MYSQL_PORT || 3306,
    user: process.env.DB_USER || process.env.MYSQL_USER,
    password: process.env.DB_PASSWORD || process.env.MYSQL_PASSWORD,
    database: process.env.DB_NAME || process.env.MYSQL_DATABASE
  });
  
  const queries = [
    \"INSERT INTO app_settings (setting_key, setting_value, created_at, updated_at) VALUES ('cartwave_client_id', 'SEU_CLIENT_ID', NOW(), NOW()) ON DUPLICATE KEY UPDATE setting_value = 'SEU_CLIENT_ID', updated_at = NOW()\",
    \"INSERT INTO app_settings (setting_key, setting_value, created_at, updated_at) VALUES ('cartwave_client_secret', 'SEU_CLIENT_SECRET', NOW(), NOW()) ON DUPLICATE KEY UPDATE setting_value = 'SEU_CLIENT_SECRET', updated_at = NOW()\",
    \"INSERT INTO app_settings (setting_key, setting_value, created_at, updated_at) VALUES ('cartwave_base_url', 'https://api.cartwave.com.br', NOW(), NOW()) ON DUPLICATE KEY UPDATE setting_value = 'https://api.cartwave.com.br', updated_at = NOW()\"
  ];
  
  for (const query of queries) {
    await conn.query(query);
  }
  
  const [rows] = await conn.query(\"SELECT setting_key, LEFT(setting_value, 20) as value_preview, updated_at FROM app_settings WHERE setting_key LIKE 'cartwave%' ORDER BY setting_key\");
  console.table(rows);
  await conn.end();
  console.log('✅ Configurado!');
})();
"
```

2. **Depois edite os valores diretamente no banco:**

```bash
cd /app && node -e "
const mysql = require('mysql2/promise');
(async () => {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });
  
  // Edite os valores aqui:
  await conn.query(\"UPDATE app_settings SET setting_value = 'SEU_CLIENT_ID_REAL' WHERE setting_key = 'cartwave_client_id'\");
  await conn.query(\"UPDATE app_settings SET setting_value = 'SEU_CLIENT_SECRET_REAL' WHERE setting_key = 'cartwave_client_secret'\");
  
  console.log('✅ Valores atualizados!');
  await conn.end();
})();
"
```

---

## ✅ Verificar Configuração

Para verificar se foi configurado corretamente:

```bash
cd /app && node -e "
const mysql = require('mysql2/promise');
(async () => {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });
  
  const [rows] = await conn.query(\`
    SELECT 
      setting_key,
      CASE 
        WHEN setting_key LIKE '%secret%' THEN 
          CONCAT(LEFT(setting_value, 4), '...', RIGHT(setting_value, 4))
        ELSE 
          setting_value 
      END as value_masked,
      updated_at
    FROM app_settings
    WHERE setting_key LIKE 'cartwave%'
    ORDER BY setting_key
  \`);
  
  console.table(rows);
  await conn.end();
})();
"
```

---

## 🎯 Recomendação

**Use a Opção 2 (Node.js)** - é mais confiável e sempre funciona no Coolify!

---

**Status:** ✅ Pronto para copiar e colar no terminal do Coolify



