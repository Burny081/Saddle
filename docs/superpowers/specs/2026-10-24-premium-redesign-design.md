# Premium Corporate Redesign Design

## Goal

Rework Saddle Point Service into a premium, professional Cameroonian energy-and-electrical-services experience while preserving its blue/red brand cues, feature set, routes, roles, and current navigation structure.

## Approved visual direction

**Corporate Confidence**: light, spacious, boardroom-ready surfaces with deep navy authority, professional blue as the primary action color, and red reserved for signal/priority accents. Visuals must communicate serious electrical engineering, renewable energy, automation, and service delivery in Cameroon.

## Typography and iconography

- Use **Manrope** for interface and body copy, with **Sora** for display headings.
- Keep Ethnocentric only for the compact brand wordmark treatment.
- Remove emoji from structural and marketing UI. Use Lucide SVG icons with one consistent stroke style.
- Replace oversized/decorative text treatment with a stable editorial scale, concise uppercase eyebrow labels, and denser, purposeful headings.

## Page and card architecture

- Public home: structured header, editorial split hero, proof bar, four compact capability cards, a single image-led project/expertise feature, standards and contact CTA.
- Original photography appears only where it adds narrative value: hero, solution/editorial modules, selected store/project pages. Navigation, capability cards, dashboards, forms, and tables remain data/icon-led.
- Capability cards use a small branded icon tile, concise title, one-line description, and a directional text link. No image tiles or hover-scale movement.
- Dashboard surfaces use restrained borders, compact spacing, and data-first hierarchy; they inherit semantic tokens rather than hard-coded red/blue gradients.

## Original image system

- Hero: a Black Cameroonian electrical engineer in a credible clean electrical/solar setting, composed with copy space.
- Supporting imagery: Black Cameroonian energy professionals, commercial clients, solar and industrial electrical systems in modern Cameroon contexts.
- No generic foreign stock imagery, no stereotypes, no visible fake brands/text, no watermarks.
- Assets live under `public/images/` with descriptive versioned names. Existing remote image references are replaced only in redesigned public modules.

## Navbar and dropdowns

- Preserve the existing information architecture: company mark, solution/product/category/service menus, locations, language/theme controls, and login/client access.
- Upgrade interaction rather than replace it: dropdown trigger uses a fine animated active indicator; panel has a clear surface, controlled shadow, a small visual anchor, and pointer-aware entry/exit motion. Panels remain open while moving between trigger and content, work on keyboard focus, and honor reduced motion.
- Menu content is reorganized into concise groups with a featured callout, not large image grids.

## Accessibility and responsiveness

- Keep contrast at AA levels, keyboard focus visible, clickable targets at least 44px where applicable, and all dropdown triggers labeled with expanded state.
- Mobile navigation retains the current menu model but uses the same card hierarchy and non-hover interaction patterns.
- Motion is transform/opacity-only, short, optional, and disabled by the existing reduced-motion rule.

## Scope and sequencing

1. Design tokens, fonts, and shared public components.
2. Public home plus original image assets and dropdown/navbar polish.
3. Dashboard shell, topbar/sidebar, cards, forms, and table styling.
4. Screen-level clean-up on operational views.

No data model, role, route, authentication, or Supabase behaviour changes are included.
