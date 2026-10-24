# Premium Corporate Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver a more premium, professional SaddlePoint experience while preserving the existing navigation model and public routes.

**Architecture:** Establish a focused visual foundation in the shared styles, then rebuild the public landing page as a calm editorial sales experience. Keep the existing dropdown data and routing contracts, but replace abrupt hover behaviour with pointer-aware, accessible mega-menu interactions and organise imagery around a small original asset set.

**Tech Stack:** React 18, TypeScript, Vite, Tailwind CSS, Lucide React, Motion.

**Spec:** `docs/superpowers/specs/2026-10-24-premium-redesign-design.md`

## Global Constraints

- Keep the existing top-nav information architecture: product, category, service, locations, language, theme, and login controls remain available.
- Keep existing routes, authentication, product data, and navigation callback contracts unchanged.
- Use Manrope for body copy, Sora for headlines, and Ethnocentric only for the wordmark.
- Use Lucide SVG icons for structural UI; do not introduce marketing emojis.
- Preserve SaddlePoint blue and red as restrained brand accents with an editorial white/ink base.
- Use original image assets depicting Black Cameroonian professionals for high-visibility editorial imagery.
- Make all hover-led interactions usable by click, Escape, focus navigation, and reduced-motion preferences.

---

## File map

- Modify `src/styles/fonts.css`: load the new type pair and retain wordmark font loading.
- Modify `src/styles/theme.css`: define typography, surface, border, and elevated-card tokens.
- Modify `src/components/PublicHome.tsx`: compose the premium landing page while retaining all public actions and navbar children.
- Modify `src/components/public/ProductDropdown.tsx`: introduce intent-safe desktop dropdown behaviour and compact editorial card treatment.
- Modify `src/components/public/CategoryDropdown.tsx`: apply the shared pointer/focus interaction and card treatment.
- Modify `src/components/public/ServiceDropdown.tsx`: apply the shared pointer/focus interaction and card treatment.
- Modify `src/components/layout/Topbar.tsx`, `Sidebar.tsx`, and `DashboardLayout.tsx`: align authenticated shell surfaces and typography with the new system without changing navigation behaviour.
- Add `public/images/saddlepoint-*.png`: original editorial imagery for the public experience.

### Task 1: Create the visual foundation

**Files:**
- Modify: `src/styles/fonts.css`
- Modify: `src/styles/theme.css`

**Interfaces:**
- Consumes: the existing global CSS imports in `src/styles/index.css`.
- Produces: `--font-sans`, `--font-display`, surface, border, and focus tokens used by all Tailwind arbitrary values and component CSS.

- [ ] **Step 1: Inspect current font imports and theme variables**

Run: `Get-Content -Raw src/styles/fonts.css; Get-Content -Raw src/styles/theme.css`

- [ ] **Step 2: Replace the generic public type pair with Manrope and Sora**

Add the Google Fonts import for `Manrope` and `Sora`, preserve `/fonts/ethnocentric.css`, and set `--font-sans` to Manrope and `--font-display` to Sora.

- [ ] **Step 3: Add restrained premium surfaces and focus styling**

Define white/ink surface, muted surface, blue/red accent, fine border, strong shadow, and high-contrast focus tokens. Do not change semantic success, warning, or error color roles.

- [ ] **Step 4: Verify the style foundation compiles**

Run: `npm run build`
Expected: build succeeds; existing font and bundle-size warnings may remain.

- [ ] **Step 5: Commit**

Run: `git add src/styles/fonts.css src/styles/theme.css && git commit -m "style: establish premium visual foundation"`

### Task 2: Rebuild the public landing page and editorial image cards

**Files:**
- Modify: `src/components/PublicHome.tsx`
- Create: `public/images/saddlepoint-solar-team-v1.png`
- Create: `public/images/saddlepoint-industrial-control-v1.png`
- Create: `public/images/saddlepoint-client-consultation-v1.png`
- Uses: `public/images/saddlepoint-hero-engineer-v1.png`

**Interfaces:**
- Consumes: `COMPANY`, `onNavigate`, language/theme contexts, and existing product/category/service dropdown props.
- Produces: the unchanged `PublicHome` component API and public contact actions.

- [ ] **Step 1: Generate three supporting editorial images**

Generate landscape, text-free images that portray Black Cameroonian professionals working in solar, industrial automation, and executive project consultation contexts. Copy outputs into the stated `public/images` names.

