// Mock data for the application

export interface Article {
  id: string;
  name: string;
  category: string;
  description: string;
  price: number;
  purchasePrice: number;
  stock: number;
  minStock: number;
  image: string;
  status: 'active' | 'inactive';
  unit: string;
  storeId?: string;         // Store that owns/manages this article
}

export interface Service {
  id: string;
  name: string;
  category: string;
  description: string;
  price: number;
  duration: string;
  image: string;
  status: 'active' | 'inactive';
  storeId?: string;         // Store that offers this service
}

export interface Sale {
  id: string;
  clientName: string;
  items: { type: 'article' | 'service'; id: string; name: string; quantity: number; price: number }[];
  total: number;
  paid: number;
  status: 'pending' | 'partial' | 'completed';
  date: string;
  invoiceNumber: string;
  createdBy?: string;       // User ID of staff who created the sale
  createdByName?: string;   // Name of staff who created the sale
  storeId?: string;         // Store where the sale was made
}

export interface Alert {
  id: string;
  type: 'stock' | 'sale' | 'payment';
  severity: 'low' | 'medium' | 'high';
  message: string;
  date: string;
  read: boolean;
}

// Points of Sale Data
export interface PointOfSale {
  id: string;
  city: string;
  name: string;
  address: string;
  manager: string;
  phone: string;
  email: string;
  hours: string;
  image: string;
  coordinates?: { lat: number, lng: number };
  features: string[];
}

export const mockPointsOfSale: PointOfSale[] = [
  {
    id: 'pos-dla',
    city: 'Douala',
    name: 'Saddle Point Douala (Siège)',
    address: 'Akwa, Boulevard de la Liberté, Ancien immeuble Air France',
    manager: 'Mme. Sarah Eboa',
    phone: '(+237) 677 33 44 55',
    email: 'douala@saddlepoint.cm',
    hours: 'Lundi - Samedi : 08h00 - 18h00',
    image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=1200',
    features: ['Siège Social', 'Showroom Principal', 'Service Technique', 'Vente en Gros', 'Support Pro', 'Formation'],
  },
  {
    id: 'pos-yde',
    city: 'Yaoundé',
    name: 'Saddle Point Yaoundé',
    address: 'Bastos, Avenue des Ambassades, Face ambassade du Nigeria',
    manager: 'M. Jean-Pierre Manga',
    phone: '(+237) 699 00 11 22',
    email: 'yaounde@saddlepoint.cm',
    hours: 'Lundi - Samedi : 08h30 - 18h30',
    image: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&q=80&w=1200',
    features: ['Showroom', 'Vente Directe', 'Service Technique', 'Logistique'],
  },
];

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  totalSpent: number;
  storeId?: string;         // Primary store for this client
}

