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
      onClose={vi.fn()}
    />
  );

  expect(screen.getByRole('button', { name: 'Fermer la fiche produit' })).toBeInTheDocument();
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
  expect(screen.getByTestId('quote-request-cta')).not.toHaveClass('sticky');
  expect(screen.getByTestId('product-gallery')).toHaveClass('max-w-2xl');
  expect(screen.getAllByRole('button', { name: /Voir l’image/i })).toHaveLength(
    product.images.length
  );

  fireEvent.click(screen.getByRole('button', { name: 'Voir l’image 2' }));
  expect(screen.getByRole('img', { name: product.altImage })).toHaveAttribute(
    'src',
    product.images[1]
  );
});

test('keeps product information visible when a product has no generated images yet', () => {
  const product = catalogueProducts.find((catalogueProduct) => !catalogueProduct.image);
  if (!product) throw new Error('Expected a catalogue product without generated media');

  render(
    <CatalogueProductDetails
      product={product}
      isFavorite={false}
      onToggleFavorite={vi.fn()}
      onAddToQuote={vi.fn()}
      onClose={vi.fn()}
    />
  );

  expect(screen.getByTestId('product-images-pending')).toHaveClass('py-4');
  expect(screen.getByRole('heading', { name: 'Description' })).toBeVisible();
  expect(screen.getByRole('heading', { name: 'Caractéristiques techniques' })).toBeVisible();
});
