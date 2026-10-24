import type { UserRole } from '@/contexts/AuthContext';
import { navItems } from '@/data/navigation';

export interface ShopParams {
  category?: string;
  subCategory?: string;
}

export interface RouteState {
  view: string;
  shopParams: ShopParams;
}

const publicPaths: Record<string, string> = {
  home: '/',
  shop: '/shop',
  'points-of-sale': '/points-of-sale',
};

const parentViews: Record<string, string> = {
  'articles-new': 'articles',
  'sales-new': 'sales',
  'clients-new': 'clients',
};

const applicationViews = new Set([
  ...navItems.map((item) => item.id),
  ...Object.keys(parentViews),
]);

const protectedApplicationViews = new Set(
  [...applicationViews].filter((view) => !(view in publicPaths)),
);

export function routeFromLocation(pathname: string, search: string): RouteState {
  const normalizedPath = pathname.replace(/\/+$/, '') || '/';

  if (normalizedPath === '/') {
    return { view: 'home', shopParams: {} };
  }

  if (normalizedPath === '/shop') {
    const params = new URLSearchParams(search);
    const category = params.get('category') || undefined;
    const subCategory = params.get('subCategory') || undefined;
    return { view: 'shop', shopParams: { category, subCategory } };
  }

  if (normalizedPath === '/points-of-sale') {
    return { view: 'points-of-sale', shopParams: {} };
  }

  const applicationMatch = normalizedPath.match(/^\/app\/([^/]+)$/);
  if (applicationMatch && protectedApplicationViews.has(applicationMatch[1])) {
    return { view: applicationMatch[1], shopParams: {} };
  }

  return { view: 'home', shopParams: {} };
}

export function pathForView(view: string, shopParams: ShopParams = {}): string {
  if (view === 'shop') {
    const params = new URLSearchParams();
    if (shopParams.category) params.set('category', shopParams.category);
    if (shopParams.subCategory) params.set('subCategory', shopParams.subCategory);
    const search = params.toString();
    return search ? `${publicPaths.shop}?${search}` : publicPaths.shop;
  }

  if (view in publicPaths) {
    return publicPaths[view];
  }

  return protectedApplicationViews.has(view) ? `/app/${encodeURIComponent(view)}` : publicPaths.home;
}

export function isProtectedView(view: string): boolean {
  return protectedApplicationViews.has(view);
}

export function canAccessView(view: string, role: UserRole): boolean {
  const parentView = parentViews[view] || view;
  const navigationItem = navItems.find((item) => item.id === parentView);
  return navigationItem ? navigationItem.roles.includes(role) : !isProtectedView(view);
}
