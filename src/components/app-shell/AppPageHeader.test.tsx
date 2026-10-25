import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { AppPageHeader } from './AppPageHeader';

describe('AppPageHeader', () => {
  it('renders the title, description, and supplied action', () => {
    render(<AppPageHeader title="Articles" description="Catalogue" actions={<button>Créer</button>} />);

    expect(screen.getByRole('heading', { name: 'Articles' })).toBeInTheDocument();
    expect(screen.getByText('Catalogue')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Créer' })).toBeInTheDocument();
  });
});
