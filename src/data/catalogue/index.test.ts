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
  expect(new Set(catalogueProducts.map((product) => product.mediaKey)).size).toBe(catalogueProducts.length);
  const generatedProduct = catalogueProducts.find(
    (product) => product.mediaKey === 'catalogue-energie-et-distribution-electrique-energie-et-distribution-electrique-transformateur-sec-basse-tension',
  );
  expect(generatedProduct?.image).toBe(
    '/catalogue-media/catalogue-energie-et-distribution-electrique-energie-et-distribution-electrique-transformateur-sec-basse-tension/01-hero.png',
  );
  expect(generatedProduct?.images).toHaveLength(4);
  expect(new Set(generatedProduct?.images).size).toBe(4);
  expect(JSON.stringify(catalogueProducts).toLocaleLowerCase('fr')).not.toMatch(/prix|price|promotion|remise|fcfa|xaf|€/);
});
