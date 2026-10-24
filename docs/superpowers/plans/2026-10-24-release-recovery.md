# Release Recovery Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restore a buildable, testable catalogue client lifecycle and align technical documentation with the checked-in application.

**Architecture:** Keep `src/utils/apiCatalog.ts` as the sole client catalogue data boundary. Restore one client CRUD implementation that treats `clients` as the primary record and `profiles` as best-effort synchronization. Add direct unit coverage by mocking the shared Supabase module; do not contact the live backend.

**Tech Stack:** React 18, TypeScript, Vite, Vitest, Supabase JavaScript client.

**Spec:** `docs/superpowers/specs/2026-10-24-release-recovery-design.md`

## Global Constraints

- Keep current public function signatures and Supabase table names.
- Do not change database migrations, RLS policies, role behaviour, or user-facing workflows.
- Do not install dependencies.
- Treat `clients` failures as fatal and companion `profiles` synchronization failures as non-fatal.
- Do not introduce credentials or claim unverified live-service guarantees.

---

### Task 1: Stabilize the Vitest project root

**Files:**
- Modify: `vitest.config.ts`
- Test: `src/config/constants.test.ts`

**Interfaces:**
- Consumes: existing `defineConfig`, React Vite plugin, `@` source alias.
- Produces: a project-rooted Vitest configuration that finds `src/**/*.test.ts` regardless of Windows path casing.

- [ ] **Step 1: Establish the current failure**

Run: `npm test -- --run src/config/constants.test.ts`

Expected: the runner cannot resolve `vitest.config.ts` or reports an access error before running a test.

- [ ] **Step 2: Make the test configuration project-rooted**

Add an ESM-safe root constant and configure the root explicitly:

```ts
import { fileURLToPath } from 'node:url';

const projectRoot = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
  root: projectRoot,
  // existing plugins, test settings, and alias stay unchanged
});
```

- [ ] **Step 3: Verify the existing test executes**

Run: `npm test -- --run src/config/constants.test.ts`

Expected: all constants tests pass and the runner reports no config-resolution error.

- [ ] **Step 4: Commit the isolated configuration repair**

```bash
git add vitest.config.ts
git commit -m "test: root vitest config at project directory"
```

### Task 2: Restore and protect client CRUD synchronization

**Files:**
- Create: `src/utils/apiCatalog.test.ts`
- Modify: `src/utils/apiCatalog.ts:335-445`
- Test: `src/utils/apiCatalog.test.ts`

**Interfaces:**
- Consumes: `createClient(client)`, `updateClient(id, updates)`, and `deleteClient(id)` from `apiCatalog.ts`; the `supabase` singleton imported from `supabaseClient.ts`.
- Produces: a single syntactically valid implementation of each function. `createClient` returns the created `Client`; `updateClient` returns the updated `Client`; `deleteClient` resolves after soft-deactivation.

- [ ] **Step 1: Write failing client-lifecycle tests**

Mock `./supabaseClient` before importing the module. Use a chain helper which records `from(table)` and supports `insert`, `update`, `select`, `eq`, and `single`. Define the behavioural tests below:

```ts
it('creates the primary client before synchronizing its client profile', async () => {
  const result = await createClient(clientInput);

  expect(result).toEqual(createdClient);
  expect(from).toHaveBeenNthCalledWith(1, 'clients');
  expect(from).toHaveBeenNthCalledWith(2, 'profiles');
});

it('returns the created client when profile synchronization fails', async () => {
  profiles.insert.mockReturnValueOnce(singleResult({ data: null, error: new Error('profile unavailable') }));

  await expect(createClient(clientInput)).resolves.toEqual(createdClient);
});

it('rejects creation when the primary client write fails', async () => {
  clients.insert.mockReturnValueOnce(singleResult({ data: null, error: new Error('client write failed') }));

  await expect(createClient(clientInput)).rejects.toThrow('client write failed');
});

it('updates the primary client and attempts profile synchronization', async () => {
  await expect(updateClient(createdClient.id, { name: 'Updated Client' })).resolves.toEqual(updatedClient);
  expect(from).toHaveBeenCalledWith('clients');
  expect(from).toHaveBeenCalledWith('profiles');
});

it('soft-deactivates the client and its profile', async () => {
  await expect(deleteClient(createdClient.id)).resolves.toBeUndefined();
  expect(clients.update).toHaveBeenCalledWith({ is_active: false });
  expect(profiles.update).toHaveBeenCalledWith({ is_active: false });
});
```

