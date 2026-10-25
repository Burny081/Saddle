# Authenticated Screen Rollout Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Apply the approved premium SaddlePoint design system to every authenticated screen while retaining existing behaviour.

**Architecture:** Add small composable presentation primitives and use them as wrappers around existing data-bound views. Each screen family is upgraded in a separate verification batch so no role, route, provider, or action changes as part of styling.

**Tech Stack:** React 18, TypeScript, Tailwind CSS, shadcn/Radix UI, Lucide React, Motion, Vitest, Testing Library.

**Spec:** `docs/superpowers/specs/2026-10-25-authenticated-screen-rollout-design.md`

## Global Constraints

- Preserve every existing route, user role, authorization check, provider, query, mutation, calculation, export, and callback contract.
- Use Manrope for body copy, Sora for page headings, and Ethnocentric only for the wordmark.
- Use white/off-white surfaces, thin borders, restrained elevation, blue productive states, and red only for priority/destructive emphasis.
- Replace structural emojis with Lucide SVG icons where a screen is touched.
- Keep all existing controls available at 44px practical mobile tap size and retain global focus treatment.
- Respect `prefers-reduced-motion`; do not rely on animation to convey state.

---

## File map

- Create `src/components/app-shell/AppPageHeader.tsx`: shared title, description, and action composition.
- Create `src/components/app-shell/AppPanel.tsx`: shared premium surface wrapper.
- Create `src/components/app-shell/DataState.tsx`: loading, empty, and error state presentation.
- Create `src/components/app-shell/StatusBadge.tsx`: semantic badge variants for status values.
- Create focused component tests under `src/components/app-shell/`.
- Modify existing screen families only at their presentational boundaries; their data and action handlers remain in place.

### Task 1: Establish shared authenticated-screen primitives

**Files:**
- Create: `src/components/app-shell/AppPageHeader.tsx`
- Create: `src/components/app-shell/AppPanel.tsx`
- Create: `src/components/app-shell/DataState.tsx`
- Create: `src/components/app-shell/StatusBadge.tsx`
- Create: `src/components/app-shell/AppPageHeader.test.tsx`
- Create: `src/components/app-shell/DataState.test.tsx`

**Interfaces:**
- `AppPageHeader({ eyebrow?, title, description?, actions? })` renders a single page heading landmark and optional action slot.
- `AppPanel({ title?, action?, children, className? })` renders one labelled content section.
- `DataState({ kind, title, description, action? })` supports `kind: 'loading' | 'empty' | 'error'`.
- `StatusBadge({ tone, children })` supports `tone: 'neutral' | 'info' | 'success' | 'warning' | 'danger'`.

- [ ] **Step 1: Write failing primitive tests**

```tsx
render(<AppPageHeader title="Articles" description="Catalogue" actions={<button>Créer</button>} />);
expect(screen.getByRole('heading', { name: 'Articles' })).toBeInTheDocument();
expect(screen.getByRole('button', { name: 'Créer' })).toBeInTheDocument();

render(<DataState kind="empty" title="Aucun article" description="Créez votre premier article." />);
expect(screen.getByText('Aucun article')).toBeInTheDocument();
```

- [ ] **Step 2: Run the focused tests and confirm they fail because the primitives do not exist**

Run: `npm test -- src/components/app-shell/AppPageHeader.test.tsx src/components/app-shell/DataState.test.tsx --run`

- [ ] **Step 3: Implement the four composition-only primitives**

Use Sora in the title class, standard border/surface tokens, named Lucide utility icons in `DataState`, and non-animated status visibility. Do not import contexts or data providers into any primitive.

- [ ] **Step 4: Rerun focused tests and type checking**

Run: `npm test -- src/components/app-shell/AppPageHeader.test.tsx src/components/app-shell/DataState.test.tsx --run; npx tsc --noEmit --pretty false`

- [ ] **Step 5: Commit the isolated visual foundation**

Run: `git add src/components/app-shell && git commit -m "feat: add authenticated screen primitives"`

### Task 2: Upgrade dashboards, analytics, and reports

**Files:**
- Modify: `src/components/dashboards/DashboardView.tsx`
- Modify: `src/components/dashboards/ClientDashboard.tsx`
- Modify: `src/components/dashboards/AnalyticsDashboard.tsx`
- Modify: `src/components/dashboards/components/StatsCard.tsx`
- Modify: `src/components/dashboards/components/QuickActions.tsx`
- Modify: `src/components/dashboards/components/RecentSales.tsx`
- Modify: `src/components/dashboards/components/SalesChart.tsx`
- Modify: `src/components/dashboards/components/VisitorAnalyticsView.tsx`
- Modify: `src/components/reports/ReportsView.tsx`
- Modify: `src/components/reports/AdvancedReportsExport.tsx`
- Create: `src/components/dashboards/DashboardView.test.tsx`

