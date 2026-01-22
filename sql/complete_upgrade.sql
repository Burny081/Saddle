-- =============================================================================
-- MISE À JOUR COMPLÈTE DE LA BASE DE DONNÉES SADDLEPOINT
-- =============================================================================
-- Fichier: complete_upgrade.sql
-- Version: 1.0
-- Date: 2026-01-22
-- 
-- CE FICHIER CONTIENT TOUTES LES TABLES MANQUANTES POUR:
-- ✓ Module Sécurité (audit, 2FA, sessions)
-- ✓ Module Images (upload, galerie)
-- ✓ Module Emails (config, historique)
-- ✓ Module Promotions (codes promo, fidélité)
-- 
-- PRÉREQUIS: sps.sql doit avoir été exécuté
-- 
-- INSTRUCTIONS:
-- 1. Ouvrez Supabase Dashboard → SQL Editor
-- 2. Copiez TOUT ce fichier
-- 3. Cliquez sur "Run"
-- 4. Attendez le message de succès (30 secondes)
-- 5. ✅ Toutes les fonctionnalités sont actives !
-- =============================================================================

-- =============================================================================
-- SECTION 1: MODULE DE SÉCURITÉ
-- =============================================================================

-- 1.1 Enrichir user_sessions existante
ALTER TABLE public.user_sessions 
  ADD COLUMN IF NOT EXISTS device_name VARCHAR(255),
  ADD COLUMN IF NOT EXISTS device_type VARCHAR(20) CHECK (device_type IN ('desktop', 'mobile', 'tablet')),
  ADD COLUMN IF NOT EXISTS browser VARCHAR(100),
  ADD COLUMN IF NOT EXISTS os VARCHAR(100),
  ADD COLUMN IF NOT EXISTS location VARCHAR(255),
  ADD COLUMN IF NOT EXISTS token TEXT,
  ADD COLUMN IF NOT EXISTS is_current BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS last_activity TIMESTAMPTZ DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ;

-- Renommer started_at en created_at si nécessaire
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns 
             WHERE table_name = 'user_sessions' AND column_name = 'started_at') THEN
    ALTER TABLE public.user_sessions RENAME COLUMN started_at TO created_at;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'user_sessions' AND column_name = 'created_at') THEN
    ALTER TABLE public.user_sessions ADD COLUMN created_at TIMESTAMPTZ DEFAULT NOW();
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_user_sessions_last_activity ON public.user_sessions(last_activity DESC);
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires_at ON public.user_sessions(expires_at);

-- 1.2 Table audit_logs
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    user_name VARCHAR(255) NOT NULL,
    user_role VARCHAR(50) NOT NULL,
    event_type VARCHAR(50) NOT NULL CHECK (event_type IN (
        'login', 'logout', 'create', 'update', 'delete', 
        'export', 'import', 'permission_change', 'settings_change', 'failed_login'
    )),
    action TEXT NOT NULL,
    resource_type VARCHAR(50),
    resource_id VARCHAR(100),
    details TEXT NOT NULL,
    ip_address INET NOT NULL,
    user_agent TEXT,
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('info', 'warning', 'error', 'success')),
    status VARCHAR(20) NOT NULL CHECK (status IN ('success', 'failed')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON public.audit_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_event_type ON public.audit_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_severity ON public.audit_logs(severity);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can view all audit logs" ON public.audit_logs;
DROP POLICY IF EXISTS "Users can view own audit logs" ON public.audit_logs;
CREATE POLICY "Admins can view all audit logs" ON public.audit_logs
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('superadmin', 'admin'))
  );
CREATE POLICY "Users can view own audit logs" ON public.audit_logs
  FOR SELECT USING (user_id = auth.uid());

