# 📂 Fichiers SQL - SaddlePoint

## 📋 Liste des fichiers

### 1. `sps.sql` ✅
**Statut:** Déjà exécuté dans votre base de données

**Contenu:**
- Toutes les tables métier (clients, articles, ventes, etc.)
- Table `profiles` (utilisateurs)
- Table `user_sessions` (sessions de base)
- Table `alerts` (alertes système)
- Table `notifications` (notifications)
- Toutes les tables de configuration
- ~2800 lignes

**Action:** Rien à faire, c'est votre base actuelle

---

### 2. `security_integration.sql` 🆕
**Statut:** À EXÉCUTER MAINTENANT

**Contenu:**
- Enrichissement de `user_sessions` (9 colonnes ajoutées)
- 5 nouvelles tables pour la sécurité
- 4 vues utiles
- 4 fonctions automatiques
- Politiques RLS

**Action:** Exécuter dans Supabase SQL Editor

**Ce fichier contient TOUT ce qu'il faut pour le module de sécurité**

---

### 3. `security_tables.sql` ⚠️
**Statut:** NE PAS UTILISER

**Raison:** 
- Version générique (utilise `users` au lieu de `profiles`)
- Remplacé par `security_integration.sql`
- Gardé uniquement pour référence

**Action:** Ignorer ce fichier

---

### 4. `comptable_commercial.sql` ℹ️
**Statut:** Optionnel (fonctionnalités spécifiques)

**Contenu:** Fonctions spéciales pour comptabilité/commercial

**Action:** Si nécessaire pour ces modules spécifiques

---

### 5. `comptable_commercial_functions.sql` ℹ️
**Statut:** Optionnel (complémentaire)

**Contenu:** Fonctions additionnelles

**Action:** Si nécessaire

---

## 🎯 Pour installer le module de sécurité

### Un seul fichier à exécuter :

```
sql/security_integration.sql
```

### Étapes :
1. Ouvrez Supabase Dashboard
2. SQL Editor → New Query
3. Copiez `security_integration.sql`
4. Run
5. ✅ Terminé !

---

## 📊 Structure finale de votre base

Après avoir exécuté `security_integration.sql`, vous aurez :

```
Base de données SaddlePoint
│
├── Tables métier (de sps.sql)
│   ├── profiles (utilisateurs)
│   ├── clients
│   ├── articles
│   ├── sales
│   ├── stores
│   ├── alerts (alertes système)
│   ├── notifications
│   └── ... (toutes les autres)
│
└── Tables sécurité (de security_integration.sql)
    ├── user_sessions (enrichie)
    ├── audit_logs (nouveau)
    ├── user_2fa (nouveau)
    ├── failed_login_attempts (nouveau)
    ├── security_alerts (nouveau)
    └── password_history (nouveau)
```

---

## ❓ Questions fréquentes

**Q: Dois-je exécuter sps.sql à nouveau ?**  
R: Non, c'est déjà fait

**Q: Dois-je exécuter security_tables.sql ?**  
R: Non, utilisez security_integration.sql à la place

**Q: security_integration.sql va-t-il casser ma base ?**  
R: Non, il ajoute seulement ce qui manque

**Q: Combien de fichiers SQL dois-je exécuter ?**  
R: Un seul : `security_integration.sql`

**Q: Que faire des anciennes sessions dans user_sessions ?**  
R: Rien, elles restent compatibles (nouvelles colonnes = NULL)

---

## 📚 Documentation

Pour plus d'infos, voir :
- `INTEGRATION_GUIDE.md` (à la racine)
- `guidelines/SECURITY_SYSTEM.md`
- `guidelines/SECURITY_README.md`
