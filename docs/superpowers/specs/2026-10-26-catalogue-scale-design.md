# Extension du catalogue SaddlePoint — conception

## Objectif

Faire passer le catalogue public de 272 à environ 1 600 références sans prix, en conservant une recherche et des filtres rapides par catégorie, sous-catégorie et marque.

## Données et répartition

Les dix familles existantes restent la source de navigation. Chaque famille reçoit 130 à 180 produits, selon sa profondeur commerciale : protection électrique, distribution, câbles, automatisme, motorisation/pompage, solaire/secours, éclairage, installation bâtiment, réseaux/sûreté et outils/EPI.

Chaque référence contient un identifiant stable, un nom commercial descriptif, une marque, une gamme, une catégorie, une sous-catégorie, un usage, une description courte et longue, des caractéristiques, applications, variantes, produits complémentaires, alternatives et métadonnées SEO. Les références n'incluent ni prix, ni remise, ni devise.

## Génération et intégrité

Un générateur déterministe étend les produits par familles techniques réelles : calibre, tension, pôles, dimensions, indice de protection, protocole, puissance, capacité, environnement et montage. Ces attributs sont exprimés comme variantes ou distinctions techniques légitimes, jamais comme copies avec un simple suffixe arbitraire.

Les identifiants utilisent catégorie et slug afin d'éviter les collisions entre familles. Un contrôle automatisé garantit :

- au moins 1 500 produits et au plus 2 000 ;
- dix catégories actives ;
- des identifiants et slugs uniques ;
- une marque, une catégorie et une sous-catégorie par produit ;
- l'absence de contenu tarifaire ;
- des options de filtre dérivées de la source unique.

## Intégration boutique

La boutique continue de lire `catalogueProducts` depuis l'agrégateur. Les filtres existants catégorie, sous-catégorie, marque et recherche ne changent pas de contrat, donc la pagination actuelle reste valide à grande échelle. La demande de devis conserve uniquement les produits et leurs quantités ; elle n'affiche aucun total.

## Performance

Les 1 500–2 000 fiches restent des objets statiques légers, chargés à partir d'un seul module. Le filtrage se fait en mémoire côté client ; la pagination n'affiche que 24 cartes. Les images produit ne sont pas ajoutées lors de cette étape : une image éditoriale locale reste le repli temporaire pour ne pas alourdir le bundle avec plusieurs milliers d'assets.

## Validation

Les nouveaux tests couvrent le volume, l'unicité, la couverture par catégorie et l'absence de termes tarifaires. La suite complète, le contrôle TypeScript, le build de production et `git diff --check` doivent réussir avant le commit. Le lint est exclu de la validation jusqu'à migration de `.eslintrc.json` vers la configuration attendue par ESLint 9.
