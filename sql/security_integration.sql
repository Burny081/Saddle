-- =============================================================================
-- MODULE DE SÉCURITÉ AVANCÉE - MISE À JOUR DE LA BASE DE DONNÉES
-- =============================================================================
-- Fichier: security_integration.sql
-- Version: 1.0
-- Date: 2026-01-22
-- 
-- CE FICHIER CONTIENT TOUTES LES MODIFICATIONS SQL NÉCESSAIRES
-- POUR ACTIVER LE MODULE DE SÉCURITÉ AVANCÉE
-- 
-- PRÉREQUIS: sps.sql doit avoir été exécuté
-- 
-- CE QUI EST MODIFIÉ:
-- ✓ Table user_sessions (ajout de colonnes)
-- ✓ 5 nouvelles tables créées
-- ✓ 4 vues utiles créées
-- ✓ 4 fonctions créées
-- ✓ Politiques RLS configurées
-- 
-- INSTRUCTIONS:
-- 1. Ouvrez Supabase Dashboard → SQL Editor
-- 2. Copiez TOUT ce fichier
-- 3. Cliquez sur "Run"
-- 4. Attendez le message de succès
-- 5. ✅ Terminé !
-- =============================================================================

-- =============================================================================
-- ÉTAPE 1: MODIFIER LA TABLE USER_SESSIONS EXISTANTE
-- =============================================================================

-- Désactiver temporairement RLS
ALTER TABLE public.user_sessions DISABLE ROW LEVEL SECURITY;

-- Supprimer les anciennes politiques
DROP POLICY IF EXISTS "Users can view own sessions" ON public.user_sessions;

-- Ajouter les nouvelles colonnes nécessaires pour le module de sécurité
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

-- Renommer ou migrer les colonnes existantes si nécessaire
-- Note: device_info existe déjà, on garde
-- Note: ip_address existe déjà, on garde

-- Mettre à jour les contraintes
ALTER TABLE public.user_sessions 
  ALTER COLUMN user_id SET NOT NULL;

-- Supprimer les anciennes colonnes si elles ne sont plus nécessaires
-- ALTER TABLE public.user_sessions DROP COLUMN IF EXISTS ended_at;
-- ALTER TABLE public.user_sessions DROP COLUMN IF EXISTS started_at;

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

-- Créer les index pour les performances
CREATE INDEX IF NOT EXISTS idx_user_sessions_last_activity ON public.user_sessions(last_activity DESC);
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires_at ON public.user_sessions(expires_at);

-- Réactiver RLS avec de nouvelles politiques
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;

-- Nouvelles politiques pour le module de sécurité
CREATE POLICY "Users can view own sessions" ON public.user_sessions
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can delete own sessions" ON public.user_sessions
  FOR DELETE USING (user_id = auth.uid());

CREATE POLICY "Users can insert own sessions" ON public.user_sessions
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own sessions" ON public.user_sessions
  FOR UPDATE USING (user_id = auth.uid());

COMMENT ON TABLE public.user_sessions IS 'Sessions actives des utilisateurs (modifié pour le module de sécurité)';

-- =============================================================================
-- ÉTAPE 2: CRÉER LA TABLE AUDIT_LOGS
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Informations utilisateur (référence profiles au lieu de users)
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    user_name VARCHAR(255) NOT NULL,
    user_role VARCHAR(50) NOT NULL,
    
    -- Informations événement
    event_type VARCHAR(50) NOT NULL CHECK (event_type IN (
        'login', 'logout', 'create', 'update', 'delete', 
        'export', 'import', 'permission_change', 'settings_change', 'failed_login'
    )),
    action TEXT NOT NULL,
    
    -- Ressource affectée
    resource_type VARCHAR(50),
    resource_id VARCHAR(100),
    
    -- Détails
    details TEXT NOT NULL,
    
    -- Informations réseau/système
    ip_address INET NOT NULL,
    user_agent TEXT,
    
    -- Métadonnées
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('info', 'warning', 'error', 'success')),
    status VARCHAR(20) NOT NULL CHECK (status IN ('success', 'failed')),
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON public.audit_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_event_type ON public.audit_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_severity ON public.audit_logs(severity);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource ON public.audit_logs(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_ip_address ON public.audit_logs(ip_address);

-- Index pour la recherche full-text
CREATE INDEX IF NOT EXISTS idx_audit_logs_search ON public.audit_logs USING gin(to_tsvector('french', 
    coalesce(user_name, '') || ' ' || 
    coalesce(action, '') || ' ' || 
    coalesce(details, '')
));

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Politiques: Seuls les admins peuvent voir tous les logs
CREATE POLICY "Admins can view all audit logs" ON public.audit_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('superadmin', 'admin')
    )
  );

-- Les utilisateurs peuvent voir leurs propres logs
CREATE POLICY "Users can view own audit logs" ON public.audit_logs
  FOR SELECT USING (user_id = auth.uid());

