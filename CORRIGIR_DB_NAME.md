# 🔧 Corrigir Nome do Banco

## Erro

O erro mostra: `Unknown database 'raiway'`

Isso significa que no `.env` está escrito `raiway` ao invés de `railway` (falta o 'l').

## Corrigir

No arquivo `.env`, verifique a linha:

```env
DB_NAME=railway
```

Deve ser `railway` (com 'l'), não `raiway`.

## Depois de Corrigir

Execute novamente:

```bash
npm run migrate
```

## Verificar Nome do Banco no Railway

No Railway:
1. Clique no MySQL
2. Vá em **"Variables"**
3. Verifique o valor de `MYSQLDATABASE`
4. Use esse valor exato no `DB_NAME`

