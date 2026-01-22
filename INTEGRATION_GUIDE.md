# 🔧 Installation du Module de Sécurité

## ✅ Un Seul Fichier à Exécuter

**Fichier:** `sql/security_integration.sql`

Ce fichier contient **TOUTES** les modifications SQL nécessaires. Pas besoin d'autre chose !

## 📋 Ce que votre base a déjà

Votre fichier `sps.sql` contient déjà :
- ✅ Table `profiles` (utilisateurs)
- ✅ Table `user_sessions` (sera enrichie)
- ✅ Table `alerts` (alertes système)
- ✅ Table `notifications` (notifications)
- ✅ Toutes les tables métier (clients, ventes, articles, etc.)

## 🆕 Ce qui sera ajouté

Le fichier `security_integration.sql` va :

### 1. Enrichir `user_sessions` existante
Ajoute 9 colonnes pour le tracking détaillé :
- `device_name`, `device_type`, `browser`, `os`
- `location`, `token`, `is_current`
- `last_activity`, `expires_at`

### 2. Créer 5 nouvelles tables
- **`audit_logs`** - Journal complet des actions
- **`user_2fa`** - Configuration 2FA par utilisateur
- **`failed_login_attempts`** - Détection des intrusions
- **`security_alerts`** - Alertes de sécurité (différent de `alerts` existant)
- **`password_history`** - Empêche réutilisation des anciens MDP

### 3. Créer 4 vues utiles
- `active_sessions` - Sessions actives en temps réel
- `audit_stats_by_user` - Stats par utilisateur
- `unacknowledged_alerts` - Alertes non traitées
- `recent_failed_logins` - Tentatives récentes

### 4. Créer 4 fonctions
- `cleanup_expired_sessions()` - Nettoyage auto
- `cleanup_old_failed_attempts()` - Nettoyage tentatives
- `limit_password_history()` - Garde 5 derniers MDP
- `detect_brute_force_attempt()` - Détection attaques

## 🚀 Installation en 3 étapes

### Étape 1 : Ouvrir Supabase
```
1. Allez sur https://supabase.com/dashboard
2. Sélectionnez votre projet
3. Cliquez sur "SQL Editor" dans le menu
```

### Étape 2 : Exécuter le script
```
1. Cliquez sur "New Query"
2. Copiez TOUT le contenu de sql/security_integration.sql
3. Collez dans l'éditeur
4. Cliquez sur "Run" (ou Ctrl+Enter)
```

### Étape 3 : Vérifier
```
Vous devriez voir un message de succès dans la console :
✅ MODULE DE SÉCURITÉ INSTALLÉ AVEC SUCCÈS
```

## ⏱️ Durée

- **Exécution:** ~30 secondes
- **Temps total:** 2-3 minutes

## 🎯 Compatibilité

✅ Compatible avec votre base actuelle (`sps.sql`)
✅ Ne supprime aucune donnée existante
✅ Peut être réexécuté sans problème (idempotent)
✅ Les tables existantes (`alerts`, `notifications`) restent intactes

## ✅ Après l'installation

### L'application est prête !
Tous les composants React sont déjà intégrés :
- ✅ Route `/security` disponible
- ✅ Menu Sécurité visible (Superadmin/Admin)
- ✅ 3 onglets : Paramètres, Sessions, Audit
- ✅ API configurée

### Pas besoin de redéployer !
Le module fonctionne immédiatement après l'exécution SQL.

## 🔍 Vérification Rapide

Dans Supabase SQL Editor, exécutez :
```sql
-- Vérifier les tables
SELECT COUNT(*) FROM audit_logs;           -- Devrait fonctionner
SELECT COUNT(*) FROM user_2fa;             -- Devrait fonctionner
SELECT COUNT(*) FROM failed_login_attempts;-- Devrait fonctionner

-- Vérifier les vues
SELECT * FROM active_sessions;             -- Devrait être vide au début
```

## 📚 Documentation Complète

- **`guidelines/SECURITY_SYSTEM.md`** - Guide détaillé du système
- **`guidelines/SECURITY_README.md`** - Vue d'ensemble et exemples
- **`src/utils/apiSecurity.ts`** - Toutes les fonctions API

## 🆘 Support

### Problèmes courants

**"Table already exists"**
→ Normal si vous réexécutez. Le script gère ça avec `IF NOT EXISTS`

**"Column already exists"**  
→ Normal aussi. Le script gère les réexécutions

**"Permission denied"**
→ Vérifiez que vous êtes le propriétaire de la base dans Supabase

**Les alertes de sécurité ne s'affichent pas**
→ C'est normal, elles seront créées automatiquement lors d'événements suspects

---

## 🎉 C'est tout !

**Un seul fichier SQL** → **Module complet fonctionnel**

Le fichier `security_integration.sql` contient absolument tout ce dont vous avez besoin.
