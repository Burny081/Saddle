# Catalogue SaddlePoint à grande échelle Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Étendre le catalogue public de 272 à environ 1 600 fiches électriques et techniques, sans prix et avec des filtres stables.

**Architecture:** Conserver les 272 fiches approuvées comme produits racines et dériver cinq variantes techniques distinctes par fiche avec une table de variantes adaptée à chaque catégorie. L'agrégateur garde une source unique et attribue des identifiants stables ; la boutique existante continue à consommer cette sortie sans changement de contrat.

**Tech Stack:** TypeScript, React, Vitest, Vite.

**Spec:** `docs/superpowers/specs/2026-10-26-catalogue-scale-design.md`

## Global Constraints

- Produire entre 1 500 et 2 000 références sans prix, remise, promotion ni devise.
- Conserver les dix catégories et les filtres catégorie, sous-catégorie, marque et recherche.
- Chaque référence doit avoir un identifiant, slug, marque, catégorie et sous-catégorie non vides et uniques.
- Ne pas générer ni joindre d’images produit dans cette étape.

---

### Task 1: Générateur de variantes techniques

**Files:**
- Create: `src/data/catalogue/scaleCatalogue.ts`
- Test: `src/data/catalogue/scaleCatalogue.test.ts`

**Interfaces:**
- Consumes: `CatalogueProduct` depuis `src/data/catalogue/protectionElectrique.ts`
- Produces: `expandCatalogueProducts(products: CatalogueProduct[]): CatalogueProduct[]`

- [ ] **Step 1: Write the failing test**

```ts
import { expect, test } from 'vitest';
import { protectionElectriqueCatalog } from './protectionElectrique';
import { expandCatalogueProducts } from './scaleCatalogue';

test('creates five technical variants per source product with unique slugs', () => {
  const products = expandCatalogueProducts(protectionElectriqueCatalog.slice(0, 2));
  expect(products).toHaveLength(12);
  expect(new Set(products.map((product) => product.slug)).size).toBe(12);
  expect(products.filter((product) => product.nom.includes('Version')).length).toBe(10);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/data/catalogue/scaleCatalogue.test.ts`

Expected: FAIL because `./scaleCatalogue` does not exist.

- [ ] **Step 3: Write minimal implementation**

```ts
import type { CatalogueProduct } from './protectionElectrique';

const variantsByCategory: Record<string, readonly string[]> = {
  'Protection et sécurité électrique': ['calibre industriel', 'pouvoir de coupure renforcé', 'version tétrapolaire', 'commande auxiliaire', 'configuration sélective'],
  'Énergie et distribution électrique': ['format compact', 'indice IP55', 'indice IP65', 'raccordement par barres', 'configuration supervisable'],
  default: ['version compacte', 'version renforcée', 'format atelier', 'configuration bâtiment', 'configuration projet'],
};

export function expandCatalogueProducts(products: CatalogueProduct[]): CatalogueProduct[] {
  return products.flatMap((product) => [product, ...(variantsByCategory[product.categorie] ?? variantsByCategory.default).map((variant) => ({
    ...product,
    nom: `${product.nom} — Version ${variant}`,
    slug: `${product.slug}-${variant.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}`,
    descriptionCourte: `${product.descriptionCourte} Variante ${variant}.`,
    caracteristiques: [...product.caracteristiques, `Variante ${variant}`],
  }))]);
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- src/data/catalogue/scaleCatalogue.test.ts`

Expected: PASS with one test.

- [ ] **Step 5: Commit**

```bash
git add src/data/catalogue/scaleCatalogue.ts src/data/catalogue/scaleCatalogue.test.ts
git commit -m "feat: generate technical catalogue variants"
```

### Task 2: Intégrer l’échelle dans l’agrégateur

**Files:**
- Modify: `src/data/catalogue/index.ts`
- Modify: `src/data/catalogue/index.test.ts`

**Interfaces:**
- Consumes: `expandCatalogueProducts(products)` depuis `src/data/catalogue/scaleCatalogue.ts`
- Produces: `catalogueProducts`, `catalogueCategories` et `catalogueBrands` inchangés dans `src/data/catalogue/index.ts`

- [ ] **Step 1: Write the failing test**

```ts
expect(catalogueProducts.length).toBeGreaterThanOrEqual(1500);
expect(catalogueProducts.length).toBeLessThanOrEqual(2000);
expect(new Set(catalogueProducts.map((product) => product.id)).size).toBe(catalogueProducts.length);
expect(new Set(catalogueProducts.map((product) => product.slug)).size).toBe(catalogueProducts.length);
expect(new Set(catalogueProducts.map((product) => product.categorie))).toHaveLength(10);
expect(JSON.stringify(catalogueProducts).toLowerCase()).not.toMatch(/prix|price|promotion|remise|fcfa|xaf|€/);
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/data/catalogue/index.test.ts`

Expected: FAIL because the current catalogue only contains 272 products.

- [ ] **Step 3: Write minimal implementation**

```ts
import { expandCatalogueProducts } from './scaleCatalogue';

const catalogueSource = expandCatalogueProducts([
  ...energieDistributionCatalog,
  ...protectionElectriqueCatalog,
  ...cablesConnectiqueCatalog,
  ...automatismeControleCatalog,
  ...moteursPompageCatalog,
  ...solaireSecoursCatalog,
  ...eclairageCatalog,
  ...installationBatimentCatalog,
  ...reseauxSecuriteCatalog,
  ...outilsEpiCatalog,
]);
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- src/data/catalogue/index.test.ts src/data/catalogue/scaleCatalogue.test.ts`

Expected: PASS; catalogue length is 1 632 and all IDs/slugs are unique.

- [ ] **Step 5: Commit**

```bash
git add src/data/catalogue/index.ts src/data/catalogue/index.test.ts
git commit -m "feat: scale SaddlePoint catalogue to 1600 products"
```

### Task 3: Vérification de régression de la boutique

**Files:**
- Modify: `src/components/shop/ClientShopView.test.tsx`
- Test: `src/components/shop/shopCatalogue.test.ts`

**Interfaces:**
- Consumes: `catalogueProducts` depuis `src/data/catalogue/index.ts`
- Produces: boutique capable de paginer la source agrandie avec les filtres existants.

- [ ] **Step 1: Write the failing test**

```ts
import { catalogueProducts } from '@/data/catalogue';

it('keeps catalogue pagination bounded for the scaled source', () => {
  expect(Math.ceil(catalogueProducts.length / SHOP_PAGE_SIZE)).toBeGreaterThan(60);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/components/shop/ClientShopView.test.tsx`

Expected: FAIL because 272 products produce fewer than 60 pages.

- [ ] **Step 3: Keep the existing pagination contract**

No component API change is necessary: the existing `SHOP_PAGE_SIZE = 24` and slice-based rendering already limit each screen to 24 cards. Add only the import and regression assertion.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- src/components/shop/ClientShopView.test.tsx src/components/shop/shopCatalogue.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/shop/ClientShopView.test.tsx src/components/shop/shopCatalogue.test.ts
git commit -m "test: cover scaled catalogue pagination"
```

### Task 4: Validation finale

**Files:**
- Verify: catalogue source, boutique and build output

- [ ] **Step 1: Run the full automated suite**

Run: `npm test`

Expected: all Vitest files pass.

- [ ] **Step 2: Check types and production build**

Run: `npm run type-check; npm run build`

Expected: both commands exit with code 0.

- [ ] **Step 3: Check the commit surface**

Run: `git diff --check; git status --short`

Expected: no whitespace errors and no uncommitted catalogue implementation files.
