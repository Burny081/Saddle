import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { expect, test } from 'vitest';

const dropdownSources = [
  'ProductDropdown.tsx',
  'CategoryDropdown.tsx',
  'ServiceDropdown.tsx',
];

test('assigns a distinct editorial image to every public navigation entry', () => {
  const images = dropdownSources.flatMap((file) => {
    const source = readFileSync(resolve(process.cwd(), 'src/components/public', file), 'utf8');
    return [...source.matchAll(/image: '(\/images\/saddlepoint-[^']+\.png)'/g)].map((match) => match[1]);
  });

  expect(images).toHaveLength(10);
  expect(new Set(images)).toHaveLength(10);
});
