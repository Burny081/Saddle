import { expect, test } from 'vitest';
import { createQuoteRequestMailto } from './quoteRequest';

test('builds a French email quote request with all selected catalogue products', () => {
  const url = createQuoteRequestMailto([
    { name: 'Disjoncteur industriel', brand: 'Schneider Electric', quantity: 2 },
    { name: 'Onduleur solaire', brand: 'Victron', quantity: 1 },
  ]);

    expect(url).toContain('mailto:bongni@saddlepoint.org');
  expect(decodeURIComponent(url)).toContain('Disjoncteur industriel — Schneider Electric × 2');
  expect(decodeURIComponent(url)).toContain('Onduleur solaire — Victron × 1');
});
