# Análise da Documentação da Arkama

## Endpoint: Criar Compra (POST /orders)

**URL Base:**
- Produção: `https://app.arkama.com.br/api/v1`
- Sandbox: `https://sandbox.arkama.com.br/api/v1`
- Beta: `https://beta.arkama.com.br/api/v1`

**Endpoint:** `POST /orders`

## Autenticação

A autenticação pode ser feita de duas formas:
1. **Header:** `Authorization: Bearer {token}`
2. **Body:** Incluir `token` no body da requisição

## Campos Obrigatórios Identificados

### 1. `value` (float, obrigatório)
- **Descrição:** Valor total da compra (em compras parceladas, juros serão acrescidos automaticamente)
- **Obrigatório:** Sim, caso não informe `total_value`
- **Valor mínimo:** R$ 2,00
- **Nota:** Não pode ser enviado junto com `total_value`

### 2. `total_value` (float, opcional)
- **Descrição:** Valor total cobrado do cliente (em compras parceladas, juros serão descontados do vendedor)
- **Obrigatório:** Sim, caso não informe `value`
- **Valor mínimo:** R$ 2,00
- **Nota:** Não pode ser enviado junto com `value`

### 3. `paymentMethod` (string, obrigatório)
- **Descrição:** Forma de pagamento
- **Valores possíveis:** `credit_card`, `pix`
- **Obrigatório:** Sim

### 4. `installments` (int32, opcional)
- **Descrição:** Número de parcelas (para cartão de crédito)

## Campos Adicionais (a verificar na documentação completa)

Baseado nos erros anteriores e na estrutura comum de APIs de pagamento, os seguintes campos provavelmente são necessários:

### `customer` (objeto, provavelmente obrigatório)
- `name` (string)
- `email` (string)
- `phone` (string, opcional)

### `items` (array, provavelmente obrigatório)
- `title` (string)
- `unitPrice` (float)
- `quantity` (int)
- `isDigital` (boolean)

### `shipping` (objeto, provavelmente obrigatório)
- `address` (array de strings)

### `callback_url` (string, provavelmente obrigatório)
- URL para receber webhooks de notificação

### `return_url` (string, provavelmente obrigatório)
- URL para redirecionar após o pagamento

### `ip` (string, provavelmente obrigatório)
- IP do cliente

## Problemas Identificados no Código Atual

1. **Enviando ambos `value` e `total_value`:** A documentação diz que não pode enviar ambos
2. **Campos extras no body:** Estamos enviando `user_email`, `user_name`, `description` que podem não ser necessários se já estão em `customer`
3. **Formato de `shipping.address`:** Precisamos confirmar se deve ser array

## Próximos Passos

1. Verificar se todos os campos obrigatórios estão sendo enviados
2. Remover campos desnecessários
3. Garantir que não estamos enviando `value` e `total_value` juntos
4. Verificar se o formato dos dados está correto conforme a documentação

## Erro Atual

O erro "Error on pix payment" com contexto vazio `{"userId":2068,"exception":{}}` sugere:
- Problema de configuração da conta Arkama
- Campos obrigatórios faltando ou incorretos
- Formato de dados incorreto