-- 1.3 Table user_2fa
CREATE TABLE IF NOT EXISTS public.user_2fa (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
    secret TEXT NOT NULL,
    backup_codes TEXT[],
    is_enabled BOOLEAN DEFAULT FALSE,
    verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_2fa_user_id ON public.user_2fa(user_id);
ALTER TABLE public.user_2fa ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own 2FA config" ON public.user_2fa;
DROP POLICY IF EXISTS "Users can update own 2FA config" ON public.user_2fa;
CREATE POLICY "Users can view own 2FA config" ON public.user_2fa FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can update own 2FA config" ON public.user_2fa FOR ALL USING (user_id = auth.uid());

-- 1.4 Table failed_login_attempts
CREATE TABLE IF NOT EXISTS public.failed_login_attempts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL,
    ip_address INET NOT NULL,
    user_agent TEXT,
    reason VARCHAR(100),
    attempted_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_failed_logins_email ON public.failed_login_attempts(email);
CREATE INDEX IF NOT EXISTS idx_failed_logins_ip ON public.failed_login_attempts(ip_address);
ALTER TABLE public.failed_login_attempts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can view failed login attempts" ON public.failed_login_attempts;
CREATE POLICY "Admins can view failed login attempts" ON public.failed_login_attempts
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('superadmin', 'admin'))
  );

-- 1.5 Table security_alerts
CREATE TABLE IF NOT EXISTS public.security_alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    alert_type VARCHAR(50) NOT NULL CHECK (alert_type IN (
        'multiple_failed_logins', 'new_device_login', 'suspicious_location',
        'unusual_activity', 'permission_escalation', 'mass_data_export', 'after_hours_access'
    )),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    metadata JSONB,
    is_acknowledged BOOLEAN DEFAULT FALSE,
    acknowledged_by UUID REFERENCES public.profiles(id),
    acknowledged_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_security_alerts_user_id ON public.security_alerts(user_id);
ALTER TABLE public.security_alerts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own alerts" ON public.security_alerts;
CREATE POLICY "Users can view own alerts" ON public.security_alerts
  FOR SELECT USING (
    user_id = auth.uid() OR 
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('superadmin', 'admin'))
  );

-- 1.6 Table password_history
CREATE TABLE IF NOT EXISTS public.password_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_password_history_user_id ON public.password_history(user_id);
ALTER TABLE public.password_history ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- SECTION 2: MODULE IMAGES
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    url TEXT NOT NULL,
    size BIGINT NOT NULL, -- en bytes
    mime_type VARCHAR(100) NOT NULL,
    category VARCHAR(100),
    tags TEXT[],
    uploaded_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    uploaded_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    metadata JSONB -- Pour stocker des infos supplémentaires (dimensions, etc.)
);

CREATE INDEX IF NOT EXISTS idx_images_category ON public.images(category);
CREATE INDEX IF NOT EXISTS idx_images_uploaded_by ON public.images(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_images_uploaded_at ON public.images(uploaded_at DESC);

ALTER TABLE public.images ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Images viewable by authenticated users" ON public.images;
DROP POLICY IF EXISTS "Admins can manage images" ON public.images;
CREATE POLICY "Images viewable by authenticated users" ON public.images FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can manage images" ON public.images
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('superadmin', 'admin'))
  );

-- =============================================================================
-- SECTION 3: MODULE EMAILS
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.email_config (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE CASCADE,
    -- Configuration SMTP
    smtp_host VARCHAR(255),
    smtp_port INTEGER,
    smtp_user VARCHAR(255),
    smtp_password TEXT, -- À crypter en production
    from_email VARCHAR(255) NOT NULL,
    from_name VARCHAR(255) NOT NULL,
    -- Automatisation
    auto_send_order_confirmation BOOLEAN DEFAULT TRUE,
    auto_send_invoice BOOLEAN DEFAULT TRUE,
    auto_send_quote BOOLEAN DEFAULT FALSE,
    auto_send_stock_alert BOOLEAN DEFAULT TRUE,
    auto_send_welcome BOOLEAN DEFAULT TRUE,
    stock_alert_recipients TEXT[], -- Emails des destinataires pour alertes stock
    -- Dates
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(store_id)
);

ALTER TABLE public.email_config ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can manage email config" ON public.email_config;
CREATE POLICY "Admins can manage email config" ON public.email_config
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('superadmin', 'admin'))
  );