COMMENT ON TABLE public.audit_logs IS 'Journal d''audit complet de toutes les actions dans le système';

-- =============================================================================
-- ÉTAPE 3: CRÉER LA TABLE USER_2FA
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.user_2fa (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
    
    -- Secret pour TOTP (À CRYPTER EN PRODUCTION!)
    secret TEXT NOT NULL,
    
    -- Codes de secours
    backup_codes TEXT[],
    
    -- Statut
    is_enabled BOOLEAN DEFAULT FALSE,
    verified_at TIMESTAMPTZ,
    
    -- Dates
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_2fa_user_id ON public.user_2fa(user_id);
CREATE INDEX IF NOT EXISTS idx_user_2fa_enabled ON public.user_2fa(is_enabled);

ALTER TABLE public.user_2fa ENABLE ROW LEVEL SECURITY;

-- Politique: Les utilisateurs ne voient que leur propre config 2FA
CREATE POLICY "Users can view own 2FA config" ON public.user_2fa
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update own 2FA config" ON public.user_2fa
  FOR ALL USING (user_id = auth.uid());

COMMENT ON TABLE public.user_2fa IS 'Configuration de l''authentification à deux facteurs';
COMMENT ON COLUMN public.user_2fa.secret IS 'Secret TOTP - DOIT être crypté en production';

-- =============================================================================
-- ÉTAPE 4: CRÉER LA TABLE FAILED_LOGIN_ATTEMPTS
-- =============================================================================

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
CREATE INDEX IF NOT EXISTS idx_failed_logins_attempted_at ON public.failed_login_attempts(attempted_at DESC);

ALTER TABLE public.failed_login_attempts ENABLE ROW LEVEL SECURITY;

-- Politique: Seuls les admins peuvent voir les tentatives échouées
CREATE POLICY "Admins can view failed login attempts" ON public.failed_login_attempts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('superadmin', 'admin')
    )
  );

COMMENT ON TABLE public.failed_login_attempts IS 'Historique des tentatives de connexion échouées';

-- =============================================================================
-- ÉTAPE 5: CRÉER LA TABLE SECURITY_ALERTS
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.security_alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    
    -- Type d'alerte
    alert_type VARCHAR(50) NOT NULL CHECK (alert_type IN (
        'multiple_failed_logins',
        'new_device_login',
        'suspicious_location',
        'unusual_activity',
        'permission_escalation',
        'mass_data_export',
        'after_hours_access'
    )),
    
    -- Détails
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    
    -- Métadonnées
    metadata JSONB,
    
    -- Statut
    is_acknowledged BOOLEAN DEFAULT FALSE,
    acknowledged_by UUID REFERENCES public.profiles(id),
    acknowledged_at TIMESTAMPTZ,
    
    -- Dates
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_security_alerts_user_id ON public.security_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_security_alerts_type ON public.security_alerts(alert_type);
CREATE INDEX IF NOT EXISTS idx_security_alerts_severity ON public.security_alerts(severity);
CREATE INDEX IF NOT EXISTS idx_security_alerts_created_at ON public.security_alerts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_security_alerts_acknowledged ON public.security_alerts(is_acknowledged);

ALTER TABLE public.security_alerts ENABLE ROW LEVEL SECURITY;

-- Politique: Les utilisateurs voient leurs propres alertes
CREATE POLICY "Users can view own alerts" ON public.security_alerts
  FOR SELECT USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('superadmin', 'admin')
    )
  );

COMMENT ON TABLE public.security_alerts IS 'Alertes de sécurité automatiques';

-- =============================================================================
-- ÉTAPE 6: CRÉER LA TABLE PASSWORD_HISTORY
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.password_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_password_history_user_id ON public.password_history(user_id);
CREATE INDEX IF NOT EXISTS idx_password_history_created_at ON public.password_history(created_at DESC);

ALTER TABLE public.password_history ENABLE ROW LEVEL SECURITY;

-- Politique: Personne ne peut lire l'historique des mots de passe (sécurité)
-- Seules les fonctions backend peuvent insérer

COMMENT ON TABLE public.password_history IS 'Historique des mots de passe (pour éviter réutilisation)';

-- =============================================================================
-- ÉTAPE 7: CRÉER LES FONCTIONS UTILITAIRES
-- =============================================================================

-- Fonction pour nettoyer les sessions expirées
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS void AS $$
BEGIN
    DELETE FROM public.user_sessions
    WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Fonction pour nettoyer les tentatives anciennes (> 30 jours)
CREATE OR REPLACE FUNCTION cleanup_old_failed_attempts()
RETURNS void AS $$
BEGIN
    DELETE FROM public.failed_login_attempts
    WHERE attempted_at < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;

-- Fonction pour limiter l'historique (garder 5 derniers)
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

-- Créer le trigger
DROP TRIGGER IF EXISTS trigger_limit_password_history ON public.password_history;
CREATE TRIGGER trigger_limit_password_history
AFTER INSERT ON public.password_history
FOR EACH ROW
EXECUTE FUNCTION limit_password_history();

