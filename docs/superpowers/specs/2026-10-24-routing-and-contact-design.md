# URL Navigation and Public Contact Design

**Scope:** Phase 2 of the Saddle Point production-readiness work.

## Goal

Make every supported public and application view addressable through the browser URL, preserve history navigation and existing role checks, and publish the approved contact details consistently on the public site.

## Public contact requirements

- Display phone number: `+237 6 74 93 23 19`.
- Phone action: `tel:+237674932319`.
- Display email: `bongni@saddlepoint.org`.
- Email action: `mailto:bongni@saddlepoint.org`.
- These are canonical public contact details. Remote or cached company settings may continue to supply company metadata, but cannot replace these public support links.

## Routing architecture

The project will retain its current state-driven component rendering and avoid adding a router dependency. A focused route utility will map public paths (`/`, `/shop`, `/points-of-sale`) and application paths (`/app/<view>`) to the existing view identifiers. It will also map the catalogue filter query parameters to the existing shop state.

`App.tsx` will own a navigation callback that updates both React state and `window.history`. A `popstate` listener will rebuild state from the browser location. Existing child views keep receiving a string navigation callback, so dashboard, sidebar, quick-action, and shop component contracts remain compatible.

## Access and fallback behaviour

- Guests may open `/`, `/shop`, and `/points-of-sale`.
- A guest visiting an application route sees the public home until authentication completes; the requested application view remains in state for the existing login flow.
- An authenticated visit to `/` transitions to the dashboard.
- Existing `navItems` role checks remain authoritative for routable module views. The create-new variants inherit their parent module's role requirement.
- Unknown paths resolve safely to the public home rather than rendering an arbitrary view.

## Testing

Unit tests will exercise the pure route parser and URL generator: public paths, application paths, category query parameters, unknown paths, and inherited permissions. Existing constants tests will assert the canonical contact values. UI behaviour is verified through the production build because the application already uses the route utility through `App.tsx`.

## Constraints

- No new routing package or server-side configuration.
- No database, RLS, or deployed company-settings mutation.
- No changes to the existing page component public APIs beyond replacing internal setter references with the compatible navigation callback.
- Keep the route utility browser-safe and independent of React for direct unit testing.
