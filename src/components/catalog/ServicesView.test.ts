import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { expect, test } from 'vitest';

test('uses the shared workspace header and empty state', () => {
  const source = readFileSync(resolve(process.cwd(), 'src/components/catalog/ServicesView.tsx'), 'utf8');
  expect(source).toContain('AppPageHeader');
  expect(source).toContain('DataState');
});
