# Unique Product Media Prompts Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Generate and validate four distinct, product-only image prompts for every SaddlePoint catalogue reference.

**Architecture:** A pure TypeScript module turns each `CatalogueShopProduct` into four stable prompt records, each with a deterministic ID and output path. A small Node-compatible export script writes all records as JSONL; later, the approved image API batch tool consumes that manifest. The website remains on the neutral placeholder until the actual assets pass ownership validation.

**Tech Stack:** TypeScript, Vitest, Node.js, existing catalogue data.

**Spec:** `docs/superpowers/specs/2026-10-26-unique-product-media-design.md`

## Global Constraints

- Generate exactly four prompt records per unique `mediaKey`.
- Every prompt must name the exact product and brand, prohibit people and text overlays, and specify the view.
- Output paths must be unique and remain under `public/catalogue-media/<mediaKey>/`.
- No prices, product substitution, generic category fallback, image API call, API key, or generated image asset in this change.
- The current `main` branch is the explicitly authorized workspace.

---

### Task 1: Create the prompt record generator

**Files:**
- Create: `src/data/catalogue/productMediaPrompts.ts`
- Test: `src/data/catalogue/productMediaPrompts.test.ts`

**Interfaces:**
- Consumes: `CatalogueShopProduct` from `src/data/catalogue/index.ts`.
- Produces: `ProductMediaPrompt`, `createProductMediaPrompts(product)`, and `createCatalogueMediaPrompts(products)`.

- [ ] **Step 1: Write the failing test**

```ts
const records = createProductMediaPrompts(catalogueProducts[0]);
expect(records).toHaveLength(4);
expect(records.map(({ id }) => id)).toEqual([
  `${catalogueProducts[0].mediaKey}-01-hero`,
  `${catalogueProducts[0].mediaKey}-02-angle`,
  `${catalogueProducts[0].mediaKey}-03-detail`,
  `${catalogueProducts[0].mediaKey}-04-context`,
]);
expect(records.every(({ prompt }) => prompt.includes(catalogueProducts[0].nom))).toBe(true);
expect(records.every(({ prompt }) => prompt.includes('no people'))).toBe(true);
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/data/catalogue/productMediaPrompts.test.ts --run`

Expected: FAIL because the module does not exist.

- [ ] **Step 3: Write minimal implementation**

```ts
export interface ProductMediaPrompt {
  id: string;
  mediaKey: string;
  view: 'hero' | 'angle' | 'detail' | 'context';
  outputPath: string;
  prompt: string;
}

export function createProductMediaPrompts(product: CatalogueShopProduct): ProductMediaPrompt[] {
  // Return the four views with stable IDs and a prompt built from product identity.
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- src/data/catalogue/productMediaPrompts.test.ts --run`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/data/catalogue/productMediaPrompts.ts src/data/catalogue/productMediaPrompts.test.ts
git commit -m "feat: add unique product media prompts"
```

### Task 2: Enforce catalogue-wide uniqueness

**Files:**
- Modify: `src/data/catalogue/productMediaPrompts.test.ts`

**Interfaces:**
- Consumes: `createCatalogueMediaPrompts(catalogueProducts)`.
- Produces: evidence that 1,632 products map to 6,528 distinct prompt IDs and output paths.

- [ ] **Step 1: Write the failing test**

```ts
const records = createCatalogueMediaPrompts(catalogueProducts);
expect(records).toHaveLength(catalogueProducts.length * 4);
expect(new Set(records.map(({ id }) => id)).size).toBe(records.length);
expect(new Set(records.map(({ outputPath }) => outputPath)).size).toBe(records.length);
expect(records.every(({ outputPath }) => outputPath.startsWith('catalogue-media/'))).toBe(true);
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/data/catalogue/productMediaPrompts.test.ts --run`

Expected: FAIL because the catalogue-wide function is absent.

- [ ] **Step 3: Write minimal implementation**

```ts
export const createCatalogueMediaPrompts = (products: CatalogueShopProduct[]) =>
  products.flatMap(createProductMediaPrompts);
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- src/data/catalogue/productMediaPrompts.test.ts --run`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/data/catalogue/productMediaPrompts.test.ts src/data/catalogue/productMediaPrompts.ts
git commit -m "test: verify media prompt ownership"
```

### Task 3: Export the complete prompt manifest

**Files:**
- Create: `scripts/export-product-media-prompts.ts`
- Modify: `package.json`
- Test: `src/data/catalogue/productMediaPrompts.test.ts`

**Interfaces:**
- Consumes: `catalogueProducts` and `createCatalogueMediaPrompts`.
- Produces: `output/catalogue-media/prompts.jsonl` when `npm run catalogue:media-prompts` executes.

- [ ] **Step 1: Write the failing test**

```ts
const lines = serializeProductMediaPrompts(createCatalogueMediaPrompts(catalogueProducts));
expect(lines.trim().split('\n')).toHaveLength(6528);
expect(JSON.parse(lines.split('\n')[0])).toMatchObject({
  mediaKey: catalogueProducts[0].mediaKey,
  view: 'hero',
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/data/catalogue/productMediaPrompts.test.ts --run`

Expected: FAIL because the serializer is absent.

- [ ] **Step 3: Write minimal implementation**

```ts
export const serializeProductMediaPrompts = (records: ProductMediaPrompt[]) =>
  records.map((record) => JSON.stringify(record)).join('\n').concat('\n');
```

The export script calls the serializer and writes the manifest, while the package script runs the TypeScript export with the repository’s available execution tool.

- [ ] **Step 4: Run test and export to verify it passes**

Run: `npm test -- src/data/catalogue/productMediaPrompts.test.ts --run && npm run catalogue:media-prompts`

Expected: PASS and an output with 6,528 JSONL lines.

- [ ] **Step 5: Commit**

```bash
git add package.json scripts/export-product-media-prompts.ts src/data/catalogue/productMediaPrompts.ts src/data/catalogue/productMediaPrompts.test.ts
git commit -m "feat: export product media prompt manifest"
```

### Task 4: Verify the complete change

**Files:**
- Verify: all changed files.

- [ ] **Step 1: Run catalogue prompt tests**

Run: `npm test -- src/data/catalogue/productMediaPrompts.test.ts --run`

Expected: PASS with a 6,528-record manifest assertion.

- [ ] **Step 2: Run project validation**

Run: `npm run lint && npm run type-check && npm run build`

Expected: all commands exit successfully.

- [ ] **Step 3: Inspect generated manifest**

Run: `Get-Content output/catalogue-media/prompts.jsonl | Measure-Object -Line`

Expected: 6,528 lines.

- [ ] **Step 4: Commit and push**

```bash
git add -A
git commit -m "feat: prepare unique product image prompts"
git push origin main
```
