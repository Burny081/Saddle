# Pages Client - Documentation Complète

## Vue d'ensemble

Le système dispose de **7 pages dédiées aux clients** avec une navigation role-based et un design premium cohérent.

## Navigation Client

```typescript
// src/data/navigation.ts
const clientNavigation = [
  { id: 'dashboard', icon: LayoutDashboard, label: 'Tableau de bord' },
  { id: 'shop', icon: ShoppingCart, label: 'Boutique' },
  { id: 'orders', icon: ShoppingBag, label: 'Mes Commandes' },
  { id: 'favorites', icon: Heart, label: 'Mes Favoris' },
  { id: 'quotes', icon: FileText, label: 'Mes Devis' },
  { id: 'loyalty', icon: Gift, label: 'Fidélité' },
  { id: 'profile', icon: User, label: 'Mon Profil' }
];
```

**Note:** Les paramètres (settings) ont été retirés de la navigation client et sont maintenant réservés aux administrateurs.

## Pages Implémentées

### 1. Dashboard Client (ClientDashboard.tsx)

**Fichier:** `src/components/dashboards/ClientDashboard.tsx`

**Fonctionnalités:**
- Hero section avec gradient et badge de bienvenue
- Bouton de basculement dark mode (Sun/Moon)
- 4 cartes statistiques:
  * Total des commandes
  * Commandes en cours
  * Points de fidélité disponibles
  * Montant total dépensé
- Liste des 5 dernières commandes avec statuts
- Carte programme fidélité avec:
  * Niveau actuel (Bronze/Silver/Gold)
  * Barre de progression vers niveau suivant
  * Actions rapides fonctionnelles
- Quick Actions:
  * Nouvelle commande → navigue vers boutique
  * Mes devis → navigue vers devis
  * Mes favoris → navigue vers favoris
  * Mes adresses → navigue vers settings (si nécessaire)

**Props:**
```typescript
interface ClientDashboardProps {
  onNavigate?: (view: string) => void;
}
```

**Sources de données:**
- Table `sales` (filtrée par client_id)
- Table `customer_loyalty`
- Calculs en temps réel

**Dark Mode:** Complet avec palette slate

---

### 2. Profil Client (ClientProfile.tsx)

**Fichier:** `src/components/client/ClientProfile.tsx`

**Fonctionnalités:**
- Mode édition/lecture avec boutons de contrôle
- Informations personnelles:
  * Nom (éditable)
  * Email (lecture seule avec badge "Vérifié")
  * Téléphone (éditable)
  * Adresse (éditable)
  * Date de création (lecture seule)
- Statut du compte:
  * Rôle (badge Client)
  * Statut (badge Actif)
- Informations de dernière connexion:
  * Localisation (ville, région, pays)
  * Adresse IP
  * Fuseau horaire
  * Date/heure

**API:**
```typescript
// Lecture
const { data } = await supabase
  .from('profiles')
  .select('last_login_ip, last_login_location, last_login_country, timezone, last_login')
  .eq('id', user.id)
  .single();

// Mise à jour
const { error } = await supabase
  .from('profiles')
  .update({
    name: formData.name,
    phone: formData.phone,
    address: formData.address,
    updated_at: new Date().toISOString()
  })
  .eq('id', user.id);
```

**Sécurité:**
- Email non modifiable (sécurité)
- Localisation automatique (lecture seule)
- Validation côté serveur

---

### 3. Programme Fidélité (ClientLoyaltyView.tsx)

**Fichier:** `src/components/client/ClientLoyaltyView.tsx`

**Fonctionnalités:**
- Carte points principale avec:
  * Points disponibles (grand affichage)
  * Total gagné
  * Niveau actuel avec icône
- Progression vers niveau supérieur:
  * Barre de progression visuelle
  * Points restants calculés
- Avantages par niveau:
  * **Bronze** (0+ points): 1 point = 10 FCFA
  * **Silver** (1000+ points): Réductions 5% + accès prioritaire
  * **Gold** (2500+ points): Réductions 10% + livraison gratuite + cadeaux
