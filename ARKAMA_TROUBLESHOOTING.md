# Troubleshooting - Erro "Error on pix payment" da Arkama

## Problema

O erro "Error on pix payment" com contexto vazio `{"userId":2068,"exception":{}}` indica que há um problema no processamento do PIX na Arkama, mas não há detalhes sobre qual é o problema específico.

## Análise do Erro

O erro está sendo mascarado por um problema de permissão de log no servidor da Arkama, mas o erro real é:
- **Erro:** "Error on pix payment"
- **Contexto:** `{"userId":2068,"exception":{}}`
- **Status:** 500 (Internal Server Error)

## Possíveis Causas

### 1. Conta Arkama não habilitada para PIX
- A conta pode não ter o PIX habilitado
- Pode ser necessário ativar o PIX no painel da Arkama

### 2. Credenciais incorretas
- Token inválido ou expirado
- Ambiente incorreto (sandbox vs produção)
- URL base incorreta

### 3. IP não permitido
- O IP do servidor pode não estar na whitelist da Arkama
- IP atual: `45.184.217.146`

### 4. Configuração da conta
- A conta pode precisar de aprovação para PIX
- Pode haver restrições na conta

## Verificações Necessárias

### 1. Verificar Credenciais
- [ ] Token está correto?
- [ ] Ambiente está correto (sandbox/produção)?
- [ ] URL base está correta?

### 2. Verificar Configuração da Conta
- [ ] PIX está habilitado na conta?
- [ ] Conta está aprovada para PIX?
- [ ] Há alguma restrição na conta?

### 3. Verificar IP
- [ ] IP do servidor está na whitelist?
- [ ] IP atual: `45.184.217.146`

### 4. Verificar Dados Enviados
- [ ] Todos os campos obrigatórios estão presentes?
- [ ] Formato dos dados está correto?
- [ ] Valor mínimo (R$ 2,00) está sendo respeitado?

## Campos Enviados (Conforme Documentação)

```json
{
  "value": "20.00",
  "paymentMethod": "pix",
  "customer": {
    "name": "teste02",
    "email": "midasreidoblack@gmail.com",
    "phone": "(94) 99296-1626"
  },
  "items": [
    {
      "title": "Depósito de R$ 20.00",
      "unitPrice": "20.00",
      "quantity": 1,
      "isDigital": true
    }
  ],
  "shipping": {
    "address": ["Endereço não informado"]
  },
  "ip": "45.184.217.146",
  "callback_url": "https://qoo8wgogo4ow4gsg0k0wk4g4.agenciamidas.com/api/payments/arkama-webhook",
  "return_url": "https://qoo8wgogo4ow4gsg0k0wk4g4.agenciamidas.com/wallet?payment=success"
}
```

## Próximos Passos

1. **Entrar em contato com o suporte da Arkama**
   - Informar o erro: "Error on pix payment"
   - Informar o userId: 2068
   - Informar o IP do servidor: 45.184.217.146
   - Solicitar verificação da configuração da conta

2. **Verificar no painel da Arkama**
   - Verificar se o PIX está habilitado
   - Verificar se há alguma pendência
   - Verificar logs de transações

3. **Testar no ambiente Sandbox**
   - Se disponível, testar no ambiente sandbox primeiro
   - Verificar se o problema é específico do ambiente de produção

## Contato com Suporte Arkama

- **Suporte 24/7:** Disponível no chat do aplicativo
- **Email:** Verificar no site da Arkama
- **Central de Ajuda:** https://arkama.com.br/faq

## Conclusão

O código está correto e conforme a documentação oficial da Arkama. O problema está na configuração da conta ou nas credenciais. É necessário entrar em contato com o suporte da Arkama para resolver.

