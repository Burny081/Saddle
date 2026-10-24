# URL Navigation and Public Contact Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add URL/history navigation for current Saddle Point views and publish canonical clickable public contact details.

**Architecture:** A pure `routes.ts` module maps locations to current view IDs and back to stable URLs. `App.tsx` consumes that module through one navigation callback and a `popstate` listener, leaving downstream components’ `onNavigate`/`onViewChange` string contracts unchanged. Public contact details are sourced from `COMPANY` and rendered as semantic links.

**Tech Stack:** React 18, TypeScript, Vite, Vitest, browser History API, Tailwind CSS.

**Spec:** `docs/superpowers/specs/2026-10-24-routing-and-contact-design.md`

## Global Constraints

- Do not add dependencies or mutate Supabase data.
- Keep public paths `/`, `/shop`, and `/points-of-sale`.
- Keep application routes under `/app/<view>`.
- Guests must not render protected application views.
- The published phone must be `+237 6 74 93 23 19` with `tel:+237674932319`; email must be `bongni@saddlepoint.org` with its `mailto:` link.

---

### Task 1: Define and test the route contract

**Files:**
- Create: `src/app/routes.ts`
- Create: `src/app/routes.test.ts`

**Interfaces:**
- Consumes: `navItems` from `src/data/navigation.ts`.
- Produces: `RouteState`, `routeFromLocation(pathname, search)`, `pathForView(view, shopParams)`, `isProtectedView(view)`, and `canAccessView(view, role)`.

- [ ] **Step 1: Write the failing route contract tests**

```ts
expect(routeFromLocation('/', '')).toEqual({ view: 'home', shopParams: {} });
expect(routeFromLocation('/shop', '?category=solar&subCategory=inverters')).toEqual({
  view: 'shop', shopParams: { category: 'solar', subCategory: 'inverters' },
});
expect(routeFromLocation('/app/articles-new', '')).toEqual({ view: 'articles-new', shopParams: {} });
expect(routeFromLocation('/unrecognised', '')).toEqual({ view: 'home', shopParams: {} });
expect(pathForView('shop', { category: 'solar' })).toBe('/shop?category=solar');
expect(canAccessView('articles-new', 'commercial')).toBe(true);
expect(canAccessView('articles-new', 'client')).toBe(false);
```

- [ ] **Step 2: Verify the test fails because the module is absent**

Run: `npm test -- --run src/app/routes.test.ts --maxWorkers=1 --no-file-parallelism`

Expected: FAIL with module-not-found for `./routes`.

- [ ] **Step 3: Implement the pure route utility**

Define the view allow-list from `navItems` plus `articles-new`, `sales-new`, and `clients-new`. `routeFromLocation` must decode `category` and `subCategory` only for `/shop`; `pathForView` must encode them with `URLSearchParams` and omit empty values. `canAccessView` must use the parent navigation item for each create-new view.

- [ ] **Step 4: Verify the route contract passes**

Run: `npm test -- --run src/app/routes.test.ts --maxWorkers=1 --no-file-parallelism`

Expected: all route tests pass.

### Task 2: Integrate browser history in the application shell

**Files:**
- Modify: `src/app/App.tsx`
- Test: `src/app/routes.test.ts`

**Interfaces:**
- Consumes: `RouteState`, `routeFromLocation`, `pathForView`, and `canAccessView` from `routes.ts`.
- Produces: `navigateToView(view, shopParams?, options?)`, a string-compatible callback that writes browser history and reacts to `popstate`.

- [ ] **Step 1: Extend the failing route test with inherited role assertions**

```ts
expect(canAccessView('sales-new', 'secretaire')).toBe(true);
expect(canAccessView('sales-new', 'client')).toBe(false);
```

- [ ] **Step 2: Observe the assertion failure**

Run: `npm test -- --run src/app/routes.test.ts --maxWorkers=1 --no-file-parallelism`

Expected: FAIL until create-new aliases inherit their parent permissions.