- Historique des transactions:
  * Type (gain/utilisation)
  * Description
  * Date/heure
  * Badge coloré selon le type

**Structure des niveaux:**
```typescript
const TIER_CONFIG = {
  bronze: { name: 'Bronze', color: 'bg-amber-600', minPoints: 0, nextTier: 1000 },
  silver: { name: 'Silver', color: 'bg-gray-400', minPoints: 1000, nextTier: 2500 },
  gold: { name: 'Gold', color: 'bg-yellow-500', minPoints: 2500, nextTier: null }
};
```

**API:**
```typescript
// Points et niveau
const { data: loyalty } = await supabase
  .from('customer_loyalty')
  .select('*')
  .eq('customer_id', user.id)
  .single();

// Transactions
const { data: txns } = await supabase
  .from('loyalty_transactions')
  .select('*')
  .eq('customer_id', user.id)
  .order('created_at', { ascending: false })
  .limit(20);
```

---

### 4. Mes Devis (ClientQuotesView.tsx)

**Fichier:** `src/components/client/ClientQuotesView.tsx`

**Fonctionnalités:**
- Liste de tous les devis avec:
  * Numéro de devis
  * Statut (En attente/Accepté/Refusé/Expiré)
  * Date de création
  * Date de validité (30 jours)
  * Montant total
  * Aperçu des articles (3 premiers)
  * Notes
- Actions par devis:
  * Voir détails (modal)
  * Télécharger PDF
  * Accepter (si en attente)
  * Refuser (si en attente)
- Modal de détails complet:
  * Tableau des articles avec quantités/prix
  * Total récapitulatif
  * Notes complètes
  * Actions disponibles

**Statuts:**
```typescript
const STATUS_CONFIG = {
  pending: { label: 'En attente', color: 'yellow', icon: Clock },
  accepted: { label: 'Accepté', color: 'green', icon: CheckCircle },
  rejected: { label: 'Refusé', color: 'red', icon: XCircle },
  expired: { label: 'Expiré', color: 'gray', icon: AlertCircle }
};
```

**API:**
```typescript
// Récupération des devis (depuis sales avec status='quote')
const { data } = await supabase
  .from('sales')
  .select(`
    id,
    sale_number,
    created_at,
    total_amount,
    status,
    notes,
    sale_items (
      id,
      article_id,
      quantity,
      unit_price,
      articles (name, description)
    )
  `)
  .eq('client_id', user.id)
  .eq('status', 'quote')
  .order('created_at', { ascending: false });

// Accepter un devis
await supabase
  .from('sales')
  .update({ status: 'accepted' })
  .eq('id', quoteId);
```

**Règles métier:**
- Validité automatique: 30 jours après création
- Expiration automatique si date dépassée
- Transformation en commande possible après acceptation

---

### 5. Mes Favoris (ClientFavoritesView.tsx)

**Fichier:** `src/components/client/ClientFavoritesView.tsx`

**Fonctionnalités:**
- Barre de recherche
- Toggle vue grille/liste
- Vue grille:
  * Cartes produits avec image
  * Badge type (Produit/Service)
  * Badge stock (pour articles)
  * Prix avec gradient
  * Bouton retirer
  * Bouton ajouter au panier
  * Hover avec zoom image
- Vue liste:
  * Layout horizontal
  * Image 128x128px
  * Description visible
  * Informations complètes
  * Actions à droite
- Gestion localStorage:
  * Favoris par utilisateur
  * Synchronisation temps réel

**Stockage:**
```typescript
// Structure localStorage
const key = `favorites_${user.id}`;
const favorites = ['article-uuid-1', 'article-uuid-2', 'service-uuid-3'];
localStorage.setItem(key, JSON.stringify(favorites));
```

**API:**
```typescript
// Articles favoris
const { data: articles } = await supabase
  .from('articles')
  .select('id, name, sale_price, category, description, image_url, stock')
  .in('id', favoriteIds);

// Services favoris
const { data: services } = await supabase
  .from('services')
  .select('id, name, price, category, description')
  .in('id', favoriteIds);
```

**Actions:**
- Ajouter au panier: Integration avec localStorage cart
- Retirer des favoris: Mise à jour immédiate localStorage + UI

