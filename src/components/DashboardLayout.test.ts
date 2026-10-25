import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { expect, test } from 'vitest';

test('provides a premium workspace boundary for every authenticated screen', () => {
  const layout = readFileSync(resolve(process.cwd(), 'src/components/DashboardLayout.tsx'), 'utf8');
  const theme = readFileSync(resolve(process.cwd(), 'src/styles/theme.css'), 'utf8');

  expect(layout).toContain('data-workspace="authenticated"');
  expect(theme).toContain('[data-workspace="authenticated"]');
});