// Articles électriques
export const mockArticles: Article[] = [
  {
    id: 'art-1',
    name: 'Disjoncteur Différentiel 63A',
    category: 'Protection Électrique',
    description: 'Disjoncteur différentiel triphasé 63A, sensibilité 30mA, conforme IEC 61008',
    price: 95000,
    purchasePrice: 62000,
    stock: 45,
    minStock: 50,
    image: 'https://images.unsplash.com/photo-1635335874521-7987db781153?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaXJjdWl0JTIwYnJlYWtlciUyMGVsZWN0cmljYWx8ZW58MXx8fHwxNzY4NTEwNjkwfDA&ixlib=rb-4.1.0&q=80&w=1080',
    status: 'active',
    unit: 'pièce',
  },
  {
    id: 'art-2',
    name: 'Transformateur MT/BT 1000 kVA',
    category: 'Distribution Électrique',
    description: 'Transformateur immergé huile 20kV/400V, rendement 98.5%, norme IEC 60076',
    price: 18500000,
    purchasePrice: 14500000,
    stock: 3,
    minStock: 2,
    image: 'https://images.unsplash.com/photo-1593525938092-bfc1fea7e912?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbGVjdHJpY2FsJTIwdHJhbnNmb3JtZXJ8ZW58MXx8fHwxNzY4NDQ5Nzc4fDA&ixlib=rb-4.1.0&q=80&w=1080',
    status: 'active',
    unit: 'pièce',
  },
  {
    id: 'art-3',
    name: 'Panneau Solaire 450W Monocristallin',
    category: 'Énergies Renouvelables',
    description: 'Module photovoltaïque 450W, rendement 21%, garantie 25 ans, certifié IEC 61215',
    price: 185000,
    purchasePrice: 125000,
    stock: 120,
    minStock: 50,
    image: 'https://images.unsplash.com/photo-1628206554160-63e8c921e398?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzb2xhciUyMHBhbmVscyUyMHJlbmV3YWJsZXxlbnwxfHx8fDE3Njg1MTA2OTF8MA&ixlib=rb-4.1.0&q=80&w=1080',
    status: 'active',
    unit: 'pièce',
  },
  {
    id: 'art-4',
    name: 'Câble U1000 R2V 3G6mm²',
    category: 'Câblage et Connectique',
    description: 'Câble rigide cuivre 3 conducteurs + terre 6mm², isolation PVC, norme NF C 32-321',
    price: 3200,
    purchasePrice: 2100,
    stock: 850,
    minStock: 500,
    image: 'https://images.unsplash.com/photo-1678295630775-f5b1587cdfef?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbGVjdHJpY2FsJTIwY2FibGUlMjB3aXJpbmd8ZW58MXx8fHwxNzY4NTEwNjkyfDA&ixlib=rb-4.1.0&q=80&w=1080',
    status: 'active',
    unit: 'mètre',
  },
  {
    id: 'art-5',
    name: 'Automate Programmable (PLC)',
    category: 'Automatismes Industriels',
    description: 'PLC modulaire 32 E/S, CPU 1.2GHz, 2MB mémoire, communication Ethernet/Profibus',
    price: 1850.00,
    purchasePrice: 1250.00,
    stock: 15,
    minStock: 10,
    image: 'https://images.unsplash.com/photo-1647427060118-4911c9821b82?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmR1c3RyaWFsJTIwYXV0b21hdGlvbnxlbnwxfHx8fDE3Njg1MTA2OTJ8MA&ixlib=rb-4.1.0&q=80&w=1080',
    status: 'active',
    unit: 'pièce',
  },
  {
    id: 'art-6',
    name: 'Armoire Électrique IP65',
    category: 'Distribution Électrique',
    description: 'Coffret métallique étanche 800x600x300mm, protection IP65, porte vitrée',
    price: 425.00,
    purchasePrice: 280.00,
    stock: 28,
    minStock: 20,
    image: 'https://images.unsplash.com/photo-1544724569-5f546fd6f2b5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbGVjdHJpY2FsJTIwcGFuZWx8ZW58MXx8fHwxNzY4NTEwNjkwfDA&ixlib=rb-4.1.0&q=80&w=1080',
    status: 'active',
    unit: 'pièce',
  },
  {
    id: 'art-7',
    name: 'Variateur de Vitesse 22kW',
    category: 'Entraînement Moteurs',
    description: 'Variateur électronique triphasé 22kW, contrôle vectoriel, freinage dynamique',
    price: 2150.00,
    purchasePrice: 1550.00,
    stock: 8,
    minStock: 10,
    image: 'https://images.unsplash.com/photo-1759830337357-29c472b6746c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbGVjdHJpY2FsJTIwZXF1aXBtZW50JTIwaW5kdXN0cmlhbHxlbnwxfHx8fDE3Njg0Nzg3MTl8MA&ixlib=rb-4.1.0&q=80&w=1080',
    status: 'active',
    unit: 'pièce',
  },
  {
    id: 'art-8',
    name: 'Compteur Électrique Triphasé',
    category: 'Mesure & Comptage',
    description: 'Compteur numérique triphasé, classe 1, communication Modbus, certification MID',
    price: 385.00,
    purchasePrice: 250.00,
    stock: 35,
    minStock: 30,
    image: 'https://images.unsplash.com/photo-1759830337357-29c472b6746c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbGVjdHJpY2FsJTIwZXF1aXBtZW50JTIwaW5kdXN0cmlhbHxlbnwxfHx8fDE3Njg0Nzg3MTl8MA&ixlib=rb-4.1.0&q=80&w=1080',
    status: 'active',
    unit: 'pièce',
  },
];

