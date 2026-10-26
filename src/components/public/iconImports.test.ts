import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const componentFiles = [
  'CategoryDropdown.tsx',
  'ProductDropdown.tsx',
  'ServiceDropdown.tsx',
];

describe('public navigation icon imports', () => {
  it('uses explicit Lucide imports so unused icons stay out of the public bundle', () => {
    for (const file of componentFiles) {
      const source = readFileSync(resolve(__dirname, file), 'utf8');
      expect(source).not.toMatch(/import\s+\*\s+as\s+LucideIcons/);
      expect(source).not.toContain('(LucideIcons as any)');
    }
  });
});
