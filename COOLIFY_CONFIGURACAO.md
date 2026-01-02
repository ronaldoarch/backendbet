# 🔧 Configuração Coolify - Backend Node.js

## ⚠️ Problema Atual

O deploy está falhando porque o `package.json` não está sendo encontrado durante o build.

## ✅ Solução Recomendada: Usar Nixpacks

### 1. **No Painel do Coolify:**

1. Acesse seu serviço/aplicação
2. Vá em **Settings** → **Build Pack**
3. Selecione **"Nixpacks"** (não Dockerfile)
4. Salve

### 2. **Verificar Root Directory:**

1. Vá em **Settings** → **Build**
2. Verifique se o campo **"Root Directory"** está **VAZIO** ou com `/`
3. Se estiver com algum caminho, limpe e deixe vazio

### 3. **Variáveis de Ambiente:**

Certifique-se de que `NODE_ENV` está configurado como **"Runtime only"**:

1. Vá em **Environment Variables**
2. Encontre `NODE_ENV`
3. **Desmarque** "Available at Buildtime"
4. **Marque** apenas "Available at Runtime"

Isso evita o problema de `npm ci` não instalar devDependencies que podem ser necessárias.

### 4. **Fazer Deploy:**

Clique em **"Redeploy"** após fazer as alterações acima.

## 📋 Arquivos no Repositório

Certifique-se de que estes arquivos estão no repositório:

- ✅ `package.json` (na raiz)
- ✅ `package-lock.json` (na raiz)
- ✅ `nixpacks.toml` (na raiz)
- ✅ `src/server.js` (arquivo principal)

## 🔍 Verificar se está tudo OK

Execute no terminal local:

```bash
cd backend-api
git ls-files | grep -E "package.json|package-lock.json|nixpacks.toml|src/server.js"
```

Todos devem aparecer na lista.

## 🐛 Se ainda não funcionar

### Alternativa: Usar Dockerfile

Se o Nixpacks continuar falhando:

1. No Coolify, vá em **Settings** → **Build Pack**
2. Selecione **"Dockerfile"**
3. Certifique-se que o **Root Directory** está vazio
4. Faça o deploy

O Dockerfile já está configurado e deve funcionar.

## 📝 Checklist Final

- [ ] Build Pack configurado como "Nixpacks"
- [ ] Root Directory vazio
- [ ] NODE_ENV configurado como "Runtime only"
- [ ] package.json e package-lock.json no repositório
- [ ] nixpacks.toml no repositório
- [ ] Fazer redeploy

---

**Recomendação:** Use **Nixpacks** primeiro. Se não funcionar, tente o **Dockerfile**.
