import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { expect, test } from 'vitest';

test('prevents public pages from creating horizontal viewport overflow', () => {
  const themeStyles = readFileSync(resolve(process.cwd(), 'src/styles/theme.css'), 'utf8');

  expect(themeStyles).toMatch(/body\s*\{[\s\S]*overflow-x:\s*clip/);
  expect(themeStyles).toMatch(/#root\s*\{[\s\S]*width:\s*100%/);
});
