import { fireEvent, render, screen } from '@testing-library/react';
import { expect, test, vi } from 'vitest';
import { catalogueProducts } from '@/data/catalogue';
import { CatalogueProductDetails } from './CatalogueProductDetails';

test('shows a complete catalogue product detail with a selectable image gallery', () => {
  const product = {
    ...catalogueProducts[0],
    image: '/product-image-1.png',
    images: [
      '/product-image-1.png',
      '/product-image-2.png',
      '/product-image-3.png',
      '/product-image-4.png',
    ],
  };

  render(
    <CatalogueProductDetails
      product={product}
      isFavorite={false}
      onToggleFavorite={vi.fn()}
      onAddToQuote={vi.fn()}
    />
  );

  expect(screen.getByRole('heading', { name: 'Fiche produit' })).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: 'Caractéristiques techniques' })).toBeInTheDocument();
  expect(
    screen.getByRole('heading', { name: 'Configuration technique souhaitée' })
  ).toBeInTheDocument();
  expect(
    screen.getByRole('combobox', { name: 'Intensité / capacité souhaitée' })
  ).toBeInTheDocument();
  expect(
    screen.getByRole('heading', { name: 'Compatibilités & alternatives' })
  ).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: 'Variantes disponibles' })).toBeInTheDocument();
  expect(screen.getByText(new RegExp(product.usage))).toBeInTheDocument();
  expect(screen.getByTestId('quote-request-cta')).toHaveClass('sticky');
  expect(screen.getAllByRole('button', { name: /Voir l’image/i })).toHaveLength(
    product.images.length
  );

  fireEvent.click(screen.getByRole('button', { name: 'Voir l’image 2' }));
  expect(screen.getByRole('img', { name: product.altImage })).toHaveAttribute(
    'src',
    product.images[1]
  );
});
