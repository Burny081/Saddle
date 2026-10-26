import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import ClientFavoritesView from './ClientFavoritesView';
import { readFavorites } from '@/utils/favorites';

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({ user: { id: 'client-1', name: 'Marie Client' } }),
}));

vi.mock('@/contexts/DataContext', () => ({
  useData: () => ({
    articles: [{ id: 'breaker-01', name: 'Disjoncteur 32 A', price: 12500, category: 'Protection', description: 'Protection électrique', stock: 18, minStock: 4, status: 'active' }],
    services: [],
  }),
}));

vi.mock('@/utils/supabaseClient', () => ({
  supabase: { from: vi.fn() },
}));

describe('ClientFavoritesView', () => {
  beforeEach(() => {
    const storage = new Map<string, string>();
    vi.mocked(localStorage.getItem).mockImplementation((key) => storage.get(key) ?? null);
    vi.mocked(localStorage.setItem).mockImplementation((key, value) => { storage.set(key, value); });
    vi.mocked(localStorage.removeItem).mockImplementation((key) => { storage.delete(key); });
    vi.mocked(localStorage.clear).mockImplementation(() => { storage.clear(); });
    localStorage.setItem('favorites_client-1', JSON.stringify(['article:breaker-01']));
  });

  it('shows saved catalogue items in the customer favourites workspace', async () => {
    render(<ClientFavoritesView />);

    expect(await screen.findByRole('heading', { name: 'Disjoncteur 32 A' })).toBeInTheDocument();
  });

  it('reads a typed favourite from the active customer storage', () => {
    expect(readFavorites('client-1')).toEqual([{ type: 'article', id: 'breaker-01' }]);
  });

  it('shows a saved SaddlePoint catalogue product alongside customer favourites', async () => {
    localStorage.setItem('favorites_client-1', JSON.stringify(['article:catalogue-energie-et-distribution-electrique-transformateur-sec-basse-tension']));

    render(<ClientFavoritesView />);

    expect(await screen.findByRole('heading', { name: 'Transformateur sec basse tension' })).toBeInTheDocument();
  });
});