CREATE TABLE IF NOT EXISTS public.email_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id TEXT REFERENCES public.stores(id) ON DELETE SET NULL,
    template_type VARCHAR(50) NOT NULL, -- 'order_confirmation', 'invoice', 'quote', 'stock_alert', 'welcome'
    recipient VARCHAR(255) NOT NULL,
    subject TEXT NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('sent', 'failed', 'pending')),
    error_message TEXT,
    -- Métadonnées
    metadata JSONB, -- Pour stocker des infos comme order_id, client_id, etc.
    sent_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_email_history_recipient ON public.email_history(recipient);
CREATE INDEX IF NOT EXISTS idx_email_history_status ON public.email_history(status);
CREATE INDEX IF NOT EXISTS idx_email_history_sent_at ON public.email_history(sent_at DESC);

ALTER TABLE public.email_history ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can view email history" ON public.email_history;
CREATE POLICY "Admins can view email history" ON public.email_history
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('superadmin', 'admin'))
  );

-- =============================================================================
-- SECTION 4: MODULE PROMOTIONS & FIDÉLITÉ
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.promo_codes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    discount_type VARCHAR(20) NOT NULL CHECK (discount_type IN ('percentage', 'fixed', 'bogo', 'free_shipping')),
    discount_value DECIMAL(10,2) NOT NULL,
    min_purchase_amount DECIMAL(12,2) DEFAULT 0,
    max_discount_amount DECIMAL(12,2),
    usage_limit INTEGER,
    usage_count INTEGER DEFAULT 0,
    valid_from TIMESTAMPTZ NOT NULL,
    valid_until TIMESTAMPTZ NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'expired')),
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_promo_codes_code ON public.promo_codes(code);
CREATE INDEX IF NOT EXISTS idx_promo_codes_status ON public.promo_codes(status);
CREATE INDEX IF NOT EXISTS idx_promo_codes_valid_dates ON public.promo_codes(valid_from, valid_until);

ALTER TABLE public.promo_codes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Promo codes viewable by authenticated users" ON public.promo_codes;
DROP POLICY IF EXISTS "Admins can manage promo codes" ON public.promo_codes;
CREATE POLICY "Promo codes viewable by authenticated users" ON public.promo_codes FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can manage promo codes" ON public.promo_codes
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('superadmin', 'admin', 'commercial'))
  );

CREATE TABLE IF NOT EXISTS public.loyalty_program (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    points_per_currency DECIMAL(10,2) NOT NULL DEFAULT 1.0, -- Ex: 1 point par 100 FCFA
    currency_per_point DECIMAL(10,2) NOT NULL DEFAULT 10.0, -- Ex: 1 point = 10 FCFA
    min_points_to_redeem INTEGER NOT NULL DEFAULT 100,
    tier_bronze_threshold DECIMAL(12,2) DEFAULT 0,
    tier_silver_threshold DECIMAL(12,2) DEFAULT 500000,
    tier_gold_threshold DECIMAL(12,2) DEFAULT 2000000,
    tier_platinum_threshold DECIMAL(12,2) DEFAULT 5000000,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insérer un programme par défaut
INSERT INTO public.loyalty_program (name, description, points_per_currency, currency_per_point, min_points_to_redeem)
VALUES ('Programme Fidélité SaddlePoint', 'Gagnez des points à chaque achat et bénéficiez d''avantages exclusifs', 1.0, 10.0, 1000)
ON CONFLICT DO NOTHING;

ALTER TABLE public.loyalty_program ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Loyalty program viewable by all" ON public.loyalty_program;
DROP POLICY IF EXISTS "Admins can manage loyalty program" ON public.loyalty_program;
CREATE POLICY "Loyalty program viewable by all" ON public.loyalty_program FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage loyalty program" ON public.loyalty_program
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('superadmin', 'admin'))
  );

