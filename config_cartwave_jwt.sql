-- ============================================
-- Script para configurar Nova API Cartwave (JWT)
-- ============================================
-- Execute este script no banco de dados para configurar as credenciais JWT
-- 
-- IMPORTANTE: Substitua os valores abaixo pelos seus dados reais:
--   - seu_client_id: Client ID fornecido pelo Cartwave
--   - seu_client_secret: Client Secret fornecido pelo Cartwave
--   - seu_hmac_secret: Secret HMAC (opcional, para validação de webhooks)
-- ============================================

-- Credenciais JWT (OBRIGATÓRIO)
INSERT INTO app_settings (setting_key, setting_value, created_at, updated_at) 
VALUES ('cartwave_client_id', 'seu_client_id', NOW(), NOW())
ON DUPLICATE KEY UPDATE setting_value = 'seu_client_id', updated_at = NOW();

INSERT INTO app_settings (setting_key, setting_value, created_at, updated_at) 
VALUES ('cartwave_client_secret', 'seu_client_secret', NOW(), NOW())
ON DUPLICATE KEY UPDATE setting_value = 'seu_client_secret', updated_at = NOW();

-- URL Base da API (padrão: https://api.cartwave.com.br)
INSERT INTO app_settings (setting_key, setting_value, created_at, updated_at) 
VALUES ('cartwave_base_url', 'https://api.cartwave.com.br', NOW(), NOW())
ON DUPLICATE KEY UPDATE setting_value = 'https://api.cartwave.com.br', updated_at = NOW();

-- HMAC Secret (OPCIONAL - apenas se configurar validação HMAC nos webhooks)
INSERT INTO app_settings (setting_key, setting_value, created_at, updated_at) 
VALUES ('cartwave_hmac_secret', 'seu_hmac_secret', NOW(), NOW())
ON DUPLICATE KEY UPDATE setting_value = 'seu_hmac_secret', updated_at = NOW();

-- ============================================
-- Verificar configuração
-- ============================================
SELECT 
  setting_key,
  CASE 
    WHEN setting_key LIKE '%secret%' OR setting_key LIKE '%_secret' THEN 
      CONCAT(LEFT(setting_value, 4), '...', RIGHT(setting_value, 4))
    ELSE 
      setting_value 
  END as setting_value_masked,
  updated_at
FROM app_settings
WHERE setting_key LIKE 'cartwave%'
ORDER BY setting_key;

-- ============================================
-- NOTAS:
-- ============================================
-- 1. Após configurar, o sistema vai usar automaticamente a Nova API (JWT)
-- 2. Se não configurar, o sistema vai usar a API antiga (fallback)
-- 3. As credenciais antigas (cartwavehub_api_secret) podem ser mantidas como backup
-- 4. Para testar, faça um depósito e verifique os logs

