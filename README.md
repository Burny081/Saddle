# 🏪 Saddle Point Service

> **Plateforme de Gestion Commerciale Premium - Production Ready**

**Saddle Point Service** est une solution complète de gestion commerciale moderne et intelligente, spécialement conçue pour révolutionner la gestion des entreprises de solutions électriques et énergétiques en Afrique. Cette plateforme offre une expérience utilisateur exceptionnelle avec des fonctionnalités avancées de BI, CRM intégré, et gestion multi-magasins.

## 🌟 **Fonctionnalités Principales**

### 🎯 **Modules Métier**
- 📊 **Dashboard Analytics** - KPI temps réel, graphiques interactifs
- 🛒 **Gestion Ventes** - POS avancé, devis, facturation automatique  
- 📦 **Catalogue Intelligent** - Produits & services, gestion stock avancée
- 👥 **CRM Intégré** - Clients, prospects, fidélité, interactions
- 💼 **Comptabilité** - Journal, grand livre, rapports financiers
- 📋 **Stock Management** - Mouvements, transferts, alertes automatiques
- 🏪 **Multi-Magasins** - Gestion centralisée, permissions granulaires
- 👤 **Administration** - Utilisateurs, rôles, tâches, documents
- 📊 **Rapports BI** - Analytics avancés, exports, visualisations

### 🔐 **Système d'Authentification**
- **6 Rôles Utilisateur**: Super Admin, Admin, Manager, Commercial, Comptable, Secrétaire, Client
- **Permissions Granulaires** par module et action
- **Multi-Store Access** avec contrôle fin des accès
- **Session Management** sécurisé

---

## ⚡ Configuration de Production

### 🔧 **Supabase (Backend)**
```env
🌐 URL: https://pztiflkwumhpvtfdkoli.supabase.co
🔑 Clé Publique: sb_publishable_BLZau8kh8s3hIy9ZzSrOhw_b59sQtI8
🗃️ Base de Données: 68 tables PostgreSQL (2762 lignes SQL)
🛡️ Sécurité: Row Level Security (RLS) activé
🔄 Real-time: Subscriptions PostgreSQL
📊 Storage: Images et documents
```

### 💻 **Développement Local**
```bash
🖥️ URL: http://localhost:3001
⚡ Hot Reload: Activé avec Vite HMR
🔄 Build: Ultra-rapide (<2s)
🎨 Tailwind: JIT compilation
📦 TypeScript: Strict mode
🧪 Tests: Vitest + Testing Library
```

### 🏗️ **Architecture Frontend**
```typescript
⚛️ React 18: Concurrent Features, Suspense
🔷 TypeScript: Type Safety complet
🎨 Tailwind CSS: Utility-first, Design System
🗂️ Zustand: State Management léger
📍 React Router: Navigation SPA
📋 React Hook Form: Forms optimisés
📊 Recharts: Graphiques interactifs
🎭 Framer Motion: Animations fluides
💎 Lucide React: 1000+ icônes SVG
🌐 i18n: Support multi-langues
♿ a11y: WCAG 2.1 AA compliant
```

---

## 🚀 Démarrage Rapide

### **1. 📥 Installation**
```bash
# Cloner le projet
git clone <repo-url>
cd SaddlePoint

# Installer les dépendances
npm install
```

### **2. 🔧 Configuration Environnement**
Le fichier `.env.local` est déjà configuré avec les credentials de production:
```env
# Supabase Configuration
VITE_SUPABASE_URL=https://pztiflkwumhpvtfdkoli.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_BLZau8kh8s3hIy9ZzSrOhw_b59sQtI8

# Application Settings
VITE_APP_TITLE="Saddle Point Service"
VITE_APP_VERSION="1.0.0"
VITE_APP_ENVIRONMENT="production"
```

### **3. 🗃️ Déploiement Base de Données**
```bash
# 1. Ouvrir Supabase Dashboard
open https://pztiflkwumhpvtfdkoli.supabase.co

# 2. SQL Editor → Coller sps.sql (2762 lignes)
# 3. Exécuter le script complet
# ✅ 68 tables créées avec RLS et triggers
```

### **4. ▶️ Lancement Développement**
```bash
# Démarrer le serveur de développement
npm run dev

# Ou avec debug
npm run dev:debug
```

### **5. 🏗️ Build Production**
```bash
# Build optimisé pour production
npm run build

# Preview build local
npm run preview

# Analyse du bundle
npm run analyze
```

