# Product Media Pipeline Design

## Objective

Provide exactly four unique, product-only images for each catalogue reference and render them in the shop only after all four assets are correctly assigned.

## Scope

The current catalogue contains 1,632 references. The pipeline therefore manages 6,528 generated assets. It does not add prices, people, lifestyle photography, downloads, fake product specifications, or shared category images.

## Product identity and file ownership

`CatalogueShopProduct.id` and `mediaKey` are already unique for every catalogue reference. Every image record is owned by exactly one `mediaKey` and one view index from `01` to `04`.

Final filenames use this stable format:

```text
public/catalogue-media/<mediaKey>/01-hero.png
public/catalogue-media/<mediaKey>/02-angle.png
public/catalogue-media/<mediaKey>/03-detail.png
public/catalogue-media/<mediaKey>/04-context.png
```

No asset path may occur in more than one product record. The product card uses image `01`; the detail view uses all four images in view order.

## Image brief

Every generated prompt includes the product name, brand, range, category, subcategory, intended usage, product details, and a required view.

The four required views are:

1. A clean three-quarter studio packshot on a neutral light-grey background.
2. A different studio angle that exposes the opposite side or installation profile.
3. A macro-detail view of the relevant connectors, controls, terminals, mounting point, heat sink, lens, enclosure, or material.
4. A technically relevant isolated view: rear, underside, mounting, included accessory, or connection point, selected from the product type.

All prompts enforce: product only; no people, hands, models, technicians, rooms, job sites, packaging, text overlays, watermarks, SaddlePoint logo, or unrelated equipment. Brand markings are not invented: where the model cannot faithfully render a mark, the physical product remains unbranded rather than displaying inaccurate text.

## Generation and validation flow

1. Build a JSONL manifest with four prompt records for each catalogue product.
2. Generate one output for each record through the configured OpenAI Images API batch workflow.
3. Store the returned file at the owned product/view path.
4. Validate that every expected product/view exists, each file is non-empty, every product has four distinct paths, and paths are not owned by another product.
5. Produce a review report listing failures only. Failed records are regenerated from their original prompt; successful assets are never overwritten by another product.
6. Generate a typed catalogue-media index only after validation succeeds; the shop consumes this index rather than category fallback images.

## Failure handling

A failed, rejected, duplicate, or missing image remains absent from the public product page and is represented by the existing neutral “Visuel produit en préparation” state. It must never fall back to an image from another product. The job can restart safely because filenames and manifest IDs are deterministic.

## Security and operating constraints

Generation requires a locally configured `OPENAI_API_KEY`. The key is read only from the environment, never committed, written to a manifest, logged, or requested in chat. Generation incurs external API usage and begins only after the key is available. The pipeline uses the approved image-generation script and its API batch mode.

## Verification

Automated tests must prove that the manifest has four records per `mediaKey`, every prompt includes the product identity and no-person constraints, and the generated media index never shares a path between products. Runtime validation must count 1,632 references and 6,528 unique asset paths before the full gallery is enabled.
