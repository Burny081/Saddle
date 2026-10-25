import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { DataState } from './DataState';

describe('DataState', () => {
  it('announces an empty state with its supporting description', () => {
    render(<DataState kind="empty" title="Aucun article" description="Créez votre premier article." />);

    expect(screen.getByRole('status')).toHaveTextContent('Aucun article');
    expect(screen.getByText('Créez votre premier article.')).toBeInTheDocument();
  });
});