- [ ] **Step 2: Observe that the tests fail for the intended reason**

Run: `npm test -- --run src/utils/apiCatalog.test.ts`

Expected: TypeScript/Vite cannot parse the malformed duplicate client CRUD region in `apiCatalog.ts`.

- [ ] **Step 3: Replace only the corrupted client region with the minimal implementation**

The restored functions must follow this structure:

```ts
export async function createClient(client: Omit<Client, 'created_at' | 'updated_at' | 'total_spent'>): Promise<Client> {
  const { data, error } = await supabase.from('clients')
    .insert({ ...client, total_spent: 0, is_active: true }).select().single();
  if (error) throw error;

  try {
    const { error: profileError } = await supabase.from('profiles').insert({
      id: data.id, name: client.name, email: client.email, phone: client.phone,
      address: client.address, role: 'client', is_active: true,
    });
    if (profileError) console.warn('Profile creation failed:', profileError);
  } catch (profileError) {
    console.warn('Profile creation failed:', profileError);
  }
  return data;
}
```

`updateClient` must update `clients` with an ISO `updated_at`, reject its primary error, then best-effort update the matching `profiles` record with `name`, `email`, `phone`, `address`, and `updated_at`. `deleteClient` must set `is_active: false` in `clients`, reject its primary error, then best-effort set the matching client profile inactive.

- [ ] **Step 4: Verify the repaired unit contract**

Run: `npm test -- --run src/utils/apiCatalog.test.ts`

Expected: all five tests pass.

- [ ] **Step 5: Run static verification**

Run: `npm run type-check && npm run build`

Expected: TypeScript parsing succeeds and Vite creates `dist/`.

- [ ] **Step 6: Commit the client lifecycle repair**

```bash
git add src/utils/apiCatalog.ts src/utils/apiCatalog.test.ts
git commit -m "fix: restore catalogue client synchronization"
```

### Task 3: Correct inaccurate technical documentation

**Files:**
- Modify: `README.md`
- Modify: `DOCUMENTATION.md`
- Test: `npm run build`, `npm test -- --run`

**Interfaces:**
- Consumes: `package.json`, `src/app/App.tsx`, `src/contexts/*`, and the restored build output.
- Produces: documentation that accurately represents the shipped stack and readiness status.

- [ ] **Step 1: Record the conflicting claims**

Run: `rg -n "React Router|Zustand|Framer Motion|6 rôles|68 tables|Production Ready|99\.9%|<200ms" README.md DOCUMENTATION.md package.json`

Expected: documentation claims dependencies absent from `package.json`, six roles despite seven role values, and unverified performance/availability guarantees.

- [ ] **Step 2: Update documentation to current facts**

Apply these replacements:

```md
- Routing: in-memory view state in `App.tsx`; URL routing is planned work.
- State: React Context plus component state; no Zustand dependency is installed.
- Animation: Motion (`motion` package), not a claimed Framer Motion version.
- Roles: seven — Super Admin, Admin, Manager, Commercial, Comptable, Secrétaire, Client.
- Readiness: remove “Production Ready”, 99.9% uptime, and <200ms response guarantees unless supported by external operational evidence.
```

Keep live Supabase capability language conditional: the schema contains RLS declarations, but deployment configuration must be validated separately.

- [ ] **Step 3: Verify no inaccurate stack claims remain**

Run: `rg -n "React Router|Zustand|Framer Motion|6 rôles|99\.9%|<200ms|Production Ready" README.md DOCUMENTATION.md`

Expected: no matches except an explicit historical note, if one is deliberately retained.

- [ ] **Step 4: Run the release gate**

Run: `npm run type-check && npm run build && npm test -- --run`

Expected: all commands complete successfully.

- [ ] **Step 5: Commit the documentation correction**

```bash
git add README.md DOCUMENTATION.md
git commit -m "docs: align platform claims with implementation"
```

## Plan self-review

- Spec coverage: Task 1 restores test execution; Task 2 repairs and verifies client CRUD; Task 3 corrects mismatched documentation. All Phase 1 requirements are represented.
- Placeholder scan: no deferred tasks or unspecified interfaces remain.
- Type consistency: the task uses the existing exported `Client`, `createClient`, `updateClient`, and `deleteClient` contracts without changing their signatures.
