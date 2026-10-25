import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ClientShopView, SHOP_PAGE_SIZE } from './ClientShopView';

vi.mock('@/contexts/AuthContext', () => ({ useAuth: () => ({ user: null }) }));
vi.mock('@/contexts/DataContext', () => ({ useData: () => ({ articles: [], services: [], addSale: vi.fn() }) }));
vi.mock('@/components/LoginModal', () => ({ LoginModal: () => null }));
vi.mock('./ProductDetailsDialog', () => ({ ProductDetailsDialog: () => null }));

describe('ClientShopView', () => {
  it('caps a catalogue page at 24 items', () => {
    expect(SHOP_PAGE_SIZE).toBe(24);
  });

  it('shows a labelled return action when a back handler is provided', () => {
    render(<ClientShopView onBack={vi.fn()} />);

    expect(screen.getByRole('button', { name: 'Retour' })).toBeInTheDocument();
  });

  it('uses professional text-only sort labels', () => {
    render(<ClientShopView onBack={vi.fn()} />);

    expect(screen.getByRole('option', { name: 'Plus populaires' })).toBeInTheDocument();
    expect(screen.queryByRole('option', { name: /🔥|🔤|💰|💎/ })).not.toBeInTheDocument();
  });
});
