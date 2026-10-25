import { expect, test } from 'vitest';
import { solaireSecoursCatalog } from './solaireSecours';
test('keeps solar and backup products unique, branded and request-only', () => {
  expect(solaireSecoursCatalog).toHaveLength(24);
  expect(new Set(solaireSecoursCatalog.map((item) => item.slug)).size).toBe(24);
  solaireSecoursCatalog.forEach((item) => {
    expect(item.marque).not.toHaveLength(0);
    expect(item.disponibilite).toBe('Disponible sur demande');
    expect(JSON.stringify(item).toLowerCase()).not.toMatch(/prix|price|promotion|remise|fcfa|xaf|€/);
  });
});