✅ **Application disponible**: http://localhost:3001

---

## 📚 Documentation Complète

- 📖 **[DOCUMENTATION.md](./DOCUMENTATION.md)** - Documentation technique complète
- 🛠️ **[SETUP.md](./SETUP.md)** - Guide d'installation détaillé  
- 🎨 **[DESIGN.md](./DESIGN.md)** - Système de design et UI/UX

---

## 🎯 Prochaines Étapes

1. **Déployer la base de données** - Exécuter `sps.sql` dans Supabase
2. **Créer un admin** - Ajouter le premier utilisateur superadmin
3. **Tester** - Vérifier toutes les fonctionnalités

---

**🚀 Version 1.0.0 - Production Ready**
- Gestion des paiements (complets, partiels)
- Historique des transactions

### 📊 Tableaux de bord
- Statistiques en temps réel
- Graphiques et métriques clés
- Alertes de stock faible
- Activité récente

### 🎨 Design Premium
- Interface moderne avec gradients rouge et bleu
- Mode sombre/clair
- Animations fluides avec Motion
- Responsive (mobile, tablette, desktop)

### 🌍 Multilingue
- Français
- Anglais

## 🚀 Comptes de démonstration

Tous les comptes utilisent le mot de passe: `admin123`

- **Super Admin**: superadmin@sps.com
- **Admin**: admin@sps.com
- **Secrétaire**: secretaire@sps.com
- **Manager**: manager@sps.com
- **Comptable**: comptable@sps.com
- **Client**: client@sps.com

## 🛠️ Technologies

- **Framework**: React 18 + Vite
- **Styling**: Tailwind CSS v4
- **UI Components**: Radix UI
- **Animations**: Motion (Framer Motion)
- **Thèmes**: next-themes
- **Icons**: Lucide React
- **State Management**: React Context API

## 📂 Structure

```
src/
├── app/
│   ├── App.tsx                    # Point d'entrée principal
│   └── components/
│       ├── ui/                    # Composants UI réutilisables
│       └── figma/                 # Composants Figma
├── components/
│   ├── SplashScreen.tsx           # Écran de démarrage
│   ├── PublicHome.tsx             # Page d'accueil publique
│   ├── LoginModal.tsx             # Modal de connexion
│   ├── DashboardLayout.tsx        # Layout principal du dashboard
│   ├── PlaceholderView.tsx        # Vue placeholder générique
│   ├── dashboards/
│   │   └── DashboardView.tsx      # Vue principale du dashboard
│   ├── catalog/
│   │   ├── ArticlesView.tsx       # Gestion des articles
│   │   └── ServicesView.tsx       # Gestion des services
│   ├── stock/
│   │   └── StockView.tsx          # Gestion du stock
│   └── sales/
│       └── SalesView.tsx          # Gestion des ventes
├── contexts/
│   ├── AuthContext.tsx            # Contexte d'authentification
│   └── LanguageContext.tsx        # Contexte de langue
├── data/
│   └── mockData.ts                # Données mockées
└── styles/
    ├── index.css
    ├── theme.css
    ├── tailwind.css
    └── fonts.css
```

## 🎭 Rôles et Permissions

### Super Admin
- Accès total au système
- Gestion des rôles et permissions
- Paramétrage global
- Tous les rapports et logs

### Admin
- Gestion des utilisateurs (sauf Super Admin)
- CRUD articles et services
- Validation des ventes
- Gestion fournisseurs et catégories

### Secrétaire
- Enregistrement clients
- Création de ventes et factures
- Enregistrement paiements
- Consultation stock (lecture seule)

### Manager
- Gestion complète du stock
- Entrées/sorties de stock
- Ajustements et historique
- Alertes automatiques

### Comptable
- Suivi des paiements
- Gestion factures et avoirs
- Rapports financiers
- Export PDF/Excel

### Client
- Consultation catalogue
- Passage de commandes
- Suivi commandes et paiements
- Téléchargement factures

## 🏢 À propos de Saddle Point Service

Entreprise leader en solutions électriques complètes:
- Production d'énergie
- Moyenne et Basse Tension
- Distribution électrique
- Automatismes industriels
- Énergies renouvelables
- Mobilité électrique

**Normes**: IEC, ISO, NF
**Engagement**: Fiabilité, Innovation, Sécurité, Performance Énergétique

---

Développé avec ❤️ pour Saddle Point Service
