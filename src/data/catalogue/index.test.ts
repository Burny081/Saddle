import { expect, test } from 'vitest';
import { catalogueCategories, catalogueProducts, catalogueBrands } from './index';

test('combines every SaddlePoint catalogue category into a filterable price-free source', () => {
  expect(catalogueProducts.length).toBeGreaterThanOrEqual(240);
  expect(catalogueCategories).toHaveLength(10);
  expect(catalogueBrands).toContain('Schneider Electric');
  expect(catalogueProducts.every((product) => product.id.startsWith('catalogue-'))).toBe(true);
  expect(catalogueProducts.every((product) => product.marque.trim().length > 0)).toBe(true);
  expect(catalogueProducts.every((product) => !('price' in product))).toBe(true);
});
