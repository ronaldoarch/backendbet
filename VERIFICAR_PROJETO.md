# 🔍 Verificar Projeto Supabase

## Checklist

### 1. Projeto Ativo?

No painel do Supabase:
- **Settings** → **General**
- Verifique se o projeto está **ativo** (não pausado)
- Se estiver pausado, clique em **"Resume project"**

### 2. Connection String

Procure pela connection string em:
- **Settings** → **Database** → Procure por "Connection string" ou "Connection URI"
- Ou em **Settings** → **API** → Pode ter uma seção de Database

A connection string deve aparecer como:
```
postgresql://postgres:[PASSWORD]@[HOST]:[PORT]/postgres
```

### 3. Habilitar Conexões Externas

No Supabase, pode haver uma opção para habilitar conexões externas:
- **Settings** → **Database**
- Procure por "Allow external connections" ou "Public access"
- Ou "Network access" / "IP whitelist"

### 4. Testar com psql (se tiver instalado)

Se você tiver `psql` instalado, pode testar:

```bash
psql "postgresql://postgres:uvmBBiChFtyYWctO@slrkerlrcvntxynfjbyh.supabase.co:5432/postgres?sslmode=require"
```

Se funcionar com `psql`, o problema pode ser na configuração do Node.js.

## Se Nada Funcionar

Podemos:
1. **Manter MySQL na Hostinger** e usar Vercel apenas para o backend
2. **Usar API REST do Supabase** (requer adaptar o código)
3. **Usar outro serviço de banco** (PlanetScale, Railway, etc.)

Qual opção você prefere?

