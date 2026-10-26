import { automatismeControleCatalog } from './automatismeControle';
import { cablesConnectiqueCatalog } from './cablesConnectique';
import { eclairageCatalog } from './eclairage';
import { energieDistributionCatalog } from './energieDistribution';
import { installationBatimentCatalog } from './installationBatiment';
import { moteursPompageCatalog } from './moteursPompage';
import { outilsEpiCatalog } from './outilsEpi';
import { protectionElectriqueCatalog, type CatalogueProduct } from './protectionElectrique';
import { reseauxSecuriteCatalog } from './reseauxSecurite';
import { solaireSecoursCatalog } from './solaireSecours';

export interface CatalogueShopProduct extends CatalogueProduct {
  id: string;
  image: string;
}

const catalogueSource = [
  energieDistributionCatalog,
  protectionElectriqueCatalog,
  cablesConnectiqueCatalog,
  automatismeControleCatalog,
  moteursPompageCatalog,
  solaireSecoursCatalog,
  eclairageCatalog,
  installationBatimentCatalog,
  reseauxSecuriteCatalog,
  outilsEpiCatalog,
].flat();

export const catalogueProducts: CatalogueShopProduct[] = catalogueSource.map((product) => ({
  ...product,
  id: `catalogue-${product.categorie}-${product.slug}`
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-'),
  image: '/images/saddlepoint-cameroon-workspace-v1.png',
}));

export const catalogueCategories = Array.from(
  new Set(catalogueProducts.map((product) => product.categorie)),
).sort((a, b) => a.localeCompare(b, 'fr'));

export const catalogueBrands = Array.from(
  new Set(catalogueProducts.map((product) => product.marque)),
).sort((a, b) => a.localeCompare(b, 'fr'));
