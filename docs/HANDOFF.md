# Anjez — Handoff

> The live, operational state of the project: what was just done, what is
> pending, and exactly what the next person must do to continue. **Update after
> every major implementation sprint.**
>
> Last handoff: 2026-06-10 · After Sprint 2.5 (Performance — Auth + Bundle)

---

## 1. Where things stand

- **Code:** Sprints 1 → 2.5 implemented. `npm run build` and `npm run lint` both
  pass cleanly from `anjez-app/`.
- **Local run:** `npm run dev` (the project has been run on port 3001 locally
  because another app occupied 3000).
- **Live data layer:** Supabase connected (URL + anon key in `.env.local`).
  **Migrations `0002` + `0003` are applied** — verified live: task creation,
  recurrence badges and the completion archive all work.

## 2. No outstanding blockers

The previously-required migrations are applied. Fresh environments should run
`supabase/schema.sql` (which now includes all columns/triggers); existing
environments are already migrated.

## 3. Performance notes (Sprints 2.4 + 2.5)

- **Auth (2.5):** the middleware validates the session once with `getUser()` and
  forwards the user via request headers; pages read them (no second `getUser`).
  Measured on the data-free `/goals` route (production): **470 ms → 257 ms
  (−213 ms)** — one round-trip removed from every navigation. The middleware
  `getUser()` (~250 ms) remains — it's the secure refresh and is intentionally
  kept.
- **Bundle (2.5):** client dates use `Intl` (`lib/format-date.ts`), not the
  `date-fns` `ar` locale → **First Load JS 193→185 kB (dashboard), 195→187 kB
  (tasks)**. `date-fns` is no longer imported by any app code (dependency left
  in `package.json` for now; safe to remove in a later cleanup).
- **Loading skeletons (2.4)** make navigation feel instant (skeleton at ~20 ms).
- **Future option (not done, out of scope):** Supabase **asymmetric JWT keys** +
  `getClaims()` to also make the middleware validation local (no network).

## 3b. Deep dashboard audit (diagnosis only — measured, instrumentation reverted)

The reported "dashboard 1.7–4 s" was **measurement contention** — those samples
were taken while hammering the single-threaded dev server with concurrent fetch
loops. A **clean single navigation** measures **~0.98–1.0 s** to content-visible
(one ~1.85 s dev outlier). The dashboard is **not** structurally slow.

Measured breakdown (dev, warm; temporary `[PERF]` server logs + browser
PerformanceObserver):

| Stage | Time | Notes |
|---|---|---|
| `GET /dashboard` total (server) | **~475 ms** | |
| middleware `auth.getUser()` | **~220–400 ms** (≈290) | network round-trip to Supabase Auth |
| page `createClient` | ~15–30 ms | |
| page `getCurrentUser()` | **~0 ms** | reads header — P1 confirmed |
| `fetchTasks` query (7 rows) | **~230–315 ms** (≈250) | **latency, not volume** — 7 rows is trivial |
| **all 7 sections render (server)** | **~2 ms** | `preRender − fetchTasks − createClient` |
| RSC payload | 66 KB | not a factor |
| client long-tasks (hydration/render) | **51 ms total** | not a factor |
| queries per load | **1 DB query + 1 auth call** | no N+1, no duplicates |

**Exact bottleneck:** two **sequential ~250 ms Supabase network round-trips** per
navigation — `auth.getUser()` (middleware) then `fetchTasks` (page) ≈ **540 ms
server floor** — plus dev-mode client render (~400–500 ms; far less in prod). The
~250 ms/round-trip is consistent with **geographic latency to the Supabase
region**; it is independent of dataset size (7 rows). Sections, rendering,
hydration, and RSC payload are all negligible.

**Recommended fixes (not implemented):**
1. **Reduce round-trip latency** — host the Supabase project in a region close to
   users (biggest lever; ~250 ms → ~50–80 ms per round-trip), and/or add
   short-TTL server caching for task reads.
2. **Collapse to one auth round-trip** — `getClaims()` + asymmetric JWT keys makes
   the middleware validation local (removes the ~290 ms auth call). *(Out of the
   previous sprint's scope; revisit deliberately.)*
3. **Use production mode for any perceived-speed judgement** — dev adds the
   client-render overhead and on-demand compile (7 s first dashboard visit).

## 4. Verification checklist (tasks feature)

1. Create a task via the FAB, including a recurrence — it saves without error.
2. Open any task → details modal shows all fields (recurrence populated).
3. Change status to ✓ مكتملة on the tasks page → task leaves the **Active** tab.
4. Open the **المهام المكتملة** tab → task appears with a completion date.
5. Dashboard: Top Priorities and Overdue exclude completed; Daily Summary still
   counts completed in totals/percentage.
6. Overdue card on the dashboard → opens `/tasks?filter=overdue`.

## 4. Environment & run notes

- Stack: Next.js 15.5.x · React 19 · `@supabase/ssr` · Tailwind v3. Node on the
  dev machine is current.
- `.env.local` holds `NEXT_PUBLIC_SUPABASE_URL` and the **anon** key only. The
  `service_role` key must never be added to the repo or app code.
- Running `npm run build` overwrites `.next`; if the dev server was running,
  restart it (`stop` → clear `.next` → `start`) to avoid a stale CSS cache.

## 5. Known limitations / open items

- **Placeholders:** Goals, Ideas, Achievements, Reports, Calendar, Settings
  render "قيد التطوير".
- **Mock data:** dashboard Goals and Ideas sections.
- **Recurrence is descriptive only** — there is no scheduler yet that generates
  the next occurrence when a recurring task is completed. (Future sprint.)
- **Mobile screenshots** could not be captured via the automation browser (its
  viewport is locked at desktop width); the mobile layout is standard Tailwind
  `lg:` and was build-verified. Verify visually by narrowing a real browser
  below 1024px.

## 6. Suggested next sprint

Per [ROADMAP.md](ROADMAP.md): **Subtasks MVP** (one level, checkbox completion,
progress %, completed count). Architecture + DB proposal are in the roadmap's
"Immediate — Subtasks MVP" section. After that, the **Goals module**.

---

## Maintenance

**Update this file after every major implementation sprint.** Replace the
"Where things stand", required-actions, and verification sections with the new
sprint's reality; carry forward any still-open items. This is the document a
fresh session or new contributor reads to resume work safely — keep it concrete
and current. Historical sprint summaries live in [ROADMAP.md](ROADMAP.md).