// Services électriques
export const mockServices: Service[] = [
  {
    id: 'srv-1',
    name: 'Installation Électrique Complète',
    category: 'Installation',
    description: 'Installation complète du tableau électrique aux points d\'utilisation, mise aux normes NF C 15-100',
    price: 3500.00,
    duration: '3-5 jours',
    image: 'https://images.unsplash.com/photo-1615774925655-a0e97fc85c14?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbGVjdHJpY2FsJTIwZW5naW5lZXIlMjBzZXJ2aWNlfGVufDF8fHx8MTc2ODUxMDY5Mnww&ixlib=rb-4.1.0&q=80&w=1080',
    status: 'active',
  },
  {
    id: 'srv-2',
    name: 'Audit Énergétique',
    category: 'Conseil',
    description: 'Analyse complète de votre installation, recommandations d\'optimisation énergétique et ROI',
    price: 1200.00,
    duration: '2-3 jours',
    image: 'https://images.unsplash.com/photo-1615774925655-a0e97fc85c14?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbGVjdHJpY2FsJTIwZW5naW5lZXIlMjBzZXJ2aWNlfGVufDF8fHx8MTc2ODUxMDY5Mnww&ixlib=rb-4.1.0&q=80&w=1080',
    status: 'active',
  },
  {
    id: 'srv-3',
    name: 'Maintenance Préventive',
    category: 'Maintenance',
    description: 'Contrat annuel de maintenance préventive, 4 visites/an, rapport détaillé',
    price: 2400.00,
    duration: '1 an',
    image: 'https://images.unsplash.com/photo-1647427060118-4911c9821b82?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmR1c3RyaWFsJTIwYXV0b21hdGlvbnxlbnwxfHx8fDE3Njg1MTA2OTJ8MA&ixlib=rb-4.1.0&q=80&w=1080',
    status: 'active',
  },
  {
    id: 'srv-4',
    name: 'Dépannage Urgent 24/7',
    category: 'Dépannage',
    description: 'Intervention d\'urgence sous 2h, équipe qualifiée, diagnostic et réparation rapide',
    price: 450.00,
    duration: '2-4 heures',
    image: 'https://images.unsplash.com/photo-1615774925655-a0e97fc85c14?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbGVjdHJpY2FsJTIwZW5naW5lZXIlMjBzZXJ2aWNlfGVufDF8fHx8MTc2ODUxMDY5Mnww&ixlib=rb-4.1.0&q=80&w=1080',
    status: 'active',
  },
  {
    id: 'srv-5',
    name: 'Installation Système Solaire',
    category: 'Énergies Renouvelables',
    description: 'Installation complète système photovoltaïque, dimensionnement, pose, raccordement',
    price: 8500.00,
    duration: '5-7 jours',
    image: 'https://images.unsplash.com/photo-1628206554160-63e8c921e398?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzb2xhciUyMHBhbmVscyUyMHJlbmV3YWJsZXxlbnwxfHx8fDE3Njg1MTA2OTF8MA&ixlib=rb-4.1.0&q=80&w=1080',
    status: 'active',
  },
  {
    id: 'srv-6',
    name: 'Mise aux Normes Industrielle',
    category: 'Conseil',
    description: 'Audit et mise en conformité installations industrielles selon normes IEC et ISO',
    price: 5200.00,
    duration: '7-10 jours',
    image: 'https://images.unsplash.com/photo-1647427060118-4911c9821b82?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmR1c3RyaWFsJTIwYXV0b21hdGlvbnxlbnwxfHx8fDE3Njg1MTA2OTJ8MA&ixlib=rb-4.1.0&q=80&w=1080',
    status: 'active',
  },
];

// Mock sales
export const mockSales: Sale[] = [
  {
    id: 'sale-1',
    clientName: 'Entreprise ABC',
    items: [
      { type: 'article', id: 'art-1', name: 'Disjoncteur Différentiel 63A', quantity: 5, price: 145.00 },
      { type: 'service', id: 'srv-1', name: 'Installation Électrique Complète', quantity: 1, price: 3500.00 },
    ],
    total: 4225.00,
    paid: 4225.00,
    status: 'completed',
    date: '2026-01-14T10:30:00',
    invoiceNumber: 'INV-2026-001',
  },
  {
    id: 'sale-2',
    clientName: 'Industries XYZ',
    items: [
      { type: 'article', id: 'art-2', name: 'Transformateur MT/BT 1000 kVA', quantity: 1, price: 28500.00 },
      { type: 'service', id: 'srv-3', name: 'Maintenance Préventive', quantity: 1, price: 2400.00 },
    ],
    total: 30900.00,
    paid: 15000.00,
    status: 'partial',
    date: '2026-01-13T14:15:00',
    invoiceNumber: 'INV-2026-002',
  },
];

