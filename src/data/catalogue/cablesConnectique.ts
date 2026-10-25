import type { CatalogueProduct, CatalogueUsage } from './protectionElectrique';

type CableRow = readonly [string, string, string, CatalogueUsage, string];

const rows: CableRow[] = [
  ['Câble cuivre U1000 R2V', 'Câbles d’énergie', 'Nexans', 'Multi-usage', 'Alimentation fixe de bâtiments et équipements'],
  ['Câble aluminium de distribution', 'Câbles d’énergie', 'Prysmian', 'Industriel', 'Liaisons de distribution à forte section'],
  ['Câble souple H07RN-F', 'Câbles d’énergie', 'Nexans', 'Multi-usage', 'Alimentation mobile et environnement exigeant'],
  ['Câble solaire photovoltaïque', 'Câbles d’énergie', 'Prysmian', 'Commercial', 'Liaisons entre modules et onduleur'],
  ['Câble moteur blindé', 'Câbles industriels', 'Lapp', 'Industriel', 'Liaison variateur et moteur'],
  ['Câble industriel résistant aux huiles', 'Câbles industriels', 'HELUKABEL', 'Industriel', 'Machines et ateliers industriels'],
  ['Câble de chaîne porte-câbles', 'Câbles industriels', 'Lapp', 'Industriel', 'Machines à mouvements répétitifs'],
  ['Câble haute température', 'Câbles industriels', 'Nexans', 'Industriel', 'Zones thermiques et process'],
  ['Câble de commande multiconducteur', 'Câbles de commande', 'Prysmian', 'Industriel', 'Commandes d’armoire et automatismes'],
  ['Câble blindé de commande', 'Câbles de commande', 'HELUKABEL', 'Industriel', 'Signaux protégés des perturbations'],
  ['Câble souple de commande', 'Câbles de commande', 'Lapp', 'Commercial', 'Pupitres et coffrets techniques'],
  ['Câble de signalisation incendie', 'Câbles de commande', 'Nexans', 'Commercial', 'Systèmes de sécurité bâtiment'],
  ['Câble réseau cuivre Catégorie 6', 'Câbles réseau et télécommunication', 'Nexans', 'Commercial', 'Réseau local structuré'],
  ['Câble réseau cuivre Catégorie 6A', 'Câbles réseau et télécommunication', 'Legrand', 'Commercial', 'Réseau à haut débit'],
  ['Câble fibre optique intérieur', 'Câbles réseau et télécommunication', 'Prysmian', 'Commercial', 'Liaisons fibre dans les bâtiments'],
  ['Câble coaxial vidéosurveillance', 'Câbles réseau et télécommunication', 'Nexans', 'Commercial', 'Liaison de caméras analogiques'],
  ['Gaine ICTA annelée', 'Gaines, conduits et goulottes', 'Legrand', 'Résidentiel', 'Protection encastrée des conducteurs'],
  ['Conduit rigide PVC', 'Gaines, conduits et goulottes', 'Schneider Electric', 'Commercial', 'Cheminement apparent intérieur'],
  ['Gaine industrielle flexible', 'Gaines, conduits et goulottes', 'OBO Bettermann', 'Industriel', 'Protection mécanique des câbles'],
  ['Goulotte de câblage', 'Gaines, conduits et goulottes', 'Legrand', 'Commercial', 'Organisation de câblage mural'],
  ['Chemin de câbles perforé', 'Chemins de câbles', 'OBO Bettermann', 'Industriel', 'Supportage horizontal de câbles'],
  ['Chemin de câbles filaire', 'Chemins de câbles', 'Legrand', 'Commercial', 'Cheminement léger et réseau'],
  ['Échelle à câbles galvanisée', 'Chemins de câbles', 'Niedax', 'Industriel', 'Grandes liaisons de puissance'],
  ['Accessoire de dérivation pour chemin de câbles', 'Chemins de câbles', 'OBO Bettermann', 'Industriel', 'Changement de direction et dérivation'],
  ['Cosse tubulaire cuivre', 'Cosses, borniers et connecteurs', 'Klauke', 'Industriel', 'Terminaison fiable de conducteurs cuivre'],
  ['Embout de câblage isolé', 'Cosses, borniers et connecteurs', 'Phoenix Contact', 'Multi-usage', 'Finition de conducteurs souples'],
  ['Bornier sur rail DIN', 'Cosses, borniers et connecteurs', 'WAGO', 'Industriel', 'Raccordement organisé en armoire'],
  ['Connecteur industriel multipolaire', 'Cosses, borniers et connecteurs', 'Harting', 'Industriel', 'Connexion débrochable de machine'],
  ['Collier de serrage polyamide', 'Accessoires de fixation et repérage', 'HellermannTyton', 'Multi-usage', 'Fixation et regroupement de câbles'],
  ['Étiquette de repérage câble', 'Accessoires de fixation et repérage', 'Phoenix Contact', 'Industriel', 'Identification durable des conducteurs'],
  ['Presse-étoupe industriel', 'Accessoires de fixation et repérage', 'Wiska', 'Industriel', 'Entrée de câble étanche en coffret'],
  ['Bride de fixation pour conduit', 'Accessoires de fixation et repérage', 'Legrand', 'Commercial', 'Fixation de conduits et goulottes'],
];

const slugify = (name: string) => name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

export const cablesConnectiqueCatalog: CatalogueProduct[] = rows.map(([nom, sousCategorie, marque, usage, application]) => ({
  nom, slug: slugify(nom), marque, gammeMarque: 'Câblage et connectique', categorie: 'Câbles, chemins de câbles et connectique', sousCategorie, usage,
  descriptionCourte: `${application} avec sélection technique adaptée au projet.`, description: `${nom} destiné à ${application.toLowerCase()}. La section, la gaine, le niveau de protection et les accessoires sont à sélectionner selon les contraintes de l’installation.`,
  caracteristiques: ['Conforme au type de cheminement prévu', 'Sélection selon environnement et section requise', 'Compatible avec les accessoires de raccordement adaptés'],
  applications: [application, 'Installations neuves', 'Maintenance et extension'], variantesDisponibles: ['Sections ou dimensions adaptées', 'Longueurs et conditionnements selon projet'],
  produitsComplementaires: ['Accessoires de fixation', 'Solution de raccordement', 'Repérage de circuit'], alternativesCompatibles: ['Nexans', 'Prysmian', 'Legrand'], disponibilite: 'Disponible sur demande', statut: 'Actif', seoTitle: nom, seoDescription: `${application} pour projets électriques SaddlePoint.`, altImage: `${nom} ${marque}`,
}));
