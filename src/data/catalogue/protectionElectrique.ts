export type CatalogueUsage = 'Résidentiel' | 'Commercial' | 'Industriel' | 'Multi-usage';

export interface CatalogueProduct {
  nom: string;
  slug: string;
  marque: string;
  gammeMarque: string;
  categorie: 'Protection et sécurité électrique';
  sousCategorie: string;
  usage: CatalogueUsage;
  descriptionCourte: string;
  description: string;
  caracteristiques: string[];
  applications: string[];
  variantesDisponibles: string[];
  produitsComplementaires: string[];
  alternativesCompatibles: string[];
  disponibilite: 'Disponible sur demande';
  statut: 'Actif';
  seoTitle: string;
  seoDescription: string;
  altImage: string;
}

type ProductInput = Omit<
  CatalogueProduct,
  'categorie' | 'disponibilite' | 'statut' | 'seoTitle' | 'seoDescription' | 'altImage'
>;

const product = (input: ProductInput): CatalogueProduct => ({
  ...input,
  categorie: 'Protection et sécurité électrique',
  disponibilite: 'Disponible sur demande',
  statut: 'Actif',
  seoTitle: input.nom,
  seoDescription: input.descriptionCourte,
  altImage: `${input.nom} – ${input.marque}`,
});

export const protectionElectriqueCatalog: CatalogueProduct[] = [
  product({
    nom: 'Disjoncteur modulaire unipolaire', slug: 'disjoncteur-modulaire-unipolaire', marque: 'Schneider Electric', gammeMarque: 'Protection modulaire', sousCategorie: 'Disjoncteurs modulaires', usage: 'Résidentiel',
    descriptionCourte: 'Protection de circuit monophasé pour tableau résidentiel.', description: 'Disjoncteur modulaire destiné à protéger les circuits d’éclairage et de prises contre les surcharges et les courts-circuits dans les tableaux résidentiels.',
    caracteristiques: ['Montage sur rail DIN', 'Courbe de déclenchement adaptée aux usages courants', 'Bornes à vis ou automatiques selon variante'], applications: ['Circuits d’éclairage', 'Prises domestiques', 'Petits départs dédiés'], variantesDisponibles: ['Calibres adaptés au circuit', 'Pouvoir de coupure selon installation'], produitsComplementaires: ['Peigne d’alimentation', 'Coffret modulaire', 'Interrupteur différentiel'], alternativesCompatibles: ['ABB', 'Hager', 'Legrand']
  }),
  product({
    nom: 'Disjoncteur modulaire bipolaire', slug: 'disjoncteur-modulaire-bipolaire', marque: 'Hager', gammeMarque: 'Protection modulaire', sousCategorie: 'Disjoncteurs modulaires', usage: 'Résidentiel',
    descriptionCourte: 'Protection et coupure simultanée des circuits monophasés.', description: 'Disjoncteur bipolaire modulaire assurant la protection des conducteurs actifs et une coupure adaptée aux circuits domestiques, tertiaires ou de petite puissance.',
    caracteristiques: ['Deux pôles', 'Montage rail DIN', 'Indicateur de position'], applications: ['Chauffe-eau', 'Climatisation légère', 'Circuits spécialisés'], variantesDisponibles: ['Différents calibres', 'Courbes de déclenchement B ou C'], produitsComplementaires: ['Contacteur jour/nuit', 'Parafoudre', 'Peigne bipolaire'], alternativesCompatibles: ['Schneider Electric', 'Legrand', 'CHINT']
  }),
  product({
    nom: 'Disjoncteur modulaire tripolaire', slug: 'disjoncteur-modulaire-tripolaire', marque: 'ABB', gammeMarque: 'Protection modulaire', sousCategorie: 'Disjoncteurs modulaires', usage: 'Commercial',
    descriptionCourte: 'Protection des départs triphasés de faible puissance.', description: 'Disjoncteur tripolaire compact pour la protection de départs triphasés dans les petits tableaux commerciaux, ateliers et installations techniques.',
    caracteristiques: ['Trois pôles', 'Rail DIN', 'Déclenchement thermique et magnétique'], applications: ['Petits moteurs', 'Pompes triphasées', 'Tableaux divisionnaires'], variantesDisponibles: ['Calibres adaptés aux départs', 'Courbes C ou D'], produitsComplementaires: ['Contacteur triphasé', 'Relais thermique', 'Coffret métallique'], alternativesCompatibles: ['Schneider Electric', 'Siemens', 'Eaton']
  }),

  product({
    nom: 'Disjoncteur boîtier moulé tripolaire', slug: 'disjoncteur-boitier-moule-tripolaire', marque: 'Schneider Electric', gammeMarque: 'Protection de puissance', sousCategorie: 'Disjoncteurs boîtier moulé', usage: 'Industriel',
    descriptionCourte: 'Protection réglable pour départs de puissance et tableaux industriels.', description: 'Disjoncteur boîtier moulé destiné à la protection des départs de distribution et d’équipements de puissance, avec réglages adaptés au dimensionnement du réseau.',
    caracteristiques: ['Boîtier isolant compact', 'Réglages de protection selon version', 'Commande manuelle en face avant'], applications: ['Départs de tableau', 'Groupes de pompage', 'Machines industrielles'], variantesDisponibles: ['3 ou 4 pôles', 'Déclencheur thermique-magnétique ou électronique'], produitsComplementaires: ['Coffret de puissance', 'Cosses de raccordement', 'Analyseur réseau'], alternativesCompatibles: ['ABB', 'Eaton', 'Siemens']
  }),
  product({
    nom: 'Disjoncteur boîtier moulé quatre pôles', slug: 'disjoncteur-boitier-moule-quatre-poles', marque: 'Eaton', gammeMarque: 'Power distribution', sousCategorie: 'Disjoncteurs boîtier moulé', usage: 'Industriel',
    descriptionCourte: 'Protection de distribution incluant le conducteur neutre.', description: 'Disjoncteur quatre pôles pour installations triphasées avec neutre, conçu pour protéger les départs critiques et faciliter l’isolement complet du circuit.',
    caracteristiques: ['Quatre pôles', 'Raccordement par bornes ou plages', 'Accessoires de signalisation possibles'], applications: ['Tableaux généraux', 'Alimentations de bâtiments', 'Charges triphasées avec neutre'], variantesDisponibles: ['Différents cadres de courant', 'Accessoires de commande'], produitsComplementaires: ['Inverseur de source', 'Parafoudre de tableau', 'Barres cuivre'], alternativesCompatibles: ['Schneider Electric', 'ABB', 'LS Electric']
  }),
  product({
    nom: 'Disjoncteur boîtier moulé à déclencheur électronique', slug: 'disjoncteur-boitier-moule-declencheur-electronique', marque: 'ABB', gammeMarque: 'Smart power', sousCategorie: 'Disjoncteurs boîtier moulé', usage: 'Industriel',
    descriptionCourte: 'Protection sélective pour tableaux et départs industriels exigeants.', description: 'Disjoncteur de puissance compacte avec unité électronique permettant d’ajuster les seuils de protection aux contraintes de sélectivité et de continuité de service.',
    caracteristiques: ['Unité de protection électronique', 'Réglages de longue et courte durée', 'Indication d’état selon version'], applications: ['Centres de contrôle moteur', 'Distribution industrielle', 'Infrastructures techniques'], variantesDisponibles: ['3 ou 4 pôles', 'Communication selon configuration'], produitsComplementaires: ['Relais de protection', 'Compteur d’énergie', 'Câbles de puissance'], alternativesCompatibles: ['Schneider Electric', 'Siemens', 'Eaton']
  }),

  product({
    nom: 'Disjoncteur de puissance ouvert', slug: 'disjoncteur-de-puissance-ouvert', marque: 'Schneider Electric', gammeMarque: 'Distribution principale', sousCategorie: 'Disjoncteurs de puissance', usage: 'Industriel',
    descriptionCourte: 'Protection principale pour tableaux généraux de forte puissance.', description: 'Disjoncteur ouvert destiné aux arrivées principales et couplages de tableaux, avec protections réglables et possibilités d’intégration dans une architecture de distribution supervisée.',
    caracteristiques: ['Châssis ouvert', 'Unité de protection électronique', 'Commande manuelle ou motorisée'], applications: ['TGBT', 'Arrivée groupe électrogène', 'Couplage de sources'], variantesDisponibles: ['Fixe ou débrochable', '3 ou 4 pôles'], produitsComplementaires: ['Inverseur automatique', 'Analyseur de qualité réseau', 'Jeu de barres'], alternativesCompatibles: ['ABB', 'Siemens', 'Eaton']
  }),
  product({
    nom: 'Disjoncteur de puissance débrochable', slug: 'disjoncteur-de-puissance-debrochable', marque: 'Siemens', gammeMarque: 'Protection de distribution', sousCategorie: 'Disjoncteurs de puissance', usage: 'Industriel',
    descriptionCourte: 'Appareil principal débrochable pour maintenance sécurisée de tableau.', description: 'Disjoncteur de puissance monté sur châssis débrochable pour simplifier les opérations de maintenance et d’essai sans démonter le tableau de distribution.',
    caracteristiques: ['Position service, essai et sectionné', 'Unité électronique', 'Interverrouillages mécaniques'], applications: ['TGBT industriels', 'Data rooms', 'Bâtiments critiques'], variantesDisponibles: ['Commande motorisée', 'Contacts auxiliaires'], produitsComplementaires: ['Verrouillage de sécurité', 'Bobine de déclenchement', 'Supervision énergie'], alternativesCompatibles: ['Schneider Electric', 'ABB', 'Eaton']
  }),
  product({
    nom: 'Disjoncteur de puissance motorisable', slug: 'disjoncteur-de-puissance-motorisable', marque: 'Eaton', gammeMarque: 'Power management', sousCategorie: 'Disjoncteurs de puissance', usage: 'Industriel',
    descriptionCourte: 'Disjoncteur principal préparé pour commande à distance.', description: 'Disjoncteur de puissance conçu pour les tableaux où la commande, le report d’état et l’intégration à une logique de transfert doivent être prévus.',
    caracteristiques: ['Prédisposition à la motorisation', 'Contacts auxiliaires', 'Protections configurables'], applications: ['Transfert de source', 'Tableaux supervisés', 'Installations critiques'], variantesDisponibles: ['Commande locale ou distante', 'Fonctions de communication'], produitsComplementaires: ['Automate de transfert', 'Bobine manque de tension', 'Coffret de commande'], alternativesCompatibles: ['Schneider Electric', 'ABB', 'Socomec']
  }),

  product({
    nom: 'Interrupteur différentiel bipolaire', slug: 'interrupteur-differentiel-bipolaire', marque: 'Legrand', gammeMarque: 'Protection résidentielle', sousCategorie: 'Interrupteurs différentiels', usage: 'Résidentiel',
    descriptionCourte: 'Protection différentielle des personnes pour tableau monophasé.', description: 'Interrupteur différentiel bipolaire placé en tête de groupe de circuits afin de détecter les défauts d’isolement et d’améliorer la protection des utilisateurs.',
    caracteristiques: ['Deux pôles', 'Montage rail DIN', 'Bouton de test'], applications: ['Tableau résidentiel', 'Petits commerces', 'Dépendances'], variantesDisponibles: ['Sensibilités adaptées à l’usage', 'Types AC ou A'], produitsComplementaires: ['Disjoncteur modulaire', 'Coffret encastré', 'Peigne d’alimentation'], alternativesCompatibles: ['Schneider Electric', 'Hager', 'ABB']
  }),
  product({
    nom: 'Interrupteur différentiel tétrapolaire', slug: 'interrupteur-differentiel-tetrapolaire', marque: 'Hager', gammeMarque: 'Protection modulaire', sousCategorie: 'Interrupteurs différentiels', usage: 'Commercial',
    descriptionCourte: 'Protection différentielle pour circuits triphasés avec neutre.', description: 'Interrupteur différentiel tétrapolaire destiné à protéger plusieurs départs triphasés ou un groupe de circuits dans un tableau commercial ou technique.',
    caracteristiques: ['Quatre pôles', 'Bouton d’essai', 'Rail DIN'], applications: ['Ateliers', 'Cuisines professionnelles', 'Climatisation triphasée'], variantesDisponibles: ['Types AC, A ou B selon besoin', 'Sensibilités adaptées'], produitsComplementaires: ['Disjoncteur tripolaire', 'Parafoudre triphasé', 'Coffret de distribution'], alternativesCompatibles: ['Schneider Electric', 'ABB', 'CHINT']
  }),
  product({
    nom: 'Interrupteur différentiel sélectif', slug: 'interrupteur-differentiel-selectif', marque: 'Schneider Electric', gammeMarque: 'Protection modulaire', sousCategorie: 'Interrupteurs différentiels', usage: 'Industriel',
    descriptionCourte: 'Protection différentielle temporisée pour coordination des tableaux.', description: 'Interrupteur différentiel sélectif conçu pour coordonner les protections en cascade et réduire les coupures étendues lors d’un défaut localisé.',
    caracteristiques: ['Temporisation sélective', 'Montage modulaire', 'Test manuel'], applications: ['Tableau général', 'Sous-tableaux', 'Installations à continuité de service'], variantesDisponibles: ['Bipolaire ou tétrapolaire', 'Sensibilités adaptées'], produitsComplementaires: ['Disjoncteurs divisionnaires', 'Relais différentiel', 'Parafoudre'], alternativesCompatibles: ['ABB', 'Siemens', 'Eaton']
  }),

  product({
    nom: 'Dispositif différentiel résiduel type AC', slug: 'dispositif-differentiel-residuel-type-ac', marque: 'CHINT', gammeMarque: 'Protection modulaire', sousCategorie: 'Dispositifs différentiels résiduels', usage: 'Résidentiel',
    descriptionCourte: 'Protection différentielle pour circuits à courant alternatif standard.', description: 'Dispositif différentiel résiduel destiné aux circuits usuels ne comportant pas de charges électroniques générant des composantes continues significatives.',
    caracteristiques: ['Détection de défaut alternatif', 'Montage modulaire', 'Test intégré'], applications: ['Éclairage', 'Prises générales', 'Petits circuits auxiliaires'], variantesDisponibles: ['Différentes sensibilités', 'Versions bipolaires'], produitsComplementaires: ['Disjoncteur modulaire', 'Peigne d’alimentation', 'Coffret électrique'], alternativesCompatibles: ['Legrand', 'Hager', 'Schneider Electric']
  }),
  product({
    nom: 'Dispositif différentiel résiduel type A', slug: 'dispositif-differentiel-residuel-type-a', marque: 'Schneider Electric', gammeMarque: 'Protection modulaire', sousCategorie: 'Dispositifs différentiels résiduels', usage: 'Résidentiel',
    descriptionCourte: 'Protection différentielle pour charges avec électronique de puissance.', description: 'Dispositif différentiel adapté aux circuits alimentant des équipements dont la commande électronique peut générer des composantes de défaut particulières.',
    caracteristiques: ['Détection AC et composante pulsée', 'Rail DIN', 'Bouton de test'], applications: ['Lave-linge', 'Plaques de cuisson', 'Bornes et alimentations électroniques'], variantesDisponibles: ['Bipolaire ou tétrapolaire', 'Sensibilités adaptées'], produitsComplementaires: ['Disjoncteur dédié', 'Parafoudre', 'Coffret modulaire'], alternativesCompatibles: ['ABB', 'Hager', 'Legrand']
  }),
  product({
    nom: 'Dispositif différentiel résiduel industriel', slug: 'dispositif-differentiel-residuel-industriel', marque: 'ABB', gammeMarque: 'Protection industrielle', sousCategorie: 'Dispositifs différentiels résiduels', usage: 'Industriel',
    descriptionCourte: 'Protection différentielle adaptée aux départs industriels sensibles.', description: 'Dispositif différentiel pour départs industriels nécessitant une protection adaptée aux courants de fuite et à la continuité de service du procédé.',
    caracteristiques: ['Compatible départs industriels', 'Signalisation selon variante', 'Montage sur tableau'], applications: ['Machines', 'Pompes', 'Armoires de commande'], variantesDisponibles: ['Types adaptés aux variateurs', 'Seuils réglables selon version'], produitsComplementaires: ['Relais différentiel', 'Transformateur torique', 'Contacteur de puissance'], alternativesCompatibles: ['Schneider Electric', 'Siemens', 'Eaton']
  }),

  product({
    nom: 'Fusible cylindrique gG', slug: 'fusible-cylindrique-gg', marque: 'Legrand', gammeMarque: 'Protection par fusible', sousCategorie: 'Fusibles et porte-fusibles', usage: 'Multi-usage',
    descriptionCourte: 'Fusible polyvalent pour protection générale des circuits.', description: 'Fusible cylindrique de type général destiné à protéger les conducteurs et équipements contre les surintensités dans les tableaux et coffrets.',
    caracteristiques: ['Cartouche cylindrique', 'Protection générale', 'Remplacement simple'], applications: ['Coffrets de commande', 'Petits tableaux', 'Circuits auxiliaires'], variantesDisponibles: ['Dimensions et calibres adaptés', 'Pouvoir de coupure selon version'], produitsComplementaires: ['Porte-fusible', 'Sectionneur fusible', 'Étiquette de repérage'], alternativesCompatibles: ['Mersen', 'Schneider Electric', 'Eaton']
  }),
  product({
    nom: 'Fusible aM de protection moteur', slug: 'fusible-am-protection-moteur', marque: 'Mersen', gammeMarque: 'Protection moteur', sousCategorie: 'Fusibles et porte-fusibles', usage: 'Industriel',
    descriptionCourte: 'Fusible associé à une protection de surcharge moteur.', description: 'Fusible aM conçu pour la protection contre les courts-circuits des départs moteur, à utiliser avec un relais thermique ou une protection de surcharge adaptée.',
    caracteristiques: ['Protection contre court-circuit', 'Association avec relais thermique', 'Format industriel'], applications: ['Départs moteur', 'Pompes', 'Ventilation'], variantesDisponibles: ['Cartouches cylindriques ou à couteaux', 'Calibres selon moteur'], produitsComplementaires: ['Porte-fusible', 'Contacteur', 'Relais thermique'], alternativesCompatibles: ['Eaton', 'Siemens', 'Schneider Electric']
  }),
  product({
    nom: 'Porte-fusible modulaire', slug: 'porte-fusible-modulaire', marque: 'ABB', gammeMarque: 'Protection modulaire', sousCategorie: 'Fusibles et porte-fusibles', usage: 'Commercial',
    descriptionCourte: 'Support modulaire sécurisé pour cartouche fusible en tableau.', description: 'Porte-fusible à montage DIN permettant l’intégration propre et repérée de cartouches de protection dans un tableau électrique.',
    caracteristiques: ['Montage rail DIN', 'Capot de protection', 'Repérage possible'], applications: ['Tableaux divisionnaires', 'Circuits de commande', 'Éclairage commercial'], variantesDisponibles: ['Unipolaire à tétrapolaire', 'Formats de cartouche adaptés'], produitsComplementaires: ['Cartouche fusible', 'Peigne d’alimentation', 'Étiquette de repérage'], alternativesCompatibles: ['Schneider Electric', 'Legrand', 'CHINT']
  }),

  product({
    nom: 'Contacteur modulaire silencieux', slug: 'contacteur-modulaire-silencieux', marque: 'Schneider Electric', gammeMarque: 'Commande modulaire', sousCategorie: 'Contacteurs et relais thermiques', usage: 'Résidentiel',
    descriptionCourte: 'Commande automatique de circuits résidentiels et tertiaires légers.', description: 'Contacteur modulaire conçu pour la commande répétitive de charges telles que chauffe-eau, éclairage ou ventilation dans un tableau électrique.',
    caracteristiques: ['Montage rail DIN', 'Commande par bobine', 'Fonctionnement discret selon version'], applications: ['Chauffe-eau', 'Éclairage commandé', 'Ventilation'], variantesDisponibles: ['Contacts normalement ouverts ou fermés', 'Bobines adaptées au réseau'], produitsComplementaires: ['Horloge modulaire', 'Disjoncteur de commande', 'Contact auxiliaire'], alternativesCompatibles: ['Hager', 'Legrand', 'ABB']
  }),
  product({
    nom: 'Contacteur de puissance triphasé', slug: 'contacteur-puissance-triphase', marque: 'Siemens', gammeMarque: 'Commande moteur', sousCategorie: 'Contacteurs et relais thermiques', usage: 'Industriel',
    descriptionCourte: 'Commande de moteurs et charges triphasées en armoire industrielle.', description: 'Contacteur électromécanique pour établir et interrompre de façon répétée l’alimentation de moteurs et de charges de puissance.',
    caracteristiques: ['Trois pôles principaux', 'Bobine de commande', 'Contacts auxiliaires ajoutables'], applications: ['Pompes', 'Compresseurs', 'Ventilation industrielle'], variantesDisponibles: ['Calibres adaptés à la charge', 'Bobines de commande diverses'], produitsComplementaires: ['Relais thermique', 'Disjoncteur moteur', 'Bouton-poussoir'], alternativesCompatibles: ['Schneider Electric', 'ABB', 'LS Electric']
  }),
  product({
    nom: 'Relais thermique réglable', slug: 'relais-thermique-reglable', marque: 'ABB', gammeMarque: 'Protection moteur', sousCategorie: 'Contacteurs et relais thermiques', usage: 'Industriel',
    descriptionCourte: 'Protection contre surcharge pour départs moteur avec contacteur.', description: 'Relais thermique réglable à associer à un contacteur afin de détecter les surcharges prolongées et préserver l’enroulement du moteur.',
    caracteristiques: ['Réglage selon courant nominal moteur', 'Réarmement manuel ou automatique', 'Contacts auxiliaires de défaut'], applications: ['Démarrage direct', 'Pompes', 'Convoyeurs'], variantesDisponibles: ['Plages de réglage adaptées', 'Classes de déclenchement selon version'], produitsComplementaires: ['Contacteur', 'Fusible aM', 'Disjoncteur moteur'], alternativesCompatibles: ['Schneider Electric', 'Siemens', 'Eaton']
  }),

  product({
    nom: 'Relais de protection de phase', slug: 'relais-protection-phase', marque: 'Schneider Electric', gammeMarque: 'Contrôle réseau', sousCategorie: 'Relais de protection', usage: 'Industriel',
    descriptionCourte: 'Surveillance de perte, ordre et déséquilibre des phases.', description: 'Relais de surveillance réseau triphasé permettant de protéger les équipements contre les anomalies de phase susceptibles d’endommager les moteurs.',
    caracteristiques: ['Contrôle présence de phase', 'Surveillance ordre des phases', 'Sortie relais'], applications: ['Pompes', 'Compresseurs', 'Armoires moteur'], variantesDisponibles: ['Seuils et temporisations réglables', 'Montage rail DIN'], produitsComplementaires: ['Contacteur de puissance', 'Relais thermique', 'Voyant de signalisation'], alternativesCompatibles: ['Siemens', 'ABB', 'Finder']
  }),
  product({
    nom: 'Relais de protection tension', slug: 'relais-protection-tension', marque: 'Siemens', gammeMarque: 'Surveillance réseau', sousCategorie: 'Relais de protection', usage: 'Commercial',
    descriptionCourte: 'Surveillance de sous-tension et surtension des alimentations.', description: 'Relais de surveillance permettant de commander l’arrêt ou la mise en sécurité d’un équipement lorsque la tension d’alimentation sort de la plage définie.',
    caracteristiques: ['Seuils de tension réglables', 'Temporisation réglable', 'Sortie inverseur'], applications: ['Équipements sensibles', 'Coffrets de climatisation', 'Alimentations de commande'], variantesDisponibles: ['Monophasé ou triphasé', 'Montage sur rail DIN'], produitsComplementaires: ['Parafoudre', 'Contacteur', 'Voyant d’alarme'], alternativesCompatibles: ['Schneider Electric', 'ABB', 'Eaton']
  }),
  product({
    nom: 'Relais différentiel avec tore', slug: 'relais-differentiel-avec-tore', marque: 'Socomec', gammeMarque: 'Protection différentielle', sousCategorie: 'Relais de protection', usage: 'Industriel',
    descriptionCourte: 'Détection réglable des défauts d’isolement sur départs de puissance.', description: 'Relais différentiel associé à un tore de mesure pour détecter les courants de fuite sur une installation et commander une alarme ou un déclenchement.',
    caracteristiques: ['Tore de mesure séparé', 'Seuil de défaut réglable', 'Temporisation réglable'], applications: ['Départs de puissance', 'Tableaux industriels', 'Sites techniques'], variantesDisponibles: ['Diamètres de tore adaptés', 'Sortie alarme ou déclenchement'], produitsComplementaires: ['Disjoncteur à émission', 'Coffret de signalisation', 'Analyseur réseau'], alternativesCompatibles: ['Schneider Electric', 'ABB', 'Eaton']
  }),

  product({
    nom: 'Parafoudre monophasé de tableau', slug: 'parafoudre-monophase-tableau', marque: 'Legrand', gammeMarque: 'Protection surtension', sousCategorie: 'Parafoudres et protection surtension', usage: 'Résidentiel',
    descriptionCourte: 'Protection du tableau contre les surtensions transitoires.', description: 'Parafoudre modulaire destiné à réduire les effets des surtensions liées à la foudre ou aux manœuvres réseau sur les équipements d’un bâtiment.',
    caracteristiques: ['Montage rail DIN', 'Indication d’état selon version', 'Connexion au réseau de terre'], applications: ['Tableaux résidentiels', 'Petits commerces', 'Équipements électroniques'], variantesDisponibles: ['Type adapté à l’exposition', 'Cartouche remplaçable selon version'], produitsComplementaires: ['Disjoncteur de sauvegarde', 'Barrette de terre', 'Interrupteur différentiel'], alternativesCompatibles: ['Schneider Electric', 'Hager', 'ABB']
  }),
  product({
    nom: 'Parafoudre triphasé de tableau', slug: 'parafoudre-triphase-tableau', marque: 'Schneider Electric', gammeMarque: 'Protection surtension', sousCategorie: 'Parafoudres et protection surtension', usage: 'Commercial',
    descriptionCourte: 'Protection triphasée des tableaux et équipements connectés.', description: 'Parafoudre triphasé pour tableaux de distribution assurant la protection coordonnée des lignes alimentant les équipements commerciaux et techniques.',
    caracteristiques: ['Protection triphasée', 'Montage modulaire', 'Indicateur d’état'], applications: ['Tableaux commerciaux', 'Climatisation', 'Équipements informatiques'], variantesDisponibles: ['Réseaux avec ou sans neutre', 'Types adaptés au niveau de risque'], produitsComplementaires: ['Disjoncteur de protection', 'Barrette de terre', 'Onduleur'], alternativesCompatibles: ['ABB', 'Eaton', 'Socomec']
  }),
  product({
    nom: 'Protection surtension pour ligne de données', slug: 'protection-surtension-ligne-donnees', marque: 'Phoenix Contact', gammeMarque: 'Protection interface', sousCategorie: 'Parafoudres et protection surtension', usage: 'Industriel',
    descriptionCourte: 'Protection des lignes de communication et de signal faible.', description: 'Module de protection destiné aux lignes de données, d’instrumentation ou de commande exposées aux surtensions transitoires.',
    caracteristiques: ['Protection de signal faible', 'Montage sur rail ou en ligne', 'Raccordement de terre'], applications: ['Réseaux de communication', 'Capteurs', 'Automates'], variantesDisponibles: ['Interfaces selon protocole', 'Montage DIN ou boîtier'], produitsComplementaires: ['Parafoudre alimentation', 'Bornier de terre', 'Câble blindé'], alternativesCompatibles: ['WAGO', 'Schneider Electric', 'Weidmüller']
  }),

  product({
    nom: 'Disjoncteur moteur réglable', slug: 'disjoncteur-moteur-reglable', marque: 'Schneider Electric', gammeMarque: 'Protection moteur', sousCategorie: 'Protection moteur', usage: 'Industriel',
    descriptionCourte: 'Protection compacte contre surcharge et court-circuit de moteur.', description: 'Disjoncteur moteur réglable destiné à la protection et à l’isolement des petits moteurs, en association ou non avec un contacteur.',
    caracteristiques: ['Réglage thermique', 'Déclenchement magnétique', 'Commande rotative'], applications: ['Pompes', 'Ventilateurs', 'Convoyeurs'], variantesDisponibles: ['Plages de réglage par moteur', 'Accessoires auxiliaires'], produitsComplementaires: ['Contacteur', 'Coffret moteur', 'Bouton d’arrêt'], alternativesCompatibles: ['ABB', 'Siemens', 'Eaton']
  }),
  product({
    nom: 'Relais de surveillance moteur', slug: 'relais-surveillance-moteur', marque: 'Siemens', gammeMarque: 'Surveillance moteur', sousCategorie: 'Protection moteur', usage: 'Industriel',
    descriptionCourte: 'Surveillance d’état et défauts de fonctionnement moteur.', description: 'Relais de protection pour surveiller des conditions telles que surcharge, sous-charge, perte de phase ou déséquilibre afin d’améliorer la disponibilité du moteur.',
    caracteristiques: ['Seuils paramétrables', 'Sorties de défaut', 'Montage sur rail ou en façade'], applications: ['Pompage', 'Ventilation', 'Machines de production'], variantesDisponibles: ['Entrées de capteur selon version', 'Communication selon modèle'], produitsComplementaires: ['Contacteur', 'Transformateur de courant', 'Voyant d’alarme'], alternativesCompatibles: ['Schneider Electric', 'ABB', 'Eaton']
  }),
  product({
    nom: 'Coffret de protection moteur', slug: 'coffret-protection-moteur', marque: 'LS Electric', gammeMarque: 'Commande et protection moteur', sousCategorie: 'Protection moteur', usage: 'Industriel',
    descriptionCourte: 'Ensemble prêt à câbler pour protection et commande de moteur.', description: 'Coffret de protection moteur intégrant les composants nécessaires pour sécuriser un départ moteur et faciliter son exploitation sur site.',
    caracteristiques: ['Boîtier adapté à l’environnement', 'Protection et commande intégrables', 'Repérage des organes'], applications: ['Pompes de forage', 'Ventilation', 'Petits équipements industriels'], variantesDisponibles: ['Démarrage direct ou étoile-triangle', 'Indice de protection selon environnement'], produitsComplementaires: ['Arrêt d’urgence', 'Câble moteur', 'Flotteur de niveau'], alternativesCompatibles: ['Schneider Electric', 'ABB', 'Siemens']
  }),

  product({
    nom: 'Interrupteur-sectionneur rotatif', slug: 'interrupteur-sectionneur-rotatif', marque: 'Socomec', gammeMarque: 'Coupure de sécurité', sousCategorie: 'Sectionneurs et interrupteurs de sécurité', usage: 'Industriel',
    descriptionCourte: 'Coupure locale visible pour isolement sécurisé des équipements.', description: 'Interrupteur-sectionneur rotatif destiné à isoler une machine ou un départ électrique lors des opérations de maintenance et de consignation.',
    caracteristiques: ['Commande rotative', 'Position verrouillable', 'Montage en coffret ou panneau'], applications: ['Machines', 'Pompes', 'Armoires électriques'], variantesDisponibles: ['3 ou 4 pôles', 'Montage porte ou fond de coffret'], produitsComplementaires: ['Cadenas de consignation', 'Étiquette de sécurité', 'Coffret étanche'], alternativesCompatibles: ['Schneider Electric', 'ABB', 'Eaton']
  }),
  product({
    nom: 'Sectionneur porte-fusible triphasé', slug: 'sectionneur-porte-fusible-triphase', marque: 'Eaton', gammeMarque: 'Coupure et protection', sousCategorie: 'Sectionneurs et interrupteurs de sécurité', usage: 'Industriel',
    descriptionCourte: 'Isolement et protection par fusible des départs triphasés.', description: 'Sectionneur porte-fusible permettant de couper un départ en charge et d’intégrer la protection par cartouches adaptées à l’équipement alimenté.',
    caracteristiques: ['Trois pôles', 'Logement pour cartouches', 'Manœuvre sécurisée'], applications: ['Départs moteur', 'Coffrets de commande', 'Tableaux industriels'], variantesDisponibles: ['Formats de fusible variés', 'Montage rail ou panneau'], produitsComplementaires: ['Fusible aM', 'Cosses de câble', 'Contacteur'], alternativesCompatibles: ['Schneider Electric', 'ABB', 'Siemens']
  }),
  product({
    nom: 'Interrupteur de sécurité cadenassable', slug: 'interrupteur-securite-cadenassable', marque: 'ABB', gammeMarque: 'Safety switch', sousCategorie: 'Sectionneurs et interrupteurs de sécurité', usage: 'Commercial',
    descriptionCourte: 'Coupure locale cadenassable pour maintenance d’équipement.', description: 'Interrupteur de sécurité conçu pour l’isolement local d’un équipement avec possibilité de verrouillage en position ouverte durant les interventions.',
    caracteristiques: ['Poignée verrouillable', 'Boîtier adapté à l’installation', 'Coupure omnipolaire selon variante'], applications: ['Climatisation', 'Pompes', 'Équipements de cuisine'], variantesDisponibles: ['Montage apparent ou encastré', 'Indices de protection adaptés'], produitsComplementaires: ['Cadenas de consignation', 'Plaque de repérage', 'Câble d’alimentation'], alternativesCompatibles: ['Schneider Electric', 'Eaton', 'Socomec']
  }),

  product({
    nom: 'Barrette principale de terre', slug: 'barrette-principale-terre', marque: 'Legrand', gammeMarque: 'Mise à la terre', sousCategorie: 'Mise à la terre et protection équipotentielle', usage: 'Résidentiel',
    descriptionCourte: 'Point de connexion et de contrôle du réseau de terre.', description: 'Barrette de coupure principale destinée à raccorder l’électrode de terre à l’installation et à permettre le contrôle périodique de la continuité.',
    caracteristiques: ['Bornes de raccordement', 'Point de contrôle démontable', 'Matériaux résistants à la corrosion'], applications: ['Maisons', 'Commerces', 'Petits bâtiments'], variantesDisponibles: ['Formats selon section de conducteur', 'Montage mural'], produitsComplementaires: ['Piquet de terre', 'Conducteur cuivre', 'Regard de visite'], alternativesCompatibles: ['Schneider Electric', 'Hager', 'OBO Bettermann']
  }),
  product({
    nom: 'Kit de mise à la terre par piquet', slug: 'kit-mise-terre-piquet', marque: 'OBO Bettermann', gammeMarque: 'Earthing systems', sousCategorie: 'Mise à la terre et protection équipotentielle', usage: 'Multi-usage',
    descriptionCourte: 'Éléments de base pour réalisation d’une prise de terre.', description: 'Ensemble de composants destiné à constituer une prise de terre adaptée au site, avec piquet, raccordement et éléments de contrôle à définir selon étude.',
    caracteristiques: ['Piquet et raccordement', 'Matériaux adaptés au sol', 'Installation enterrée'], applications: ['Bâtiments neufs', 'Coffrets extérieurs', 'Installations techniques'], variantesDisponibles: ['Longueurs de piquet variées', 'Conducteurs cuivre nu ou isolé'], produitsComplementaires: ['Barrette de coupure', 'Regard de terre', 'Parafoudre'], alternativesCompatibles: ['Legrand', 'Schneider Electric', 'nVent ERICO']
  }),
  product({
    nom: 'Borne équipotentielle principale', slug: 'borne-equipotentielle-principale', marque: 'Phoenix Contact', gammeMarque: 'Grounding terminal', sousCategorie: 'Mise à la terre et protection équipotentielle', usage: 'Commercial',
    descriptionCourte: 'Raccordement équipotentiel des masses métalliques et réseaux de terre.', description: 'Borne de raccordement conçue pour organiser les connexions équipotentielles entre éléments métalliques, terre principale et conducteurs de protection.',
    caracteristiques: ['Bornes multiples', 'Raccordement conducteurs de protection', 'Montage tableau ou mural'], applications: ['Locaux techniques', 'Bâtiments tertiaires', 'Armoires électriques'], variantesDisponibles: ['Nombre de départs variable', 'Sections de conducteur adaptées'], produitsComplementaires: ['Barrette de terre', 'Conducteur vert-jaune', 'Parafoudre'], alternativesCompatibles: ['WAGO', 'Legrand', 'OBO Bettermann']
  }),

  product({
    nom: 'Détecteur d’arc électrique modulaire', slug: 'detecteur-arc-electrique-modulaire', marque: 'Siemens', gammeMarque: 'Protection incendie électrique', sousCategorie: 'Protection arc électrique', usage: 'Résidentiel',
    descriptionCourte: 'Détection des défauts d’arc sur circuits terminaux sensibles.', description: 'Appareil modulaire de détection d’arc destiné à réduire le risque d’échauffement et d’incendie liés à certains défauts de connexion ou de câble.',
    caracteristiques: ['Montage rail DIN', 'Surveillance du circuit', 'Signalisation de défaut'], applications: ['Chambres', 'Circuits bois', 'Locaux à risque'], variantesDisponibles: ['Bipolaire selon installation', 'Association avec disjoncteur'], produitsComplementaires: ['Disjoncteur modulaire', 'Interrupteur différentiel', 'Coffret résidentiel'], alternativesCompatibles: ['Schneider Electric', 'ABB', 'Hager']
  }),
  product({
    nom: 'Relais de détection d’arc en tableau', slug: 'relais-detection-arc-tableau', marque: 'ABB', gammeMarque: 'Arc protection', sousCategorie: 'Protection arc électrique', usage: 'Industriel',
    descriptionCourte: 'Détection rapide d’arc interne dans les tableaux de distribution.', description: 'Relais de protection destiné à détecter un arc interne via capteurs lumineux et courant afin de commander rapidement la mise hors tension du tableau concerné.',
    caracteristiques: ['Entrées capteurs optiques', 'Logique de déclenchement', 'Sorties de commande'], applications: ['TGBT', 'Cellules de distribution', 'Tableaux industriels'], variantesDisponibles: ['Nombre de capteurs variable', 'Extension de zones'], produitsComplementaires: ['Disjoncteur à émission', 'Capteur optique', 'Coffret de signalisation'], alternativesCompatibles: ['Schneider Electric', 'Siemens', 'Eaton']
  }),
  product({
    nom: 'Capteur optique de détection d’arc', slug: 'capteur-optique-detection-arc', marque: 'Eaton', gammeMarque: 'Arc flash protection', sousCategorie: 'Protection arc électrique', usage: 'Industriel',
    descriptionCourte: 'Capteur pour système de détection d’arc dans un tableau.', description: 'Capteur optique à installer dans les compartiments d’un tableau afin de détecter la lumière intense générée par un arc interne et transmettre l’information au relais de protection.',
    caracteristiques: ['Détection lumineuse rapide', 'Montage en compartiment', 'Raccordement au relais dédié'], applications: ['Tableaux de puissance', 'Cellules moyenne tension', 'Centres de contrôle moteur'], variantesDisponibles: ['Longueurs de câble adaptées', 'Capteurs ponctuels ou linéaires'], produitsComplementaires: ['Relais d’arc', 'Disjoncteur de puissance', 'Bobine de déclenchement'], alternativesCompatibles: ['ABB', 'Schneider Electric', 'Siemens']
  }),

  product({
    nom: 'Voyant lumineux de tableau', slug: 'voyant-lumineux-tableau', marque: 'Schneider Electric', gammeMarque: 'Signalisation industrielle', sousCategorie: 'Signalisation, alarmes et sécurité de tableau', usage: 'Multi-usage',
    descriptionCourte: 'Signalisation visuelle de présence tension ou état de machine.', description: 'Voyant lumineux à installer en porte ou façade d’armoire pour indiquer l’état d’un circuit, d’une alimentation ou d’une fonction de commande.',
    caracteristiques: ['Montage en façade', 'Source lumineuse durable selon version', 'Couleurs de signalisation disponibles'], applications: ['Armoires électriques', 'Pupitres de commande', 'Coffrets techniques'], variantesDisponibles: ['Couleurs variées', 'Tensions de commande adaptées'], produitsComplementaires: ['Bouton-poussoir', 'Sélecteur', 'Étiquette de repérage'], alternativesCompatibles: ['Siemens', 'ABB', 'Eaton']
  }),
  product({
    nom: 'Arrêt d’urgence à coup de poing', slug: 'arret-urgence-coup-poing', marque: 'Schneider Electric', gammeMarque: 'Safety control', sousCategorie: 'Signalisation, alarmes et sécurité de tableau', usage: 'Industriel',
    descriptionCourte: 'Commande d’arrêt immédiat pour équipement et machine.', description: 'Bouton d’arrêt d’urgence à action maintenue conçu pour demander l’arrêt d’une machine ou d’un processus lors d’une situation dangereuse.',
    caracteristiques: ['Tête rouge à coup de poing', 'Verrouillage mécanique', 'Contacts de sécurité'], applications: ['Machines', 'Convoyeurs', 'Armoires de commande'], variantesDisponibles: ['Déverrouillage par rotation ou clé', 'Blocs de contacts multiples'], produitsComplementaires: ['Relais de sécurité', 'Contacteur de puissance', 'Boîtier de commande'], alternativesCompatibles: ['Siemens', 'ABB', 'Eaton']
  }),
  product({
    nom: 'Colonne lumineuse de signalisation', slug: 'colonne-lumineuse-signalisation', marque: 'Patlite', gammeMarque: 'Signalisation machine', sousCategorie: 'Signalisation, alarmes et sécurité de tableau', usage: 'Industriel',
    descriptionCourte: 'Indication visuelle et sonore de l’état d’une installation.', description: 'Colonne lumineuse modulaire destinée à communiquer les états de fonctionnement, d’alerte ou de défaut d’une machine et faciliter la réaction des opérateurs.',
    caracteristiques: ['Modules lumineux empilables', 'Signal sonore selon version', 'Fixation sur machine ou armoire'], applications: ['Lignes de production', 'Postes de pompage', 'Armoires industrielles'], variantesDisponibles: ['Nombre de couleurs variable', 'Modules sonores ou clignotants'], produitsComplementaires: ['Relais de commande', 'Automate programmable', 'Arrêt d’urgence'], alternativesCompatibles: ['Schneider Electric', 'Siemens', 'WERMA']
  }),
];
