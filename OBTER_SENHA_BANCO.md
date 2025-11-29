# 🔑 Como Obter a Senha do Banco

## Opção 1: Resetar Senha no Supabase

1. No painel do Supabase, vá em **Settings** → **Database**
2. Procure pela seção **"Database password"**
3. Clique em **"Reset database password"**
4. **ANOTE A NOVA SENHA** (ela só aparece uma vez!)
5. Atualize o `.env` com a nova senha

## Opção 2: Verificar se Já Tem a Senha

Se você criou o projeto recentemente, a senha é a que você definiu ao criar o projeto.

## Configurar .env

Depois de obter/resetar a senha, configure o `.env`:

```env
DB_HOST=db.slrkerlrcvntxynfjbyh.supabase.co
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=SUA_SENHA_AQUI
DB_NAME=postgres
DB_SSL=true
```

## Testar Múltiplas Configurações

Execute o script que testa automaticamente diferentes combinações:

```bash
node test_multiplas_configs.js
```

Este script vai testar:
- Diferentes hosts (com e sem `db.`)
- Diferentes portas (5432 e 6543)
- Com e sem SSL

E vai mostrar qual configuração funciona!

