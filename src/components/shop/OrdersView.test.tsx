import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { OrdersView } from './OrdersView';

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({ user: { id: 'client-1', name: 'Amina Ngono' } }),
}));

vi.mock('@/contexts/LanguageContext', () => ({ useLanguage: () => ({ language: 'fr' }) }));

vi.mock('@/contexts/DataContext', () => ({
  useData: () => ({
    sales: [{
      id: 'sale-1',
      clientName: 'Amina Ngono',
      invoiceNumber: 'FAC-2026-001',
      date: '2026-10-20T10:00:00.000Z',
      total: 125000,
      paid: true,
      status: 'completed',
      items: [{ id: 'breaker-1', type: 'article', name: 'Disjoncteur', quantity: 2, price: 62500 }],
    }],
  }),
}));

describe('OrdersView', () => {
  it('presents orders in an accessible history workspace', () => {
    render(<OrdersView />);

    expect(screen.getByRole('heading', { name: 'Historique des commandes' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Voir les détails de FAC-2026-001' })).toBeInTheDocument();
  });
});
