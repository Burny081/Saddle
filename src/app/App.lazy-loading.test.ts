import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { expect, test } from 'vitest';

test('loads internal workspaces lazily instead of adding them to the public entry bundle', () => {
  const source = readFileSync(resolve(process.cwd(), 'src/app/App.tsx'), 'utf8');

  expect(source).toContain("lazy(() => import('@/components/settings/SettingsView')");
  expect(source).toContain("lazy(() => import('@/components/reports/ReportsView')");
  expect(source).toContain('<Suspense fallback=');
});
