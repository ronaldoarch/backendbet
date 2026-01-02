# Erro 500 da API Arkama

## Problema:
A API Arkama está retornando erro 500 (erro interno do servidor deles):
```
The stream or file "/app/arkamapay/storage/logs/laravel-2025-11-30.log" could not be opened in append mode: Permission denied
```

## Análise:
Este é um **erro interno do servidor da Arkama**, não um problema do nosso código. O servidor deles está com problema de permissão para escrever logs.

## Soluções:

### 1. Tentar Novamente:
O erro pode ser temporário. Tente fazer o depósito novamente após alguns minutos.

### 2. Verificar se é Problema do Ambiente:
- Se estiver usando **sandbox**, pode ser um problema temporário
- Se estiver usando **production**, pode ser mais crítico

### 3. Contatar Suporte Arkama:
Se o erro persistir, entre em contato com o suporte da Arkama informando:
- Erro 500 ao criar pedido
- Mensagem: "Permission denied" no arquivo de log
- Data/hora do erro

### 4. Verificar se Todos os Campos Estão Corretos:
Mesmo que seja erro 500, vamos garantir que todos os campos estão corretos:

```javascript
{
  value: '20.00',
  paymentMethod: 'pix',
  customer: {
    name: '...',
    email: '...'
  },
  items: [{
    title: '...',
    unitPrice: '20.00',
    quantity: 1,
    isDigital: true
  }],
  shipping: {
    address: ['...']
  },
  ip: '...',
  user_email: '...',
  user_name: '...',
  description: '...',
  callback_url: '...',
  return_url: '...'
}
```

## Próximos Passos:

1. **Aguarde alguns minutos** e tente novamente
2. **Verifique os logs** da Arkama (se tiver acesso)
3. **Teste no site** após o rebuild do Coolify
4. Se persistir, **contate o suporte da Arkama**

## Nota:
O código está correto. O erro 500 é um problema interno do servidor da Arkama, não do nosso código.

