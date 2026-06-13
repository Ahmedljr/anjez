# Anjez — Handoff

> The live, operational state of the project: what was just done, what is
> pending, and exactly what the next person must do to continue. **Update after
> every major implementation sprint.**
>
> Last handoff: 2026-06-14 · UX polish pass — debug styles removed, empty states improved, section hierarchy strengthened

---

## 1. Where things stand

- **Code:** Sprints 1 → 2.8B + two bug-fix commits fully implemented. `npm run build`
  and `npm run lint` both pass cleanly from `anjez-app/`.
- **Architecture note (2.6):** dashboard + tasks are now **client-first** — task
  data lives in a shared `TasksProvider` store seeded once by the dashboard
  layout; navigation between the two does not re-fetch. See §3c.
- **Local run:** `npm run dev` (the project has been run on port 3001 locally
  because another app occupied 3000).
- **Live data layer:** Supabase connected (URL + anon key in `.env.local`).
  **Migrations `0002`–`0005` must be applied** — `0005_checklist_and_subtask_status.sql`
  adds `checklist_items` and upgrades subtask status. See §2 below.

## 2. ⚠️ Required action: run migration `0005_checklist_and_subtask_status.sql`

Sprint 2.8B adds the `checklist_items` table and changes subtasks from a
boolean `is_done` to a `status` enum. Run the full file
`supabase/migrations/0005_checklist_and_subtask_status.sql` **once** in the
Supabase SQL Editor (it is idempotent and requires `0004` to have run first).
Until then the app degrades gracefully — checklist fetch `.catch`es to empty, and
subtask `status` falls back to `todo` in the UI (no crash).

Key statements (see the file for the full RLS + checklist DDL):

```sql
-- subtasks: is_done boolean -> status enum (idempotent)
alter table public.subtasks add column if not exists status task_status not null default 'todo';
do $$ begin
  if exists (select 1 from information_schema.columns
             where table_schema='public' and table_name='subtasks' and column_name='is_done') then
    update public.subtasks set status = 'done' where is_done = true;
    alter table public.subtasks drop column is_done;
  end if;
end $$;
-- + create table public.checklist_items (... is_checked boolean ...) with index/RLS/trigger
```

Migrations `0002`–`0004` are already applied.

## 2c. Checklist + Subtasks architecture (Sprint 2.8B)

Two **distinct** child primitives per task (one level each, never nested):

- **Checklist items** (`checklist_items`) — lightweight, `is_checked` only.
  Store: `checklist` map; `addChecklistItem` / `toggleChecklistItem` /
  `removeChecklistItem` (optimistic). UI: `ChecklistSection` (Notion-style rows).
- **Subtasks** (`subtasks`) — real mini-tasks, `status` enum (reuses
  `task_status`). Store: `setSubtaskStatus` replaces the old boolean toggle. UI:
  `SubtasksSection` renders the shared `StatusSelector` (○ ◐ ✓). **Kept as its
  own table specifically so it can gain estimates / dependencies / scheduling
  without touching tasks or checklist.**
- **Parent progress** (`TaskProgressSummary` + `combinedProgress`) rolls up
  checklist + subtasks (count, %, bar, all-done hint) — parent **not**
  auto-completed. The list-row badge shows the same combined `{done}/{total}`.
- Modal layout = workspace: Notes → Checklist → Subtasks → Dates → Progress.
- **Trade-off:** both primitives share the tasks store, so a change re-renders
  store consumers (task list). Negligible at current scale; splittable later.

### Store-shape fix — new tasks register empty child arrays (Sprint 2.8B, commit c2a6a31)
Optimistically-created tasks were never given a key in the `subtasks` /
`checklist` maps (only tasks that *have* children get one from `groupByTask`),
so a fresh task's store shape differed from a hydrated one. The UI already
survived this via read-time `?? []`, but `TasksProvider.addTask` now explicitly
sets `subtasks[id] = []` and `checklist[id] = []` on create — making new tasks
identical to hydrated tasks and removing reliance on undefined-array guards.
**Invariant for future per-task relational state:** initialize it in the
optimistic create path **and** read it through a `?? []`/selector.

