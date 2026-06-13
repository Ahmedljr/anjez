# Anjez — Roadmap & Sprint Log

> Where Anjez has been and where it's going. **Update after every sprint** —
> move the active sprint into "Completed" and adjust the future plan.
>
> Last verified: 2026-06-10

---

## Status at a glance

- **Current phase:** Sprint 2.8B (Checklist + status-driven Subtasks) complete;
  build + lint green.
- **Operational blocker:** migration **`0005_checklist_and_subtask_status.sql`**
  must be applied to the live DB (degrades gracefully until then). `0002`–`0004`
  already applied.
- **Next up:** Goals module — see "Future Roadmap".

---

## Completed Sprints

### Sprint 1 — MVP Foundation ✅
- Feature-based scaffolding on Next.js 15 App Router (TS, Tailwind, Supabase).
- Auth: email + Google sign-in, middleware session refresh, route protection.
- Tasks: CRUD with `impact_level`, `due_date`, `status`, `is_pinned`.
- Dashboard v1: greeting, total count, top-3 priorities.
- Priority engine, services-only data layer, RTL/mobile-first shell.
- `schema.sql` + RLS, architecture & setup docs. Build + lint verified.

### Sprint 2 — Dashboard V2 ✅
- Rebuilt the dashboard as a "command center" with seven sections: Hero, Top
  Priorities, Daily Summary, Overdue, Goals (mock), Ideas (mock), Productivity
  Insight.
- Stronger visual hierarchy, spacing and motivation; answers "what now?".

### Sprint 2.1 — Navigation & Quick Add ✅
- Persistent **Floating Action Button** opening the existing task modal.
- **Responsive RTL sidebar** (desktop) + **hamburger drawer + overlay** (mobile).
- Active-route highlighting; 8 nav destinations.
- Placeholder routes (`/goals /ideas /achievements /reports /calendar
  /settings`) showing "قيد التطوير".

### Sprint 2.2 — Usability & Interaction ✅
- **Task model upgrade:** added `start_date` and `recurrence`
  (none/daily/weekly/monthly/yearly) across DB, types, service, form, validation.
- **3-state status workflow** (`StatusSelector`: ○ / ◐ / ✓) with distinct visuals.
- **Task details modal** (all fields + Edit / Delete / Change Status), opened by
  clicking any task — via the global `TaskInteractionProvider`.
- **Interactive dashboard:** Top Priorities → details; Daily Summary → `/tasks`;
  Overdue → `/tasks?filter=overdue`; Goals/Ideas/Reports → their routes.
- **Dedicated desktop layout:** two-column grid, widened content, intentional SaaS feel.
- Overdue filter on the tasks page. Build + lint verified.

### Sprint 2.3 — Completed Tasks Archive ✅
- Active view shows only `todo` + `in_progress`; **completed tasks leave the
  active list**.
- **Completed archive view** with completion date, newest first.
- **Active / Completed tabs** on the tasks page (`?filter=completed`), plus the
  existing Overdue filter.
- `completed_at` column + auto-stamping trigger + backfill; `completionDate`
  selector. Dashboard remains compatible (priorities/overdue exclude done; daily
  summary still counts done). Build + lint verified.

---

### Sprint 2.4 — Performance Pass ✅
- Profiled navigation: isolated the dominant cost as the **middleware
  `auth.getUser()`** round-trip (~290ms on *every* navigation; a data-free
  placeholder route measured ~291ms vs ~7ms local ping).
- Added **`getCurrentUser()`** (React `cache()`) so layout + page share one auth
  call; **parallelized** auth + data fetching in the data pages.
- Added **route loading skeletons** (`Skeleton` primitive + `/dashboard` and
  `/tasks` `loading.tsx`) so navigation shows instant feedback instead of a
  ~300ms frozen page. Build + lint verified. No features added.

### Sprint 2.5 — Performance: Auth + Bundle ✅
- Diagnosis (separate report) found the dominant per-navigation cost was a
  **second `auth.getUser()`** (middleware + page) and the `date-fns` Arabic
  locale shipped to the client.
- **Removed the redundant auth lookup:** middleware now forwards the validated
  user via request headers; pages read them instead of re-calling `getUser()`.
  Measured (production, isolated on the data-free `/goals` route):
  **470 ms → 257 ms (−213 ms, −45%)** — one round-trip eliminated on every
  navigation.
- **Dropped the `date-fns` `ar` locale from the client** via an `Intl`-based
  `lib/format-date.ts` (identical output): **First Load JS 193→185 kB
  (dashboard), 195→187 kB (tasks)**.
- Functionality unchanged; build + lint green. *(Not done — JWT/`getClaims`
  migration, deliberately out of scope.)*