// Mock alerts
export const mockAlerts: Alert[] = [
  {
    id: 'alert-1',
    type: 'stock',
    severity: 'high',
    message: 'Stock critique: Disjoncteur Différentiel 63A (45/50 unités)',
    date: '2026-01-15T08:00:00',
    read: false,
  },
  {
    id: 'alert-2',
    type: 'stock',
    severity: 'high',
    message: 'Stock critique: Variateur de Vitesse 22kW (8/10 unités)',
    date: '2026-01-15T08:00:00',
    read: false,
  },
  {
    id: 'alert-3',
    type: 'sale',
    severity: 'medium',
    message: 'Nouvelle vente enregistrée: INV-2026-002 - 30,900.00 €',
    date: '2026-01-13T14:15:00',
    read: true,
  },
  {
    id: 'alert-4',
    type: 'payment',
    severity: 'medium',
    message: 'Paiement partiel reçu: Industries XYZ - 15,000.00 € / 30,900.00 €',
    date: '2026-01-13T15:30:00',
    read: false,
  },
];
// Mock clients
export const mockClients = [
  {
    id: 'clt-1',
    name: 'Entreprise ABC',
    email: 'contact@entreprise-abc.com',
    phone: '+33 1 23 45 67 89',
    address: '123 Avenue des Champs-Élysées, 75008 Paris',
    totalSpent: 4225.00,
  },
  {
    id: 'clt-2',
    name: 'Industries XYZ',
    email: 'achats@industries-xyz.com',
    phone: '+33 4 78 90 12 34',
    address: '45 Rue de la République, 69002 Lyon',
    totalSpent: 30900.00,
  },
  {
    id: 'clt-3',
    name: 'Jean Dupont',
    email: 'jean.dupont@email.com',
    phone: '+33 6 12 34 56 78',
    address: '8 Impasse des Lilas, 33000 Bordeaux',
    totalSpent: 0,
  },
];

// Categories Data
export interface Category {
  id: string;
  name: { en: string; fr: string };
  icon: string;
  image: string;
  subCategories?: { id: string; name: { en: string; fr: string } }[];
}

export const categories: Category[] = [
  {
    id: 'electronics',
    name: { en: 'Electronics', fr: 'Électronique' },
    icon: 'Zap',
    image: 'https://images.unsplash.com/photo-1498049397964-29f9b7c53524?auto=format&fit=crop&q=80&w=1200',
    subCategories: [
      { id: 'cables', name: { en: 'Cables and Wiring', fr: 'Câbles et Câblage' } },
      { id: 'breakers', name: { en: 'Circuit Breakers', fr: 'Disjoncteurs' } },
      { id: 'lighting', name: { en: 'Lighting', fr: 'Éclairage' } },
      { id: 'motors', name: { en: 'Motors and Drives', fr: 'Moteurs et Variateurs' } },
    ]
  },
  {
    id: 'solar',
    name: { en: 'Solar and Energy', fr: 'Solaire et Énergie' },
    icon: 'Sun',
    image: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&q=80&w=1200',
    subCategories: [
      { id: 'panels', name: { en: 'Solar Panels', fr: 'Panneaux Solaires' } },
      { id: 'inverters', name: { en: 'Inverters', fr: 'Onduleurs' } },
      { id: 'batteries', name: { en: 'Batteries', fr: 'Batteries' } },
    ]
  },
  {
    id: 'security',
    name: { en: 'Security', fr: 'Sécurité' },
    icon: 'Shield',
    image: 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&q=80&w=1200',
    subCategories: [
      { id: 'cameras', name: { en: 'CCTV Cameras', fr: 'Caméras Vidéosurveillance' } },
      { id: 'alarms', name: { en: 'Alarm Systems', fr: 'Systèmes d\'Alarme' } },
      { id: 'access', name: { en: 'Access Control', fr: 'Contrôle d\'Accès' } },
    ]
  },
  {
    id: 'automation',
    name: { en: 'Automation', fr: 'Automatisme' },
    icon: 'Cpu',
    image: 'https://images.unsplash.com/photo-1531746790731-6c087fecd65a?auto=format&fit=crop&q=80&w=1200',
    subCategories: [
      { id: 'plc', name: { en: 'PLCs', fr: 'Automates Programmables' } },
      { id: 'hmi', name: { en: 'HMIs', fr: 'IHM' } },
      { id: 'sensors', name: { en: 'Industrial Sensors', fr: 'Capteurs Industriels' } },
    ]
  },
];

