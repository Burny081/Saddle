/**
 * API Security Management
 * 
 * Gestion de la sécurité : 2FA, sessions, audit logs
 */

import { supabase } from './supabaseClient';

// ============================================
// TYPES
// ============================================

export type AuditEventType = 
  | 'login' | 'logout' | 'create' | 'update' | 'delete' 
  | 'export' | 'import' | 'permission_change' | 'settings_change' | 'failed_login';

export type AuditSeverity = 'info' | 'warning' | 'error' | 'success';

export interface AuditLog {
  id: string;
  timestamp: Date;
  userId: string;
  userName: string;
  userRole: string;
  eventType: AuditEventType;
  action: string;
  resourceType?: string;
  resourceId?: string;
  details: string;
  ipAddress: string;
  userAgent: string;
  severity: AuditSeverity;
  status: 'success' | 'failed';
}

export interface UserSession {
  id: string;
  userId: string;
  deviceName: string;
  deviceType: 'desktop' | 'mobile' | 'tablet';
  browser: string;
  os: string;
  ipAddress: string;
  location: string;
  lastActivity: Date;
  isCurrent: boolean;
  createdAt: Date;
  expiresAt: Date;
}

export interface TwoFactorSetup {
  secret: string;
  qrCodeUrl: string;
  backupCodes: string[];
}

// ============================================
// AUDIT LOGS
// ============================================

/**
 * Enregistre un événement dans le journal d'audit
 */