-- Fonction pour détecter les tentatives brute force
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
    SELECT COUNT(*)
    INTO attempt_count
    FROM public.failed_login_attempts
    WHERE email = p_email
    AND ip_address = p_ip_address
    AND attempted_at > NOW() - INTERVAL '1 minute' * p_time_window_minutes;
    
    RETURN attempt_count >= p_max_attempts;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- ÉTAPE 8: CRÉER LES VUES UTILES
-- =============================================================================

-- Vue: Sessions actives (dernière activité < 30 minutes)
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

-- Vue: Statistiques d'audit par utilisateur
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

-- Vue: Tentatives échouées récentes (24h)
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
-- ÉTAPE 9: INSÉRER DES DONNÉES DE TEST (OPTIONNEL)
-- =============================================================================

-- Insérer quelques logs de test pour vérifier le fonctionnement
-- Décommentez si vous voulez des données de démonstration

/*
-- Récupérer un user_id existant pour les tests
DO $$
DECLARE
    test_user_id UUID;
BEGIN
    -- Prendre le premier profil admin
    SELECT id INTO test_user_id FROM public.profiles WHERE role IN ('admin', 'superadmin') LIMIT 1;
    
    IF test_user_id IS NOT NULL THEN
        -- Insérer des logs de test
        INSERT INTO public.audit_logs (user_id, user_name, user_role, event_type, action, details, ip_address, user_agent, severity, status) VALUES
        (test_user_id, 'Admin Test', 'admin', 'login', 'Connexion réussie', 'Connexion depuis l''application web', '192.168.1.100', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0', 'success', 'success'),
        (test_user_id, 'Admin Test', 'admin', 'create', 'Création d''un client', 'Nouveau client "Test Corp" créé', '192.168.1.100', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0', 'success', 'success');
        
        -- Insérer une session de test
        INSERT INTO public.user_sessions (user_id, device_name, device_type, browser, os, ip_address, location, is_current, last_activity, expires_at) VALUES
        (test_user_id, 'Windows PC', 'desktop', 'Chrome 120', 'Windows 11', '192.168.1.100', 'Yaoundé, Cameroun', true, NOW(), NOW() + INTERVAL '30 days');
    END IF;
END $$;
*/

-- =============================================================================
-- FIN DU SCRIPT - RÉSUMÉ
-- =============================================================================

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '╔════════════════════════════════════════════════════════════╗';
    RAISE NOTICE '║  ✅ MODULE DE SÉCURITÉ INSTALLÉ AVEC SUCCÈS              ║';
    RAISE NOTICE '╚════════════════════════════════════════════════════════════╝';
    RAISE NOTICE '';
    RAISE NOTICE '📊 TABLES:';
    RAISE NOTICE '   ✓ user_sessions - Enrichie avec nouvelles colonnes';
    RAISE NOTICE '   ✓ audit_logs - Journal audit (NOUVEAU)';
    RAISE NOTICE '   ✓ user_2fa - Config 2FA (NOUVEAU)';
    RAISE NOTICE '   ✓ failed_login_attempts - Tentatives échouées (NOUVEAU)';
    RAISE NOTICE '   ✓ security_alerts - Alertes sécurité (NOUVEAU)';
    RAISE NOTICE '   ✓ password_history - Historique mots de passe (NOUVEAU)';
    RAISE NOTICE '';
    RAISE NOTICE '🔍 VUES:';
    RAISE NOTICE '   ✓ active_sessions';
    RAISE NOTICE '   ✓ audit_stats_by_user';
    RAISE NOTICE '   ✓ unacknowledged_alerts';
    RAISE NOTICE '   ✓ recent_failed_logins';
    RAISE NOTICE '';
    RAISE NOTICE '⚙️  FONCTIONS:';
    RAISE NOTICE '   ✓ cleanup_expired_sessions()';
    RAISE NOTICE '   ✓ cleanup_old_failed_attempts()';
    RAISE NOTICE '   ✓ limit_password_history()';
    RAISE NOTICE '   ✓ detect_brute_force_attempt()';
    RAISE NOTICE '';
    RAISE NOTICE '🔐 POLITIQUES RLS: Toutes configurées';
    RAISE NOTICE '';
    RAISE NOTICE '🚀 PROCHAINES ÉTAPES:';
    RAISE NOTICE '   1. Lancez votre application web';
    RAISE NOTICE '   2. Allez dans le menu Sécurité';
    RAISE NOTICE '   3. Le module est prêt à l''emploi!';
    RAISE NOTICE '';
    RAISE NOTICE '📚 DOCUMENTATION:';
    RAISE NOTICE '   → guidelines/SECURITY_SYSTEM.md';
    RAISE NOTICE '   → guidelines/SECURITY_README.md';
    RAISE NOTICE '   → INTEGRATION_GUIDE.md';
    RAISE NOTICE '';
END $$;