// Navigation Data for Mega Menus
export interface NavItem {
  id: string;
  title: { en: string; fr: string };
  description: { en: string; fr: string };
  icon: string;
  image: string;
  href?: string;
  items?: { id: string; name: { en: string; fr: string }; href?: string }[];
}

export const navProducts: NavItem[] = [
  {
    id: 'new-arrivals',
    title: { en: 'New Arrivals', fr: 'Nouveautés' },
    description: { en: 'The latest tech in power management', fr: 'Les dernières technologies de gestion d\'énergie' },
    icon: 'Sparkles',
    image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=1200',
    items: [
      { id: 'smart-breakers', name: { en: 'Smart Breakers', fr: 'Disjoncteurs Intelligents' } },
      { id: 'iot-sensors', name: { en: 'IoT Power Sensors', fr: 'Capteurs IoT' } },
      { id: 'eco-drives', name: { en: 'Eco Drives', fr: 'Variateurs Éco' } },
    ]
  },
  {
    id: 'best-sellers',
    title: { en: 'Best Sellers', fr: 'Meilleures Ventes' },
    description: { en: 'Our most popular trusted solutions', fr: 'Nos solutions les plus populaires' },
    icon: 'TrendingUp',
    image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=1200',
    items: [
      { id: 'transformers', name: { en: 'HV Transformers', fr: 'Transformateurs HT' } },
      { id: 'solar-kits', name: { en: 'Solar Kits', fr: 'Kits Solaires' } },
      { id: 'cabling', name: { en: 'Industrial Cabling', fr: 'Câblage Industriel' } },
    ]
  },
  {
    id: 'promotions',
    title: { en: 'Promotions', fr: 'Promotions' },
    description: { en: 'Limited time offers and discounts', fr: 'Offres limitées et réductions' },
    icon: 'Percent',
    image: 'https://images.unsplash.com/photo-1601597111158-2fceff292cdc?auto=format&fit=crop&q=80&w=1200',
    items: [
      { id: 'clearance', name: { en: 'Clearance', fr: 'Déstockage' } },
      { id: 'bundles', name: { en: 'Project Bundles', fr: 'Packs Projet' } },
    ]
  }
];

export const navServices: NavItem[] = [
  {
    id: 'installation',
    title: { en: 'Installation', fr: 'Installation' },
    description: { en: 'Professional setup by certified experts', fr: 'Configuration par des experts certifiés' },
    icon: 'Wrench',
    image: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&q=80&w=1200',
    items: [
      { id: 'industrial', name: { en: 'Industrial Setup', fr: 'Installation Industrielle' } },
      { id: 'residential', name: { en: 'Home Systems', fr: 'Systèmes Résidentiels' } },
      { id: 'solar-install', name: { en: 'Solar Installation', fr: 'Installation Solaire' } },
    ]
  },
  {
    id: 'maintenance',
    title: { en: 'Maintenance', fr: 'Maintenance' },
    description: { en: '24/7 support and preventive care', fr: 'Support 24/7 et maintenance préventive' },
    icon: 'Activity',
    image: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&q=80&w=1200',
    items: [
      { id: 'contracts', name: { en: 'Service Contracts', fr: 'Contrats de Service' } },
      { id: 'emergency', name: { en: 'Emergency Repairs', fr: 'Réparations d\'Urgence' } },
      { id: 'audits', name: { en: 'Energy Audits', fr: 'Audits Énergétiques' } },
    ]
  },
  {
    id: 'consulting',
    title: { en: 'Consulting', fr: 'Conseil' },
    description: { en: 'Engineering and project planning', fr: 'Ingénierie et planification de projet' },
    icon: 'BrainCircuit',
    image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=1200',
    items: [
      { id: 'design', name: { en: 'System Design', fr: 'Conception Système' } },
      { id: 'compliance', name: { en: 'Compliance', fr: 'Conformité' } },
    ]
  }
];

export interface Visitor {
  id: string;
  ip: string;
  location: string;
  date: string;
  time: string;
  userAgent: string;
  page: string;
  device?: string;
}

