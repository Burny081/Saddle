import { describe, expect, it } from 'vitest';
import { protectionElectriqueCatalog } from './protectionElectrique';

const requiredSubcategories = [
  'Disjoncteurs modulaires',
  'Disjoncteurs boîtier moulé',
  'Disjoncteurs de puissance',
  'Interrupteurs différentiels',
  'Dispositifs différentiels résiduels',
  'Fusibles et porte-fusibles',
  'Contacteurs et relais thermiques',
  'Relais de protection',
  'Parafoudres et protection surtension',
  'Protection moteur',
  'Sectionneurs et interrupteurs de sécurité',
  'Mise à la terre et protection équipotentielle',
  'Protection arc électrique',
  'Signalisation, alarmes et sécurité de tableau',
];

describe('catalogue de protection électrique', () => {
  it('provides a price-free, brand-filterable record for every protection subcategory', () => {
    expect(protectionElectriqueCatalog.length).toBeGreaterThanOrEqual(42);
    expect(new Set(protectionElectriqueCatalog.map((product) => product.slug)).size).toBe(protectionElectriqueCatalog.length);
    expect(new Set(protectionElectriqueCatalog.map((product) => product.sousCategorie))).toEqual(new Set(requiredSubcategories));

    protectionElectriqueCatalog.forEach((product) => {
      expect(product.marque).not.toHaveLength(0);
      expect(product.disponibilite).toBe('Disponible sur demande');
      expect(JSON.stringify(product).toLowerCase()).not.toMatch(/prix|price|promotion|remise|fcfa|xaf|€/);
    });
  });
});
