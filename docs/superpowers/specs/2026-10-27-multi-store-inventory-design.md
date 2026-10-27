# Multi-Store Inventory and Transfers Design

## Purpose

Make SaddlePoint stock reliable per active business location before adding supplier purchasing and quote reservations. A product quantity must never be moved, adjusted, or reserved through a browser-side sequence of separate writes.

## Scope

This phase delivers multi-store stock, inventory movements, and transfers only. Supplier purchasing and quote reservations are separate phases that will consume this foundation.

## Current-state findings

- `stores`, `store_stock`, and `stock_movements` already exist in `sps.sql`.
- `store_stock` already has one row per `store_id` and `article_id`, but only stores a physical quantity.
- `transferStockBetweenStores` in `src/utils/apiStores.ts` performs separate client-side reads and writes. It can create inconsistent quantities if two users transfer the same stock concurrently.
- `StoreAccessContext` has store access and `canTransferStock`, but its assignments are currently browser-local fallbacks.
- `StoresView` can fall back to demonstration locations. Inventory operations must use only real, active rows from `stores`; they must not initialize or use demonstration locations.

## Business decisions

- A real active `stores` record is a stock location. The first operational location is the principal depot in Douala; other real locations may be added by authorised admins.
- Product stock is owned by one location. The global quantity is a reporting sum, never an editable source of truth.
- Physical stock, reserved stock, available stock and in-transit stock are distinct values. Available stock is `physical_stock - reserved_stock`.
- A stock change is append-only in `stock_movements`. Corrections are new adjustment movements; history is never edited or deleted from the application.
- Transfers follow `draft → dispatched → received` with an optional `cancelled` state. Partial receiving is supported. A dispatched quantity is in transit until received or cancelled.
- A transfer never directly mutates two stores from the browser. PostgreSQL RPC functions execute the validation, stock updates, transfer transition and movement rows atomically.

## Data model

### `store_stock`

Retain the existing unique `(store_id, article_id)` row and add:

- `reserved_stock integer not null default 0 check (reserved_stock >= 0)`
- `in_transit_in_stock integer not null default 0 check (in_transit_in_stock >= 0)`
- `physical_stock` remains the existing `stock` column during this phase to avoid a destructive rename. It represents received physical stock at the location.
- `available_stock` is exposed through a security-invoker view or returned by RPC as `stock - reserved_stock`; it is not independently writable.

Every write must enforce `stock >= 0` and `reserved_stock <= stock` after the operation.

### `stock_transfers`

One transfer document per origin/destination pair:

- `id uuid primary key`
- `transfer_number text unique not null`
- `from_store_id`, `to_store_id` foreign keys to `stores`, required and different
- `status text` constrained to `draft`, `dispatched`, `received`, `cancelled`
- `requested_by`, `dispatched_by`, `received_by` foreign keys to `profiles`
- `notes`, `dispatched_at`, `received_at`, `created_at`, `updated_at`

### `stock_transfer_items`

One row per article on a transfer:

- `transfer_id`, `article_id` foreign keys
- `requested_quantity integer > 0`
- `dispatched_quantity integer >= 0`
- `received_quantity integer >= 0`
- unique `(transfer_id, article_id)`
- constraints: dispatched quantity cannot exceed requested quantity; received quantity cannot exceed dispatched quantity.

### `stock_movements`

Keep the existing ledger and extend its `movement_type` domain to record explicit transfer legs:

- `transfer_dispatch` decreases origin physical stock.
- `transfer_receive` increases destination physical stock and decreases destination in-transit stock.
- `transfer_cancel` returns undelivered in-transit quantity to the origin.
- Existing `in`, `out`, `adjustment`, and `return` remain valid.

Each movement records exactly one location impact, before/after physical quantities, actor, reference type/id and timestamp. It cannot be updated or deleted through application roles.

## Transactional operations

### Create draft transfer

An authorised user chooses an origin, destination, one or more articles and requested quantities. This operation writes only the transfer header and items; it changes no stock.

### Dispatch transfer

`dispatch_stock_transfer(transfer_id)` locks relevant origin `store_stock` rows, verifies active locations, verifies role and available physical quantity, then atomically:

1. marks the transfer dispatched;
2. decrements origin `store_stock.stock` for each item;
3. increments destination `in_transit_in_stock` for each item;
4. creates an origin `transfer_dispatch` movement for every item.

The function rejects inactive locations, same-origin/destination, zero/negative quantities, duplicate dispatching and insufficient stock.

### Receive transfer

`receive_stock_transfer(transfer_id, received_items)` permits an authorised receiving user to receive a positive quantity up to the outstanding in-transit quantity. In one transaction it increments destination physical stock, decrements destination in-transit stock, increments each received quantity and creates `transfer_receive` movements. It sets the transfer to `received` only when every dispatched item is fully received.

### Cancel transfer

Draft transfers can be cancelled without stock impact. A dispatched transfer can only be cancelled for its outstanding in-transit quantities. Cancellation removes those quantities from destination transit, restores them to origin physical stock and creates `transfer_cancel` movements. Received quantities are not reversed by cancellation; an authorised adjustment or a return transfer is required.

## Access control

- `superadmin` and `admin`: create, dispatch, receive, cancel and view all transfers.
- `manager`: may create and act only for locations assigned to them where `canTransferStock` is true.
- `commercial`, `secretaire`, `comptable`, and `client`: no transfer creation or transition permissions. Accountants may read the ledger if current reporting permissions allow it.
- RLS must use `profiles.role` and persisted store assignments, never browser storage or editable user metadata.
- RPC functions run with narrowly scoped, non-exposed security-definer ownership only if required. They validate `auth.uid()`, role and allowed stores before changing inventory.

## Admin experience

The Stock workspace gains a Transfers tab with:

- active-store selector limited to accessible real locations;
- transfer list, state, origin, destination, requester, date and outstanding quantity;
- create-transfer form with searchable stock available at the origin;
- dispatch, receive-partially, receive-all and cancel actions that are hidden when unauthorised;
- clear success/error messages from the server; no optimistic stock adjustment before RPC success;
- item-level movement history linked to transfer numbers.

The existing overview shows physical, reserved, available and in-transit-in quantities for each article at the active location.

## Migration and rollout

1. Inspect the linked Supabase schema before changing it; `sps.sql` is a repository reference, not proof of live state.
2. Generate a Supabase migration through the CLI, add constraints, tables, indexes, RLS policies and RPC functions.
3. Backfill every current `store_stock` row with zero reserved and in-transit quantities.
4. Do not create demonstration stores during migration. Admins explicitly create/activate actual operational locations.
5. Replace the browser-side `transferStockBetweenStores` implementation with RPC calls.
6. Add tests for insufficient stock, concurrent dispatch safety, partial reception, cancellation, role denial and movement-ledger invariants.

## Success criteria

- No stock transfer can leave either store with a negative quantity.
- Each dispatched or received quantity has a durable movement row tied to its transfer.
- A partial receipt leaves exactly the outstanding balance in transit.
- A user cannot act on a location they are not authorised to access.
- Refreshing the page or two simultaneous requests cannot duplicate or lose stock.
- Demonstration locations never appear as operational stock locations unless an admin explicitly creates them as real active stores.

## Out of scope

- Supplier purchase orders and supplier catalogue mapping.
- Quote/cart reservations and automatic expiry.
- Barcode scanning, shelf/bin-level locations, lots, serial numbers and mobile warehouse workflows.
