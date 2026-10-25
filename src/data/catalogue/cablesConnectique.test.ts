import { describe, expect, it } from 'vitest';
import { cablesConnectiqueCatalog } from './cablesConnectique';

const subcategories = [
  'Câbles d’énergie', 'Câbles industriels', 'Câbles de commande', 'Câbles réseau et télécommunication',
  'Gaines, conduits et goulottes', 'Chemins de câbles', 'Cosses, borniers et connecteurs', 'Accessoires de fixation et repérage',
];

describe('catalogue câbles et connectique', () => {
  it('covers every subcategory with unique, price-free and brand-filterable products', () => {
    expect(cablesConnectiqueCatalog).toHaveLength(32);
    expect(new Set(cablesConnectiqueCatalog.map((product) => product.slug)).size).toBe(32);
    expect(new Set(cablesConnectiqueCatalog.map((product) => product.sousCategorie))).toEqual(new Set(subcategories));
    cablesConnectiqueCatalog.forEach((product) => {
      expect(product.marque).not.toHaveLength(0);
      expect(product.disponibilite).toBe('Disponible sur demande');
      expect(JSON.stringify(product).toLowerCase()).not.toMatch(/prix|price|promotion|remise|fcfa|xaf|€/);
    });
  });
});
