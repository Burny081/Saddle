import type { CatalogueShopProduct } from './index';

export interface ProductConfigurationField {
  key: string;
  label: string;
  options: readonly string[];
}

export type SelectedProductConfiguration = Record<string, string>;

const field = (
  key: string,
  label: string,
  options: readonly string[]
): ProductConfigurationField => ({ key, label, options });

const configurations: Record<string, readonly ProductConfigurationField[]> = {
  'Énergie et distribution électrique': [
    field('ratedCurrent', 'Intensité / capacité souhaitée', [
      'Jusqu’à 63 A',
      '63–250 A',
      '250–630 A',
      'Au-delà de 630 A',
    ]),
    field('voltage', 'Tension réseau', ['230 V monophasé', '400 V triphasé', 'Autre / à préciser']),
    field('ipRequirement', 'Indice IP souhaité', [
      'IP30 intérieur',
      'IP55 local technique',
      'IP65 poussière et projections',
    ]),
  ],
  'Protection et sécurité électrique': [
    field('poles', 'Nombre de pôles', ['1P', '1P+N', '2P', '3P', '3P+N / 4P']),
    field('ratedCurrent', 'Calibre souhaité', [
      '1–16 A',
      '20–63 A',
      '80–250 A',
      'Au-delà de 250 A',
    ]),
    field('voltage', 'Tension réseau', ['230 V monophasé', '400 V triphasé']),
    field('ipRequirement', 'Environnement / IP', [
      'Tableau intérieur',
      'Local technique',
      'Extérieur ou humide',
    ]),
  ],
  'Câbles, chemins de câbles et connectique': [
    field('conductor', 'Conducteur', ['Cuivre', 'Aluminium', 'À conseiller']),
    field('crossSection', 'Section souhaitée', [
      '1,5–6 mm²',
      '10–35 mm²',
      '50–150 mm²',
      'Au-delà de 150 mm²',
    ]),
    field('installation', 'Mode de pose', [
      'Gaine / encastré',
      'Chemin de câbles',
      'Enterré',
      'Extérieur',
    ]),
    field('length', 'Longueur estimée', ['Moins de 50 m', '50–200 m', 'Plus de 200 m']),
  ],
  'Automatisme et contrôle industriel': [
    field('supply', 'Alimentation', ['24 V DC', '100–240 V AC', 'À confirmer']),
    field('communication', 'Communication', [
      'Aucune',
      'Modbus',
      'Ethernet industriel',
      'À conseiller',
    ]),
    field('mounting', 'Montage', ['Rail DIN', 'Porte d’armoire', 'Pupitre / façade']),
    field('ipRequirement', 'Indice IP souhaité', [
      'IP20 armoire',
      'IP54 atelier',
      'IP65 environnement exposé',
    ]),
  ],
  'Moteurs, entraînement et pompage': [
    field('ratedPower', 'Puissance souhaitée', [
      'Jusqu’à 1,5 kW',
      '2,2–7,5 kW',
      '11–30 kW',
      'Au-delà de 30 kW',
    ]),
    field('supply', 'Alimentation', ['230 V monophasé', '400 V triphasé', 'À confirmer']),
    field('duty', 'Mode de service', ['Ponctuel', 'Continu', 'Variable / variateur']),
    field('ipRequirement', 'Protection / environnement', [
      'Intérieur sec',
      'Local technique IP55',
      'Milieu humide / extérieur',
    ]),
  ],
  'Solaire, stockage et alimentation de secours': [
    field('ratedPower', 'Puissance ou capacité cible', [
      'Petite installation',
      'Installation moyenne',
      'Installation professionnelle',
      'À étudier',
    ]),
    field('systemVoltage', 'Tension système', ['12 V', '24 V', '48 V', 'Réseau 230/400 V']),
    field('autonomy', 'Autonomie souhaitée', [
      'Quelques heures',
      'Une journée',
      'Plusieurs jours',
      'À calculer',
    ]),
    field('mounting', 'Type de site', ['Toiture', 'Sol', 'Local technique', 'Site isolé']),
  ],
  Éclairage: [
    field('ratedPower', 'Puissance lumineuse', [
      'Faible puissance',
      'Puissance standard',
      'Haute puissance',
      'À conseiller',
    ]),
    field('colourTemperature', 'Température de couleur', [
      'Blanc chaud',
      'Blanc neutre',
      'Blanc froid',
    ]),
    field('mounting', 'Montage', ['Plafond', 'Mur', 'Encastré', 'Extérieur']),
    field('ipRequirement', 'Indice IP souhaité', [
      'Intérieur sec',
      'Humide / IP44',
      'Extérieur / IP65',
    ]),
  ],
  'Installation électrique résidentielle et bâtiment': [
    field('mounting', 'Type de pose', ['Encastré', 'Apparent', 'Tableau / rail DIN']),
    field('finish', 'Finition souhaitée', ['Standard', 'Premium', 'À assortir']),
    field('ipRequirement', 'Environnement', [
      'Intérieur sec',
      'Pièce humide',
      'Extérieur / étanche',
    ]),
  ],
  'Réseaux, sûreté et systèmes de bâtiment': [
    field('power', 'Alimentation', ['PoE', '12 V DC', '24 V DC', '230 V AC']),
    field('coverage', 'Zone à couvrir', ['Petite zone', 'Bâtiment', 'Site étendu']),
    field('storage', 'Besoins d’enregistrement', [
      'Sans enregistrement',
      '7 jours',
      '30 jours',
      'À dimensionner',
    ]),
    field('ipRequirement', 'Installation', ['Intérieur', 'Extérieur IP66', 'Milieu exigeant']),
  ],
  'Mesure, test, outils et EPI': [
    field('useCase', 'Usage principal', ['Installation', 'Maintenance', 'Diagnostic avancé']),
    field('range', 'Niveau de besoin', ['Usage courant', 'Professionnel', 'Industriel avancé']),
    field('protection', 'Protection requise', ['Standard', 'Isolé électrique', 'Haute protection']),
  ],
};

export function getProductConfigurationFields(
  product: CatalogueShopProduct
): readonly ProductConfigurationField[] {
  return configurations[product.categorie] ?? [];
}
