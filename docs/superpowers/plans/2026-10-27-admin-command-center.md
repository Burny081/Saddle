# Admin Command Center Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a role-aware, actionable command center for SaddlePoint superadmins and admins while retaining the existing dashboards for other staff and clients.

**Architecture:** Pure selector functions transform existing `DataContext` arrays into factual dashboard metrics and work queues. `AdminCommandCenter` consumes those selectors plus the existing `onNavigate` callback. `App.tsx` chooses that component only for `superadmin` and `admin`; `Sidebar` receives grouped navigation derived from existing RBAC-filtered `navItems`.

**Tech Stack:** React 18, TypeScript, Tailwind CSS, shadcn/ui primitives, Lucide, Motion, Vitest, Testing Library.

**Spec:** `docs/superpowers/specs/2026-10-27-admin-command-center-design.md`

## Global Constraints

- Use only `DataContext`, authentication and existing route/navigation data; do not invent trends, figures or records.
- Preserve the current RBAC authority in `navItems`, `canAccessView`, and `App.tsx`.
- Do not expose prices in public shop views or alter public catalogue behavior.
- Keep touch targets at least 44 px, keyboard focus visible, and respect `prefers-reduced-motion`.
- Do not stage or modify unrelated shop work currently present in the working tree.

---

### Task 1: Add testable admin dashboard selectors

**Files:**
- Create: `src/components/admin/adminCommandCenterData.ts`
- Create: `src/components/admin/adminCommandCenterData.test.ts`
- Read: `src/contexts/DataContext.tsx`, `src/types/compatibility.ts`

**Interfaces:**
- Consumes: `Article[]`, `Sale[]`, `Client[]` from `DataContext`.
- Produces: `buildAdminCommandCenterData({ articles, sales, clients }): AdminCommandCenterData`.
- Later consumers: `AdminCommandCenter` in Task 2.

- [ ] **Step 1: Write the failing selector test**

```ts
import { expect, test } from 'vitest';
import { buildAdminCommandCenterData } from './adminCommandCenterData';

test('builds factual operations metrics without invented changes', () => {
  const data = buildAdminCommandCenterData({
    articles: [
      { id: 'a-1', name: 'Coffret', stock: 2, minStock: 5 },
      { id: 'a-2', name: 'Câble', stock: 8, minStock: 5 },
    ] as never[],
    sales: [{ id: 's-1', clientName: 'Acme', total: 2000, date: '2026-10-27' }] as never[],
    clients: [{ id: 'c-1', name: 'Acme' }] as never[],
  });

  expect(data.metrics).toEqual([
    expect.objectContaining({ id: 'sales', value: 1 }),
    expect.objectContaining({ id: 'clients', value: 1 }),
    expect.objectContaining({ id: 'stock', value: 2 }),
    expect.objectContaining({ id: 'attention', value: 1 }),
  ]);
  expect(data.lowStockArticles.map((article) => article.name)).toEqual(['Coffret']);
  expect(data.metrics.every((metric) => metric.change === undefined)).toBe(true);
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- src/components/admin/adminCommandCenterData.test.ts --run`  
Expected: FAIL because `adminCommandCenterData` does not exist.

- [ ] **Step 3: Implement the selector module**

```ts
export interface AdminCommandCenterData {
  metrics: Array<{ id: 'sales' | 'clients' | 'stock' | 'attention'; value: number; label: string; href: string }>;
  lowStockArticles: Array<{ id: string; name: string; stock: number; minStock: number }>;
  recentSales: Array<{ id: string; clientName: string; total: number; date: string }>;
}

export function buildAdminCommandCenterData({ articles, sales, clients }: Input): AdminCommandCenterData {
  const lowStockArticles = articles.filter((article) => article.stock <= article.minStock);
  return {
    metrics: [
      { id: 'sales', value: sales.length, label: 'Ventes enregistrées', href: 'sales' },
      { id: 'clients', value: clients.length, label: 'Clients suivis', href: 'clients' },
      { id: 'stock', value: articles.length, label: 'Références en stock', href: 'stock' },
      { id: 'attention', value: lowStockArticles.length, label: 'Alertes stock', href: 'stock' },
    ],
    lowStockArticles,
    recentSales: [...sales].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5),
  };
}
```

