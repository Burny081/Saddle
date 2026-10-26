import type { CatalogueProduct } from './protectionElectrique';

interface TechnicalVariant {
  slug: string;
  label: string;
  characteristic: string;
}

const technicalVariants: Record<string, readonly TechnicalVariant[]> = {
  'Énergie et distribution électrique': [
    { slug: 'ip55', label: 'IP55', characteristic: 'Protection adaptée aux environnements industriels abrités' },
    { slug: 'ip65', label: 'IP65', characteristic: 'Protection renforcée contre poussières et projections d’eau' },
    { slug: 'raccordement-barres', label: 'raccordement par barres', characteristic: 'Raccordement prévu pour distribution par jeux de barres' },
    { slug: 'commande-auxiliaire', label: 'commande auxiliaire', characteristic: 'Contacts auxiliaires disponibles selon configuration' },
    { slug: 'supervision-reseau', label: 'supervision réseau', characteristic: 'Prédisposition à la mesure ou à la supervision réseau' },
  ],
  'Protection et sécurité électrique': [
    { slug: 'calibre-projet', label: 'calibre adapté au projet', characteristic: 'Calibre à définir selon étude de sélectivité' },
    { slug: 'pouvoir-coupure-renforce', label: 'pouvoir de coupure renforcé', characteristic: 'Pouvoir de coupure adapté aux réseaux exigeants' },
    { slug: 'commande-auxiliaire', label: 'commande auxiliaire', characteristic: 'Signalisation et contacts auxiliaires disponibles' },
    { slug: 'configuration-selective', label: 'configuration sélective', characteristic: 'Coordination avec les protections amont et aval' },
    { slug: 'environnement-renforce', label: 'environnement renforcé', characteristic: 'Conçu pour les conditions électriques exigeantes' },
  ],
  'Câbles, chemins de câbles et connectique': [
    { slug: 'section-standard', label: 'section standard', characteristic: 'Section sélectionnée selon l’intensité et la chute de tension' },
    { slug: 'gaine-renforcee', label: 'gaine renforcée', characteristic: 'Gaine adaptée aux contraintes mécaniques accrues' },
    { slug: 'longueur-chantier', label: 'longueur chantier', characteristic: 'Conditionnement adapté aux opérations de chantier' },
    { slug: 'usage-exterieur', label: 'usage extérieur', characteristic: 'Résistance adaptée aux conditions extérieures' },
    { slug: 'usage-industriel', label: 'usage industriel', characteristic: 'Conçu pour les installations industrielles' },
  ],
  'Automatisme et contrôle industriel': [
    { slug: '24v-dc', label: 'alimentation 24 V DC', characteristic: 'Alimentation de commande 24 V DC selon modèle' },
    { slug: 'ethernet-industriel', label: 'Ethernet industriel', characteristic: 'Interface Ethernet industrielle disponible selon configuration' },
    { slug: 'rail-din', label: 'montage rail DIN', characteristic: 'Montage prévu pour armoire sur rail DIN' },
    { slug: 'ip65', label: 'protection IP65', characteristic: 'Protection renforcée pour environnement d’atelier' },
    { slug: 'communication-projet', label: 'communication projet', characteristic: 'Protocole de communication à définir avec l’architecture' },
  ],
  'Moteurs, entraînement et pompage': [
    { slug: 'service-continu', label: 'service continu', characteristic: 'Dimensionnement adapté au fonctionnement continu' },
    { slug: 'ip55', label: 'protection IP55', characteristic: 'Indice de protection adapté aux locaux techniques' },
    { slug: 'triphasé', label: 'alimentation triphasée', characteristic: 'Alimentation triphasée selon puissance retenue' },
    { slug: 'vitesse-variable', label: 'vitesse variable', characteristic: 'Compatibilité variateur selon étude d’entraînement' },
    { slug: 'maintenance-facilitee', label: 'maintenance facilitée', characteristic: 'Configuration pensée pour les opérations de maintenance' },
  ],
  'Solaire, stockage et alimentation de secours': [
    { slug: 'autonomie-standard', label: 'autonomie standard', characteristic: 'Capacité adaptée aux besoins d’autonomie courants' },
    { slug: 'autonomie-renforcee', label: 'autonomie renforcée', characteristic: 'Capacité étudiée pour une autonomie étendue' },
    { slug: 'site-isole', label: 'site isolé', characteristic: 'Configuration adaptée aux sites hors réseau' },
    { slug: 'autoconsommation', label: 'autoconsommation', characteristic: 'Configuration adaptée à l’autoconsommation' },
    { slug: 'secours-critique', label: 'secours critique', characteristic: 'Sélection pour charges nécessitant une continuité accrue' },
  ],
  'Éclairage': [
    { slug: 'blanc-chaud', label: 'blanc chaud', characteristic: 'Température de couleur adaptée aux espaces d’accueil' },
    { slug: 'blanc-neutre', label: 'blanc neutre', characteristic: 'Température de couleur pour espaces de travail' },
    { slug: 'blanc-froid', label: 'blanc froid', characteristic: 'Température de couleur pour zones techniques' },
    { slug: 'dimmable', label: 'dimmable', characteristic: 'Variation lumineuse disponible selon configuration' },
    { slug: 'detection-presence', label: 'détection de présence', characteristic: 'Commande par détection de présence selon système' },
  ],
  'Installation électrique résidentielle et bâtiment': [
    { slug: 'encastre', label: 'montage encastré', characteristic: 'Format adapté aux installations encastrées' },
    { slug: 'apparent', label: 'montage apparent', characteristic: 'Format adapté aux installations apparentes' },
    { slug: 'etanche', label: 'protection étanche', characteristic: 'Protection adaptée aux pièces humides ou extérieures' },
    { slug: 'finition-premium', label: 'finition premium', characteristic: 'Finition sélectionnée pour les projets haut de gamme' },
    { slug: 'domotique', label: 'compatibilité domotique', characteristic: 'Compatibilité avec une commande connectée selon système' },
  ],
  'Réseaux, sûreté et systèmes de bâtiment': [
    { slug: 'poe', label: 'alimentation PoE', characteristic: 'Alimentation par Ethernet disponible selon configuration' },
    { slug: 'interieur', label: 'usage intérieur', characteristic: 'Configuration adaptée aux espaces intérieurs' },
    { slug: 'exterieur', label: 'usage extérieur', characteristic: 'Protection adaptée aux installations extérieures' },
    { slug: 'enregistrement-etendu', label: 'enregistrement étendu', characteristic: 'Capacité adaptée à une conservation prolongée' },
    { slug: 'supervision-centralisee', label: 'supervision centralisée', characteristic: 'Intégration à une supervision centralisée possible' },
  ],
  'Mesure, test, outils et EPI': [
    { slug: 'format-compact', label: 'format compact', characteristic: 'Format adapté aux interventions mobiles' },
    { slug: 'kit-professionnel', label: 'kit professionnel', characteristic: 'Configuration adaptée aux équipes professionnelles' },
    { slug: 'mesure-renforcee', label: 'mesure renforcée', characteristic: 'Capacité de mesure adaptée aux diagnostics avancés' },
    { slug: 'isolation-renforcee', label: 'isolation renforcée', characteristic: 'Protection renforcée pour intervention électrique' },
    { slug: 'mallette-transport', label: 'mallette de transport', characteristic: 'Protection et transport organisés sur site' },
  ],
};

const categorySlug = (value: string) => value
  .toLocaleLowerCase('fr')
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-|-$/g, '');

export function expandCatalogueProducts(products: CatalogueProduct[]): CatalogueProduct[] {
  return products.flatMap((product) => {
    const categoryPrefix = categorySlug(product.categorie);
    const base = { ...product, slug: `${categoryPrefix}-${product.slug}` };
    const variants = technicalVariants[product.categorie] ?? [];

    return [
      base,
      ...variants.map((variant) => ({
        ...base,
        nom: `${product.nom} — Version ${variant.label}`,
        slug: `${base.slug}-${variant.slug}`,
        descriptionCourte: `${product.descriptionCourte} Version ${variant.label}.`,
        description: `${product.description} Cette version est configurée pour ${variant.label}.`,
        caracteristiques: [...product.caracteristiques, variant.characteristic],
        variantesDisponibles: [...product.variantesDisponibles, variant.label],
        seoTitle: `${product.nom} — ${variant.label}`,
        seoDescription: `${product.seoDescription} Version ${variant.label}.`,
        altImage: `${product.altImage} ${variant.label}`,
      })),
    ];
  });
}
