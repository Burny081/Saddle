# Multi-Store Inventory Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver secure, auditable stock balances and atomic transfers between SaddlePoint's real active stores.

**Architecture:** PostgreSQL is the source of truth. A migration extends the existing `store_stock` and `stock_movements` schema, adds transfer documents, and exposes narrow RPC functions that lock and update inventory atomically. TypeScript only calls those RPC functions; the Stock workspace displays their factual state and never performs browser-side stock mutation.

**Tech Stack:** Supabase Postgres and RLS, Supabase JavaScript client, React 18, TypeScript, Tailwind/shadcn, Vitest and Testing Library.

**Spec:** `docs/superpowers/specs/2026-10-27-multi-store-inventory-design.md`

## Global Constraints

- Do not use, create, or initialise demonstration stores in stock operations; query only real active `stores` rows.
- Keep `store_stock.stock` as the physical stock column in this release; add reservation and in-transit values without destructive renames.
- Never update two stores or their balances through sequential browser writes.
- Every stock state change is represented by an append-only `stock_movements` row.
- Enforce access in Postgres with `auth.uid()` and persisted assignments; browser storage is never an authorization source.
- No public catalogue prices or public-shop behavior change.
- Preserve unrelated dirty shop files in the shared working tree.

---

### Task 1: Add the transactional inventory schema and RLS rules

**Files:**
- Create: `supabase/migrations/20261027170000_multi_store_inventory.sql`
- Modify: `sps.sql` to mirror the committed production schema after the migration is verified
- Test: SQL checks run through `supabase db query` against the linked project

**Interfaces:**
- Produces tables `stock_transfers` and `stock_transfer_items`.
- Extends `store_stock` with `reserved_stock` and `in_transit_in_stock`.
- Produces RPC functions `create_stock_transfer`, `dispatch_stock_transfer`, `receive_stock_transfer`, and `cancel_stock_transfer`.
- Later consumers: `src/utils/apiStores.ts` and `StockTransfersPanel`.

- [ ] **Step 1: Inspect the linked schema before creating a migration**

Run:

```bash
supabase db query "select table_name from information_schema.tables where table_schema = 'public' and table_name in ('stores', 'store_stock', 'stock_movements', 'user_store_assignments');"
supabase db query "select column_name from information_schema.columns where table_schema = 'public' and table_name = 'store_stock' order by ordinal_position;"
```

Expected: the live schema contains `stores`, `store_stock`, and `stock_movements`. Stop and reconcile the schema if any expected table or column differs from `sps.sql`.

- [ ] **Step 2: Create the migration through the Supabase CLI**

Run:

```bash
supabase migration new multi_store_inventory
```

Expected: a new migration file is generated under `supabase/migrations/`; rename it to `20261027170000_multi_store_inventory.sql` only if the project migration convention requires deterministic names.

- [ ] **Step 3: Write the failing database invariants**

Run these SQL assertions before adding the migration, expecting them to fail because the columns, tables and RPC functions do not yet exist:

```sql
select reserved_stock, in_transit_in_stock from public.store_stock limit 1;
select to_regclass('public.stock_transfers');
select to_regprocedure('public.dispatch_stock_transfer(uuid)');
```

- [ ] **Step 4: Implement the migration**

Add the following schema constraints and indexes to the migration:

