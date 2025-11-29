# 🔧 Corrigir DNS - api.betgeniusbr.com

## ❌ Problema

Erro: `DNS_PROBE_FINISHED_NXDOMAIN`

Isso significa que o domínio `api.betgeniusbr.com` não está resolvendo para um IP. O DNS não está configurado.

## ✅ Soluções

### Opção 1: Configurar DNS (Recomendado)

Você precisa configurar o DNS para apontar `api.betgeniusbr.com` para o IP da sua VPS.

#### Passo 1: Obter IP da VPS

```bash
# Via SSH na VPS
curl ifconfig.me
```

Anote este IP!

#### Passo 2: Configurar DNS no seu provedor

1. Acesse o painel do seu provedor de domínio (onde você comprou `betgeniusbr.com`)
2. Vá em **"DNS"** ou **"Zona DNS"**
3. Adicione um registro **A**:
   - **Nome/Host:** `api`
   - **Tipo:** `A`
   - **Valor/IP:** `IP_DA_VPS` (o IP que você obteve)
   - **TTL:** `3600` ou `Automatic`

#### Passo 3: Aguardar Propagação

O DNS pode levar de alguns minutos a 48 horas para propagar. Geralmente leva 5-30 minutos.

#### Passo 4: Verificar DNS

```bash
# Verificar se o DNS está resolvendo
nslookup api.betgeniusbr.com

# Ou
dig api.betgeniusbr.com

# Ou online
# https://www.whatsmydns.net/#A/api.betgeniusbr.com
```

### Opção 2: Usar IP Direto (Temporário)

Enquanto o DNS não está configurado, você pode usar o IP direto:

1. No Coolify, remova o domínio `api.betgeniusbr.com` temporariamente
2. Ou acesse diretamente pelo IP da VPS (se o Coolify permitir)

**Nota:** Isso não é ideal para produção, mas funciona para testes.

### Opção 3: Usar Subdomínio do Coolify (Temporário)

Se o Coolify fornecer um subdomínio (ex: `backendbet.coolify.app`), você pode usar temporariamente.

## 🔍 Verificar Configuração no Coolify

1. No Coolify, vá em **"Configuration"** → **"General"**
2. Verifique se o domínio `api.betgeniusbr.com` está configurado
3. Verifique se o SSL está sendo configurado (pode levar alguns minutos)

## 📋 Checklist

- [ ] Obter IP da VPS
- [ ] Configurar registro A no DNS: `api` → `IP_DA_VPS`
- [ ] Aguardar propagação DNS (5-30 minutos)
- [ ] Verificar DNS: `nslookup api.betgeniusbr.com`
- [ ] Testar: `curl https://api.betgeniusbr.com/api/health`

## 🧪 Testar DNS

### Após configurar o DNS, teste:

```bash
# Verificar se resolve
nslookup api.betgeniusbr.com

# Deve retornar o IP da VPS
```

### Testar endpoint:

```bash
# HTTP (pode não funcionar se SSL estiver configurado)
curl http://api.betgeniusbr.com/api/health

# HTTPS (após SSL ser configurado)
curl https://api.betgeniusbr.com/api/health
```

## ⚠️ Importante

1. **DNS pode levar tempo:** Aguarde 5-30 minutos após configurar
2. **SSL:** O Coolify configura SSL automaticamente, mas pode levar alguns minutos
3. **IP Fixo:** Certifique-se de que a VPS tem IP fixo (geralmente sim)

## 🆘 Se Não Funcionar

1. Verifique se o registro A está correto no DNS
2. Verifique se o IP da VPS está correto
3. Aguarde mais tempo para propagação DNS
4. Verifique se o Coolify está configurado para aceitar o domínio
5. Verifique os logs do Coolify