export const mockVisitors: Visitor[] = [
  {
    id: 'v1',
    ip: '192.168.1.1',
    location: 'Paris, France',
    date: '16/01/2026',
    time: '14:30:00',
    userAgent: 'Mozilla/5.0 (Desktop)',
    page: '/',
    device: 'Desktop'
  },
  {
    id: 'v2',
    ip: '102.244.222.80',
    location: 'Douala, Cameroon',
    date: '16/01/2026',
    time: '12:21:55',
    userAgent: 'Mozilla/5.0 (Mobile)',
    page: '/',
    device: 'Mobile'
  },
  {
    id: 'v3',
    ip: '41.202.207.35',
    location: 'Yaoundé, Cameroon',
    date: '16/01/2026',
    time: '09:15:30',
    userAgent: 'Mozilla/5.0 (Desktop)',
    page: '/shop',
    device: 'Desktop'
  },
  {
    id: 'v4',
    ip: '154.72.163.45',
    location: 'Douala, Cameroon',
    date: '16/01/2026',
    time: '15:45:12',
    userAgent: 'Mozilla/5.0 (Mobile)',
    page: '/services',
    device: 'Mobile'
  },
  {
    id: 'v5',
    ip: '197.149.192.23',
    location: 'Bafoussam, Cameroon',
    date: '15/01/2026',
    time: '11:20:45',
    userAgent: 'Mozilla/5.0 (Desktop)',
    page: '/',
    device: 'Desktop'
  },
  {
    id: 'v6',
    ip: '41.85.162.78',
    location: 'Yaoundé, Cameroon',
    date: '15/01/2026',
    time: '16:30:22',
    userAgent: 'Mozilla/5.0 (Mobile)',
    page: '/shop',
    device: 'Mobile'
  },
  {
    id: 'v7',
    ip: '102.176.65.89',
    location: 'Douala, Cameroon',
    date: '15/01/2026',
    time: '10:05:18',
    userAgent: 'Mozilla/5.0 (Desktop)',
    page: '/products',
    device: 'Desktop'
  },
  {
    id: 'v8',
    ip: '196.200.54.12',
    location: 'Garoua, Cameroon',
    date: '14/01/2026',
    time: '13:50:33',
    userAgent: 'Mozilla/5.0 (Mobile)',
    page: '/',
    device: 'Mobile'
  },
  {
    id: 'v9',
    ip: '41.207.187.45',
    location: 'Yaoundé, Cameroon',
    date: '14/01/2026',
    time: '08:25:11',
    userAgent: 'Mozilla/5.0 (Desktop)',
    page: '/services',
    device: 'Desktop'
  },
  {
    id: 'v10',
    ip: '154.68.45.92',
    location: 'Douala, Cameroon',
    date: '14/01/2026',
    time: '17:15:40',
    userAgent: 'Mozilla/5.0 (Mobile)',
    page: '/shop',
    device: 'Mobile'
  },
  {
    id: 'v11',
    ip: '197.234.240.67',
    location: 'Bamenda, Cameroon',
    date: '13/01/2026',
    time: '12:40:25',
    userAgent: 'Mozilla/5.0 (Desktop)',
    page: '/',
    device: 'Desktop'
  },
  {
    id: 'v12',
    ip: '102.244.189.34',
    location: 'Douala, Cameroon',
    date: '13/01/2026',
    time: '14:55:08',
    userAgent: 'Mozilla/5.0 (Mobile)',
    page: '/products',
    device: 'Mobile'
  },
  {
    id: 'v13',
    ip: '41.202.219.56',
    location: 'Yaoundé, Cameroon',
    date: '13/01/2026',
    time: '09:30:50',
    userAgent: 'Mozilla/5.0 (Desktop)',
    page: '/shop',
    device: 'Desktop'
  },
  {
    id: 'v14',
    ip: '154.72.178.90',
    location: 'Kribi, Cameroon',
    date: '12/01/2026',
    time: '16:20:15',
    userAgent: 'Mozilla/5.0 (Mobile)',
    page: '/',
    device: 'Mobile'
  },
  {
    id: 'v15',
    ip: '197.149.201.44',
    location: 'Douala, Cameroon',
    date: '12/01/2026',
    time: '11:10:33',
    userAgent: 'Mozilla/5.0 (Desktop)',
    page: '/services',
    device: 'Desktop'
  }
];
