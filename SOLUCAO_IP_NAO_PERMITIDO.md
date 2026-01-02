# 🚫 Erro: "IP Não permitido" - Solução

## ❌ Problema

Ao tentar abrir um jogo, você recebe o erro:
```
"IP Não permitido."
```

## 🔍 Causa

A PlayFiver está bloqueando o IP do servidor (Vercel). Isso acontece porque:

1. **Whitelist de IP**: A PlayFiver requer que o IP do servidor esteja na lista de IPs permitidos
2. **Vercel usa IPs dinâmicos**: O Vercel pode usar diferentes IPs, o que complica a whitelist

## ✅ Soluções

### Solução 1: Adicionar IP à Whitelist (Recomendado)

1. **Entre em contato com o suporte da PlayFiver**
   - Solicite adicionar o IP do servidor à whitelist
   - Informe que você está usando Vercel

2. **Problema com Vercel**:
   - Vercel usa IPs dinâmicos (mudam a cada deploy)
   - Você pode precisar de um IP fixo ou usar outra solução

3. **Alternativas**:
   - Usar um servidor com IP fixo (Hostinger, AWS, etc.)
   - Solicitar à PlayFiver uma lista de IPs do Vercel
   - Usar um proxy com IP fixo

### Solução 2: Usar Servidor com IP Fixo

Se você tem acesso ao servidor Hostinger:

1. **Configure o backend no Hostinger** (em vez do Vercel)
2. **Obtenha o IP fixo** do servidor
3. **Solicite à PlayFiver** adicionar esse IP à whitelist

### Solução 3: Verificar se há Outro Erro

O erro "IP Não permitido" pode também indicar:
- ❌ Credenciais incorretas
- ❌ Agente não configurado corretamente
- ❌ Jogo não disponível para o agente

**Verifique:**
- As credenciais estão corretas no admin?
- O agente está ativo na PlayFiver?
- O jogo está disponível para seu agente?

## 📋 Checklist

- [ ] Entre em contato com suporte da PlayFiver
- [ ] Solicite adicionar IP à whitelist
- [ ] Informe que está usando Vercel (ou outro servidor)
- [ ] Se usar Vercel, pergunte sobre IPs dinâmicos
- [ ] Considere usar servidor com IP fixo
- [ ] Verifique se as credenciais estão corretas

## 💡 Próximos Passos

1. **Contate o suporte da PlayFiver**:
   - Email ou chat de suporte
   - Informe o erro "IP Não permitido"
   - Solicite adicionar IP à whitelist

2. **Se usar Vercel**:
   - Pergunte se há uma lista de IPs do Vercel
   - Ou considere migrar para servidor com IP fixo

3. **Teste novamente** após adicionar IP:
   ```bash
   npm run test-game-launch 37
   ```

## 🔧 Nota Técnica

O erro ocorre porque:
- A PlayFiver verifica o IP de origem da requisição
- Se o IP não estiver na whitelist, retorna erro 403
- Vercel usa IPs que mudam, dificultando a whitelist

**Solução ideal**: Servidor com IP fixo ou whitelist de range de IPs do Vercel.