- [ ] **Step 3: Replace direct app view setters with the navigation callback**

Initialize route state from `routeFromLocation(window.location.pathname, window.location.search)`. The callback must call `window.history.pushState` for user navigation and `window.history.replaceState` for automatic authenticated-home redirects. Subscribe to `popstate`, parse the location, and update `currentView` plus shop parameters. Pass the callback to `DashboardLayout`, dashboards, and public callbacks without changing their prop names.

- [ ] **Step 4: Verify application compilation and route tests**

Run: `npm test -- --run src/app/routes.test.ts --maxWorkers=1 --no-file-parallelism && npm run type-check`

Expected: route tests pass and TypeScript exits 0.

### Task 3: Publish canonical clickable contact details

**Files:**
- Modify: `src/config/constants.ts`
- Modify: `src/config/constants.test.ts`
- Modify: `src/components/PublicHome.tsx`
- Test: `src/config/constants.test.ts`

**Interfaces:**
- Consumes: `COMPANY.phone` and `COMPANY.email`.
- Produces: canonical display values and semantic `tel:`/`mailto:` links in the public desktop and mobile contact areas.

- [ ] **Step 1: Write failing contact assertions**

```ts
expect(COMPANY.phone).toBe('+237 6 74 93 23 19');
expect(COMPANY.email).toBe('bongni@saddlepoint.org');
```

- [ ] **Step 2: Verify the assertions fail against old defaults**

Run: `npm test -- --run src/config/constants.test.ts --maxWorkers=1 --no-file-parallelism`

Expected: FAIL because the previous phone and email are still configured.

- [ ] **Step 3: Implement canonical public contact links**

Set `COMPANY.phone` and `COMPANY.email` to the approved values. In `PublicHome`, import `COMPANY` and use its phone/email for the public contact links rather than values which can be overridden by remote settings. Render:

```tsx
<a href="tel:+237674932319" className="...">{COMPANY.phone}</a>
<a href={`mailto:${COMPANY.email}`} className="...">{COMPANY.email}</a>
```

Add both links to the desktop information strip and mobile menu information block with visible focus styles inherited from the application base CSS.

- [ ] **Step 4: Verify the contact contract and full unit suite**

Run: `npm test -- --run --maxWorkers=1 --no-file-parallelism`

Expected: all tests pass.

### Task 4: Production verification and documentation

**Files:**
- Modify: `README.md`
- Modify: `DOCUMENTATION.md`
- Test: `npm run type-check`, `npm run build`

**Interfaces:**
- Consumes: the route utility, application shell, and `COMPANY` contact values.
- Produces: documentation that states URL/history routing exists and identifies the canonical public contact address.

- [ ] **Step 1: Update routing and public-contact documentation**

Replace documentation saying navigation is only app-local state with: public URLs `/`, `/shop`, `/points-of-sale`; protected module URLs `/app/<view>`; History API back/forward support; and the public `tel:`/`mailto:` links.

- [ ] **Step 2: Run the release gate**

Run: `npm run type-check && npm test -- --run --maxWorkers=1 --no-file-parallelism && npm run build`

Expected: all commands complete with exit code 0.

- [ ] **Step 3: Commit the Phase 2 change**

```bash
git add src/app/routes.ts src/app/routes.test.ts src/app/App.tsx src/config/constants.ts src/config/constants.test.ts src/components/PublicHome.tsx README.md DOCUMENTATION.md docs/superpowers/specs/2026-10-24-routing-and-contact-design.md docs/superpowers/plans/2026-10-24-routing-and-contact.md
git commit -m "feat: add URL navigation and public contact links"
```

## Plan self-review

- Spec coverage: route mapping, history handling, role inheritance, public contact links, tests, documentation, and release verification each have a task.
- Placeholder scan: each task names its files, interfaces, verification command, and required behaviour.
- Type consistency: all navigation callbacks keep the existing string-view contract; the new route state owns only `view` and optional shop filters.