**Interfaces:**
- Consumes the Task 1 primitives and existing dashboard props such as `onNavigate(view: string)`.
- Produces the same dashboard and report component exports and navigation callbacks.

- [ ] **Step 1: Write a failing dashboard presentation test**

Render the staff dashboard inside its existing providers and assert its primary heading is available as a heading rather than gradient text only. Render the client dashboard loading branch and assert it exposes `DataState` loading text rather than a visual-only spinner.

- [ ] **Step 2: Confirm the test fails against current dashboard markup**

Run: `npm test -- src/components/dashboards/DashboardView.test.tsx --run`

- [ ] **Step 3: Apply page headers, metric treatment, panels, and data states**

Replace broad dashboard gradients and emoji tier decoration with page headers, `AppPanel`, `MetricCard`-style surfaces, Lucide icons, and semantic status styling. Keep every existing Supabase query, chart data transform, export action, and `onNavigate` target unchanged.

- [ ] **Step 4: Make chart and report surfaces responsive**

Keep the existing chart libraries and data series. Make their parent panels scroll or stack responsibly below desktop breakpoints; do not hide values or controls.

- [ ] **Step 5: Verify focused tests, type check, and build**

Run: `npm test -- src/components/dashboards/DashboardView.test.tsx --run; npx tsc --noEmit --pretty false; npm run build`

- [ ] **Step 6: Commit dashboard batch**

Run: `git add src/components/dashboards src/components/reports && git commit -m "feat: refine dashboards and reports"`

### Task 3: Upgrade client commerce and account screens

**Files:**
- Modify: `src/components/shop/ClientShopView.tsx`
- Modify: `src/components/shop/OrdersView.tsx`
- Modify: `src/components/shop/ProductDetailsDialog.tsx`
- Modify: `src/components/client/ClientFavoritesView.tsx`
- Modify: `src/components/client/ClientQuotesView.tsx`
- Modify: `src/components/client/ClientLoyaltyView.tsx`
- Modify: `src/components/client/ClientProfile.tsx`
- Create: `src/components/shop/ClientShopView.test.tsx`

**Interfaces:**
- Consumes the existing shop filters, cart/product handlers, order callbacks, and account data.
- Produces unchanged exported components and current ordering/quote/profile behaviour.

- [ ] **Step 1: Write failing tests for existing client action labels**

For shop and orders fixtures, assert current catalogue/order action labels remain available after the new page header and state wrappers are introduced.

- [ ] **Step 2: Confirm the tests fail before the new wrapper composition exists**

Run: `npm test -- src/components/shop/ClientShopView.test.tsx --run`

- [ ] **Step 3: Apply editorial shop hierarchy and compact account surfaces**

Use `AppPageHeader` on each view. Keep product data, filtering, pagination, cart controls, and modal triggers unchanged. Replace card gradients and arbitrary empty content with consistent panel, toolbar, and `DataState` composition.

- [ ] **Step 4: Standardise status and dialogue presentation**

Map existing order/quote statuses to `StatusBadge` tones and give the product-details dialog a standard header, close control, scrollable body, and fixed mobile-safe action area without changing product actions.

- [ ] **Step 5: Verify client workflows compile and test**

Run: `npm test -- src/components/shop/ClientShopView.test.tsx --run; npx tsc --noEmit --pretty false; npm run build`

- [ ] **Step 6: Commit client batch**

Run: `git add src/components/shop src/components/client && git commit -m "feat: refine client commerce workspace"`

### Task 4: Upgrade catalogue, sales, inventory, and commercial workflows

**Files:**
- Modify: `src/components/catalog/ArticlesView.tsx`
- Modify: `src/components/catalog/ServicesView.tsx`
- Modify: `src/components/catalog/ClientsView.tsx`
- Modify: `src/components/catalog/ArticleFormDialog.tsx`
- Modify: `src/components/catalog/ServiceFormDialog.tsx`
- Modify: `src/components/catalog/ClientFormDialog.tsx`
- Modify: `src/components/sales/SalesView.tsx`
- Modify: `src/components/sales/CreateSaleView.tsx`
- Modify: `src/components/stock/EnhancedStockView.tsx`
- Modify: `src/components/stock/StockAlertsPanel.tsx`
- Modify: `src/components/stock/StockHistoryPanel.tsx`
- Modify: `src/components/stock/StockTrendsPanel.tsx`
- Modify: `src/components/suppliers/SuppliersView.tsx`
- Modify: `src/components/stores/StoresView.tsx`
- Modify: `src/components/promotions/PromotionsView.tsx`
- Modify: `src/components/commercial/CommercialView.tsx`
- Modify: `src/components/commercial/ProspectFormDialog.tsx`
- Modify: `src/components/commercial/QuoteFormDialog.tsx`
- Create: `src/components/catalog/ArticlesView.test.tsx`

**Interfaces:**
- Consumes existing create/edit callbacks, forms, filter state, table columns, inventory history, and sales calculations.
- Produces unchanged create, edit, delete, export, and navigation contracts.