- [ ] **Step 4: Run the selector test to verify it passes**

Run: `npm test -- src/components/admin/adminCommandCenterData.test.ts --run`  
Expected: PASS with one test.

- [ ] **Step 5: Commit**

```bash
git add src/components/admin/adminCommandCenterData.ts src/components/admin/adminCommandCenterData.test.ts
git commit -m "feat: add admin command center data selectors"
```

### Task 2: Build the admin command center screen

**Files:**
- Create: `src/components/admin/AdminCommandCenter.tsx`
- Create: `src/components/admin/AdminCommandCenter.test.tsx`
- Modify: `src/app/App.tsx: dashboard branch in renderView`
- Read: `src/components/dashboards/DashboardView.tsx`, `src/components/app-shell/AppPageHeader.tsx`

**Interfaces:**
- Consumes: `buildAdminCommandCenterData`, `useData()`, `onNavigate(view: string)`.
- Produces: `<AdminCommandCenter onNavigate={onNavigate} />` rendered for `superadmin` and `admin`.
- Later consumers: no new public interfaces.

- [ ] **Step 1: Write the failing component test**

```tsx
test('shows operations metrics and navigates from an urgent stock action', async () => {
  render(<AdminCommandCenter onNavigate={onNavigate} />);

  expect(screen.getByRole('heading', { name: 'Centre de pilotage' })).toBeVisible();
  expect(screen.getByText('Alertes stock')).toBeVisible();
  await user.click(screen.getByRole('button', { name: /voir le stock/i }));
  expect(onNavigate).toHaveBeenCalledWith('stock');
});
```

- [ ] **Step 2: Run the component test to verify it fails**

Run: `npm test -- src/components/admin/AdminCommandCenter.test.tsx --run`  
Expected: FAIL because `AdminCommandCenter` does not exist.

- [ ] **Step 3: Implement the screen with factual states**

```tsx
export function AdminCommandCenter({ onNavigate }: { onNavigate: (view: string) => void }) {
  const { articles, clients, sales, isLoading, error } = useData();
  const data = buildAdminCommandCenterData({ articles, clients, sales });

  return (
    <section className="space-y-6">
      <AppPageHeader eyebrow="Administration" title="Centre de pilotage" description="Priorités et opérations SaddlePoint." />
      <AdminMetricGrid metrics={data.metrics} onNavigate={onNavigate} />
      <div className="grid gap-6 xl:grid-cols-[1.35fr_0.95fr]">
        <PriorityQueue lowStockArticles={data.lowStockArticles} onNavigate={onNavigate} />
        <RecentOperations sales={data.recentSales} onNavigate={onNavigate} />
      </div>
      <AdminQuickActions onNavigate={onNavigate} />
    </section>
  );
}
```

Display a loading state when `isLoading`, a retry-friendly error notice when `error`, and explicit empty states when lists are empty. Metric cards are buttons with visible labels; do not fabricate a monthly change percentage.

- [ ] **Step 4: Wire the view selection**

```tsx
case 'dashboard':
  if (user?.role === 'client') return <ClientDashboard onNavigate={navigateToView} />;
  if (user?.role === 'superadmin' || user?.role === 'admin') {
    return <AdminCommandCenter onNavigate={navigateToView} />;
  }
  return <DashboardView onNavigate={navigateToView} />;
```

- [ ] **Step 5: Run focused tests**

Run: `npm test -- src/components/admin/AdminCommandCenter.test.tsx src/components/admin/adminCommandCenterData.test.ts --run`  
Expected: PASS with no accessibility-console warnings.

- [ ] **Step 6: Commit**

```bash
git add src/components/admin/AdminCommandCenter.tsx src/components/admin/AdminCommandCenter.test.tsx src/app/App.tsx
git commit -m "feat: add admin command center"
```

### Task 3: Group role-filtered staff navigation

**Files:**
- Create: `src/components/layout/navigationGroups.ts`
- Create: `src/components/layout/navigationGroups.test.ts`
- Modify: `src/components/layout/Sidebar.tsx`
- Read: `src/data/navigation.ts`, `src/contexts/AuthContext.tsx`

**Interfaces:**
- Consumes: `NavItem[]`, `UserRole`.
- Produces: `getNavigationGroups(items, role): NavigationGroup[]` where each group contains only permitted entries.
- Later consumers: `Sidebar` renders group titles and entries.

