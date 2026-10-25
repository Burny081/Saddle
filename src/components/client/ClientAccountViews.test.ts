import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const readView = (name: string) => readFileSync(resolve(process.cwd(), `src/components/client/${name}.tsx`), 'utf8');

describe('client account workspace presentation', () => {
  it('uses the shared page header and data states for the remaining account views', () => {
    ['ClientQuotesView', 'ClientLoyaltyView', 'ClientProfile'].forEach((view) => {
      const source = readView(view);
      expect(source).toContain("AppPageHeader");
      expect(source).not.toContain('bg-gradient-to-br');
    });
  });
});