export async function logAuditEvent(entry: Omit<AuditLog, 'id' | 'timestamp'>) {
  try {
    const { data, error } = await supabase
      .from('audit_logs')
      .insert({
        user_id: entry.userId,
        user_name: entry.userName,
        user_role: entry.userRole,
        event_type: entry.eventType,
        action: entry.action,
        resource_type: entry.resourceType,
        resource_id: entry.resourceId,
        details: entry.details,
        ip_address: entry.ipAddress,
        user_agent: entry.userAgent,
        severity: entry.severity,
        status: entry.status,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Erreur lors de l\'enregistrement du log d\'audit:', error);
    // Ne pas lancer d'erreur pour ne pas bloquer l'application si le log échoue
    return null;
  }
}

/**
 * Récupère les logs d'audit avec filtres
 */
export async function getAuditLogs(filters?: {
  userId?: string;
  eventType?: AuditEventType;
  severity?: AuditSeverity;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
}) {
  try {
    let query = supabase
      .from('audit_logs')
      .select('*')
      .order('timestamp', { ascending: false });

    if (filters?.userId) {
      query = query.eq('user_id', filters.userId);
    }
    if (filters?.eventType) {
      query = query.eq('event_type', filters.eventType);
    }
    if (filters?.severity) {
      query = query.eq('severity', filters.severity);
    }
    if (filters?.startDate) {
      query = query.gte('timestamp', filters.startDate.toISOString());
    }
    if (filters?.endDate) {
      query = query.lte('timestamp', filters.endDate.toISOString());
    }
    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    const { data, error } = await query;

    if (error) throw error;

    return data.map(log => ({
      id: log.id,
      timestamp: new Date(log.timestamp),
      userId: log.user_id,
      userName: log.user_name,
      userRole: log.user_role,
      eventType: log.event_type as AuditEventType,
      action: log.action,
      resourceType: log.resource_type,
      resourceId: log.resource_id,
      details: log.details,
      ipAddress: log.ip_address,
      userAgent: log.user_agent,
      severity: log.severity as AuditSeverity,
      status: log.status as 'success' | 'failed',
    })) as AuditLog[];
  } catch (error) {
    console.error('Erreur lors de la récupération des logs d\'audit:', error);
    return [];
  }
}

/**
 * Recherche dans les logs d'audit
 */
export async function searchAuditLogs(searchTerm: string, limit = 100) {
  try {
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .or(`user_name.ilike.%${searchTerm}%,action.ilike.%${searchTerm}%,details.ilike.%${searchTerm}%,ip_address.ilike.%${searchTerm}%,resource_id.ilike.%${searchTerm}%`)
      .order('timestamp', { ascending: false })
      .limit(limit);

    if (error) throw error;

    return data.map(log => ({
      id: log.id,
      timestamp: new Date(log.timestamp),
      userId: log.user_id,
      userName: log.user_name,
      userRole: log.user_role,
      eventType: log.event_type as AuditEventType,
      action: log.action,
      resourceType: log.resource_type,
      resourceId: log.resource_id,
      details: log.details,
      ipAddress: log.ip_address,
      userAgent: log.user_agent,
      severity: log.severity as AuditSeverity,
      status: log.status as 'success' | 'failed',
    })) as AuditLog[];
  } catch (error) {
    console.error('Erreur lors de la recherche dans les logs:', error);
    return [];
  }
}

// ============================================
// SESSION MANAGEMENT
// ============================================

/**
 * Récupère toutes les sessions de l'utilisateur
 */
export async function getUserSessions(userId: string) {
  try {
    const { data, error } = await supabase
      .from('user_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('last_activity', { ascending: false });

    if (error) throw error;

    return data.map(session => ({
      id: session.id,
      userId: session.user_id,
      deviceName: session.device_name,
      deviceType: session.device_type as 'desktop' | 'mobile' | 'tablet',
      browser: session.browser,
      os: session.os,
      ipAddress: session.ip_address,
      location: session.location,
      lastActivity: new Date(session.last_activity),
      isCurrent: session.is_current,
      createdAt: new Date(session.created_at),
      expiresAt: new Date(session.expires_at),
    })) as UserSession[];
  } catch (error) {
    console.error('Erreur lors de la récupération des sessions:', error);
    return [];
  }
}

/**
 * Crée une nouvelle session
 */
export async function createSession(session: Omit<UserSession, 'id' | 'createdAt'>) {
  try {
    const { data, error } = await supabase
      .from('user_sessions')
      .insert({
        user_id: session.userId,
        device_name: session.deviceName,
        device_type: session.deviceType,
        browser: session.browser,
        os: session.os,
        ip_address: session.ipAddress,
        location: session.location,
        last_activity: session.lastActivity.toISOString(),
        is_current: session.isCurrent,
        expires_at: session.expiresAt.toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Erreur lors de la création de la session:', error);
    throw error;
  }
}

/**
 * Met à jour l'activité d'une session
 */
export async function updateSessionActivity(sessionId: string) {
  try {
    const { data, error } = await supabase
      .from('user_sessions')
      .update({ last_activity: new Date().toISOString() })
      .eq('id', sessionId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la session:', error);
    throw error;
  }
}

/**
 * Révoque une session spécifique
 */
export async function revokeSession(sessionId: string) {
  try {
    const { error } = await supabase
      .from('user_sessions')
      .delete()
      .eq('id', sessionId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Erreur lors de la révocation de la session:', error);
    throw error;
  }
}

/**
 * Révoque toutes les sessions sauf la session actuelle
 */
export async function revokeAllOtherSessions(userId: string, currentSessionId: string) {
  try {
    const { error } = await supabase
      .from('user_sessions')
      .delete()
      .eq('user_id', userId)
      .neq('id', currentSessionId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Erreur lors de la révocation des sessions:', error);
    throw error;
  }
}

/**
 * Nettoie les sessions expirées
 */
export async function cleanupExpiredSessions() {
  try {
    const { error } = await supabase
      .from('user_sessions')
      .delete()
      .lt('expires_at', new Date().toISOString());

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Erreur lors du nettoyage des sessions expirées:', error);
    throw error;
  }
}

// ============================================
// TWO-FACTOR AUTHENTICATION (2FA)
// ============================================

/**
 * Configure la 2FA pour un utilisateur
 * Note: En production, utilisez une bibliothèque comme 'speakeasy' pour générer les secrets
 */
export async function setup2FA(userId: string): Promise<TwoFactorSetup> {
  try {
    // En production, utilisez speakeasy.generateSecret()
    const secret = 'MOCK_SECRET_' + Math.random().toString(36).substring(7);
    
    // Générer les codes de secours
    const backupCodes = Array.from({ length: 10 }, () => {
      const part1 = Math.random().toString(36).substring(2, 6).toUpperCase();
      const part2 = Math.random().toString(36).substring(2, 6).toUpperCase();
      return `${part1}-${part2}`;
    });

    // Enregistrer dans la base de données
    const { error } = await supabase
      .from('user_2fa')
      .upsert({
        user_id: userId,
        secret: secret, // En production, cryptez ce secret !
        backup_codes: backupCodes,
        is_enabled: false, // Sera activé après vérification
        created_at: new Date().toISOString(),
      });

    if (error) throw error;

    return {
      secret,
      qrCodeUrl: `otpauth://totp/SaddlePoint:${userId}?secret=${secret}&issuer=SaddlePoint`,
      backupCodes,
    };
  } catch (error) {
    console.error('Erreur lors de la configuration de la 2FA:', error);
    throw error;
  }
}

/**
 * Vérifie un code 2FA
 * Note: En production, utilisez speakeasy.totp.verify()
 */
export async function verify2FACode(userId: string, code: string): Promise<boolean> {
  try {
    // Récupérer le secret de l'utilisateur
    const { error } = await supabase
      .from('user_2fa')
      .select('secret')
      .eq('user_id', userId)
      .single();

    if (error) throw error;

    // En production, utilisez speakeasy.totp.verify()
    // Pour la démo, acceptons n'importe quel code de 6 chiffres
    const isValid = /^\d{6}$/.test(code);

    return isValid;
  } catch (error) {
    console.error('Erreur lors de la vérification du code 2FA:', error);
    return false;
  }
}

/**
 * Active la 2FA pour un utilisateur
 */
export async function enable2FA(userId: string) {
  try {
    const { error } = await supabase
      .from('user_2fa')
      .update({ is_enabled: true })
      .eq('user_id', userId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Erreur lors de l\'activation de la 2FA:', error);
    throw error;
  }
}

/**
 * Désactive la 2FA pour un utilisateur
 */
export async function disable2FA(userId: string) {
  try {
    const { error } = await supabase
      .from('user_2fa')
      .delete()
      .eq('user_id', userId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Erreur lors de la désactivation de la 2FA:', error);
    throw error;
  }
}

/**
 * Vérifie si la 2FA est activée pour un utilisateur
 */
export async function is2FAEnabled(userId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('user_2fa')
      .select('is_enabled')
      .eq('user_id', userId)
      .single();

    if (error) return false;
    return data?.is_enabled || false;
  } catch (error) {
    console.error('Erreur lors de la vérification du statut 2FA:', error);
    return false;
  }
}

/**
 * Régénère les codes de secours
 */
export async function regenerateBackupCodes(userId: string): Promise<string[]> {
  try {
    const backupCodes = Array.from({ length: 10 }, () => {
      const part1 = Math.random().toString(36).substring(2, 6).toUpperCase();
      const part2 = Math.random().toString(36).substring(2, 6).toUpperCase();
      return `${part1}-${part2}`;
    });

    const { error } = await supabase
      .from('user_2fa')
      .update({ backup_codes: backupCodes })
      .eq('user_id', userId);

    if (error) throw error;
    return backupCodes;
  } catch (error) {
    console.error('Erreur lors de la régénération des codes de secours:', error);
    throw error;
  }
}

// ============================================
// PASSWORD SECURITY
// ============================================

/**
 * Valide la force d'un mot de passe
 */
export function validatePasswordStrength(password: string): {
  score: number;
  label: string;
  color: string;
  requirements: Record<string, boolean>;
} {
  const requirements = {
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /\d/.test(password),
    hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  };

  const score = Object.values(requirements).filter(Boolean).length;

  let label = '';
  let color = '';
  if (score === 0) {
    label = '';
    color = '';
  } else if (score <= 2) {
    label = 'Faible';
    color = 'red';
  } else if (score === 3) {
    label = 'Moyen';
    color = 'yellow';
  } else if (score === 4) {
    label = 'Bon';
    color = 'blue';
  } else {
    label = 'Excellent';
    color = 'green';
  }

  return { score, label, color, requirements };
}

/**
 * Change le mot de passe d'un utilisateur
 */
export async function changePassword(userId: string, _oldPassword: string, newPassword: string) {
  try {
    // Valider la force du nouveau mot de passe
    const strength = validatePasswordStrength(newPassword);
    if (strength.score < 3) {
      throw new Error('Le nouveau mot de passe n\'est pas assez fort');
    }

    // En production, utilisez Supabase Auth
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) throw error;

    // Logger l'action
    await logAuditEvent({
      userId,
      userName: 'Current User', // À récupérer du contexte
      userRole: 'user',
      eventType: 'settings_change',
      action: 'Changement de mot de passe',
      details: 'Mot de passe changé avec succès',
      ipAddress: '', // À récupérer
      userAgent: navigator.userAgent,
      severity: 'info',
      status: 'success',
    });

    return true;
  } catch (error) {
    console.error('Erreur lors du changement de mot de passe:', error);
    throw error;
  }
}

// ============================================
// UTILITIES
// ============================================

/**
 * Récupère l'adresse IP du client
 * Note: En production, utilisez une API comme ipify ou récupérez-la côté serveur
 */
export async function getClientIP(): Promise<string> {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip;
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'IP:', error);
    return 'unknown';
  }
}

/**
 * Détecte les informations du dispositif
 */
export function getDeviceInfo() {
  const userAgent = navigator.userAgent;
  
  // Détection du type d'appareil
  let deviceType: 'desktop' | 'mobile' | 'tablet' = 'desktop';
  if (/Mobile|Android|iPhone/i.test(userAgent)) {
    deviceType = 'mobile';
  } else if (/iPad|Tablet/i.test(userAgent)) {
    deviceType = 'tablet';
  }

  // Détection du navigateur
  let browser = 'Unknown';
  if (userAgent.indexOf('Chrome') > -1) browser = 'Chrome';
  else if (userAgent.indexOf('Safari') > -1) browser = 'Safari';
  else if (userAgent.indexOf('Firefox') > -1) browser = 'Firefox';
  else if (userAgent.indexOf('Edge') > -1) browser = 'Edge';

  // Détection de l'OS
  let os = 'Unknown';
  if (userAgent.indexOf('Win') > -1) os = 'Windows';
  else if (userAgent.indexOf('Mac') > -1) os = 'macOS';
  else if (userAgent.indexOf('Linux') > -1) os = 'Linux';
  else if (userAgent.indexOf('Android') > -1) os = 'Android';
  else if (userAgent.indexOf('iOS') > -1) os = 'iOS';

  return { deviceType, browser, os, userAgent };
}
