import { expect, test } from 'vitest';
import { catalogueProducts } from '@/data/catalogue';
import { filterCatalogueProducts } from './shopCatalogue';

test('filters catalogue products by category, brand and search query together', () => {
  const results = filterCatalogueProducts(catalogueProducts, {
    category: 'Protection et sécurité électrique',
    brand: 'Schneider Electric',
    query: 'disjoncteur',
  });

  expect(results.length).toBeGreaterThan(0);
  expect(results.every((product) => product.categorie === 'Protection et sécurité électrique')).toBe(true);
  expect(results.every((product) => product.marque === 'Schneider Electric')).toBe(true);
  expect(results.every((product) => product.nom.toLowerCase().includes('disjoncteur'))).toBe(true);
});