- [ ] **Step 1: Write the failing grouping test**

```ts
test('groups only the navigation items an admin can access', () => {
  const groups = getNavigationGroups(navItems, 'admin');
  expect(groups.map((group) => group.label)).toEqual([
    'Pilotage', 'Catalogue & stock', 'Ventes & relations', 'Administration',
  ]);
  expect(groups.flatMap((group) => group.items).every((item) => item.roles.includes('admin'))).toBe(true);
  expect(groups.flatMap((group) => group.items).map((item) => item.id)).not.toContain('shop');
});
```

- [ ] **Step 2: Run the grouping test to verify it fails**

Run: `npm test -- src/components/layout/navigationGroups.test.ts --run`  
Expected: FAIL because `navigationGroups` does not exist.

- [ ] **Step 3: Implement deterministic grouping**

```ts
const groupDefinitions = [
  { id: 'pilotage', label: 'Pilotage', ids: ['dashboard', 'analytics', 'visitors', 'reports'] },
  { id: 'catalogue', label: 'Catalogue & stock', ids: ['articles', 'services', 'stock', 'suppliers', 'images'] },
  { id: 'commerce', label: 'Ventes & relations', ids: ['sales', 'commercial', 'clients', 'promotions', 'stores', 'accounting'] },
  { id: 'administration', label: 'Administration', ids: ['users', 'security', 'settings'] },
] as const;

export function getNavigationGroups(items: NavItem[], role: UserRole): NavigationGroup[] {
  return groupDefinitions
    .map((definition) => ({ ...definition, items: items.filter((item) => definition.ids.includes(item.id as never) && item.roles.includes(role)) }))
    .filter((group) => group.items.length > 0);
}
```

- [ ] **Step 4: Render group headings in the sidebar**

Replace the flat `filteredNavItems.map` block with `groups.map`. Group headings use semantic text, not buttons. Existing item buttons retain their active treatment, route callback, 44 px target and mobile close behavior.

- [ ] **Step 5: Run focused tests**

Run: `npm test -- src/components/layout/navigationGroups.test.ts src/components/layout/Sidebar.test.tsx --run`  
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/components/layout/navigationGroups.ts src/components/layout/navigationGroups.test.ts src/components/layout/Sidebar.tsx
git commit -m "feat: group staff navigation by operations"
```

### Task 4: Validate role boundaries, responsiveness and production build

**Files:**
- Modify only if a failing test identifies a defect in files from Tasks 1–3.
- Test: `src/app/App.test.tsx` or a new narrowly scoped role-routing test if none exists.

**Interfaces:**
- Consumes: RBAC functions in `src/app/routes.ts` and `navItems`.
- Produces: verified admin-only command-center routing and unchanged staff/client dashboard behavior.

- [ ] **Step 1: Write failing role-routing coverage**

```tsx
test('routes an admin to the command center but keeps a manager on the operational dashboard', () => {
  mockAuth('admin');
  render(<AppContent />);
  expect(screen.getByRole('heading', { name: 'Centre de pilotage' })).toBeVisible();

  mockAuth('manager');
  render(<AppContent />);
  expect(screen.queryByRole('heading', { name: 'Centre de pilotage' })).not.toBeInTheDocument();
});
```

- [ ] **Step 2: Run the test to verify it fails before the final routing implementation, if not already covered**

Run: `npm test -- src/app/App.test.tsx --run`  
Expected: FAIL before the Task 2 route change, then PASS afterward.

- [ ] **Step 3: Verify all required checks**

Run:

```bash
npm test -- --run
npm run lint
npm run type-check
npm run build
git diff --check
```

Expected: all commands exit with code 0.

- [ ] **Step 4: Manually verify responsive behavior**

1. Sign in as an admin and visit `/app/dashboard`.
2. Confirm the centre shows factual metrics, priority state and quick actions.
3. Use an action to navigate to stock or sales.
4. At mobile width, open the sidebar, verify group headings and select one item; the sidebar must close.
5. Sign in as manager and client; verify neither sees admin-only command-center controls.

- [ ] **Step 5: Commit**

```bash
git add src/app/App.test.tsx src/components/admin src/components/layout
git commit -m "test: verify admin command center access"
```
