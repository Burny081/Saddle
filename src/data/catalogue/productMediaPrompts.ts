import type { CatalogueShopProduct } from './index';

export type ProductMediaView = 'hero' | 'angle' | 'detail' | 'context';

export interface ProductMediaPrompt {
  id: string;
  mediaKey: string;
  view: ProductMediaView;
  outputPath: string;
  prompt: string;
}

interface ViewDefinition {
  view: ProductMediaView;
  filename: string;
  direction: string;
}

const views: readonly ViewDefinition[] = [
  { view: 'hero', filename: '01-hero.png', direction: 'clean three-quarter front studio packshot' },
  { view: 'angle', filename: '02-angle.png', direction: 'different rear or opposite-side studio angle that shows the installation profile' },
  { view: 'detail', filename: '03-detail.png', direction: 'macro product detail of the relevant terminals, controls, mounting, lens, heat sink, enclosure, or material' },
  { view: 'context', filename: '04-context.png', direction: 'isolated technical rear, underside, connector, accessory, or mounting view relevant to this exact product' },
];

function createPrompt(product: CatalogueShopProduct, direction: string) {
  return [
    'Use case: product-mockup',
    'Asset type: electrical product catalogue image',
    `Primary request: ${direction} of the exact product “${product.nom}” by ${product.marque}, product range ${product.gammeMarque}.`,
    `Product category: ${product.categorie}; subcategory: ${product.sousCategorie}; intended usage: ${product.usage}.`,
    `Product description: ${product.descriptionCourte}`,
    `Key technical details to represent faithfully: ${product.caracteristiques.join('; ')}.`,
    'Scene/backdrop: seamless neutral light-grey studio background only.',
    'Style/medium: premium photorealistic commercial product photography, sharp focus, natural materials, accurate industrial proportions.',
    'Composition/framing: one isolated product centered in frame, ample clean margin, no cropped product.',
    'Lighting/mood: controlled softbox studio lighting, natural shadow beneath the product, no dramatic scene.',
    'Constraints: show only the product and its integral parts; no people, no hands, no technician, no model, no room, no site, no packaging, no unrelated equipment, no SaddlePoint logo, no invented brand labels, no text overlays, no watermark.',
    'Avoid: lifestyle imagery, humans, duplicate products, impossible terminals, distorted geometry, unreadable text, logos, labels, diagrams.',
  ].join('\n');
}

export function createProductMediaPrompts(product: CatalogueShopProduct): ProductMediaPrompt[] {
  return views.map(({ view, filename, direction }, index) => ({
    id: `${product.mediaKey}-${String(index + 1).padStart(2, '0')}-${view}`,
    mediaKey: product.mediaKey,
    view,
    outputPath: `catalogue-media/${product.mediaKey}/${filename}`,
    prompt: createPrompt(product, direction),
  }));
}

export function createCatalogueMediaPrompts(products: CatalogueShopProduct[]): ProductMediaPrompt[] {
  return products.flatMap(createProductMediaPrompts);
}

export function serializeProductMediaPrompts(records: ProductMediaPrompt[]) {
  return `${records.map((record) => JSON.stringify(record)).join('\n')}\n`;
}