### UX polish pass — empty states + section hierarchy (2026-06-14)

All temporary debug instrumentation has been removed. Sections are confirmed to
mount correctly for both existing and newly-created tasks.

**Changes applied (all UX-only — no logic, store, or architecture changes):**

- **`TaskInteractionProvider.tsx`** — removed the fixed debug overlay
  (`{selectedTaskId && (<div style=…>)}` block).
- **`ChecklistSection.tsx`** — removed red debug border/background and DEBUG
  `<p>` tag; header upgraded `font-medium → font-semibold` and `mb-2 → mb-3`;
  empty state replaced plain text with a centered `Check` icon (opacity-30) +
  descriptive label; `Plus` icon in add-row darkened `text-slate-300 → text-slate-400`.
- **`SubtasksSection.tsx`** — same pattern: debug removed; header upgraded;
  empty state gains a centered `ListTree` icon (opacity-30) + label.
- **`TaskProgressSummary.tsx`** — debug removed; header upgraded `font-medium →
  font-semibold`; when `total === 0` the empty progress bar is replaced with a
  soft descriptive line ("أضف عناصر للقائمة أو المهام الفرعية لتتبع تقدمك");
  when `total > 0` the bar, counter, and all-done hint render as before.

`npm run lint` passes cleanly after these changes.

### Progress section always renders — TaskProgressSummary (2026-06-14)
`TaskProgressSummary` had `if (total === 0) return null;` on line 20.
`combinedProgress([], [])` always returns `total = 0` for newly-created tasks
(no checklist items, no subtasks), so the Progress section **never mounted** for
them. The section header and bar are now always rendered; the numeric counter
(`{completed} / {total} · {percent}%`) is wrapped in `{total > 0 && ...}` so it
only appears once there is something to count — avoiding "0 / 0 · 0%" on new
tasks. `ChecklistSection` and `SubtasksSection` already had no early returns and
were unaffected. Build and lint verified clean.

**Invariant for future roll-up widgets:** never return null from a summary
component based on child count — render a neutral/empty shell instead. The
parent task modal layout owns the decision of whether to show the section at all.

### Stale-snapshot race fix — TaskInteractionProvider (2026-06-14)
The previous fix above was necessary but not sufficient. `TaskInteractionProvider`
stored `detailsTask` as a **Task snapshot** (`useState<Task | null>`). When a
newly-created task was clicked immediately after creation, the snapshot was
captured in the same React render batch as the `addTask` state commits. React's
batching meant `tasks`, `subtasks`, and `checklist` all committed together —
but the snapshot was taken from the calling component's stale closure over the
task object, which predated the relational-map registrations being visible to the
modal's render pass. This created an intermittent race: the sections (`ChecklistSection`,
`SubtasksSection`) looked up `checklist[task.id]` / `subtasks[task.id]` from the
live store but the `task.id` in the modal came from the stale snapshot, producing
inconsistent results depending on render ordering.

**Fix (`TaskInteractionProvider.tsx`):** replaced the task snapshot with a task ID
(`useState<string | null>` → `selectedTaskId`) and derived `detailsTask` via
`useMemo(() => tasks.find(t => t.id === selectedTaskId) ?? null, [selectedTaskId, tasks])`.
The modal now always reads the **committed** task from the store. Side effects:
- Manual status sync (`setDetailsTask((t) => ...)` in `handleChangeStatus`) is
  removed — the store update propagates to `detailsTask` automatically.
- The modal also auto-closes if the selected task is deleted from the store
  (previously it held a stale snapshot of a deleted task).
Build and lint verified clean.

## 2b. Subtasks architecture (Sprint 2.8)

- **One level only** (a task has many subtasks; never nested).
- **Store-integrated:** subtasks live in `TasksProvider` grouped by `task_id`,
  seeded once by the layout (`fetchSubtasks`, defensive `.catch`). Mutations
  `addSubtask` / `toggleSubtask` / `removeSubtask` are optimistic — instant, no
  `router.refresh()`, no navigation, no refetch (matches the client-first model).
