import { describe, expect, test } from 'vitest';
import { catalogueProducts } from './index';
import { createCatalogueMediaPrompts, createProductMediaPrompts, serializeProductMediaPrompts } from './productMediaPrompts';

describe('createProductMediaPrompts', () => {
  test('creates four product-only views with stable unique ownership', () => {
    const product = catalogueProducts[0];
    const records = createProductMediaPrompts(product);

    expect(records).toHaveLength(4);
    expect(records.map(({ id }) => id)).toEqual([
      `${product.mediaKey}-01-hero`,
      `${product.mediaKey}-02-angle`,
      `${product.mediaKey}-03-detail`,
      `${product.mediaKey}-04-context`,
    ]);
    expect(records.every(({ mediaKey }) => mediaKey === product.mediaKey)).toBe(true);
    expect(records.every(({ outputPath }) => outputPath.startsWith(`catalogue-media/${product.mediaKey}/`))).toBe(true);
    expect(records.every(({ prompt }) => prompt.includes(product.nom))).toBe(true);
    expect(records.every(({ prompt }) => prompt.includes(product.marque))).toBe(true);
    expect(records.every(({ prompt }) => prompt.includes('no people'))).toBe(true);
    expect(records.every(({ prompt }) => prompt.includes('no text overlays'))).toBe(true);
  });
});

describe('createCatalogueMediaPrompts', () => {
  test('gives every catalogue reference four unique prompt records and output paths', () => {
    const records = createCatalogueMediaPrompts(catalogueProducts);

    expect(records).toHaveLength(catalogueProducts.length * 4);
    expect(new Set(records.map(({ id }) => id)).size).toBe(records.length);
    expect(new Set(records.map(({ outputPath }) => outputPath)).size).toBe(records.length);
    expect(records.every(({ outputPath }) => outputPath.startsWith('catalogue-media/'))).toBe(true);
  });

  test('serializes every prompt as a portable JSONL manifest', () => {
    const records = createCatalogueMediaPrompts(catalogueProducts);
    const lines = serializeProductMediaPrompts(records).trim().split('\n');

    expect(lines).toHaveLength(6528);
    expect(JSON.parse(lines[0])).toMatchObject({
      mediaKey: catalogueProducts[0].mediaKey,
      view: 'hero',
    });
  });
});