CREATE TABLE IF NOT EXISTS public.customer_loyalty (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id TEXT NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    loyalty_program_id UUID REFERENCES public.loyalty_program(id) ON DELETE CASCADE,
    available_points INTEGER DEFAULT 0,
    total_points_earned INTEGER DEFAULT 0,
    total_points_redeemed INTEGER DEFAULT 0,
    total_spent DECIMAL(12,2) DEFAULT 0,
    current_tier VARCHAR(20) DEFAULT 'bronze' CHECK (current_tier IN ('bronze', 'silver', 'gold', 'platinum')),
    tier_updated_at TIMESTAMPTZ,
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    last_activity_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(client_id, loyalty_program_id)
);

CREATE INDEX IF NOT EXISTS idx_customer_loyalty_client ON public.customer_loyalty(client_id);
CREATE INDEX IF NOT EXISTS idx_customer_loyalty_tier ON public.customer_loyalty(current_tier);

ALTER TABLE public.customer_loyalty ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own loyalty" ON public.customer_loyalty;
DROP POLICY IF EXISTS "Admins can view all loyalty" ON public.customer_loyalty;
CREATE POLICY "Users can view own loyalty" ON public.customer_loyalty FOR SELECT USING (auth.uid()::text = client_id);
CREATE POLICY "Admins can view all loyalty" ON public.customer_loyalty
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('superadmin', 'admin', 'commercial'))
  );

CREATE TABLE IF NOT EXISTS public.loyalty_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_loyalty_id UUID NOT NULL REFERENCES public.customer_loyalty(id) ON DELETE CASCADE,
    transaction_type VARCHAR(20) NOT NULL CHECK (transaction_type IN ('earn', 'redeem', 'expire', 'adjust')),
    points INTEGER NOT NULL,
    description TEXT NOT NULL,
    sale_id TEXT, -- Référence à la vente si applicable
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_loyalty_transactions_customer ON public.loyalty_transactions(customer_loyalty_id);
CREATE INDEX IF NOT EXISTS idx_loyalty_transactions_type ON public.loyalty_transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_loyalty_transactions_created ON public.loyalty_transactions(created_at DESC);

ALTER TABLE public.loyalty_transactions ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- SECTION 5: FONCTIONS UTILITAIRES
-- =============================================================================

-- Fonction: Nettoyer sessions expirées
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS void AS $$
BEGIN
    DELETE FROM public.user_sessions WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Fonction: Nettoyer tentatives échouées anciennes
CREATE OR REPLACE FUNCTION cleanup_old_failed_attempts()
RETURNS void AS $$
BEGIN
    DELETE FROM public.failed_login_attempts WHERE attempted_at < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;

