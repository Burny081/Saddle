import { expect, test } from 'vitest';
import { generatedProductMedia } from './generatedProductMedia';
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
  const ip65Product = catalogueProducts.find(
    (product) =>
      product.mediaKey ===
      'catalogue-energie-et-distribution-electrique-energie-et-distribution-electrique-transformateur-sec-basse-tension-ip65',
  );
  expect(ip65Product?.images).toHaveLength(4);
  expect(new Set(ip65Product?.images).size).toBe(4);
  const recentlyAddedProductMedia = [
    {
      mediaKey:
        'catalogue-energie-et-distribution-electrique-energie-et-distribution-electrique-batterie-de-condensateurs',
      image:
        '/catalogue-media/catalogue-energie-et-distribution-electrique-energie-et-distribution-electrique-batterie-de-condensateurs/01-hero.png',
    },
    {
      mediaKey:
        'catalogue-energie-et-distribution-electrique-energie-et-distribution-electrique-regulateur-de-condensateurs',
      image:
        '/catalogue-media/catalogue-energie-et-distribution-electrique-energie-et-distribution-electrique-regulateur-de-condensateurs/01-hero.png',
    },
    {
      mediaKey:
        'catalogue-energie-et-distribution-electrique-energie-et-distribution-electrique-contacteur-pour-condensateur',
      image:
        '/catalogue-media/catalogue-energie-et-distribution-electrique-energie-et-distribution-electrique-contacteur-pour-condensateur/01-hero.png',
    },
    {
      mediaKey:
        'catalogue-protection-et-securite-electrique-protection-et-securite-electrique-disjoncteur-modulaire-bipolaire',
      image:
        '/catalogue-media/catalogue-protection-et-securite-electrique-protection-et-securite-electrique-disjoncteur-modulaire-bipolaire/01-hero.png',
    },
    {
      mediaKey:
        'catalogue-protection-et-securite-electrique-protection-et-securite-electrique-disjoncteur-modulaire-tripolaire',
      image:
        '/catalogue-media/catalogue-protection-et-securite-electrique-protection-et-securite-electrique-disjoncteur-modulaire-tripolaire/01-hero.png',
    },
  ];

  recentlyAddedProductMedia.forEach(({ mediaKey, image }) => {
    const product = catalogueProducts.find((candidate) => candidate.mediaKey === mediaKey);

    expect(product?.image).toBe(image);
    expect(product?.images).toHaveLength(4);
    expect(new Set(product?.images).size).toBe(4);
  });
  expect(JSON.stringify(catalogueProducts).toLocaleLowerCase('fr')).not.toMatch(/prix|price|promotion|remise|fcfa|xaf|€/);
});

test('only exposes complete, product-owned image sets', () => {
  const allImagePaths = Object.values(generatedProductMedia).flat();

  expect(new Set(allImagePaths).size).toBe(allImagePaths.length);

  Object.entries(generatedProductMedia).forEach(([mediaKey, images]) => {
    const product = catalogueProducts.find((candidate) => candidate.mediaKey === mediaKey);

    expect(product).toBeDefined();
    expect(images).toHaveLength(4);
    expect(new Set(images).size).toBe(4);
    expect(product?.images).toEqual(images);
  });
});

test('connects the latest protection product image sets to their exact product', () => {
  const protectionMedia = [
    ['contacteur-puissance-triphase', 'Contacteur de puissance triphasé'],
    ['contacteur-modulaire-silencieux', 'Contacteur modulaire silencieux'],
    ['disjoncteur-de-puissance-motorisable', 'Disjoncteur de puissance motorisable'],
    ['disjoncteur-moteur-reglable', 'Disjoncteur moteur réglable'],
    ['dispositif-differentiel-residuel-industriel', 'Dispositif différentiel résiduel industriel'],
    ['dispositif-differentiel-residuel-type-a', 'Dispositif différentiel résiduel type A'],
    ['dispositif-differentiel-residuel-type-ac', 'Dispositif différentiel résiduel type AC'],
    ['fusible-am-protection-moteur', 'Fusible aM de protection moteur'],
    ['fusible-cylindrique-gg', 'Fusible cylindrique gG'],
    ['interrupteur-differentiel-bipolaire', 'Interrupteur différentiel bipolaire'],
    ['interrupteur-differentiel-selectif', 'Interrupteur différentiel sélectif'],
    ['interrupteur-differentiel-tetrapolaire', 'Interrupteur différentiel tétrapolaire'],
    ['parafoudre-monophase-tableau', 'Parafoudre monophasé de tableau'],
    ['parafoudre-triphase-tableau', 'Parafoudre triphasé de tableau'],
    ['porte-fusible-modulaire', 'Porte-fusible modulaire'],
    ['protection-surtension-ligne-donnees', 'Protection surtension pour ligne de données'],
    ['relais-protection-phase', 'Relais de protection de phase'],
    ['relais-protection-tension', 'Relais de protection tension'],
    ['relais-differentiel-avec-tore', 'Relais différentiel avec tore'],
    ['relais-thermique-reglable', 'Relais thermique réglable'],
  ];

  protectionMedia.forEach(([slug, nom]) => {
    const mediaKey = `catalogue-protection-et-securite-electrique-protection-et-securite-electrique-${slug}`;
    const product = catalogueProducts.find((candidate) => candidate.mediaKey === mediaKey);

    expect(product?.nom).toBe(nom);
    expect(product?.image).toBe(`/catalogue-media/${mediaKey}/01-hero.png`);
    expect(product?.images).toHaveLength(4);
  });
});