- [ ] **Step 2: Replace hardcoded gradient-heavy page framing**

Build an editorial shell with thin service bar, quiet header, an asymmetric hero using `saddlepoint-hero-engineer-v1.png`, proof points, and primary/secondary CTAs. Retain the phone and `mailto:bongni@saddlepoint.org` actions.

- [ ] **Step 3: Organise product imagery into consistent hierarchy**

Use one featured solution image plus three supporting cards with fixed aspect ratios, clear category labels, concise copy, icon treatment, and predictable CTA placement. Replace generic remote Unsplash imagery in high-visibility public cards with the original assets.

- [ ] **Step 4: Replace decorative emoji-like UI with Lucide icons**

Use existing Lucide imports or named Lucide icons for proof bars, value cards, and CTAs. Do not alter text labels or route targets solely for the design change.

- [ ] **Step 5: Run type and production verification**

Run: `npx tsc --noEmit --pretty false; npm run build`
Expected: both commands succeed.

- [ ] **Step 6: Commit**

Run: `git add src/components/PublicHome.tsx public/images && git commit -m "feat: redesign public landing experience"`

### Task 3: Upgrade existing navigation dropdown interactions

**Files:**
- Modify: `src/components/public/ProductDropdown.tsx`
- Modify: `src/components/public/CategoryDropdown.tsx`
- Modify: `src/components/public/ServiceDropdown.tsx`

**Interfaces:**
- Consumes: `onNavigate(page, params?)`, `trigger`, `isMobile`, language context, and current menu data.
- Produces: the same exported components and navigation callback semantics.

- [ ] **Step 1: Add a shared pointer-intent pattern inside each desktop component**

Keep a short close timeout in a ref, open immediately on pointer enter, cancel a close when the pointer enters the trigger or panel, and defer close briefly only after pointer leaves both. Clear timers on unmount.

- [ ] **Step 2: Add keyboard-safe state transitions**

Set `aria-expanded`, `aria-haspopup="menu"`, and stable menu labels on triggers. Open on focus, close on Escape, and close when focus exits the menu wrapper. Preserve click behaviour when `trigger="click"`.

- [ ] **Step 3: Restyle menu panels without changing menu content**

Replace oversized rounded/gradient presentation with a precise white surface, fine borders, editorial image crop, blue active rail, and red accent only for important conversion actions. Retain mobile accordion content and search behaviour.

- [ ] **Step 4: Respect reduced motion**

Reduce panel translate/scale to opacity-only when `prefers-reduced-motion` is enabled, and keep active-state indication visible without animation.

- [ ] **Step 5: Verify behaviour and production build**

Run: `npm test; npm run build`
Expected: all existing tests and production build succeed.

- [ ] **Step 6: Commit**

Run: `git add src/components/public && git commit -m "feat: refine pointer-aware navigation menus"`

### Task 4: Align the authenticated shell with the premium system

**Files:**
- Modify: `src/components/layout/Topbar.tsx`
- Modify: `src/components/layout/Sidebar.tsx`
- Modify: `src/components/layout/DashboardLayout.tsx`

**Interfaces:**
- Consumes: current user context, navigation callbacks, `navItems`, store switcher, and notification center.
- Produces: unchanged dashboard routes and shell component signatures.

- [ ] **Step 1: Apply new typography and border/surface hierarchy**

Use the theme tokens for a quiet off-white content canvas, white navigation surfaces, slim separators, and Sora only for short dashboard headings.

- [ ] **Step 2: Refine active and hover navigation states**

Keep all items and click targets intact. Replace broad gradients with a blue active rail or restrained tint; use red only for alert/count emphasis.

- [ ] **Step 3: Preserve responsive behaviour and visible focus states**

Do not alter sidebar visibility logic or mobile drawer controls. Ensure controls retain 44px practical touch targets and focused controls have the global focus ring.

- [ ] **Step 4: Verify type, tests, and production build**

Run: `npx tsc --noEmit --pretty false; npm test; npm run build`
Expected: all commands succeed.

- [ ] **Step 5: Commit**

Run: `git add src/components/layout && git commit -m "style: refine premium dashboard shell"`

## Final verification

- [ ] Run `git diff --check` and confirm no whitespace errors.
- [ ] Run `npm test`, `npx tsc --noEmit --pretty false`, and `npm run build`.
- [ ] Inspect `git status --short` and report only intended source, image, or documentation changes.
