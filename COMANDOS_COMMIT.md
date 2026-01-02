# 📋 Comandos para Commit Manual

Como o git pode ter problemas, execute estes comandos **MANUALMENTE**:

---

## 🚀 Passo a Passo

### **1. Ir para o diretório do backend:**
```bash
cd backend-api
```

### **2. Adicionar arquivos NOVOS:**
```bash
git add src/services/cartwaveAuth.js
git add config_cartwave_jwt.sql
git add test_cartwave_jwt.js
git add test_cartwave_pix.js
```

### **3. Adicionar arquivos MODIFICADOS:**
```bash
git add src/services/cartwavehub.js
git add src/controllers/cartwavehubWebhookController.js
```

### **4. Verificar o que será commitado:**
```bash
git status
```

### **5. Fazer o commit:**
```bash
git commit -m "feat: implementar Nova API Cartwave com autenticação JWT

- Adicionar serviço de autenticação JWT (cartwaveAuth.js)
- Atualizar cartwavehub.js para suportar Nova API e API antiga
- Atualizar webhook handler para formato novo e antigo
- Adicionar validação HMAC opcional
- Criar scripts de teste e configuração
- Adicionar documentação completa

Breaking changes: Nenhum (compatibilidade retroativa mantida)"
```

### **6. Fazer push:**
```bash
git push
```

---

## ✅ Após o Commit

1. **Aguardar deploy no Coolify** (automático ou manual)
2. **Configurar credenciais JWT** (veja `GUIA_CONFIGURACAO_CARTWAVE.md`)
3. **Testar** (veja `GUIA_CONFIGURACAO_CARTWAVE.md`)

---

## 📝 Nota

- ✅ **Backend:** Commit via Git (este processo)
- ✅ **Frontend:** Upload via File Manager após build (como você mencionou)

---

**Status:** ✅ Pronto para commit manual



