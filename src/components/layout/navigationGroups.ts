import type { UserRole } from '@/contexts/AuthContext';
import type { NavItem } from '@/data/navigation';

export interface NavigationGroup {
  id: 'pilotage' | 'catalogue' | 'commerce' | 'administration';
  label: string;
  items: NavItem[];
}

const groupDefinitions: Array<Omit<NavigationGroup, 'items'> & { itemIds: string[] }> = [
  { id: 'pilotage', label: 'Pilotage', itemIds: ['dashboard', 'analytics', 'visitors', 'reports'] },
  { id: 'catalogue', label: 'Catalogue & stock', itemIds: ['articles', 'services', 'stock', 'suppliers', 'images'] },
  { id: 'commerce', label: 'Ventes & relations', itemIds: ['sales', 'commercial', 'clients', 'promotions', 'stores', 'accounting'] },
  { id: 'administration', label: 'Administration', itemIds: ['users', 'security', 'settings'] },
];

export function getNavigationGroups(items: NavItem[], role: UserRole): NavigationGroup[] {
  return groupDefinitions
    .map(({ itemIds, ...group }) => ({
      ...group,
      items: items.filter((item) => itemIds.includes(item.id) && item.roles.includes(role)),
    }))
    .filter((group) => group.items.length > 0);
}
