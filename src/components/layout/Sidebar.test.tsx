import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Sidebar } from './Sidebar';

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({ user: null, logout: vi.fn() }),
}));

vi.mock('@/contexts/LanguageContext', () => ({
  useLanguage: () => ({ t: (key: string) => key }),
}));

vi.mock('@/data/navigation', () => ({ navItems: [] }));

describe('Sidebar', () => {
  it('does not offer logout when no account is authenticated', () => {
    render(<Sidebar currentView="shop" onViewChange={vi.fn()} open />);

    expect(screen.queryByRole('button', { name: 'nav.logout' })).not.toBeInTheDocument();
  });
});
