-- ============================================
-- TABLES DE SÉCURITÉ POUR SADDLEPOINT
-- ============================================

-- Active l'extension pour les UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABLE: AUDIT LOGS
-- Historique complet de toutes les actions
-- ============================================
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Informations utilisateur
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
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

-- Index pour améliorer les performances de recherche
CREATE INDEX idx_audit_logs_timestamp ON audit_logs(timestamp DESC);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_event_type ON audit_logs(event_type);
CREATE INDEX idx_audit_logs_severity ON audit_logs(severity);
CREATE INDEX idx_audit_logs_resource ON audit_logs(resource_type, resource_id);
CREATE INDEX idx_audit_logs_ip_address ON audit_logs(ip_address);

-- Index pour la recherche full-text
CREATE INDEX idx_audit_logs_search ON audit_logs USING gin(to_tsvector('french', 
    coalesce(user_name, '') || ' ' || 
    coalesce(action, '') || ' ' || 
    coalesce(details, '')
));

-- Commentaires
COMMENT ON TABLE audit_logs IS 'Journal d''audit complet de toutes les actions dans le système';
COMMENT ON COLUMN audit_logs.event_type IS 'Type d''événement: login, logout, create, update, delete, export, import, permission_change, settings_change, failed_login';
COMMENT ON COLUMN audit_logs.severity IS 'Niveau de sévérité: info, warning, error, success';
COMMENT ON COLUMN audit_logs.status IS 'Statut de l''action: success ou failed';

-- ============================================
-- TABLE: USER SESSIONS
-- Gestion des sessions utilisateur
-- ============================================
CREATE TABLE IF NOT EXISTS user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Informations appareil
    device_name VARCHAR(255) NOT NULL,
    device_type VARCHAR(20) NOT NULL CHECK (device_type IN ('desktop', 'mobile', 'tablet')),
    browser VARCHAR(100) NOT NULL,
    os VARCHAR(100) NOT NULL,
    
    -- Informations réseau
    ip_address INET NOT NULL,
    location VARCHAR(255),
    
    -- Session
    token TEXT, -- JWT ou session token
    is_current BOOLEAN DEFAULT FALSE,
    last_activity TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Dates
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL
);

-- Index
CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_last_activity ON user_sessions(last_activity DESC);
CREATE INDEX idx_user_sessions_expires_at ON user_sessions(expires_at);

-- Commentaires
COMMENT ON TABLE user_sessions IS 'Sessions actives des utilisateurs pour la gestion multi-appareils';
COMMENT ON COLUMN user_sessions.is_current IS 'True si c''est la session actuellement active';
COMMENT ON COLUMN user_sessions.expires_at IS 'Date d''expiration de la session (généralement 30 jours après création)';

