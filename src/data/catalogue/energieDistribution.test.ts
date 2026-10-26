import { expect, test } from 'vitest';
import { energieDistributionCatalog } from './energieDistribution';

test('keeps the energy and distribution catalogue filter-ready and price-free', () => {
  expect(energieDistributionCatalog).toHaveLength(30);
  expect(new Set(energieDistributionCatalog.map((product) => product.slug)).size).toBe(30);
  expect(new Set(energieDistributionCatalog.map((product) => product.sousCategorie))).toEqual(
    new Set([
      'Transformateurs BT/MT',
      'Cellules moyenne tension',
      'Tableaux généraux basse tension',
      'Armoires électriques',
      'Coffrets et boîtiers',
      'Jeux de barres',
      'Distribution modulaire',
      'Compteurs et analyseurs réseau',
      'Sectionneurs, inverseurs de source et commutateurs',
      'Correction du facteur de puissance',
    ]),
  );

  energieDistributionCatalog.forEach((product) => {
    expect(product.marque.trim()).not.toBe('');
    expect(product.disponibilite).toBe('Disponible sur demande');
    expect(product.statut).toBe('Actif');
    expect(JSON.stringify(product).toLowerCase()).not.toMatch(/prix|price|promotion|remise|fcfa|xaf|€/);
  });
});