### Sprint 2.6 — Client-First Data Architecture ✅
- Root cause of "still slow in prod": every navigation re-fetched tasks
  server-side (dynamic routes can't prefetch their data), so each route waited
  on middleware auth + a Supabase round-trip + render (~1 s, every time).
- **Shift to a shared client store (`TasksProvider`, React Context):** the
  dashboard layout fetches tasks **once**; dashboard + tasks render from the
  store (client) with no per-navigation fetch. Mutations are optimistic and
  update the store directly (**no `router.refresh()`**), reflecting across views
  instantly.
- **`experimental.staleTimes`** keeps visited route shells in the Router Cache.
- **Measured (production):** first visit to a route ~426 ms (data-free shell, no
  data flash); **revisits ~12–39 ms with no skeleton** (was ~1000 ms *every*
  navigation). Cross-view propagation verified (add on `/tasks` → dashboard total
  9→10 with no refetch).
- Auth preserved (middleware `getUser` + headers + RLS). Chose Context over
  TanStack Query / SWR / Zustand: zero new deps, reuses the existing
  service + optimistic pattern, single resource. Build + lint green.

### Sprint 2.7 — Tasks Tab Switching (micro-pass) ✅
- Current/Completed tabs were `<Link>`s → each switch was a route navigation
  (~533 ms server round-trip + skeleton flash) to filter in-store data.
- Made the filter client `useState` (buttons, not Links); `useMemo` on the
  derivations; URL synced via `history.replaceState` (deep-links preserved).
- **Measured:** tab switch **~533 ms + skeleton → ~31–82 ms, no skeleton, no
  navigation.** No UI/functionality change. See HANDOFF §3d.

### Sprint 2.8 — Subtasks MVP ✅
- **DB:** `public.subtasks` table (`id`, `task_id`→cascade, `user_id`, `title`,
  `is_done`, timestamps) + index + RLS + `updated_at` trigger
  (`migrations/0004_subtasks.sql`, mirrored in `schema.sql`).
- **Store-integrated:** subtasks live in the shared `TasksProvider` (grouped by
  `task_id`), seeded once by the layout; `addSubtask` / `toggleSubtask` /
  `removeSubtask` are optimistic — instant, no `router.refresh()`, no navigation,
  no refetch.
- **UI:** add / complete / delete inside the task details modal, with completed
  count, percentage and progress bar; compact `{done}/{total}` badge on list
  rows; an all-done "ready to complete" hint that does **not** auto-complete the
  parent.
- One level only (no nesting). Build + lint green; graceful pre-migration
  degradation verified.

### Sprint 2.8B — Checklist + Status-Driven Subtasks ✅
- Split the single boolean-subtask concept into **two distinct primitives**:
  - **Checklist items** (`checklist_items` table) — lightweight checked/unchecked
    steps; add/toggle/delete instantly.
  - **Subtasks** — upgraded from `is_done` boolean to a **`status` enum**
    (todo/in_progress/done, reusing `task_status`), so they read as real
    mini-tasks and stay future-expandable (estimates, dependencies, scheduling).
- **Task details = workspace:** Notes → Checklist → Subtasks → Dates → Progress.
  Combined parent progress (checklist + subtasks) with count, %, bar, and an
  all-done "ready to complete" hint (no auto-complete).
- Both primitives integrated into the shared store (optimistic, instant, no
  `router.refresh()` / navigation / refetch). Migration
  `0005_checklist_and_subtask_status.sql` (+ `schema.sql`). Build + lint green.

---

## Current Sprint

**Next: Goals module** — not yet started.

---

## Future Roadmap

> Sequencing is indicative; each becomes its own sprint with a brief.

> Subtasks MVP shipped in **Sprint 2.8** (see Completed Sprints).

### Near term — first real modules
1. **Goals module** — replace mock data with a real `goals` table; link tasks to
   goals; progress derived from linked task completion. (Foundation: dashboard
   Goals section + `/goals` route already exist.)
2. **Ideas module** — capture + triage of ideas; promote an idea into a task.
   (Foundation: dashboard Ideas section + `/ideas` route exist.)

### Mid term — insight from the archive
3. **Achievements** — weekly/monthly wins computed from the completed-task
   archive (`completed_at`). (Archive intentionally structured for this.)
4. **Reports & analytics** — productivity trends, completion rates, impact mix.
5. **Calendar** — schedule/agenda view over `start_date` / `due_date`.

### Platform & depth
6. **Settings** — profile, preferences, account management.
7. **Custom recurrence rules** — beyond fixed intervals (architecture prepared
   via the `recurrence` enum + a future rule structure).
8. **Exploratory** — collaboration/teams and AI coaching (the static Productivity
   Insight is the seed for future AI guidance). Not scheduled.

---

## Maintenance

**Update this file after every sprint:** move the finished sprint into
"Completed Sprints" with a short outcome list, refresh the "Current Sprint"
block to the next one, and reprioritize "Future Roadmap" as plans evolve. Keep
"Status at a glance" honest about blockers. Deep operational detail for a
just-finished sprint belongs in [HANDOFF.md](HANDOFF.md).
