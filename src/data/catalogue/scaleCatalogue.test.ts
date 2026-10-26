import { expect, test } from 'vitest';
import { protectionElectriqueCatalog } from './protectionElectrique';
import { expandCatalogueProducts } from './scaleCatalogue';

test('creates five technical variants per source product with unique slugs', () => {
  const products = expandCatalogueProducts(protectionElectriqueCatalog.slice(0, 2));

  expect(products).toHaveLength(12);
  expect(new Set(products.map((product) => product.slug)).size).toBe(12);
  expect(products.filter((product) => product.nom.includes('Version')).length).toBe(10);
});
