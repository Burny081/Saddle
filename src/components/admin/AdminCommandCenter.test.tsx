import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, test, vi } from 'vitest';
import { AdminCommandCenter } from './AdminCommandCenter';

const context = vi.hoisted(() => ({
  current: {
    articles: [
      {
        id: 'article-low',
        name: 'Coffret de protection',
        stock: 1,
        minStock: 4,
      },
    ],
    clients: [{ id: 'client-1', name: 'Acme' }],
    sales: [{ id: 'sale-1', clientName: 'Acme', total: 2000, date: '2026-10-27' }],
    isLoading: false,
    error: null as string | null,
    refreshData: vi.fn(),
  },
}));

vi.mock('@/contexts/DataContext', () => ({
  useData: () => context.current,
}));

test('shows operational priorities and routes a stock action', async () => {
  const user = userEvent.setup();
  const onNavigate = vi.fn();

  render(<AdminCommandCenter onNavigate={onNavigate} />);

  expect(screen.getByRole('heading', { name: 'Centre de pilotage' })).toBeVisible();
  expect(screen.getByText('Alertes stock')).toBeVisible();
  expect(screen.getByText('Coffret de protection')).toBeVisible();

  await user.click(screen.getByRole('button', { name: /voir le stock/i }));

  expect(onNavigate).toHaveBeenCalledWith('stock');
});

test('offers a retry action when data loading fails', async () => {
  const user = userEvent.setup();
  const refreshData = vi.fn();

  context.current = {
    articles: [],
    clients: [],
    sales: [],
    isLoading: false,
    error: 'Connexion base de données échouée.',
    refreshData,
  };

  render(<AdminCommandCenter onNavigate={vi.fn()} />);

  await user.click(screen.getByRole('button', { name: /réessayer/i }));

  expect(refreshData).toHaveBeenCalledTimes(1);

  context.current = {
    articles: [
      { id: 'article-low', name: 'Coffret de protection', stock: 1, minStock: 4 },
    ],
    clients: [{ id: 'client-1', name: 'Acme' }],
    sales: [{ id: 'sale-1', clientName: 'Acme', total: 2000, date: '2026-10-27' }],
    isLoading: false,
    error: null,
    refreshData: vi.fn(),
  };
});
