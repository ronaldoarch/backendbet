# 🔐 Como Gerar JWT Secret

## ❓ O que é JWT Secret?

A **JWT Secret** é uma string aleatória e segura usada para **assinar** e **verificar** os tokens JWT (JSON Web Tokens) da sua aplicação. É como uma "senha mestra" que garante que os tokens não foram falsificados.

## ✅ JWT Secret Gerada

Use esta JWT secret (já gerada e segura):

```
5b08a53ceb004e5cb7cb704ca635d0e62bc5ad65cc932164516ea3991a50c170d3cbbf943739f658f1e8a8a0629b1daf33b8d82c54cc71dacab93b91890fe398
```

## 📋 Como Usar

### No Coolify (Variáveis de Ambiente)

Adicione esta variável:

```
JWT_SECRET=5b08a53ceb004e5cb7cb704ca635d0e62bc5ad65cc932164516ea3991a50c170d3cbbf943739f658f1e8a8a0629b1daf33b8d82c54cc71dacab93b91890fe398
```

### No .env (Desenvolvimento Local)

```env
JWT_SECRET=5b08a53ceb004e5cb7cb704ca635d0e62bc5ad65cc932164516ea3991a50c170d3cbbf943739f658f1e8a8a0629b1daf33b8d82c54cc71dacab93b91890fe398
```

## 🔧 Como Gerar uma Nova (Opcional)

Se quiser gerar uma nova JWT secret:

### Opção 1: Node.js

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Opção 2: OpenSSL

```bash
openssl rand -hex 64
```

### Opção 3: Online

Use um gerador online seguro (não recomendado para produção, mas útil para testes):
- https://generate-secret.vercel.app/64

## ⚠️ Importante

1. **Nunca compartilhe** sua JWT secret publicamente
2. **Nunca commite** a JWT secret no Git (use `.env` e `.gitignore`)
3. **Use a mesma** JWT secret em todos os ambientes (desenvolvimento, produção)
4. **Mantenha segura** - se alguém tiver acesso, pode criar tokens falsos

## 🔄 Se Precisar Mudar

Se você já tem usuários logados e mudar a JWT secret:
- ✅ Todos os tokens existentes serão **invalidados**
- ✅ Todos os usuários precisarão **fazer login novamente**
- ✅ Isso é **normal** e **seguro**

## 📝 Checklist

- [ ] JWT secret gerada
- [ ] Adicionada no Coolify (variáveis de ambiente)
- [ ] Adicionada no `.env` local (se necessário)
- [ ] **NÃO** commitada no Git


