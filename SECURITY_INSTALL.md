# 🔐 Module de Sécurité - Installation Rapide

## ✅ Résumé Simple

**Pour activer le module de sécurité :**

### 1 seul fichier SQL à exécuter :
```
sql/security_integration.sql
```

### Étapes (2 minutes) :
1. Ouvrez votre Supabase Dashboard
2. SQL Editor → New Query
3. Copiez tout le contenu de `sql/security_integration.sql`
4. Cliquez "Run"
5. ✅ Module actif !

---

## 📋 Ce qui est inclus

### Interface Web (déjà intégré ✅)
- Route `/security` fonctionnelle
- Menu "Sécurité" visible (admins)
- 3 onglets : Paramètres / Sessions / Audit

### Base de Données (après SQL ⏳)
- `audit_logs` - Journal complet des actions
- `user_2fa` - Authentification 2FA
- `failed_login_attempts` - Détection intrusions
- `security_alerts` - Alertes sécurité
- `password_history` - Historique MDP
- `user_sessions` - Sessions enrichies

---

## 🎯 Fonctionnalités

### ✅ Authentification 2FA
- QR Code pour Google Authenticator
- 10 codes de secours
- Validation 6 chiffres

### ✅ Gestion Sessions
- Liste toutes les sessions actives
- Info détaillée (appareil, OS, IP, localisation)
- Révocation individuelle ou massive

### ✅ Journal d'Audit
- 10 types d'événements trackés
- Filtres avancés (recherche, type, période)
- Statistiques en temps réel

### ✅ Sécurité Mots de Passe
- Validation force (5 critères)
- Indicateur visuel
- Historique (empêche réutilisation)

---

## 📚 Documentation Complète

Si besoin de détails :
- `INTEGRATION_GUIDE.md` - Guide installation
- `sql/README.md` - Explication fichiers SQL
- `guidelines/SECURITY_SYSTEM.md` - Documentation technique
- `guidelines/SECURITY_README.md` - Vue d'ensemble

---

## ⚠️ Important

### Votre base actuelle (`sps.sql`)
✅ Déjà exécutée
✅ Contient : profiles, clients, ventes, alerts, notifications
✅ Compatible avec le module de sécurité

### Fichier à ignorer
❌ `sql/security_tables.sql` - Version générique (remplacée)

### Fichier à exécuter
✅ `sql/security_integration.sql` - Version adaptée à votre base

---

## 🚀 Après l'installation

L'application web fonctionne immédiatement :
1. Lancez votre app
2. Connectez-vous (superadmin/admin)
3. Cliquez sur "Sécurité" dans le menu
4. Profitez ! 🎉

---

**Tout est prêt côté code, il suffit d'exécuter le SQL !**
