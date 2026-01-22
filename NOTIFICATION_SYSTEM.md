# Système de Notifications

## Vue d'ensemble

Le système de notifications offre une solution complète pour informer les utilisateurs des événements importants en temps réel, avec persistance dans le localStorage et interface utilisateur élégante.

## Composants Principaux

### 1. Hook `useNotifications` (`src/hooks/useNotifications.ts`)

Le hook personnalisé qui gère toute la logique des notifications :

```typescript
const { 
  notifications,      // Liste complète des notifications
  unreadCount,        // Nombre de notifications non lues
  addNotification,    // Ajouter une nouvelle notification
  markAsRead,         // Marquer comme lue
  markAllAsRead,      // Tout marquer comme lu
  deleteNotification, // Supprimer une notification
  clearAll           // Tout supprimer
} = useNotifications();
```

#### Caractéristiques :
- ✅ Persistance dans localStorage (spécifique par utilisateur)
- ✅ Limite de 100 notifications par utilisateur
- ✅ Gestion automatique des IDs uniques
- ✅ Comptage des notifications non lues
- ✅ Horodatage automatique

### 2. Composant `NotificationCenter` (`src/components/layout/NotificationCenter.tsx`)

Interface utilisateur moderne et interactive pour afficher les notifications :

#### Fonctionnalités :
- 🔔 Icône de cloche avec badge de compteur
- 📋 Menu déroulant animé avec Framer Motion
- 🎨 Couleurs et icônes spécifiques par type
- ⏰ Affichage du temps écoulé ("il y a X min")
- ✅ Actions : marquer comme lu, tout marquer comme lu, supprimer
- 🌍 Support multilingue (FR/EN)
- 🌗 Support thème clair/sombre

#### Types de notifications supportés :
- `order` - Commandes (🛍️ bleu)
- `stock` - Stock (📦 orange)
- `payment` - Paiements (💳 vert)
- `message` - Messages (💬 violet)
- `system` - Système (⚙️ gris)
- `success` - Succès (✓ vert)
- `warning` - Avertissement (⚠️ orange)
- `error` - Erreur (✕ rouge)
- `info` - Information (ℹ️ bleu)

### 3. Intégration dans le Topbar

Le NotificationCenter est intégré dans le header de l'application à côté du sélecteur de langue et du thème.

## Déclencheurs Automatiques

### Notifications de Vente
Quand une nouvelle vente est créée :
```typescript
addNotification(
  'success',
  'Nouvelle vente',
  `Facture ${invoiceNumber} créée avec succès`,
  '/sales'
);
```

### Alertes de Stock Bas
Quand le stock atteint le niveau minimum :
```typescript
addNotification(
  'warning',
  'Stock bas',
  `${article.name}: ${newStock} unités restantes`,
  '/stock'
);
```

### Nouveaux Clients
Quand un client est ajouté :
```typescript
addNotification(
  'info',
  'Nouveau client',
  `${client.name} a été ajouté avec succès`,
  '/clients'
);
```

## Utilisation dans le Code

### Ajouter une notification

```typescript
import { useNotifications } from '@/hooks/useNotifications';

function MyComponent() {
  const { addNotification } = useNotifications();
  
  const handleAction = () => {
    // Votre logique...
    
    addNotification(
      'success',           // Type
      'Action réussie',    // Titre
      'Description...',    // Message
      '/page-destination', // URL optionnelle
      { key: 'value' }    // Métadonnées optionnelles
    );
  };
}
```

### Marquer comme lue

```typescript
const { markAsRead } = useNotifications();

markAsRead('notification-id');
```

### Supprimer une notification

```typescript
const { deleteNotification } = useNotifications();

deleteNotification('notification-id');
```

## Traductions

Les traductions sont définies dans `src/contexts/LanguageContext.tsx` :

```typescript
'notifications.title': { fr: 'Notifications', en: 'Notifications' },
'notifications.unread': { fr: 'non lues', en: 'unread' },
'notifications.markAllRead': { fr: 'Tout marquer comme lu', en: 'Mark all as read' },
'notifications.deleteAll': { fr: 'Tout supprimer', en: 'Delete all' },
'notifications.noNotifications': { fr: 'Aucune notification', en: 'No notifications' },
'notifications.justNow': { fr: 'À l\'instant', en: 'Just now' },
'notifications.minutesAgo': { fr: 'il y a {count} min', en: '{count} min ago' },
'notifications.hoursAgo': { fr: 'il y a {count}h', en: '{count}h ago' },
'notifications.daysAgo': { fr: 'il y a {count}j', en: '{count}d ago' },
```

## Structure des Données

### Type Notification

```typescript
interface Notification {
  id: string;
  type: 'order' | 'stock' | 'payment' | 'message' | 'system' | 
        'success' | 'warning' | 'error' | 'info';
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
  actionUrl?: string;
  metadata?: Record<string, any>;
}
```

### Stockage LocalStorage

Les notifications sont stockées par utilisateur :
```
sps_notifications_user-{userId}
```

## Améliorations Futures Possibles

1. **Notifications Push** : Intégrer des notifications navigateur
2. **Sons** : Ajouter des effets sonores pour les notifications importantes
3. **Filtres** : Permettre de filtrer par type de notification
4. **Recherche** : Ajouter une barre de recherche dans les notifications
5. **Historique** : Archivage des anciennes notifications
6. **Préférences** : Permettre aux utilisateurs de configurer quelles notifications recevoir
7. **Notifications Email** : Envoyer certaines notifications par email
8. **Groupement** : Regrouper les notifications similaires

## Exemples d'Usage

### Notification de commande
```typescript
addNotification('order', 'Nouvelle commande', 'Commande #1234 reçue', '/orders');
```

### Alerte critique
```typescript
addNotification('error', 'Erreur système', 'Connexion base de données perdue');
```

### Information simple
```typescript
addNotification('info', 'Mise à jour', 'Vos données ont été synchronisées');
```

### Avec métadonnées
```typescript
addNotification(
  'payment',
  'Paiement reçu',
  `${amount}€ de ${clientName}`,
  '/accounting',
  { orderId: '123', amount: 450, clientId: 'client-456' }
);
```

## Support

Pour toute question ou amélioration du système de notifications, consultez :
- `src/hooks/useNotifications.ts` - Logique du hook
- `src/components/layout/NotificationCenter.tsx` - Interface utilisateur
- `src/contexts/DataContext.tsx` - Exemples d'intégration