-- ============================================
-- TABLE: USER 2FA
-- Configuration de l'authentification à deux facteurs
-- ============================================
CREATE TABLE IF NOT EXISTS user_2fa (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    
    -- Secret pour TOTP
    secret TEXT NOT NULL, -- À crypter en production !
    
    -- Codes de secours
    backup_codes TEXT[], -- Array de 10 codes
    
    -- Statut
    is_enabled BOOLEAN DEFAULT FALSE,
    verified_at TIMESTAMPTZ,
    
    -- Dates
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index
CREATE INDEX idx_user_2fa_user_id ON user_2fa(user_id);
CREATE INDEX idx_user_2fa_enabled ON user_2fa(is_enabled);

-- Commentaires
COMMENT ON TABLE user_2fa IS 'Configuration de l''authentification à deux facteurs par utilisateur';
COMMENT ON COLUMN user_2fa.secret IS 'Secret TOTP - DOIT être crypté en production avec une clé de chiffrement';
COMMENT ON COLUMN user_2fa.backup_codes IS 'Codes de secours à usage unique (10 codes)';
COMMENT ON COLUMN user_2fa.is_enabled IS 'True si la 2FA est activée et vérifiée';

-- ============================================
-- TABLE: FAILED LOGIN ATTEMPTS
-- Suivi des tentatives de connexion échouées
-- ============================================
CREATE TABLE IF NOT EXISTS failed_login_attempts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL,
    ip_address INET NOT NULL,
    user_agent TEXT,
    reason VARCHAR(100), -- 'invalid_password', 'user_not_found', 'account_locked', etc.
    attempted_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index
CREATE INDEX idx_failed_logins_email ON failed_login_attempts(email);
CREATE INDEX idx_failed_logins_ip ON failed_login_attempts(ip_address);
CREATE INDEX idx_failed_logins_attempted_at ON failed_login_attempts(attempted_at DESC);

-- Commentaires
COMMENT ON TABLE failed_login_attempts IS 'Historique des tentatives de connexion échouées pour la détection d''intrusion';

-- ============================================
-- TABLE: SECURITY ALERTS
-- Alertes de sécurité automatiques
-- ============================================
CREATE TABLE IF NOT EXISTS security_alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    
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
    metadata JSONB, -- Données supplémentaires sur l'alerte
    
    -- Statut
    is_acknowledged BOOLEAN DEFAULT FALSE,
    acknowledged_by UUID REFERENCES users(id),
    acknowledged_at TIMESTAMPTZ,
    
    -- Dates
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index
CREATE INDEX idx_security_alerts_user_id ON security_alerts(user_id);
CREATE INDEX idx_security_alerts_type ON security_alerts(alert_type);
CREATE INDEX idx_security_alerts_severity ON security_alerts(severity);
CREATE INDEX idx_security_alerts_created_at ON security_alerts(created_at DESC);
CREATE INDEX idx_security_alerts_acknowledged ON security_alerts(is_acknowledged);

-- Commentaires
COMMENT ON TABLE security_alerts IS 'Alertes de sécurité automatiques basées sur la détection d''activités suspectes';
COMMENT ON COLUMN security_alerts.metadata IS 'Données JSON avec contexte supplémentaire (IP, timestamp, détails, etc.)';

-- ============================================
-- TABLE: PASSWORD HISTORY
-- Historique des mots de passe pour éviter la réutilisation
-- ============================================
CREATE TABLE IF NOT EXISTS password_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    password_hash TEXT NOT NULL, -- Hash du mot de passe
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index
CREATE INDEX idx_password_history_user_id ON password_history(user_id);
CREATE INDEX idx_password_history_created_at ON password_history(created_at DESC);

-- Commentaires
COMMENT ON TABLE password_history IS 'Historique des mots de passe pour empêcher la réutilisation des 5 derniers';

-- ============================================
-- FONCTIONS ET TRIGGERS
-- ============================================

-- Fonction pour nettoyer automatiquement les sessions expirées
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS void AS $$
BEGIN
    DELETE FROM user_sessions
    WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Fonction pour nettoyer les tentatives de connexion anciennes (> 30 jours)
CREATE OR REPLACE FUNCTION cleanup_old_failed_attempts()
RETURNS void AS $$
BEGIN
    DELETE FROM failed_login_attempts
    WHERE attempted_at < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;

-- Fonction pour limiter l'historique des mots de passe (garder seulement les 5 derniers)
CREATE OR REPLACE FUNCTION limit_password_history()
RETURNS TRIGGER AS $$
BEGIN
    DELETE FROM password_history
    WHERE user_id = NEW.user_id
    AND id NOT IN (
        SELECT id FROM password_history
        WHERE user_id = NEW.user_id
        ORDER BY created_at DESC
        LIMIT 5
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_limit_password_history
AFTER INSERT ON password_history
FOR EACH ROW
EXECUTE FUNCTION limit_password_history();

-- Fonction pour mettre à jour le timestamp de dernière activité
CREATE OR REPLACE FUNCTION update_session_activity()
RETURNS TRIGGER AS $$
BEGIN
    NEW.last_activity = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour détecter les tentatives de connexion multiples échouées
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
    FROM failed_login_attempts
    WHERE email = p_email
    AND ip_address = p_ip_address
    AND attempted_at > NOW() - INTERVAL '1 minute' * p_time_window_minutes;
    
    RETURN attempt_count >= p_max_attempts;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- POLITIQUES DE SÉCURITÉ RLS (Row Level Security)
-- ============================================

-- Active RLS sur toutes les tables
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_2fa ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE password_history ENABLE ROW LEVEL SECURITY;

-- Politique: Les utilisateurs ne voient que leurs propres sessions
CREATE POLICY user_sessions_policy ON user_sessions
    FOR ALL
    USING (user_id = auth.uid());

-- Politique: Les utilisateurs ne voient que leur propre config 2FA
CREATE POLICY user_2fa_policy ON user_2fa
    FOR ALL
    USING (user_id = auth.uid());

-- Politique: Seulement les admins peuvent voir les audit logs
CREATE POLICY audit_logs_admin_policy ON audit_logs
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role IN ('superadmin', 'admin')
        )
    );

