# Release Recovery Design

**Scope:** Phase 1 of the Saddle Point production-readiness work.

## Goal

Restore a reproducible, testable production build without changing the product's user-facing workflows.

## Included work

1. Repair the malformed client CRUD region in `src/utils/apiCatalog.ts`.
2. Preserve the intended client lifecycle: create a client in `clients`, attempt the companion `profiles` record without rolling back a successful client creation, update both records when possible, and soft-deactivate both records.
3. Add unit coverage for the client CRUD contract using the existing Vitest stack.
4. Make the test configuration resolve correctly in the local project environment.
5. Correct documentation claims that conflict with the checked-in implementation, including routing, state management, animation library, role count, and production-readiness language.

## Excluded work

- URL routing and browser-history support.
- Database schema or deployed Supabase policy changes.
- Replacing mock data, remote images, or local-storage fallbacks.
- New product features or visual redesign.
- Production credential, deployment, or live-backend changes.

## Architecture

The existing `apiCatalog.ts` module remains the catalogue data boundary. Its client CRUD functions will be restored as one complete, non-duplicated implementation that operates against the existing shared `supabase` client. A dedicated test will mock that client at the module boundary and exercise the observable calls and return values for create, update, and soft-delete operations.

The test configuration will retain its current Vite/Vitest setup and `@` alias. The correction must be portable across Windows path casing and must not rely on absolute workspace paths. Documentation will describe actual current architecture: React state/context, `motion`, and state-driven views rather than dependencies that are absent from `package.json`.

## Error handling

- A failed primary `clients` operation rejects the request.
- A failed companion `profiles` synchronization is logged but does not convert an already successful primary client operation into a failure.
- Tests prove the primary failure and companion-sync fallback distinctions.
- No user, token, or secret values are introduced into source or documentation.

## Verification

The phase is complete only when `npm run build`, `npm run type-check`, and the Vitest suite run successfully from the repository root. The new tests must be observed failing before the repair and passing afterward.

## Constraints

- Keep the existing Supabase table names and public function signatures.
- Do not broaden permission behaviour or alter database migrations.
- Do not install dependencies unless an existing toolchain problem makes it unavoidable.
- Keep all documentation claims evidence-based and qualified where live infrastructure cannot be verified.
