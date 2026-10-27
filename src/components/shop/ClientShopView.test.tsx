import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ClientShopView, SHOP_PAGE_SIZE } from './ClientShopView';
import { catalogueProducts } from '@/data/catalogue';

vi.mock('@/contexts/AuthContext', () => ({ useAuth: () => ({ user: null }) }));
vi.mock('@/contexts/DataContext', () => ({
  useData: () => ({ articles: [], services: [], addSale: vi.fn() }),
}));
vi.mock('@/components/LoginModal', () => ({ LoginModal: () => null }));
vi.mock('./ProductDetailsDialog', () => ({ ProductDetailsDialog: () => null }));

describe('ClientShopView', () => {
  it('caps a catalogue page at 24 items', () => {
    expect(SHOP_PAGE_SIZE).toBe(24);
  });

  it('keeps catalogue pagination bounded for the scaled source', () => {
    expect(Math.ceil(catalogueProducts.length / SHOP_PAGE_SIZE)).toBeGreaterThan(60);
  });

  it('shows a labelled return action when a back handler is provided', () => {
    render(<ClientShopView onBack={vi.fn()} />);

    expect(screen.getByRole('button', { name: 'Retour' })).toBeInTheDocument();
  });

  it('hides the duplicate return action when the public header already links home', () => {
    render(<ClientShopView onBack={vi.fn()} showBackButton={false} />);

    expect(screen.queryByRole('button', { name: 'Retour' })).not.toBeInTheDocument();
  });

  it('uses professional text-only sort labels', () => {
    render(<ClientShopView onBack={vi.fn()} />);

    expect(screen.getByRole('option', { name: 'Plus populaires' })).toBeInTheDocument();
    expect(screen.queryByRole('option', { name: /🔥|🔤|💰|💎/ })).not.toBeInTheDocument();
  });

  it('offers a category filter alongside catalogue search and sorting', () => {
    render(<ClientShopView onBack={vi.fn()} />);

    expect(screen.getByRole('combobox', { name: 'Filtrer par catégorie' })).toBeInTheDocument();
  });

  it('places catalogue search above the filter controls', () => {
    render(<ClientShopView onBack={vi.fn()} />);

    const search = screen.getByRole('textbox', { name: 'Rechercher un produit' });
    const filters = screen.getByTestId('shop-filters');

    expect(filters).not.toContainElement(search);
    expect(search.compareDocumentPosition(filters) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('provides a dedicated mobile action to open the cart', () => {
    render(<ClientShopView onBack={vi.fn()} />);

    expect(screen.getByRole('button', { name: 'Ouvrir le panier' })).toBeInTheDocument();
  });
});