- **UI:** `SubtasksSection` inside `TaskDetailsModal` (add / complete / delete +
  count + percent + progress bar + all-done hint); `{done}/{total}` badge on
  `TaskItem` (summary passed from `TaskList`, so list rows stay presentational).
- **Parent logic:** an all-done state shows a "ready to complete" hint but does
  **not** auto-complete the parent (deliberate).
- **Trade-off:** subtasks share the tasks store, so a subtask change re-renders
  store consumers (the task list). Negligible at current scale; could be split
  into a separate context later if needed.

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

**Recommended fixes (status):**
1. ✅ **Addressed in 2.6 (client-first store):** the per-navigation task
   round-trip is gone — tasks are fetched once and shared client-side.
2. **Collapse to one auth round-trip** — `getClaims()` + asymmetric JWT keys makes
   the middleware validation local (removes the ~290 ms auth call on the *first*
   visit to each route). Still out of scope; revisit deliberately.
3. **Use production mode for any perceived-speed judgement** — dev adds
   client-render overhead and on-demand compile (7 s first dashboard visit).

## 3c. Client-first data architecture (Sprint 2.6)

**Why:** dashboard/tasks are dynamic (cookie/header auth), so Next can't prefetch
their data — every navigation waited on middleware auth + a Supabase `fetchTasks`
round-trip + render (~1 s, *every* time), even in production.

**What changed:**
- **`TasksProvider`** (`features/tasks/components/TasksProvider.tsx`) — shared
  client store (React Context), seeded **once** by `(dashboard)/layout.tsx`
  (which `fetchTasks` a single time; the layout persists across child
  navigation). `useTasksStore()` exposes tasks + optimistic mutations.
- **Pages read the store**, not the server: `DashboardView` + `TaskList` are
  client components; the page server components fetch **no** task data.
- Mutations are optimistic via the store — **`router.refresh()` removed**, so no
  full server re-render and changes reflect across views instantly.
- **`experimental.staleTimes`** (`next.config.ts`, dynamic 180 / static 300)
  keeps visited route shells in the client Router Cache.
- Auth unchanged (middleware `getUser` + identity headers + RLS).

**Measured (production):**
| Navigation | Before (2.5) | After (2.6) |
|---|---|---|
| dashboard ↔ tasks, first visit | ~1000 ms + data skeleton | ~426 ms shell, no data flash |
| dashboard ↔ tasks, **revisit** | ~1000 ms *(every time)* | **12–39 ms, no skeleton** |
Cross-view propagation verified: adding a task on `/tasks` updated the dashboard
total 9→10 with no refetch.

**Trade-offs / watch-items:**
- The dashboard sections are now client components (route First Load JS
  185→188 kB) — acceptable for an authenticated app.
- The store is seeded at layout load; it does not yet auto-revalidate on window
  focus/visibility (a `refresh()` exists for that — a small future add).
- Throwaway test tasks (e.g. "مهمة اختبار المخزن المشترك", "تجربة اخر تعديل")
  were created during verification and persist in the DB; delete if undesired.

## 3d. Tasks tab switching (micro-pass)

**Bottleneck:** the Current/Completed tabs were `<Link>`s, so switching was a full
route navigation (`?filter=…`) — a **~533 ms server round-trip** (middleware +
tasks-page RSC) plus a `loading.tsx` skeleton flash — to filter data already in
the client store.

**Fix (`TaskList.tsx` + `tasks/page.tsx`):** the active filter is now client
`useState`; tabs are `<button>`s that re-filter the store in place. `useMemo`
caches the active/completed/overdue derivations. The URL stays in sync via
`window.history.replaceState` (deep-links like `?filter=overdue` from the
dashboard still set the initial filter). No UI/functionality change.

**Measured:** tab switch **~533 ms + skeleton → ~31–82 ms, no skeleton, no
navigation** (URL still synced). No `loading.tsx` flash; only `TaskList`
re-renders.

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
