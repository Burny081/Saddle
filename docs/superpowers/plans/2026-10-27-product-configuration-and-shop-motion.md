# Product Configuration and Shop Motion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let catalogue visitors choose technically relevant, quote-confirmed options per product before adding it to the quote basket, with restrained motion that improves feedback without distracting from the catalogue.

**Architecture:** A typed configuration-schema module maps each product category to appropriate selectable fields. Product details own local selected values and pass a configuration snapshot to the quote basket; the basket displays it beside each item. Shop interactions use lightweight GSAP entry transitions scoped to the shop root and CSS transform feedback for buttons.

**Tech Stack:** React, TypeScript, Vitest, Tailwind CSS, GSAP, @gsap/react.

**Spec:** `docs/superpowers/specs/2026-10-27-quote-form-and-product-configurator-design.md`

## Global Constraints

- Show every configurable field as “À confirmer dans le devis”; never call it a verified manufacturer specification without a source SKU.
- Keep selected options associated with the exact basket item.
- Do not expose email or Supabase secrets in frontend code.
- Respect reduced-motion preferences and use transform/opacity motion only.
- The `main` branch is explicitly authorized for this work.

---

### Task 1: Define category-specific configuration schemas

**Files:**
- Create: `src/data/catalogue/productConfiguration.ts`
- Test: `src/data/catalogue/productConfiguration.test.ts`

**Interfaces:**
- Consumes: `CatalogueShopProduct`.
- Produces: `ProductConfigurationField` and `getProductConfigurationFields(product)`.

- [ ] **Step 1: Write failing tests** asserting an electrical-protection item exposes `poles`, `ratedCurrent`, `voltage`, and `ipRequirement`, while a solar item exposes `ratedPower`, `systemVoltage`, and `autonomy`.
- [ ] **Step 2: Run the test** with `npm test -- src/data/catalogue/productConfiguration.test.ts --run`; expect an unresolved module failure.
- [ ] **Step 3: Implement the typed field definitions** with truthful quote-selection labels and category-specific option arrays.
- [ ] **Step 4: Re-run the test**; expect PASS.

### Task 2: Select configurations from product details

**Files:**
- Modify: `src/components/shop/CatalogueProductDetails.tsx`
- Modify: `src/components/shop/CatalogueProductDetails.test.tsx`

**Interfaces:**
- Consumes: `getProductConfigurationFields(product)`.
- Produces: `onAddToQuote(configuration: SelectedProductConfiguration)`.

- [ ] **Step 1: Write a failing product-detail test** for the “Configuration technique souhaitée” section and at least one selection control.
- [ ] **Step 2: Run the test**; expect missing-section failure.
- [ ] **Step 3: Render a semantic fieldset of selects**, persist field values in component state, and pass its snapshot with the quote action.
- [ ] **Step 4: Re-run the test**; expect PASS.

### Task 3: Preserve options in the quote basket

**Files:**
- Modify: `src/components/shop/ClientShopView.tsx`
- Modify: `src/components/shop/ClientShopView.test.tsx`

**Interfaces:**
- Consumes: `SelectedProductConfiguration` returned by product details.
- Produces: a `CartItem` with configuration and a visible, compact configuration summary.

- [ ] **Step 1: Write a failing interaction test** that chooses a technical option, adds the product, opens the basket, and sees the option summary.
- [ ] **Step 2: Run the test**; expect the summary assertion to fail.
- [ ] **Step 3: Update `CartItem`, add/merge logic, and basket render** so distinct configurations of the same product do not overwrite each other.
- [ ] **Step 4: Re-run the test**; expect PASS.

### Task 4: Add restrained shop motion

**Files:**
- Modify: `package.json`
- Modify: `src/components/shop/ClientShopView.tsx`
- Modify: `src/app/components/ui/button.tsx`
- Test: `src/components/shop/ClientShopView.test.tsx`

**Interfaces:**
- Consumes: a root ref in `ClientShopView`.
- Produces: GSAP scoped fade/translate entry of filter results and CSS hover/press feedback on buttons.

- [ ] **Step 1: Install `gsap` and `@gsap/react`**.
- [ ] **Step 2: Write a failing test** for stable `data-testid="shop-results"` motion target.
- [ ] **Step 3: Use `useGSAP` with a scoped ref and reduced-motion guard** to animate only opacity and translateY for result cards.
- [ ] **Step 4: Add transform-only hover/active button feedback** through the shared button variant.
- [ ] **Step 5: Run the targeted tests**; expect PASS.

### Task 5: Validate and publish

- [ ] Run `npm test -- --run --maxWorkers=2`, `npm run lint`, `npm run type-check`, and `npm run build`.
- [ ] Commit the verified implementation and push `main`.
