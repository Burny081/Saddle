import { describe, expect, it } from 'vitest';
import { canAccessView, isProtectedView, pathForView, routeFromLocation } from './routes';

describe('application routes', () => {
  it('maps the public home path to the home view', () => {
    expect(routeFromLocation('/', '')).toEqual({ view: 'home', shopParams: {} });
  });

  it('preserves shop filters from the URL', () => {
    expect(routeFromLocation('/shop', '?category=solar&subCategory=inverters')).toEqual({
      view: 'shop',
      shopParams: { category: 'solar', subCategory: 'inverters' },
    });
  });

  it('maps application paths to existing view identifiers', () => {
    expect(routeFromLocation('/app/articles-new', '')).toEqual({
      view: 'articles-new',
      shopParams: {},
    });
  });

  it('falls back to the public home for unknown paths', () => {
    expect(routeFromLocation('/unrecognised', '')).toEqual({ view: 'home', shopParams: {} });
  });

  it('generates shareable shop URLs with optional filters', () => {
    expect(pathForView('shop', { category: 'solar' })).toBe('/shop?category=solar');
    expect(pathForView('shop', { category: 'solar', subCategory: 'inverters' })).toBe(
      '/shop?category=solar&subCategory=inverters',
    );
  });

  it('inherits parent permissions for create-new views', () => {
    expect(canAccessView('articles-new', 'commercial')).toBe(true);
    expect(canAccessView('articles-new', 'client')).toBe(false);
    expect(canAccessView('sales-new', 'secretaire')).toBe(true);
    expect(canAccessView('sales-new', 'client')).toBe(false);
  });

  it('identifies application views as protected', () => {
    expect(isProtectedView('dashboard')).toBe(true);
    expect(isProtectedView('shop')).toBe(false);
  });
});