```sql
alter table public.store_stock
  add column if not exists reserved_stock integer not null default 0,
  add column if not exists in_transit_in_stock integer not null default 0,
  add constraint store_stock_reserved_nonnegative check (reserved_stock >= 0),
  add constraint store_stock_transit_nonnegative check (in_transit_in_stock >= 0),
  add constraint store_stock_reservation_within_physical check (reserved_stock <= stock);

alter table public.user_store_assignments
  add column if not exists can_transfer_stock boolean not null default false;

create table if not exists public.stock_transfers (
  id uuid primary key default gen_random_uuid(),
  transfer_number text not null unique,
  from_store_id text not null references public.stores(id),
  to_store_id text not null references public.stores(id),
  status text not null default 'draft' check (status in ('draft', 'dispatched', 'received', 'cancelled')),
  requested_by uuid not null references public.profiles(id),
  dispatched_by uuid references public.profiles(id),
  received_by uuid references public.profiles(id),
  notes text,
  dispatched_at timestamptz,
  received_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (from_store_id <> to_store_id)
);

create table if not exists public.stock_transfer_items (
  id uuid primary key default gen_random_uuid(),
  transfer_id uuid not null references public.stock_transfers(id) on delete cascade,
  article_id text not null references public.articles(id),
  requested_quantity integer not null check (requested_quantity > 0),
  dispatched_quantity integer not null default 0 check (dispatched_quantity >= 0),
  received_quantity integer not null default 0 check (received_quantity >= 0),
  unique (transfer_id, article_id),
  check (dispatched_quantity <= requested_quantity),
  check (received_quantity <= dispatched_quantity)
);

create index if not exists idx_stock_transfers_origin_status on public.stock_transfers(from_store_id, status);
create index if not exists idx_stock_transfers_destination_status on public.stock_transfers(to_store_id, status);
create index if not exists idx_stock_transfer_items_transfer on public.stock_transfer_items(transfer_id);
```

Add RLS to the new tables. Staff can read only transfers touching their persisted assigned stores; `superadmin` and `admin` can read all. No direct insert, update or delete policy is granted to application roles; state changes only occur through the RPC functions.

Replace the `stock_movements` check constraint so it permits `transfer_dispatch`, `transfer_receive` and `transfer_cancel`. Revoke direct `UPDATE` and `DELETE` access from application roles so its ledger is append-only.

Implement the RPC functions with `set search_path = public`, row locks (`for update`) on affected `store_stock` rows, `auth.uid()` authorization checks, an active-store check, and an exception for insufficient stock. `dispatch_stock_transfer` must decrement only origin physical stock and increase destination transit. `receive_stock_transfer` must accept `jsonb` items shaped as `[{"article_id":"...","quantity":2}]`, receive at most the outstanding dispatched amount, and mark the transfer received only when all items are fully received. `cancel_stock_transfer` restores only outstanding transit stock to the origin.

- [ ] **Step 5: Apply and verify the migration**

Run:

```bash
supabase db push
supabase db query "select column_name from information_schema.columns where table_schema = 'public' and table_name = 'store_stock' and column_name in ('reserved_stock', 'in_transit_in_stock');"
supabase db query "select to_regclass('public.stock_transfers'), to_regclass('public.stock_transfer_items');"
supabase db query "select proname from pg_proc where pronamespace = 'public'::regnamespace and proname in ('create_stock_transfer', 'dispatch_stock_transfer', 'receive_stock_transfer', 'cancel_stock_transfer');"
supabase db advisors
```

Expected: both columns, both tables and all four RPC functions exist; the advisors report no new security errors.

- [ ] **Step 6: Commit**

```bash
git add supabase/migrations/20261027170000_multi_store_inventory.sql sps.sql
git commit -m "feat: add transactional multi-store inventory schema"
```

### Task 2: Replace browser-side transfer mutation with typed RPC calls

**Files:**
- Modify: `src/utils/apiStores.ts`
- Create: `src/utils/apiStores.transfers.test.ts`
- Modify: `src/utils/apiStock.ts` only if it currently owns the transfer call used by `StockView`

**Interfaces:**
- Consumes the Task 1 RPC functions.
- Produces `getStoreStockBalances`, `getStockTransfers`, `createStockTransfer`, `dispatchStockTransfer`, `receiveStockTransfer`, and `cancelStockTransfer`.
- Removes the unsafe public `transferStockBetweenStores` implementation.
- Later consumers: Task 3 UI.

- [ ] **Step 1: Write failing API tests**

