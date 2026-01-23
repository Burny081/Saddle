# Guide de Migration & Déploiement

## 🎯 Objectif

Ce guide vous aide à déployer le système client complet sur un nouvel environnement.

## 📋 Pré-requis

- [x] Node.js 18+ installé
- [x] npm ou yarn installé
- [x] Compte Supabase actif
- [x] Git installé (optionnel)

## 🚀 Étape 1 : Clone/Récupération du projet

```bash
# Si depuis Git
git clone <votre-repo-url>
cd SaddlePoint

# Si depuis archive
# Extraire l'archive dans un dossier
cd SaddlePoint
```

## 🔧 Étape 2 : Configuration Supabase

### 2.1 Créer le projet Supabase

1. Aller sur [https://supabase.com](https://supabase.com)
2. Créer un nouveau projet
3. Noter l'URL et la clé anon

### 2.2 Exécuter le schéma de base de données

```bash
# Option 1 : Via l'interface Supabase
# - Aller dans SQL Editor
# - Copier le contenu de sps.sql
# - Exécuter

# Option 2 : Via CLI Supabase
supabase db push
```

Le fichier `sps.sql` contient :
- ✅ 21 sections de tables
- ✅ Toutes les contraintes et indexes
- ✅ Row Level Security (RLS)
- ✅ Triggers et fonctions

### 2.3 Configurer les variables d'environnement

Créer un fichier `.env` à la racine :

```env
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_ANON_KEY=votre_cle_anon_publique
```

⚠️ **Important** : Ne jamais commiter le fichier `.env` (déjà dans `.gitignore`)

### 2.4 Désactiver la vérification email (optionnel)

Dans Supabase Dashboard :
1. Authentication → Settings
2. Désactiver "Enable email confirmations"
3. Cela permet l'inscription instantanée sans email

## 📦 Étape 3 : Installation des dépendances

```bash
npm install
```

Cela installe :
- React 18.3.1
- TypeScript
- Vite 6.4.1
- Supabase Client
- Tailwind CSS
- Shadcn UI
- Framer Motion
- Lucide Icons
- next-themes

## 🧪 Étape 4 : Test en développement

```bash
npm run dev
```

Ouvrir [http://localhost:5173](http://localhost:5173)

### Tests manuels essentiels

1. **Inscription client**
   ```
   - Créer un compte avec rôle "client"
   - Vérifier la géolocalisation automatique
   - Vérifier que l'email n'est pas vérifié
   ```

2. **Connexion**
   ```
   - Se connecter avec le compte
   - Vérifier l'affichage du ClientDashboard
   - Tester le toggle dark mode
   ```

3. **Navigation**
   ```
   - Visiter chaque page (7 au total)
   - Vérifier l'affichage des données
   - Tester les actions principales
   ```

4. **Fonctionnalités**
   ```
   - Ajouter produit au panier (shop)
   - Ajouter aux favoris
   - Éditer profil
   - Envoyer message chat
   ```

## 🏗️ Étape 5 : Build production

```bash
npm run build
```

Résultat attendu :
```
✓ built in ~10s
dist/ folder created
```

Le dossier `dist/` contient :
- `index.html` - Point d'entrée
- `assets/` - JS, CSS, images minifiés
- `fonts/` - Polices personnalisées

## 🌐 Étape 6 : Déploiement

### Option A : Vercel (Recommandé)

```bash
# Installation CLI Vercel
npm i -g vercel

# Déploiement
vercel

# Production
vercel --prod
```

Configuration Vercel :
1. Framework : Vite
2. Build Command : `npm run build`
3. Output Directory : `dist`
4. Environment Variables : Ajouter `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY`

### Option B : Netlify

```bash
# Installation CLI Netlify
npm i -g netlify-cli

# Déploiement
netlify deploy

# Production
netlify deploy --prod
```

Configuration Netlify :
1. Build command : `npm run build`
2. Publish directory : `dist`
3. Environment variables : Ajouter les variables Supabase

### Option C : Serveur traditionnel (Apache/Nginx)

```bash
# Build
npm run build

# Copier dist/ vers le serveur
scp -r dist/* user@server:/var/www/saddlepoint/
```

Configuration Nginx :
```nginx
server {
    listen 80;
    server_name votre-domaine.com;
    
    root /var/www/saddlepoint;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

## 🔒 Étape 7 : Configuration de sécurité

### 7.1 Row Level Security (RLS)

Vérifier que RLS est activé sur toutes les tables dans Supabase :

```sql
-- Vérifier RLS
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';

-- Activer si nécessaire
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
-- etc.
```

### 7.2 Policies Supabase

Les policies sont incluses dans `sps.sql`. Vérifier leur activation :

```sql
-- Clients peuvent lire leur propre profil
CREATE POLICY "Users can read own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

-- Clients peuvent lire leurs propres commandes
CREATE POLICY "Clients can read own sales" ON sales
    FOR SELECT USING (client_id = auth.uid());
```

### 7.3 Variables d'environnement production

⚠️ **En production**, utiliser :
- Variables d'environnement du service (Vercel/Netlify)
- Ou fichier `.env.production` (non commité)
- Jamais de clés en dur dans le code

## 📊 Étape 8 : Données de test

### 8.1 Créer un super admin

```sql
-- Dans SQL Editor Supabase
INSERT INTO profiles (id, name, email, role)
VALUES (
    (SELECT id FROM auth.users WHERE email = 'admin@saddlepoint.cm'),
    'Admin Principal',
    'admin@saddlepoint.cm',
    'superadmin'
);
```

### 8.2 Créer des produits de test

```sql
-- Articles
INSERT INTO articles (name, sale_price, category, stock) VALUES
('Ordinateur Portable HP', 450000, 'Informatique', 15),
('Écran Samsung 27"', 180000, 'Moniteurs', 8),
('Clavier Mécanique RGB', 35000, 'Accessoires', 25);

-- Services
INSERT INTO services (name, price, category) VALUES
('Installation Réseau', 75000, 'Installation'),
('Maintenance Informatique', 50000, 'Support'),
('Formation Bureautique', 120000, 'Formation');
```

### 8.3 Créer un client de test

```sql
-- Insérer dans auth.users (via interface Supabase Auth)
-- Puis créer le profil
INSERT INTO profiles (id, name, email, role, phone, address)
VALUES (
    'uuid-du-client',
    'Jean Client',
    'client@test.cm',
    'client',
    '+237 690 000 000',
    'Douala, Cameroun'
);

-- Ajouter des points de fidélité
INSERT INTO customer_loyalty (customer_id, available_points, total_points_earned, current_tier)
VALUES ('uuid-du-client', 500, 500, 'bronze');
```

## 🎨 Étape 9 : Personnalisation (Optionnel)

### 9.1 Logo et branding

```typescript
// src/config/constants.ts
export const COMPANY_INFO = {
  name: 'Votre Entreprise',
  logo: '/assets/logo.png',
  tagline: 'Votre slogan'
};
```

### 9.2 Couleurs

```css
/* src/styles/theme.css */
:root {
  --primary: #your-color;
  --secondary: #your-color;
}
```

### 9.3 Emails

Configurer les templates d'email dans Supabase :
1. Authentication → Email Templates
2. Personnaliser les templates de confirmation, reset password, etc.

## 📈 Étape 10 : Monitoring

### 10.1 Analytics (Optionnel)

Ajouter Google Analytics :

```html
<!-- index.html -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

### 10.2 Supabase Monitoring

Dans Supabase Dashboard :
- Database → Logs
- Auth → Users
- Storage → Usage

### 10.3 Sentry (Error Tracking)

```bash
npm install @sentry/react

# src/main.tsx
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "your-sentry-dsn",
  environment: "production"
});
```

## ✅ Checklist finale

Avant de mettre en production :

### Configuration
- [ ] Variables Supabase configurées
- [ ] Base de données créée et peuplée
- [ ] RLS activé sur toutes les tables
- [ ] Policies créées et testées
- [ ] Email auth configuré (ou désactivé)

### Code
- [ ] Build réussi sans erreurs
- [ ] Tests manuels passés
- [ ] Dark mode testé
- [ ] Responsive testé (mobile/tablette)
- [ ] Performance acceptable (< 3s TTI)

### Sécurité
- [ ] Pas de clés en dur
- [ ] HTTPS activé
- [ ] CORS configuré
- [ ] Rate limiting (Supabase)

### Fonctionnel
- [ ] Inscription client OK
- [ ] Connexion OK
- [ ] Toutes les pages accessibles
- [ ] Chat fonctionnel
- [ ] Panier fonctionnel
- [ ] Favoris fonctionnels

## 🆘 Troubleshooting

### Erreur : "Cannot connect to Supabase"

```bash
# Vérifier les variables
echo $VITE_SUPABASE_URL
echo $VITE_SUPABASE_ANON_KEY

# Vérifier dans le code
console.log(import.meta.env.VITE_SUPABASE_URL)
```

### Erreur : "User not found"

```sql
-- Vérifier que le profil existe
SELECT * FROM profiles WHERE email = 'user@example.com';

-- Si manquant, créer
INSERT INTO profiles (id, name, email, role)
VALUES (auth.uid(), 'Nom', 'email', 'client');
```

### Erreur : "RLS policy violation"

```sql
-- Vérifier les policies
SELECT * FROM pg_policies WHERE tablename = 'sales';

-- Créer si manquant (voir sps.sql)
```

### Build échoue

```bash
# Nettoyer et réinstaller
rm -rf node_modules package-lock.json
npm install

# Vérifier TypeScript
npm run type-check
```

## 📚 Documentation

- [DEV_GUIDE.md](DEV_GUIDE.md) - Guide développeur
- [CLIENT_PAGES.md](guidelines/CLIENT_PAGES.md) - Documentation pages
- [DOCUMENTATION.md](DOCUMENTATION.md) - Architecture globale
- [Supabase Docs](https://supabase.com/docs)
- [Vite Docs](https://vitejs.dev)

## 🎉 Félicitations !

Votre système client est maintenant déployé et opérationnel ! 🚀

Pour toute question : consulter les fichiers de documentation ou les logs Supabase.
