# 🔒 Module de Sécurité Avancée - SaddlePoint

## 📋 Vue d'ensemble

Le module de sécurité avancée de SaddlePoint est une solution complète pour protéger votre application et surveiller toutes les activités. Il comprend trois fonctionnalités principales :

1. **Authentification à Deux Facteurs (2FA)** - Protection supplémentaire des comptes
2. **Gestion des Sessions** - Surveillance et contrôle des connexions multi-appareils
3. **Journal d'Audit** - Traçabilité complète de toutes les actions

## 🚀 Fonctionnalités Implémentées

### ✅ Authentification à Deux Facteurs (2FA)
- ✓ Activation/désactivation de la 2FA
- ✓ Génération de QR code pour les apps d'authentification
- ✓ Validation de code à 6 chiffres
- ✓ Génération de 10 codes de secours
- ✓ Régénération des codes de secours
- ✓ Interface utilisateur complète et intuitive

### ✅ Gestion des Sessions
- ✓ Liste de toutes les sessions actives
- ✓ Informations détaillées par session (appareil, OS, navigateur, IP, localisation)
- ✓ Badge "Session actuelle" pour identifier la session en cours
- ✓ Révocation d'une session spécifique
- ✓ Révocation de toutes les sessions sauf la session actuelle
- ✓ Statistiques (total sessions, sessions actives, nombre d'appareils)
- ✓ Indicateur de dernière activité

### ✅ Journal d'Audit
- ✓ Enregistrement de tous les événements (10 types)
- ✓ 4 niveaux de sévérité (info, warning, error, success)
- ✓ Filtres avancés (recherche, type, sévérité, période)
- ✓ Affichage détaillé (utilisateur, action, ressource, IP, détails)
- ✓ Statistiques en temps réel
- ✓ Export de données (prévu)

### ✅ Sécurité des Mots de Passe
- ✓ Validation de force en temps réel
- ✓ 5 exigences de sécurité
- ✓ Indicateur visuel de force (Faible/Moyen/Bon/Excellent)
- ✓ Barre de progression colorée
- ✓ Interface de changement de mot de passe

## 📁 Structure des Fichiers

```
src/
├── components/
│   └── security/
│       ├── SecurityView.tsx           # Composant principal avec onglets
│       ├── SecuritySettings.tsx       # 2FA et mots de passe
│       ├── SessionManagement.tsx      # Gestion des sessions
│       └── AuditLogView.tsx          # Journal d'audit
├── utils/
│   └── apiSecurity.ts                # API complète pour la sécurité
sql/
└── security_tables.sql               # Tables PostgreSQL + triggers
guidelines/
└── SECURITY_SYSTEM.md                # Documentation complète
```

## 🔧 Intégration dans l'Application

### Navigation
Le module est accessible depuis le menu principal avec l'icône 🛡️ (Shield).

**Rôles autorisés :**
- Superadmin (accès complet)
- Admin (accès complet)

### Route
- **ID de route :** `security`
- **Composant :** `SecurityView`

### Onglets
1. **Paramètres** - Configuration 2FA et mots de passe
2. **Sessions** - Gestion des connexions actives
3. **Journal d'Audit** - Historique des événements

## 💾 Base de Données

### Tables Créées
```sql
- audit_logs              # Journal d'audit complet
- user_sessions           # Sessions utilisateur
- user_2fa                # Configuration 2FA
- failed_login_attempts   # Tentatives échouées
- security_alerts         # Alertes de sécurité
- password_history        # Historique des mots de passe
```

### Vues
```sql
- active_sessions         # Sessions actives (< 30 min)
- audit_stats_by_user     # Statistiques par utilisateur
- unacknowledged_alerts   # Alertes non traitées
- recent_failed_logins    # Échecs récents (24h)
```

### Fonctions
```sql
- cleanup_expired_sessions()       # Nettoie les sessions expirées
- cleanup_old_failed_attempts()    # Nettoie les tentatives anciennes
- limit_password_history()         # Garde seulement les 5 derniers
- detect_brute_force_attempt()     # Détecte les attaques brute force
```

## 📊 Types d'Événements d'Audit

| Type | Description |
|------|-------------|
| `login` | Connexion réussie |
| `logout` | Déconnexion |
| `create` | Création d'entité |
| `update` | Modification d'entité |
| `delete` | Suppression d'entité |
| `export` | Export de données |
| `import` | Import de données |
| `permission_change` | Changement de permissions |
| `settings_change` | Modification paramètres |
| `failed_login` | Tentative échouée |

## 🎨 Interface Utilisateur

### Composants UI Utilisés
- Card, CardContent, CardHeader, CardTitle
- Button, Input
- Badge
- Tabs, TabsList, TabsTrigger, TabsContent
- Icônes Lucide React

### Couleurs par Sévérité
- **Success** 🟢 : Vert (actions réussies)
- **Info** 🔵 : Bleu (informations)
- **Warning** 🟡 : Jaune (actions sensibles)
- **Error** 🔴 : Rouge (erreurs, intrusions)

## 🔐 Fonctions API Disponibles

### Audit Logs
```typescript
logAuditEvent(entry)               // Enregistre un événement
getAuditLogs(filters?)             // Récupère les logs
searchAuditLogs(searchTerm)        // Recherche dans les logs
```

### Sessions
```typescript
getUserSessions(userId)            // Liste des sessions
createSession(session)             // Crée une session
updateSessionActivity(sessionId)   // Met à jour l'activité
revokeSession(sessionId)           // Révoque une session
revokeAllOtherSessions(userId, currentId) // Révoque toutes sauf actuelle
cleanupExpiredSessions()           // Nettoie les expirées
```

### 2FA
```typescript
setup2FA(userId)                   // Configure la 2FA
verify2FACode(userId, code)        // Vérifie un code
enable2FA(userId)                  // Active la 2FA
disable2FA(userId)                 // Désactive la 2FA
is2FAEnabled(userId)               // Vérifie le statut
regenerateBackupCodes(userId)      // Régénère les codes
```

### Mots de Passe
```typescript
validatePasswordStrength(password) // Valide la force
changePassword(userId, old, new)   // Change le mot de passe
```

### Utilitaires
```typescript
getClientIP()                      // Récupère l'IP client
getDeviceInfo()                    // Détecte appareil/OS/navigateur
```

## 📝 Exemple d'Utilisation

### Enregistrer un Événement d'Audit
```typescript
import { logAuditEvent, getClientIP, getDeviceInfo } from '@/utils/apiSecurity';

// Lors de la création d'un client
await logAuditEvent({
  userId: currentUser.id,
  userName: currentUser.name,
  userRole: currentUser.role,
  eventType: 'create',
  action: 'Création d\'un nouveau client',
  resourceType: 'client',
  resourceId: newClient.id,
  details: `Client "${newClient.name}" créé avec succès`,
  ipAddress: await getClientIP(),
  userAgent: navigator.userAgent,
  severity: 'success',
  status: 'success'
});
```

### Créer une Session à la Connexion
```typescript
import { createSession, getDeviceInfo, getClientIP } from '@/utils/apiSecurity';

const deviceInfo = getDeviceInfo();
const ipAddress = await getClientIP();

await createSession({
  userId: user.id,
  deviceName: `${deviceInfo.os} - ${deviceInfo.browser}`,
  deviceType: deviceInfo.deviceType,
  browser: deviceInfo.browser,
  os: deviceInfo.os,
  ipAddress: ipAddress,
  location: 'Yaoundé, Cameroun', // À obtenir via une API de géolocalisation
  lastActivity: new Date(),
  isCurrent: true,
  expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 jours
});
```

## 🛡️ Politiques de Sécurité (RLS)

Les politiques de sécurité au niveau des lignes (Row Level Security) garantissent que :
- Les utilisateurs ne voient que leurs propres sessions
- Les utilisateurs ne voient que leur propre configuration 2FA
- Seuls les admins peuvent consulter le journal d'audit complet
- Les utilisateurs voient uniquement leurs propres alertes de sécurité

## 📈 Statistiques et Métriques

### Sessions
- Total de sessions
- Sessions actives (activité < 30 min)
- Nombre d'appareils uniques

### Audit
- Total d'événements
- Nombre de succès
- Nombre d'avertissements
- Nombre d'erreurs

## ⚙️ Configuration Recommandée pour la Production

### 1. Bibliothèques Nécessaires
```bash
npm install speakeasy qrcode bcrypt
```

### 2. Variables d'Environnement
```env
# Sécurité
2FA_SECRET_ENCRYPTION_KEY=your-encryption-key-here
SESSION_SECRET=your-session-secret-here
JWT_SECRET=your-jwt-secret-here

# Supabase
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-key
```

### 3. Configuration 2FA Réelle
Remplacer le code de démonstration par une vraie implémentation avec `speakeasy` :

```typescript
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';

// Génération du secret
const secret = speakeasy.generateSecret({
  name: `SaddlePoint (${user.email})`,
  issuer: 'SaddlePoint'
});

// Génération du QR Code
const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);

// Vérification du code
const isValid = speakeasy.totp.verify({
  secret: secret.base32,
  encoding: 'base32',
  token: userCode,
  window: 2 // Permet ±1 intervalle de temps
});
```

### 4. Géolocalisation IP
Intégrer une API de géolocalisation (ipapi.co, ipstack, etc.) :

```typescript
async function getLocationFromIP(ip: string) {
  const response = await fetch(`https://ipapi.co/${ip}/json/`);
  const data = await response.json();
  return `${data.city}, ${data.country_name}`;
}
```

### 5. Tâches Cron
Configurer des tâches planifiées pour le nettoyage :

```sql
-- Installer pg_cron
CREATE EXTENSION pg_cron;

