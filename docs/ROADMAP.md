# Anjez — Roadmap & Sprint Log

> Where Anjez has been and where it's going. **Update after every sprint** —
> move the active sprint into "Completed" and adjust the future plan.
>
> Last verified: 2026-06-10

---

## Status at a glance

- **Current phase:** Sprint 2.5 (performance — auth + bundle) complete; build +
  lint green.
- **Operational blocker:** none — DB migrations `0002` + `0003` are applied.
- **Next up:** **Subtasks MVP** (one level) — proposal below in "Future Roadmap".

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

---

## Current Sprint

**Next: Subtasks MVP** — not yet started. See the proposal in "Future Roadmap →
Subtasks MVP" below.

---

## Future Roadmap

> Sequencing is indicative; each becomes its own sprint with a brief.

### Immediate — Subtasks MVP (planned)

One level only (parent task → child subtasks; **no nesting**). Checkbox
completion, progress %, and completed count on the parent.

- **DB:** new `public.subtasks` table — `id`, `task_id → tasks (cascade)`,
  `user_id → auth.users (cascade)`, `title`, `is_done bool`, `position int`,
  `created_at`, `updated_at`. RLS scoped to `auth.uid() = user_id`; index on
  `(task_id)`. New migration `0004_subtasks.sql` + `schema.sql` update.
- **Types:** `Subtask` / `SubtaskInput` in `types/subtask.ts`; add the table to
  `database.types.ts`.
- **Service:** `services/subtask.service.ts` — `fetchSubtasks(client, taskId)`,
  `createSubtask`, `toggleSubtask`, `updateSubtask`, `deleteSubtask`.
- **Logic:** `features/tasks/lib/subtask-progress.ts` — pure
  `subtaskProgress(subtasks) → { total, completed, percent }`.
- **UI:** `SubtaskList` + `SubtaskItem` (checkbox + title) and a progress bar,
  rendered **inside `TaskDetailsModal`** under the description. A compact
  "{completed}/{total}" badge on `TaskItem` when subtasks exist.
- **Out of scope:** nested subtasks, drag reorder UI, auto-completing the parent.

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