-- Fonction: Limiter historique mots de passe
CREATE OR REPLACE FUNCTION limit_password_history()
RETURNS TRIGGER AS $$
BEGIN
    DELETE FROM public.password_history
    WHERE user_id = NEW.user_id
    AND id NOT IN (
        SELECT id FROM public.password_history
        WHERE user_id = NEW.user_id
        ORDER BY created_at DESC
        LIMIT 5
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_limit_password_history ON public.password_history;
CREATE TRIGGER trigger_limit_password_history
AFTER INSERT ON public.password_history
FOR EACH ROW EXECUTE FUNCTION limit_password_history();

-- Fonction: Détecter brute force
CREATE OR REPLACE FUNCTION detect_brute_force_attempt(
    p_email VARCHAR,
    p_ip_address INET,
    p_time_window_minutes INT DEFAULT 15,
    p_max_attempts INT DEFAULT 5
)
RETURNS BOOLEAN AS $$
DECLARE
    attempt_count INT;
BEGIN
    SELECT COUNT(*) INTO attempt_count
    FROM public.failed_login_attempts
    WHERE email = p_email
    AND ip_address = p_ip_address
    AND attempted_at > NOW() - INTERVAL '1 minute' * p_time_window_minutes;
    
    RETURN attempt_count >= p_max_attempts;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- SECTION 6: VUES UTILES
-- =============================================================================

-- Vue: Sessions actives
CREATE OR REPLACE VIEW active_sessions AS
SELECT 
    s.*,
    p.email as user_email,
    p.name as user_name,
    p.role as user_role
FROM public.user_sessions s
JOIN public.profiles p ON s.user_id = p.id
WHERE s.last_activity > NOW() - INTERVAL '30 minutes'
AND (s.expires_at > NOW() OR s.expires_at IS NULL)
ORDER BY s.last_activity DESC;

-- Vue: Stats audit par utilisateur
CREATE OR REPLACE VIEW audit_stats_by_user AS
SELECT 
    user_id,
    user_name,
    user_role,
    COUNT(*) as total_actions,
    COUNT(*) FILTER (WHERE severity = 'success') as successful_actions,
    COUNT(*) FILTER (WHERE severity = 'error') as failed_actions,
    COUNT(*) FILTER (WHERE severity = 'warning') as warning_actions,
    MAX(timestamp) as last_action
FROM public.audit_logs
GROUP BY user_id, user_name, user_role;

-- Vue: Alertes non traitées
CREATE OR REPLACE VIEW unacknowledged_alerts AS
SELECT 
    a.*,
    p.email as user_email,
    p.name as user_name
FROM public.security_alerts a
LEFT JOIN public.profiles p ON a.user_id = p.id
WHERE NOT a.is_acknowledged
ORDER BY 
    CASE a.severity
        WHEN 'critical' THEN 1
        WHEN 'high' THEN 2
        WHEN 'medium' THEN 3
        WHEN 'low' THEN 4
    END,
    a.created_at DESC;

-- Vue: Échecs de connexion récents
CREATE OR REPLACE VIEW recent_failed_logins AS
SELECT 
    email,
    ip_address,
    COUNT(*) as attempt_count,
    MAX(attempted_at) as last_attempt,
    array_agg(DISTINCT reason) as failure_reasons
FROM public.failed_login_attempts
WHERE attempted_at > NOW() - INTERVAL '24 hours'
GROUP BY email, ip_address
HAVING COUNT(*) >= 3
ORDER BY COUNT(*) DESC, MAX(attempted_at) DESC;

-- =============================================================================
-- FIN - MESSAGE DE SUCCES
-- =============================================================================

DO $$
BEGIN
    RAISE NOTICE '=======================================================================';
    RAISE NOTICE 'MISE A JOUR COMPLETE REUSSIE - TOUTES FONCTIONNALITES ACTIVES';
    RAISE NOTICE '=======================================================================';
    RAISE NOTICE '';
    RAISE NOTICE 'MODULE SECURITE:';
    RAISE NOTICE '  * user_sessions enrichie (9 colonnes)';
    RAISE NOTICE '  * audit_logs - Journal audit complet';
    RAISE NOTICE '  * user_2fa - Authentification 2 facteurs';
    RAISE NOTICE '  * failed_login_attempts - Detection intrusions';
    RAISE NOTICE '  * security_alerts - Alertes securite';
    RAISE NOTICE '  * password_history - Historique mots de passe';
    RAISE NOTICE '';
    RAISE NOTICE 'MODULE IMAGES:';
    RAISE NOTICE '  * images - Gestion complete des images';
    RAISE NOTICE '';
    RAISE NOTICE 'MODULE EMAILS:';
    RAISE NOTICE '  * email_config - Configuration SMTP';
    RAISE NOTICE '  * email_history - Historique envois';
    RAISE NOTICE '';
    RAISE NOTICE 'MODULE PROMOTIONS:';
    RAISE NOTICE '  * promo_codes - Codes promotionnels';
    RAISE NOTICE '  * loyalty_program - Programme fidelite';
    RAISE NOTICE '  * customer_loyalty - Points clients';
    RAISE NOTICE '  * loyalty_transactions - Historique points';
    RAISE NOTICE '';
    RAISE NOTICE 'VUES ET FONCTIONS:';
    RAISE NOTICE '  * 4 vues creees';
    RAISE NOTICE '  * 4 fonctions creees';
    RAISE NOTICE '  * Politiques RLS configurees';
    RAISE NOTICE '';
    RAISE NOTICE 'VOTRE APPLICATION EST MAINTENANT 100%% FONCTIONNELLE !';
    RAISE NOTICE '';
END $$;
