import type { CatalogueShopProduct } from '@/data/catalogue';

export interface CatalogueFilters {
  category?: string;
  brand?: string;
  query?: string;
}

const normalize = (value: string) => value.trim().toLocaleLowerCase('fr');

export function filterCatalogueProducts(
  products: CatalogueShopProduct[],
  { category, brand, query }: CatalogueFilters,
): CatalogueShopProduct[] {
  const search = query ? normalize(query) : '';

  return products.filter((product) => {
    if (category && product.categorie !== category) return false;
    if (brand && product.marque !== brand) return false;
    if (!search) return true;

    return [product.nom, product.marque, product.categorie, product.sousCategorie, product.descriptionCourte]
      .some((value) => normalize(value).includes(search));
  });
}
