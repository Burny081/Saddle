import { expect, test } from 'vitest';
import { automatismeControleCatalog } from './automatismeControle';

test('covers industrial automation with unique, request-only records', () => {
  expect(automatismeControleCatalog).toHaveLength(24);
  expect(new Set(automatismeControleCatalog.map((item) => item.slug)).size).toBe(24);
  expect(new Set(automatismeControleCatalog.map((item) => item.sousCategorie)).size).toBe(8);
  automatismeControleCatalog.forEach((item) => {
    expect(item.disponibilite).toBe('Disponible sur demande');
    expect(item.marque).not.toHaveLength(0);
    expect(JSON.stringify(item).toLowerCase()).not.toMatch(/prix|price|promotion|remise|fcfa|xaf|€/);
  });
});
