# Système de Sécurité Avancée

## Vue d'ensemble

Le module de sécurité avancée fournit une suite complète d'outils pour protéger votre application et surveiller les activités des utilisateurs. Il comprend trois composants principaux :

1. **Paramètres de Sécurité** - Gestion de l'authentification à deux facteurs (2FA) et des mots de passe
2. **Gestion des Sessions** - Surveillance et contrôle des sessions actives sur différents appareils
3. **Journal d'Audit** - Historique complet de toutes les actions effectuées dans le système

## Fonctionnalités

### 1. Authentification à Deux Facteurs (2FA)

#### Description
L'authentification à deux facteurs ajoute une couche de sécurité supplémentaire en demandant un code de vérification en plus du mot de passe.

#### Fonctionnalités
- **Activation/Désactivation** : Active ou désactive la 2FA pour votre compte
- **QR Code** : Génération d'un QR code à scanner avec une application d'authentification (Google Authenticator, Authy, Microsoft Authenticator)
- **Codes de secours** : Génération de 10 codes de secours pour l'accès en cas de perte du dispositif d'authentification
- **Vérification** : Validation du code à 6 chiffres pour confirmer l'activation

#### Utilisation
1. Cliquez sur "Activer 2FA"
2. Scannez le QR code avec votre application d'authentification
3. Entrez le code de vérification à 6 chiffres
4. Sauvegardez les codes de secours en lieu sûr

#### Intégration Production
Pour la production, vous devrez :
- Générer un secret unique par utilisateur (bibliothèque : `speakeasy`)
- Créer le QR code avec `qrcode` ou `qrcode.react`
- Stocker le secret crypté dans la base de données
- Valider les codes avec la bibliothèque `speakeasy`

```typescript
// Exemple d'intégration
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';

// Génération du secret
const secret = speakeasy.generateSecret({
  name: 'SaddlePoint (user@example.com)'
});

// Génération du QR Code
const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);

// Validation du code
const verified = speakeasy.totp.verify({
  secret: secret.base32,
  encoding: 'base32',
  token: userInputCode
});
```

### 2. Sécurité du Mot de Passe

#### Description
Système de validation et de force du mot de passe avec indicateur visuel.

