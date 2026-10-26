import { expect, test } from 'vitest';
import { catalogueCategories, catalogueProducts, catalogueBrands } from './index';

test('combines every SaddlePoint catalogue category into a scalable, filterable and price-free source', () => {
  expect(catalogueProducts.length).toBeGreaterThanOrEqual(1500);
  expect(catalogueProducts.length).toBeLessThanOrEqual(2000);
  expect(catalogueCategories).toHaveLength(10);
  expect(catalogueBrands).toContain('Schneider Electric');
  expect(new Set(catalogueProducts.map((product) => product.id)).size).toBe(catalogueProducts.length);
  expect(new Set(catalogueProducts.map((product) => product.slug)).size).toBe(catalogueProducts.length);
  expect(catalogueProducts.every((product) => product.marque.trim().length > 0)).toBe(true);
  expect(JSON.stringify(catalogueProducts).toLocaleLowerCase('fr')).not.toMatch(/prix|price|promotion|remise|fcfa|xaf|€/);
});