-- Nettoyer les sessions expirées chaque nuit à 2h
SELECT cron.schedule('cleanup-sessions', '0 2 * * *', 
  'SELECT cleanup_expired_sessions()');

-- Nettoyer les tentatives échouées anciennes à 3h
SELECT cron.schedule('cleanup-failed-attempts', '0 3 * * *', 
  'SELECT cleanup_old_failed_attempts()');
```

## 🚨 Détection d'Activités Suspectes

### Indicateurs à Surveiller
- ❌ Plus de 3 tentatives de connexion échouées en 15 minutes
- 🌍 Connexions depuis des IP/pays inhabituels
- 🕐 Actions sensibles en dehors des heures normales
- 🔄 Changements de permissions fréquents
- 📊 Exports massifs de données
- 📍 Sessions simultanées depuis des localisations éloignées

### Actions Recommandées
1. Bloquer temporairement après 5 échecs
2. Envoyer alerte email pour nouvelle IP
3. Demander 2FA pour actions critiques
4. Logger toutes les actions sensibles
5. Révoquer sessions inactives > 30 jours

## 📚 Documentation Complète

Pour plus de détails, consultez :
- [SECURITY_SYSTEM.md](../guidelines/SECURITY_SYSTEM.md) - Documentation complète
- [security_tables.sql](../sql/security_tables.sql) - Schéma de base de données

## 🎯 Améliorations Futures

### Court terme
- [ ] API de géolocalisation IP en temps réel
- [ ] Système d'alertes en temps réel
- [ ] Export automatique des logs vers stockage externe
- [ ] Interface de recherche avancée avec regex

### Moyen terme
- [ ] Détection ML d'activités suspectes
- [ ] Dashboard de sécurité avec KPIs
- [ ] Intégration SIEM
- [ ] Authentification biométrique

### Long terme
- [ ] Analyse comportementale des utilisateurs
- [ ] Scoring de risque par utilisateur
- [ ] Système de réponse automatique aux incidents
- [ ] Threat intelligence

## 🔗 Conformité et Réglementation

Ce système aide à la conformité avec :
- ✓ **RGPD** - Traçabilité des accès aux données personnelles
- ✓ **ISO 27001** - Gestion de la sécurité de l'information
- ✓ **SOC 2** - Contrôles de sécurité et de disponibilité

## 👥 Rôles et Permissions

| Fonctionnalité | Superadmin | Admin | Autres |
|----------------|------------|-------|--------|
| Configuration 2FA propre | ✅ | ✅ | ✅ |
| Gestion sessions propres | ✅ | ✅ | ✅ |
| Journal d'audit complet | ✅ | ✅ | ❌ |
| Alertes de sécurité | ✅ | ✅ | Leurs propres |

## 📞 Support

Pour toute question ou problème :
1. Consultez la documentation complète
2. Vérifiez les logs d'erreur dans la console
3. Contactez l'équipe de développement

---

**Version :** 1.0.0  
**Date de création :** Décembre 2024  
**Auteur :** Équipe SaddlePoint  
**Statut :** ✅ Prêt pour la production (après intégration des APIs réelles)
