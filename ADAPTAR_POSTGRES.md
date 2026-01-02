# 🔧 Adaptar Código para PostgreSQL

## Diferenças MySQL → PostgreSQL

### 1. Pool de Conexão

**MySQL (mysql2):**
```javascript
const [rows] = await pool.execute(query, params)
```

**PostgreSQL (pg):**
```javascript
const { rows } = await pool.query(query, params)
```

### 2. Placeholders

**MySQL:**
```sql
SELECT * FROM users WHERE email = ? AND status = ?
```

**PostgreSQL:**
```sql
SELECT * FROM users WHERE email = $1 AND status = $2
```

### 3. INSERT com RETURNING

**MySQL:**
```javascript
const [result] = await pool.execute('INSERT INTO ...')
const id = result.insertId
```

**PostgreSQL:**
```javascript
const { rows } = await pool.query('INSERT INTO ... RETURNING id')
const id = rows[0].id
```

### 4. UPDATE/DELETE

**MySQL:**
```javascript
const [result] = await pool.execute('UPDATE ...')
const affectedRows = result.affectedRows
```

**PostgreSQL:**
```javascript
const { rowCount } = await pool.query('UPDATE ...')
const affectedRows = rowCount
```

## Solução: Criar Wrapper

Vou criar um wrapper que mantém a mesma interface do mysql2, mas usa PostgreSQL internamente.

