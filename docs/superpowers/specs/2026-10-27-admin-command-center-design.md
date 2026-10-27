# Centre de pilotage administrateur — conception

## Objectif

Transformer le tableau de bord staff générique en un centre de pilotage clair pour SaddlePoint. Il doit permettre aux administrateurs de repérer immédiatement les demandes à traiter, les risques de stock et l'activité commerciale, sans remplacer les écrans métier déjà existants.

## Périmètre de cette première phase

- Rendre le dashboard d'administration distinct du dashboard commercial et du dashboard client.
- Organiser la navigation staff en quatre groupes : Pilotage, Catalogue & stock, Ventes & relations, Administration.
- Ajouter des raccourcis directs vers les modules existants : ventes, devis, stock, articles, fournisseurs, clients, utilisateurs, sécurité et paramètres.
- Afficher des données dérivées des contextes existants uniquement ; aucun prix public ne sera affiché dans la boutique client.
- Conserver les contrôles RBAC existants : un utilisateur ne voit que les modules auxquels son rôle donne accès.

## Hors périmètre

- Refonte fonctionnelle des pages stock, ventes, clients, fournisseurs ou comptabilité.
- Nouveau backend, migration de base de données ou changement d'authentification.
- Envoi réel de devis ou génération massive d'images produit.

## Expérience proposée

### En-tête

Un en-tête sobre présente le contexte « Centre de pilotage », la date et des actions rapides. Les actions sont adaptées au rôle : créer une vente, ouvrir le stock, consulter les devis ou gérer les utilisateurs.

### Indicateurs prioritaires

Quatre cartes lisibles, sans graphiques décoratifs : activité commerciale, volume de ventes, articles à surveiller et éléments nécessitant une action. Chaque carte mène vers son écran métier. Les chiffres sont calculés à partir des données réellement disponibles ; aucune variation inventée n'est affichée.

### Zone de travail

La zone principale contient :

1. une file d'actions prioritaires (stock faible, demandes en attente, tâches ouvertes) ;
2. un aperçu des dernières opérations ;
3. des raccourcis opérationnels vers les actions fréquentes.

Les listes ont un état vide explicite et les éléments cliquables ont des libellés accessibles.

### Navigation

La barre latérale conserve le logo, le profil et la déconnexion, mais affiche des titres de groupe. Les entrées restent filtrées par rôle. Sur mobile, le menu demeure un panneau temporaire et se ferme après navigation.

## Architecture

- Le routeur continue d'utiliser la vue `dashboard` pour les membres du personnel.
- Un composant `AdminCommandCenter` est introduit pour les rôles `superadmin` et `admin`.
- Les autres rôles staff gardent le dashboard opérationnel existant, sauf amélioration de navigation partagée.
- Les données viennent des contextes déjà chargés (`DataContext`, authentification, accès boutique) et sont transformées dans des sélecteurs testables.
- Les actions naviguent via le callback `onNavigate` existant ; aucun lien ne contourne le contrôle d'accès de `App.tsx`.

## Règles d'accès

| Élément | Superadmin | Admin | Autres rôles staff |
| --- | --- | --- | --- |
| Centre de pilotage complet | Oui | Oui | Non |
| Gestion utilisateurs / sécurité / paramètres | Oui | Selon règles existantes | Non |
| Raccourcis stock, ventes, fournisseurs, clients | Selon navigation existante | Selon navigation existante | Selon navigation existante |

## Responsive et accessibilité

- Une colonne sur mobile, deux ou trois zones uniquement à partir de `lg`.
- Cibles tactiles d'au moins 44 px et visibilité clavier sur toutes les actions.
- Les graphiques, s'ils sont conservés, doivent avoir un résumé textuel ; les alertes ne reposent pas uniquement sur la couleur.
- Les animations restent légères, utilisent les transformations et respectent `prefers-reduced-motion`.

## Tests et validation

- Tests unitaires des sélecteurs : aucune donnée inventée, calcul du stock faible et filtrage par rôle.
- Tests de rendu : les raccourcis et indicateurs attendus s'affichent pour un admin, et les entrées non autorisées ne s'affichent pas.
- Lint, contrôle TypeScript et build de production.
- Vérification manuelle desktop et mobile : groupes de navigation, panneau mobile, navigation de raccourcis et états vides.

## Critères d'acceptation

- Un admin arrive sur un centre de pilotage différent, utilisable et directement actionnable.
- Les données sont exactes par rapport aux contextes disponibles.
- Les autres rôles ne gagnent pas de privilèges ni de modules non autorisés.
- Les écrans métier existants restent accessibles et fonctionnels.