```ts
test('creates a draft transfer through the atomic RPC', async () => {
  await createStockTransfer({
    fromStoreId: 'store-dla',
    toStoreId: 'store-yde',
    notes: 'Réassort Yaoundé',
    items: [{ articleId: 'article-1', quantity: 3 }],
  });

  expect(mockRpc).toHaveBeenCalledWith('create_stock_transfer', {
    p_from_store_id: 'store-dla',
    p_to_store_id: 'store-yde',
    p_notes: 'Réassort Yaoundé',
    p_items: [{ article_id: 'article-1', quantity: 3 }],
  });
});

test('does not issue direct store_stock updates while dispatching', async () => {
  await dispatchStockTransfer('transfer-1');
  expect(mockFrom).not.toHaveBeenCalledWith('store_stock');
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npm test -- src/utils/apiStores.transfers.test.ts --run`  
Expected: FAIL because the typed transfer API does not exist.

- [ ] **Step 3: Implement the typed API**

```ts
export interface StockBalance extends StoreStock {
  reserved_stock: number;
  in_transit_in_stock: number;
  available_stock: number;
}

export interface StockTransferInput {
  fromStoreId: string;
  toStoreId: string;
  notes?: string;
  items: Array<{ articleId: string; quantity: number }>;
}

export async function dispatchStockTransfer(transferId: string) {
  const { data, error } = await supabase.rpc('dispatch_stock_transfer', { p_transfer_id: transferId });
  if (error) throw error;
  return data;
}
```

Validate non-empty item arrays and positive integer quantities before calling the RPC. Map camelCase inputs to the RPC’s snake_case payload. `getStoreStockBalances` must query store stock only for one supplied active store and return calculated availability supplied by the query/view. Do not retain a fallback that silently writes to `localStorage`.

- [ ] **Step 4: Run focused tests**

Run: `npm test -- src/utils/apiStores.transfers.test.ts --run`  
Expected: PASS with direct `store_stock` updates absent from transfer code.

- [ ] **Step 5: Commit**

```bash
git add src/utils/apiStores.ts src/utils/apiStores.transfers.test.ts src/utils/apiStock.ts
git commit -m "feat: use inventory transfer RPCs from the client"
```

### Task 3: Build the stock transfer workspace

**Files:**
- Create: `src/components/stock/StockTransfersPanel.tsx`
- Create: `src/components/stock/StockTransfersPanel.test.tsx`
- Modify: `src/components/stock/EnhancedStockView.tsx`
- Modify: `src/components/stock/StockView.tsx`
- Modify: `src/contexts/StoreAccessContext.tsx`

**Interfaces:**
- Consumes Task 2 typed transfer API and `useStoreAccess()` permissions.
- Produces `StockTransfersPanel` rendered as a Transfers tab in the existing Stock workspace.
- Uses only active stores fetched from Supabase, never `defaultStores` or `sps_stores` for operational transfers.

- [ ] **Step 1: Write failing UI tests**

```tsx
test('offers dispatch only to a permitted user for a draft transfer', async () => {
  render(<StockTransfersPanel activeStoreId="store-dla" />);
  expect(screen.getByText('TRF-0001')).toBeVisible();
  await user.click(screen.getByRole('button', { name: /expédier/i }));
  expect(dispatchStockTransfer).toHaveBeenCalledWith('transfer-1');
});

test('shows outstanding quantities and supports a partial receipt', async () => {
  render(<StockTransfersPanel activeStoreId="store-yde" />);
  await user.click(screen.getByRole('button', { name: /réceptionner/i }));
  await user.clear(screen.getByLabelText(/quantité reçue/i));
  await user.type(screen.getByLabelText(/quantité reçue/i), '2');
  await user.click(screen.getByRole('button', { name: /confirmer la réception/i }));
  expect(receiveStockTransfer).toHaveBeenCalledWith('transfer-1', [{ articleId: 'article-1', quantity: 2 }]);
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npm test -- src/components/stock/StockTransfersPanel.test.tsx --run`  
Expected: FAIL because `StockTransfersPanel` does not exist.

- [ ] **Step 3: Implement accessible transfer UI**

Build a list filtered to the active store, a create dialog and a transfer detail drawer/dialog. Each row shows transfer number, origin, destination, state, requester, date and item quantities. The draft form loads origin balances through Task 2, forbids same-store transfers and quantities over available stock, then creates a draft only after server success.

