import type { CatalogueProduct, CatalogueUsage } from './protectionElectrique';

type Row = readonly [string, string, string, CatalogueUsage, string];
const rows: Row[] = [
  ['Automate compact', 'Automates programmables PLC', 'Schneider Electric', 'Industriel', 'petites machines et coffrets autonomes'],
  ['Automate modulaire', 'Automates programmables PLC', 'Siemens', 'Industriel', 'lignes de production évolutives'],
  ['Automate de sécurité', 'Automates programmables PLC', 'ABB', 'Industriel', 'fonctions de sécurité machine'],
  ['Module entrées numériques', 'Modules d’entrées/sorties', 'WAGO', 'Industriel', 'acquisition de contacts terrain'],
  ['Module sorties relais', 'Modules d’entrées/sorties', 'Siemens', 'Industriel', 'commande d’actionneurs'],
  ['Module entrées analogiques', 'Modules d’entrées/sorties', 'Schneider Electric', 'Industriel', 'mesure de capteurs analogiques'],
  ['Écran IHM compact', 'IHM et écrans industriels', 'Siemens', 'Industriel', 'supervision locale de machine'],
  ['Terminal tactile IHM', 'IHM et écrans industriels', 'Schneider Electric', 'Industriel', 'conduite opérateur industrielle'],
  ['PC industriel', 'IHM et écrans industriels', 'ABB', 'Industriel', 'supervision et visualisation avancée'],
  ['Capteur inductif', 'Capteurs industriels', 'SICK', 'Industriel', 'détection sans contact de pièces métalliques'],
  ['Capteur photoélectrique', 'Capteurs industriels', 'Omron', 'Industriel', 'détection optique d’objets'],
  ['Capteur de pression', 'Capteurs industriels', 'IFM', 'Industriel', 'surveillance de pression de procédé'],
  ['Relais temporisé', 'Relais, temporisateurs et contrôleurs', 'Finder', 'Industriel', 'séquences de commande temporisées'],
  ['Relais programmable', 'Relais, temporisateurs et contrôleurs', 'Schneider Electric', 'Commercial', 'automatismes simples de bâtiment'],
  ['Régulateur de température', 'Relais, temporisateurs et contrôleurs', 'Omron', 'Industriel', 'contrôle thermique de process'],
  ['Transmetteur de niveau', 'Instrumentation', 'Endress+Hauser', 'Industriel', 'mesure de niveau de cuves'],
  ['Débitmètre électromagnétique', 'Instrumentation', 'ABB', 'Industriel', 'mesure de débit de liquide'],
  ['Transmetteur de température', 'Instrumentation', 'Siemens', 'Industriel', 'surveillance de température de process'],
  ['Contrôleur PID', 'Contrôle de processus', 'Schneider Electric', 'Industriel', 'régulation de procédés continus'],
  ['Régulateur de niveau', 'Contrôle de processus', 'Siemens', 'Industriel', 'gestion automatisée de réservoirs'],
  ['Enregistreur de données', 'Contrôle de processus', 'ABB', 'Industriel', 'traçabilité de variables de process'],
  ['Switch Ethernet industriel', 'Réseaux industriels', 'Siemens', 'Industriel', 'réseau robuste d’atelier'],
  ['Passerelle Modbus', 'Réseaux industriels', 'WAGO', 'Industriel', 'interconnexion d’équipements industriels'],
  ['Routeur industriel', 'Réseaux industriels', 'Phoenix Contact', 'Industriel', 'accès sécurisé aux réseaux industriels'],
];

const slug = (value: string) => value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
export const automatismeControleCatalog: CatalogueProduct[] = rows.map(([nom, sousCategorie, marque, usage, application]) => ({
  nom, slug: slug(nom), marque, gammeMarque: 'Automatisme industriel', categorie: 'Automatisme et contrôle industriel', sousCategorie, usage,
  descriptionCourte: `Solution pour ${application}.`, description: `${nom} conçu pour ${application}. La configuration et les interfaces sont à confirmer selon l’architecture technique du projet.`,
  caracteristiques: ['Intégration en armoire ou sur machine', 'Sélection selon protocole et environnement', 'Mise en service par personnel qualifié'], applications: [application, 'Modernisation industrielle', 'Maintenance de système'], variantesDisponibles: ['Interfaces et capacités adaptées', 'Accessoires de montage selon projet'], produitsComplementaires: ['Alimentation de commande', 'Câble industriel', 'Coffret de contrôle'], alternativesCompatibles: ['Schneider Electric', 'Siemens', 'ABB'], disponibilite: 'Disponible sur demande', statut: 'Actif', seoTitle: nom, seoDescription: `${nom} pour automatisme et contrôle industriel.`, altImage: `${nom} ${marque}`,
}));