#### Exigences du Mot de Passe
- ✓ Au moins 8 caractères
- ✓ Au moins une majuscule (A-Z)
- ✓ Au moins une minuscule (a-z)
- ✓ Au moins un chiffre (0-9)
- ✓ Au moins un caractère spécial (!@#$%^&*)

#### Indicateur de Force
- **Faible** (1-2 critères) : Rouge
- **Moyen** (3 critères) : Jaune
- **Bon** (4 critères) : Bleu
- **Excellent** (5 critères) : Vert

### 3. Gestion des Sessions

#### Description
Vue complète de toutes les sessions actives sur différents appareils avec possibilité de les révoquer.

#### Informations Affichées
- **Appareil** : Type (desktop, mobile, tablet) et nom
- **Système** : Navigateur et OS
- **Localisation** : Ville et pays basés sur l'IP
- **Adresse IP** : Adresse IP de connexion
- **Activité** : Dernière activité et temps écoulé
- **Date de création** : Date de début de la session

#### Fonctionnalités
- **Session actuelle** : Badge vert indiquant la session en cours
- **Révoquer une session** : Déconnecte un appareil spécifique
- **Révoquer toutes les sessions** : Déconnecte tous les appareils sauf le courant
- **Statistiques** : Nombre total de sessions, sessions actives, appareils

#### Intégration Production
```typescript
// Structure de session en base de données
interface SessionDB {
  id: string;
  user_id: string;
  token: string; // JWT ou session token
  device_name: string;
  device_type: 'desktop' | 'mobile' | 'tablet';
  browser: string;
  os: string;
  ip_address: string;
  location: string; // À partir de l'IP
  last_activity: Date;
  created_at: Date;
  expires_at: Date;
}

// API endpoints nécessaires
- GET /api/sessions - Liste des sessions
- DELETE /api/sessions/:id - Révoquer une session
- DELETE /api/sessions/others - Révoquer toutes sauf actuelle
```

### 4. Journal d'Audit

#### Description
Historique complet et détaillé de toutes les actions effectuées dans le système.

#### Types d'Événements
- **Connexion** : Connexion réussie
- **Déconnexion** : Déconnexion
- **Création** : Création d'une entité (client, article, facture, etc.)
- **Modification** : Mise à jour d'une entité
- **Suppression** : Suppression d'une entité
- **Export** : Export de données
- **Import** : Import de données
- **Permissions** : Changement de permissions utilisateur
- **Paramètres** : Modification des paramètres système
- **Connexion échouée** : Tentative de connexion infructueuse

#### Niveaux de Sévérité
- **Success** (Vert) : Action réussie normale
- **Info** (Bleu) : Information non critique
- **Warning** (Jaune) : Action sensible (suppression, modification de permissions)
- **Error** (Rouge) : Erreur ou tentative d'intrusion

#### Informations Enregistrées
- **Timestamp** : Date et heure exacte
- **Utilisateur** : Nom et rôle
- **Action** : Description de l'action
- **Type d'événement** : Catégorie d'événement
- **Ressource** : Type et ID de la ressource affectée
- **Détails** : Description détaillée avec anciennes/nouvelles valeurs
- **IP** : Adresse IP source
- **User Agent** : Navigateur et système

#### Filtres Disponibles
- **Recherche** : Par nom d'utilisateur, action, détails, IP, ID de ressource
- **Type d'événement** : Tous les types d'événements
- **Sévérité** : Tous les niveaux
- **Période** : Date de début et de fin

#### Statistiques
- Total événements
- Nombre de succès
- Nombre d'avertissements
- Nombre d'erreurs

#### Export
Possibilité d'exporter les logs en CSV ou PDF pour archivage ou audit.

#### Intégration Production

##### Structure en Base de Données
```sql
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    user_id UUID REFERENCES users(id),
    user_name VARCHAR(255),
    user_role VARCHAR(50),
    event_type VARCHAR(50) NOT NULL,
    action TEXT NOT NULL,
    resource_type VARCHAR(50),
    resource_id VARCHAR(100),
    details TEXT,
    ip_address INET NOT NULL,
    user_agent TEXT,
    severity VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_timestamp ON audit_logs(timestamp DESC);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_event_type ON audit_logs(event_type);
CREATE INDEX idx_audit_logs_severity ON audit_logs(severity);
```

##### Fonction d'Enregistrement
```typescript
interface AuditLogEntry {
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

// Fonction utilitaire pour enregistrer dans les logs
async function logAuditEvent(entry: AuditLogEntry) {
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
      status: entry.status
    });
  
  if (error) {
    console.error('Erreur lors de l\'enregistrement du log d\'audit:', error);
  }
  return data;
}

// Exemple d'utilisation
await logAuditEvent({
  userId: user.id,
  userName: user.name,
  userRole: user.role,
  eventType: 'create',
  action: 'Création d\'un nouveau client',
  resourceType: 'client',
  resourceId: newClient.id,
  details: `Client "${newClient.name}" créé avec succès`,
  ipAddress: req.ip,
  userAgent: req.headers['user-agent'],
  severity: 'success',
  status: 'success'
});
```

##### Intégration dans l'Application
Pour chaque action critique dans votre application, ajoutez un appel à `logAuditEvent()` :

```typescript
// Exemple : Création d'un client
const handleCreateClient = async (clientData) => {
  try {
    // Créer le client
    const newClient = await createClient(clientData);
    
    // Log l'action
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
    
    return newClient;
  } catch (error) {
    // Log l'erreur
    await logAuditEvent({
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      eventType: 'create',
      action: 'Tentative de création d\'un client',
      resourceType: 'client',
      details: `Échec de création: ${error.message}`,
      ipAddress: await getClientIP(),
      userAgent: navigator.userAgent,
      severity: 'error',
      status: 'failed'
    });
    throw error;
  }
};

// Exemple : Modification de permissions
await logAuditEvent({
  eventType: 'permission_change',
  action: 'Modification des permissions utilisateur',
  resourceType: 'user',
  resourceId: targetUser.id,
  details: `Utilisateur "${targetUser.name}" promu de "${oldRole}" à "${newRole}"`,
  severity: 'warning',
  status: 'success'
});

// Exemple : Tentative de connexion échouée
await logAuditEvent({
  userId: 'unknown',
  userName: 'Utilisateur inconnu',
  userRole: 'unknown',
  eventType: 'failed_login',
  action: 'Tentative de connexion échouée',
  details: `Email: ${email} - Mot de passe incorrect (${attemptCount}ème tentative)`,
  severity: 'error',
  status: 'failed'
});
```

## Conseils de Sécurité

### Pour les Utilisateurs
1. ✓ Activez l'authentification à deux facteurs
2. ✓ Utilisez un mot de passe unique et complexe
3. ✓ Changez votre mot de passe régulièrement (tous les 3-6 mois)
4. ✓ Ne partagez jamais votre mot de passe
5. ✓ Utilisez un gestionnaire de mots de passe (LastPass, 1Password, Bitwarden)
6. ✓ Vérifiez régulièrement vos sessions actives
7. ✓ Révoquez les sessions inactives
8. ✓ Ne vous connectez pas depuis un ordinateur public
9. ✓ Consultez le journal d'audit régulièrement

### Pour les Administrateurs
1. ✓ Forcez la 2FA pour tous les utilisateurs avec des privilèges élevés
2. ✓ Surveillez les tentatives de connexion échouées
3. ✓ Vérifiez régulièrement le journal d'audit
4. ✓ Alertez en cas d'activité suspecte
5. ✓ Révoquez immédiatement les sessions suspectes
6. ✓ Mettez en place des politiques de mot de passe strictes
7. ✓ Configurez des alertes pour les événements critiques
8. ✓ Exportez et archivez les logs régulièrement
9. ✓ Limitez les permissions au strict nécessaire

## Détection d'Activité Suspecte

### Indicateurs à Surveiller
- **Tentatives de connexion échouées répétées** : Plus de 3 échecs en moins de 15 minutes
- **Connexions depuis des IP inhabituelles** : IP jamais vue auparavant
- **Connexions depuis des pays inattendus** : Localisation géographique suspecte
- **Actions sensibles en dehors des heures normales** : Suppressions ou modifications à 3h du matin
- **Changements de permissions fréquents** : Multiple changements de rôles en peu de temps
- **Exports massifs de données** : Téléchargement de grandes quantités de données
- **Sessions simultanées depuis des localisations éloignées** : Paris et Tokyo en même temps

### Actions Automatiques Recommandées
- Bloquer temporairement un compte après 5 tentatives échouées
- Envoyer une alerte email lors d'une connexion depuis une nouvelle IP
- Demander une vérification 2FA supplémentaire pour les actions critiques
- Logger toutes les actions sensibles (suppressions, exports, changements de permissions)
- Révoquer automatiquement les sessions inactives depuis 30 jours

## Conformité et Réglementation

Ce système d'audit aide à la conformité avec :
- **RGPD** : Traçabilité des accès aux données personnelles
- **ISO 27001** : Gestion de la sécurité de l'information
- **SOC 2** : Contrôles de sécurité et de disponibilité
- **HIPAA** (si applicable) : Protection des données de santé

## Accès

Le module de sécurité est accessible depuis la navigation principale pour les rôles :
- **Superadmin** : Accès complet à tous les onglets
- **Admin** : Accès complet à tous les onglets

## Navigation

Le module est organisé en 3 onglets :
1. **Paramètres** : 2FA et sécurité du mot de passe
2. **Sessions** : Gestion des sessions actives
3. **Journal d'Audit** : Historique complet des événements

## Améliorations Futures

### Court terme
- [ ] Intégration de l'API de géolocalisation pour la localisation précise des IP
- [ ] Système d'alertes en temps réel pour les événements critiques
- [ ] Export automatique des logs vers un stockage externe
- [ ] Interface de recherche avancée avec regex

### Moyen terme
- [ ] Détection automatique d'activités suspectes avec machine learning
- [ ] Tableau de bord de sécurité avec graphiques et KPIs
- [ ] Intégration avec des systèmes SIEM (Security Information and Event Management)
- [ ] Authentification biométrique (empreinte digitale, reconnaissance faciale)

### Long terme
- [ ] Analyse comportementale des utilisateurs
- [ ] Scoring de risque par utilisateur et action
- [ ] Système de réponse automatique aux incidents
- [ ] Intégration avec des solutions de threat intelligence