---

### 6. Boutique (ClientShopView.tsx)

**Fichier:** `src/components/shop/ClientShopView.tsx`

**Fonctionnalités principales:**
- Hero section avec compteur de produits
- Barre de filtres:
  * Recherche
  * Tri (nom, prix croissant/décroissant, popularité)
  * Toggle grille/liste
- Affichage produits:
  * Badge "Nouveau" sur nouveautés
  * Rating 4.8★
  * Badges type (Produit/Service)
  * Images avec zoom hover
  * Bouton favori (cœur)
- Panier latéral:
  * Header gradient
  * Liste produits avec miniatures
  * Contrôles quantité (+/-)
  * Bouton retirer
  * Sous-total + Total
  * Message livraison gratuite
  * Bouton commander

**État:**
```typescript
const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
const [sortBy, setSortBy] = useState<'name' | 'price-asc' | 'price-desc' | 'popular'>('name');
const [cart, setCart] = useState<CartItem[]>([]);
const [favorites, setFavorites] = useState<string[]>([]);
```

**Dark Mode:** Support complet avec transitions

---

### 7. Mes Commandes (OrdersView.tsx)

**Fichier:** `src/components/shop/OrdersView.tsx`

**Fonctionnalités:**
- Liste de toutes les commandes client
- Filtres par statut
- Détails par commande
- Suivi de livraison
- Historique complet

---

## Communication Client

### Widget de Chat (ClientChatWidget.tsx)

**Fichier:** `src/components/chat/ClientChatWidget.tsx`

**Fonctionnalités:**
- Bouton flottant en bas à droite
- Badge de notifications non lues
- Interface de chat:
  * Header gradient (émeraude)
  * Historique des messages
  * Champ de saisie
  * Bouton envoyer
- Différenciation messages:
  * Client: bulles émeraude à droite
  * Support: bulles blanches à gauche avec icône
- Persistance localStorage
- Polling toutes les 3 secondes

**Visibilité:**
```typescript
// Uniquement pour les clients
if (!user || user.role !== 'client') return null;
```

**Stockage:**
```typescript
const STORAGE_KEY = 'sps_client_messages';
interface ClientMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  content: string;
  timestamp: number;
  clientId: string;
}
```

---

## Routing

**Fichier:** `src/app/App.tsx`

```typescript
switch (currentView) {
  case 'dashboard':
    if (user?.role === 'client') {
      return <ClientDashboard onNavigate={setCurrentView} />;
    }
    return <DashboardView onNavigate={setCurrentView} />;
  
  case 'shop':
    return <ClientShopView />;
  
  case 'orders':
    return <OrdersView />;
  
  case 'favorites':
    return <ClientFavoritesView />;
  
  case 'quotes':
    return <ClientQuotesView />;
  
  case 'loyalty':
    return <ClientLoyaltyView />;
  
  case 'profile':
    return <ClientProfile />;
  
  // ... autres vues
}
```

---

## Base de Données

### Tables utilisées

1. **profiles** - Informations utilisateur
   - name, email, phone, address
   - last_login_ip, last_login_location, last_login_country, timezone
   - role, is_active, created_at

2. **sales** - Commandes et devis
   - sale_number, client_id, total_amount
   - status (quote, pending, completed, etc.)
   - notes, created_at

3. **sale_items** - Articles de vente
   - sale_id, article_id, quantity, unit_price

4. **customer_loyalty** - Programme fidélité
   - customer_id, available_points, total_points_earned
   - current_tier, tier_start_date

5. **loyalty_transactions** - Historique points
   - customer_id, points, description
   - transaction_type (earned, redeemed)
   - created_at

6. **articles** - Produits
   - name, sale_price, category, stock
   - description, image_url

7. **services** - Services
   - name, price, category, description

---

## Design System

### Couleurs par page