-- Politique: Les utilisateurs voient leurs propres alertes
CREATE POLICY security_alerts_user_policy ON security_alerts
    FOR SELECT
    USING (
        user_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role IN ('superadmin', 'admin')
        )
    );

-- ============================================
-- VUES UTILES
-- ============================================

-- Vue: Sessions actives (dernière activité < 30 minutes)
CREATE OR REPLACE VIEW active_sessions AS
SELECT 
    s.*,
    u.email as user_email,
    u.name as user_name,
    u.role as user_role
FROM user_sessions s
JOIN users u ON s.user_id = u.id
WHERE s.last_activity > NOW() - INTERVAL '30 minutes'
AND s.expires_at > NOW()
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
FROM audit_logs
GROUP BY user_id, user_name, user_role;

-- Vue: Alertes non traitées
CREATE OR REPLACE VIEW unacknowledged_alerts AS
SELECT 
    a.*,
    u.email as user_email,
    u.name as user_name
FROM security_alerts a
LEFT JOIN users u ON a.user_id = u.id
WHERE NOT a.is_acknowledged
ORDER BY 
    CASE a.severity
        WHEN 'critical' THEN 1
        WHEN 'high' THEN 2
        WHEN 'medium' THEN 3
        WHEN 'low' THEN 4
    END,
    a.created_at DESC;

-- Vue: Tentatives de connexion échouées récentes (dernières 24h)
CREATE OR REPLACE VIEW recent_failed_logins AS
SELECT 
    email,
    ip_address,
    COUNT(*) as attempt_count,
    MAX(attempted_at) as last_attempt,
    array_agg(DISTINCT reason) as failure_reasons
FROM failed_login_attempts
WHERE attempted_at > NOW() - INTERVAL '24 hours'
GROUP BY email, ip_address
HAVING COUNT(*) >= 3
ORDER BY COUNT(*) DESC, MAX(attempted_at) DESC;

-- ============================================
-- DONNÉES INITIALES DE TEST
-- ============================================

-- Insertion de quelques logs d'audit de test (optionnel)
-- Décommentez si vous voulez des données de test

/*
INSERT INTO audit_logs (user_id, user_name, user_role, event_type, action, details, ip_address, user_agent, severity, status) VALUES
(uuid_generate_v4(), 'Admin Test', 'superadmin', 'login', 'Connexion réussie', 'L''utilisateur s''est connecté avec succès', '192.168.1.100', 'Mozilla/5.0', 'success', 'success'),
(uuid_generate_v4(), 'User Test', 'commercial', 'create', 'Création d''un client', 'Nouveau client "ABC Corp" créé', '192.168.1.105', 'Mozilla/5.0', 'success', 'success'),
(uuid_generate_v4(), 'Unknown', 'unknown', 'failed_login', 'Tentative de connexion échouée', 'Mot de passe incorrect', '203.0.113.45', 'Mozilla/5.0', 'error', 'failed');
*/

-- ============================================
-- MAINTENANCE ET TÂCHES PLANIFIÉES
-- ============================================

-- Créer des tâches cron pour le nettoyage automatique (nécessite pg_cron extension)
-- SELECT cron.schedule('cleanup-sessions', '0 2 * * *', 'SELECT cleanup_expired_sessions()');
-- SELECT cron.schedule('cleanup-failed-attempts', '0 3 * * *', 'SELECT cleanup_old_failed_attempts()');

COMMENT ON DATABASE saddle_point IS 'Base de données SaddlePoint avec tables de sécurité complètes';
