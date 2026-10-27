import { expect, test } from 'vitest';
import { getNavigationGroups } from './navigationGroups';
import { navItems } from '@/data/navigation';

test('groups only the navigation items available to an admin', () => {
  const groups = getNavigationGroups(navItems, 'admin');

  expect(groups.map((group) => group.label)).toEqual([
    'Pilotage',
    'Catalogue & stock',
    'Ventes & relations',
    'Administration',
  ]);
  expect(groups.flatMap((group) => group.items).every((item) => item.roles.includes('admin'))).toBe(true);
  expect(groups.flatMap((group) => group.items).map((item) => item.id)).not.toContain('shop');
});

test('does not expose empty groups to a limited staff role', () => {
  const groups = getNavigationGroups(navItems, 'manager');

  expect(groups.map((group) => group.label)).toEqual(['Pilotage', 'Catalogue & stock']);
  expect(groups.flatMap((group) => group.items).every((item) => item.roles.includes('manager'))).toBe(true);
});
