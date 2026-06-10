# Anjez — Development Rules (for Claude & contributors)

> The standards any change to Anjez must follow. These encode the decisions that
> keep the codebase coherent. **Update only when development standards
> themselves change** — not on every sprint.
>
> Last verified: 2026-06-10

---

## 0. Golden rules

1. **Read [PROJECT_CONTEXT.md](PROJECT_CONTEXT.md) first.** Understand the
   current architecture and features before editing.
2. **Match the surrounding code.** Naming, comment density, file layout and
   idioms should be indistinguishable from neighbouring files.
3. **Build and lint must pass** before a change is considered done:
   `npm run build` and `npm run lint` (both from `anjez-app/`).
4. **No secrets in the repo.** The `service_role` key is never used in app code,
   committed, or logged. Only `NEXT_PUBLIC_SUPABASE_URL` and the **anon** key are
   client-side (protected by RLS).

---

## 1. Architecture rules

- **Data access lives only in `services/`.** No `supabase.from(...)` in
  components, hooks, or pages beyond the initial `auth.getUser()` /
  `fetchTasks()` call a server page makes. New queries → a service function.
- **Business logic lives in `features/<x>/lib` or hooks**, never in JSX.
  Sorting, filtering, derivations belong in pure functions (see `priority.ts`).
- **Pages are thin.** A `page.tsx` resolves the user + data on the server and
  renders feature components. No inline data shaping or side effects.
- **One feature folder per module.** Keep `components/`, `hooks/`, `lib/`,
  `types` colocated under `features/<module>/`, and re-export via `index.ts`.
- **Shared, generic UI → `components/ui/`.** App-shell pieces →
  `components/layout/`. Don't put feature logic in either.
- **Global task interactions go through the existing providers**
  (`TaskQuickAddProvider`, `TaskInteractionProvider`). Do not create a second
  task form or a parallel details modal.

## 2. Data & schema rules

- **Schema changes are additive and migration-based.** Add a numbered file in
  `supabase/migrations/` (idempotent: `add column if not exists`, `if not
  exists` guards) **and** update `supabase/schema.sql` for fresh installs.
- **Keep types in sync.** Any column change updates `types/task.ts` and
  `types/database.types.ts` (Row / Insert / Update) in the same change.
- **Derived timestamps are set by triggers**, not app code (`updated_at`,
  `completed_at`). Don't write these from the client.
- **RLS is mandatory.** Every table is scoped to `auth.uid() = user_id`.

## 3. UI / UX rules

- **Mobile-first.** Author the mobile layout first; use `lg:` to add the desktop
  treatment. Don't stretch mobile into desktop.
- **RTL always.** Use logical/RTL-aware classes; test that the right-side sidebar
  and right-anchored drawer behave under `dir="rtl"`.
- **Blue primary palette only.** Use the `primary-*` scale; avoid introducing new
  accent colors without a product reason.
- **Arabic copy** for all user-facing strings; keep tone calm and motivating.
- **Reuse primitives** from `components/ui` (Button, Card, Badge, Input, …)
  rather than re-styling raw elements.
- **Every dashboard surface should be purposeful** — prefer interactive cards
  (navigate or open details) over passive blocks.

## 4. TypeScript & quality rules

- **Strict, explicit types.** No `any`; model data with the shared `Task` /
  `Database` types. Exhaustive `Record<Enum, …>` maps for labels/visuals.
- **No unused exports or dead code.** Remove orphaned components when replacing
  them (as done when superseding dashboard/nav components).
- **Accessibility basics:** `aria-label`s on icon buttons, `role`/`aria-*` on
  custom controls (see `StatusSelector`).

## 5. Verification rules

- Run `npm run build` (type-check + compile) and `npm run lint` for every change.
- When a change is observable in the browser, verify it live before claiming it
  works; share evidence rather than asking the user to check.
- A change touching new DB columns is **not** end-to-end verifiable until the
  matching migration is applied to the live project — call this out explicitly.

## 6. Scope discipline

- **Do only what the sprint asks.** No speculative features, no AI, no module
  build-out unless requested. Placeholders stay placeholders until their sprint.
- Surface side-effectful or irreversible actions (destructive SQL, auth/setting
  changes) to the user instead of performing them silently.

---

## Maintenance

**Update this file only when the development standards change** — e.g. a new
architectural layer is introduced, the testing/verification process changes, or a
convention is formally revised. Routine feature work does **not** touch this
file. When a rule changes, also reconcile any affected guidance in
[PROJECT_CONTEXT.md](PROJECT_CONTEXT.md).