- [ ] **Step 1: Write a failing operations-screen test**

Render the articles screen with existing fixture/provider data and assert the current create action and table heading remain reachable through accessible roles after wrapping the view in a page header and panel.

- [ ] **Step 2: Confirm it fails before the operations presentation update**

Run: `npm test -- src/components/catalog/ArticlesView.test.tsx --run`

- [ ] **Step 3: Add consistent headers, toolbars, and table surfaces**

Apply `AppPageHeader` and `AppPanel` to each operational view. Preserve exact table data, filters, actions, and form payloads. Align numeric table cells right, keep status cells semantic, and make wide tables horizontally scroll inside the panel.

- [ ] **Step 4: Standardise form dialog rhythm**

Retain field order and validation. Group related fields under visible section headings, make dialog content scrollable, and keep cancel/save actions in a stable footer. Do not rename submitted fields or change submit handlers.

- [ ] **Step 5: Replace bare loading and empty output**

Use `DataState` for the existing loading, empty, and recoverable-error branches in these views; retain their current fetch and retry behaviour.

- [ ] **Step 6: Verify the operations batch**

Run: `npm test -- src/components/catalog/ArticlesView.test.tsx --run; npx tsc --noEmit --pretty false; npm run build`

- [ ] **Step 7: Commit operations batch**

Run: `git add src/components/catalog src/components/sales src/components/stock src/components/suppliers src/components/stores src/components/promotions src/components/commercial && git commit -m "feat: refine operational workspaces"`

### Task 5: Upgrade administration, accounting, settings, security, and communication screens

**Files:**
- Modify: `src/components/admin/UsersView.tsx`
- Modify: `src/components/admin/ImageManagementView.tsx`
- Modify: `src/components/admin/AdminDashboardView.tsx`
- Modify: `src/components/admin/AuditLogView.tsx`
- Modify: `src/components/admin/CompanyInfoEditor.tsx`
- Modify: `src/components/admin/DocumentsView.tsx`
- Modify: `src/components/admin/NotificationsView.tsx`
- Modify: `src/components/admin/SupportTicketsView.tsx`
- Modify: `src/components/admin/TasksView.tsx`
- Modify: `src/components/security/SecurityView.tsx`
- Modify: `src/components/security/SecuritySettings.tsx`
- Modify: `src/components/security/SessionManagement.tsx`
- Modify: `src/components/settings/SettingsView.tsx`
- Modify: `src/components/settings/UserLocationCard.tsx`
- Modify: `src/components/comptable/ComptableView.tsx`
- Modify: `src/components/comptable/CashJournalFormDialog.tsx`
- Modify: `src/components/comptable/InvoiceFormDialog.tsx`
- Modify: `src/components/chat/ChatWidget.tsx`
- Modify: `src/components/chat/ClientChatWidget.tsx`
- Modify: `src/components/chat/StaffClientChatWidget.tsx`
- Modify: `src/components/ui/ImageGallery.tsx`
- Modify: `src/components/ui/ImageUpload.tsx`
- Modify: `src/components/ui/ImageUploader.tsx`
- Create: `src/components/admin/UsersView.test.tsx`

**Interfaces:**
- Consumes the Task 1 primitives and every existing administrative authorization/action path.
- Produces the same settings, audit, upload, accounting, support, and chat component APIs.

- [ ] **Step 1: Write failing data-state and administrative action tests**

Assert a currently authorised users/settings action is still rendered and that a loading branch now announces its state through `DataState` rather than an unlabelled spinner.

- [ ] **Step 2: Confirm the test fails before applying the shared treatment**

Run: `npm test -- src/components/admin/UsersView.test.tsx --run`

- [ ] **Step 3: Apply settings groups and administrative data surfaces**

Use page headers and panels for settings sections, user lists, audit logs, security controls, support, tasks, documents, and company information. Preserve all role gates and destructive-action confirmation flows.

- [ ] **Step 4: Apply accounting, media, and chat treatment**

Keep accounting totals and form submission intact. Give upload queues, galleries, and chat drawers the standard surface, status, and loading treatment without changing file/upload/message workflows.

- [ ] **Step 5: Run the complete validation suite**

Run: `npm test -- --run; npm run lint; npx tsc --noEmit --pretty false; npm run build; git diff --check`

- [ ] **Step 6: Commit administration batch**

Run: `git add src/components/admin src/components/security src/components/settings src/components/comptable src/components/chat src/components/ui && git commit -m "feat: refine administration and support screens"`

## Plan self-review

- Spec coverage: Tasks 1–5 cover shared primitives, client workspace, staff operations, dashboards/management, administration, overlays, and data states. Existing public screens, routes, and data contracts are explicitly not modified.
- Placeholder scan: each implementation task names concrete files, test intent, commands, and preserved contracts.
- Interface consistency: every downstream task consumes the Task 1 primitives by their defined names and preserves existing exports/callbacks.
