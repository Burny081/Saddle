# Privacy Consent and Location Collection Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make IP, coarse location, and browser-location collection explicit opt-in actions with no local location cache.

**Architecture:** A pure location-collection helper gates network requests on a boolean consent flag. Authentication passes consent from the modal and sends location fields to Supabase only when values exist. The public auth form and account-location panels provide explicit controls instead of effects that start collection on mount.

**Tech Stack:** React 18, TypeScript, Vitest, Supabase JS client, browser Geolocation API.

**Spec:** `docs/superpowers/specs/2026-10-24-privacy-consent-design.md`

## Global Constraints

- No network-based location request without a direct opt-in action.
- No location/IP localStorage reads or writes.
- No new dependency, database migration, RLS change, or deployment action.
- Authentication remains available when consent is declined.

---

### Task 1: Gate collection and remove local cache

**Files:**
- Modify: `src/utils/ipLocation.ts`
- Create: `src/utils/ipLocation.test.ts`

**Interfaces:**
- Produces: `collectLocationData(consent, services?) -> { locationData, ipAddress }`.

- [ ] Write tests that prove non-consent calls neither service, consent returns injected values, and location collection does not call localStorage.
- [ ] Run the tests and observe failure because the helper is absent and cache calls remain.
- [ ] Implement the helper and remove cache reads/writes from `detectUserLocation`/`getUserLocation`.
- [ ] Run `npm test -- --run src/utils/ipLocation.test.ts --maxWorkers=1 --no-file-parallelism`.

### Task 2: Thread consent through authentication

**Files:**
- Modify: `src/contexts/AuthContext.tsx`
- Modify: `src/components/LoginModal.tsx`

**Interfaces:**
- `login(email, password, locationConsent?)`
- `register({ name, email, password, phone?, address?, locationConsent? })`

- [ ] Update authentication to call the gated helper and only persist returned non-null data.
- [ ] Remove the registration-mode geolocation effect; retain address lookup behind an explicit button.
- [ ] Add unchecked consent controls with clear French explanation in login and registration forms.
- [ ] Replace automatic location widgets with explicit request buttons.

### Task 3: Verify and document

**Files:**
- Modify: `README.md`
- Modify: `DOCUMENTATION.md`

- [ ] Document opt-in collection and no client-side location cache.
- [ ] Run `npm run type-check && npm test -- --run --maxWorkers=1 --no-file-parallelism && npm run build`.
- [ ] Commit the implementation and design records.