Use the existing `canPerformAction('transfer', storeId)` result to hide and disable state-changing buttons. Dispatch uses `dispatchStockTransfer`; reception collects only outstanding positive quantities and uses `receiveStockTransfer`; cancellation calls `cancelStockTransfer`. Refetch balances and transfers after every confirmed action. Use an accessible description for each dialog and retain visible keyboard focus.

Update `EnhancedStockView` with a fifth Transfers tab. Update `StockView` so its selected active location is obtained from `useStoreAccess()` and `getStores(true)`, displays physical/reserved/available/in-transit columns, and deletes the browser-side `handleConfirmTransfer` flow plus its local-store fallback.

- [ ] **Step 4: Run focused UI tests**

Run: `npm test -- src/components/stock/StockTransfersPanel.test.tsx src/components/stock/StockView.test.tsx --run`  
Expected: PASS with no React ref or dialog-description warnings.

- [ ] **Step 5: Commit**

```bash
git add src/components/stock/StockTransfersPanel.tsx src/components/stock/StockTransfersPanel.test.tsx src/components/stock/EnhancedStockView.tsx src/components/stock/StockView.tsx src/contexts/StoreAccessContext.tsx
git commit -m "feat: add admin multi-store transfer workspace"
```

### Task 4: Verify database invariants, RBAC and production integration

**Files:**
- Modify only files from Tasks 1–3 when a verification failure identifies a concrete defect.
- Test: `src/utils/apiStores.transfers.test.ts`, `src/components/stock/StockTransfersPanel.test.tsx`, and database SQL checks.

**Interfaces:**
- Confirms every transfer transition is performed by the Task 1 RPC functions.
- Confirms user role and location access are enforced by the database, not only hidden UI controls.

- [ ] **Step 1: Create the database scenario test data in a transaction**

Run these commands against a non-production Supabase environment with authorised test stores and articles:

```sql
begin;
-- Create a draft transfer with 5 units, dispatch it, then receive 2 units.
-- Query origin physical stock, destination transit, destination physical stock,
-- transfer item quantities and movement rows before rolling back.
rollback;
```

Expected invariants after the partial receipt: origin physical stock decreased by 5, destination transit equals 3, destination physical stock increased by 2, the transfer remains `dispatched`, and exactly one dispatch plus one receive movement exist for the item.

- [ ] **Step 2: Verify negative stock and unauthorised transitions are rejected**

Run:

```sql
select public.dispatch_stock_transfer('00000000-0000-0000-0000-000000000000'::uuid);
```

Expected: an explicit error, never a partial stock update. Repeat using an authenticated non-manager/non-admin session and confirm permission denial.

- [ ] **Step 3: Run application verification**

Run:

```bash
npm test -- --run --maxWorkers=2
npm run lint
npm run type-check
npm run build
git diff --check
```

Expected: all commands exit with code 0. If unrelated dirty worktree files cause lint failures, report their exact paths and do not stage or modify them.

- [ ] **Step 4: Manually verify the workflow**

1. Sign in as an admin, select the real Douala depot and create a draft transfer to another active location.
2. Dispatch the draft and confirm origin physical stock falls while destination transit rises.
3. Receive part of the quantity at the destination, refresh the page, and confirm the remaining transit quantity persists.
4. Attempt to transfer more than available stock and verify the server rejects it without stock changes.
5. Sign in as a commercial user and confirm no transfer action is offered and RPC requests are denied.

- [ ] **Step 5: Commit and publish**

```bash
git add supabase/migrations/20261027170000_multi_store_inventory.sql sps.sql src/utils/apiStores.ts src/utils/apiStores.transfers.test.ts src/components/stock/StockTransfersPanel.tsx src/components/stock/StockTransfersPanel.test.tsx src/components/stock/EnhancedStockView.tsx src/components/stock/StockView.tsx src/contexts/StoreAccessContext.tsx
git commit -m "feat: complete multi-store inventory transfers"
git push origin main
```
