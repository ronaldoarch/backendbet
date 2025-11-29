# 🚀 Como Executar SQL no Railway - Guia Rápido

## ✅ Opção Mais Fácil: Via Script Node.js

1. **Configure o `.env` com as credenciais do Railway:**
```bash
DB_HOST=nozomi.proxy.rlwy.net
DB_PORT=40823
DB_USER=root
DB_PASSWORD=XNtNSnKSwGddVKdrHMcUrGhMUgrvKXSj
DB_NAME=railway
DB_SSL=false
```

2. **Execute o script:**
```bash
cd backend-api
npm run add-callback-url
```

Pronto! ✅ A coluna será adicionada automaticamente.

---

## 📋 Opção 2: Via Railway Dashboard (Interface Web)

### Passo a Passo:

1. **Acesse:** https://railway.app/dashboard
2. **Faça login** na sua conta
3. **Clique no projeto** que contém o banco MySQL
4. **Clique no serviço MySQL** (geralmente aparece como "MySQL" ou o nome do banco)
5. **Procure por uma das abas:**
   - **"Query"** ← Mais comum
   - **"Data"**
   - **"SQL"**
   - **"Database"**
6. **Cole este SQL:**
```sql
ALTER TABLE games_keys ADD COLUMN IF NOT EXISTS callback_url VARCHAR(500) NULL;
```
7. **Clique em "Run" ou "Execute"**

---

## 🔍 Como Encontrar a Aba Query no Railway

Se não encontrar a aba "Query", tente:

1. **No menu lateral esquerdo:**
   - Procure por "Database"
   - Ou "MySQL"
   - Ou "Data"

2. **No topo da página:**
   - Abas: "Overview", "Settings", "Query", "Logs"
   - Clique em "Query"

3. **Se não aparecer:**
   - Pode ser que seu plano não tenha acesso ao Query Editor
   - Use a **Opção 1 (Script Node.js)** que é mais confiável

---

## 📸 Onde Fica no Railway?

```
Railway Dashboard
  └── Seu Projeto
      └── MySQL Service
          └── [Aba "Query"] ← Aqui!
              └── Área de texto para SQL
                  └── Botão "Run"
```

---

## ✅ Recomendação Final

**Use o script Node.js** (`npm run add-callback-url`) - É mais rápido e confiável!

