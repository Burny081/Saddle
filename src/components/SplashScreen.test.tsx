import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { SplashScreen } from './SplashScreen';

describe('SplashScreen', () => {
  it('presents the brand and an accessible loading progress indicator', () => {
    render(<SplashScreen />);

    expect(screen.getByAltText('Saddle Point Service')).toBeInTheDocument();
    expect(screen.getByRole('progressbar', { name: 'Préparation de votre espace' })).toBeInTheDocument();
  });
});
