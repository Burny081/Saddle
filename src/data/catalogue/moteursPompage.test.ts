import { expect, test } from 'vitest';
import { moteursPompageCatalog } from './moteursPompage';
test('keeps motor and pumping products unique, filterable and request-only', () => {
  expect(moteursPompageCatalog).toHaveLength(24);
  expect(new Set(moteursPompageCatalog.map((item) => item.slug)).size).toBe(24);
  expect(new Set(moteursPompageCatalog.map((item) => item.sousCategorie)).size).toBe(8);
  moteursPompageCatalog.forEach((item) => {
    expect(item.marque).not.toHaveLength(0);
    expect(item.disponibilite).toBe('Disponible sur demande');
    expect(JSON.stringify(item).toLowerCase()).not.toMatch(/prix|price|promotion|remise|fcfa|xaf|€/);
  });
});