| Page | Gradient Principal | Accents |
|------|-------------------|---------|
| Dashboard | blue → indigo → purple | Blue 600 |
| Shop | blue → indigo | Blue/Indigo 600 |
| Orders | orange → red | Orange 600 |
| Favorites | pink → red | Pink/Red 600 |
| Quotes | blue → cyan | Blue/Cyan 600 |
| Loyalty | purple → pink → red | Purple 600 |
| Profile | slate → blue → indigo | Blue 600 |
| Chat | emerald → teal | Emerald 600 |

### Dark Mode

Palette utilisée:
- Backgrounds: `slate-950`, `slate-900`, `slate-800`
- Textes: `white`, `gray-300`, `gray-400`
- Borders: `slate-700`, `slate-600`
- Contraste: WCAG AAA compliant

### Composants communs

- **Card:** Shadcn UI avec `dark:bg-slate-800`
- **Button:** Gradients ou solides selon contexte
- **Badge:** Couleurs sémantiques (vert=succès, rouge=erreur, etc.)
- **Input:** Background slate-700 en dark mode

---

## Sécurité & Permissions

### Contrôle d'accès

```typescript
// Navigation role-based
const clientPages = navItems.filter(item => item.roles.includes('client'));

// Vérification dans les composants
if (user?.role !== 'client') return null;

// Filtre données par client_id
.eq('client_id', user.id)
```

### Données sensibles

- Email non modifiable (sécurité authentification)
- Localisation auto-détectée (lecture seule)
- Prix et stocks en temps réel depuis DB
- Messages chat persistés mais non chiffrés

---

## Performances

### Optimisations

1. **Lazy Loading:** Composants chargés à la demande
2. **Memoization:** `useCallback` sur handlers
3. **localStorage:** Cache 24h pour géolocalisation
4. **Polling:** 3 secondes pour chat (évite surcharge)
5. **Pagination:** Limite 20 transactions fidélité
6. **Indexes DB:** Sur client_id, created_at, status

### Métriques cibles

- FCP (First Contentful Paint): < 1.5s
- LCP (Largest Contentful Paint): < 2.5s
- TTI (Time to Interactive): < 3s
- Bundle size client pages: ~180 KB gzipped

---

## Tests & Validation

### Checklist fonctionnelle

- [x] Navigation entre toutes les pages
- [x] Dashboard affiche statistiques correctes
- [x] Profil éditable et sauvegarde
- [x] Fidélité calcule progression correctement
- [x] Devis affichent montants exacts
- [x] Favoris ajout/retrait fonctionne
- [x] Boutique filtre et trie correctement
- [x] Chat envoie et reçoit messages
- [x] Dark mode sur toutes les pages
- [x] Responsive sur mobile/tablette/desktop

### Tests utilisateur

1. Créer compte client
2. Se connecter
3. Naviguer vers chaque page
4. Effectuer actions principales
5. Vérifier données correctes
6. Tester dark mode
7. Vérifier chat

---

## Maintenance & Évolutions

### Prochaines étapes potentielles

1. **Notifications push** - Alertes temps réel
2. **Historique recherches** - Suggestions personnalisées
3. **Comparateur produits** - Side-by-side
4. **Wishlist partageable** - URL unique
5. **Programme parrainage** - Bonus fidélité
6. **Chat vidéo** - Support avancé
7. **Multi-langues** - EN, FR, autres
8. **PWA** - Installation mobile
9. **Paiement intégré** - Stripe/PayPal
10. **Avis clients** - Rating produits

### Bugs connus

Aucun bug critique identifié au 2024.

---

## Support & Documentation

### Fichiers de référence

- `guidelines/CLIENT_DASHBOARD.md` - Design système
- `guidelines/DARK_MODE_CLIENT.md` - Implémentation dark mode
- `guidelines/IP_LOCATION_CLIENT_ONLY.md` - Géolocalisation
- `DOCUMENTATION.md` - Architecture générale
- `DESIGN.md` - Principes UI/UX

### Contact développement

Pour questions techniques, consulter:
- Code source: `src/components/client/`, `src/components/dashboards/`
- Base de données: `sps.sql` sections 1-21
- Contextes: `src/contexts/AuthContext.tsx`, `DataContext.tsx`

---

**Dernière mise à jour:** 2024
**Version:** 1.0.0
**Auteur:** Équipe SaddlePoint
