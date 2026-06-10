# Anjez — Project Context

> Single source of truth for **what Anjez is**, **how it is built**, and **what
> currently exists**. Read this first before touching the codebase.
>
> Last verified: 2026-06-10 · Update whenever architecture or features change.

---

## 1. Product Philosophy

**Anjez (أنجز) is a daily-life command center for execution, clarity and
productivity — not a task manager.**

Guiding principles:

- **"What should I do *now*?"** — within ~5 seconds of opening the app the user
  must understand their most important task, what remains today, what is
  overdue, and their momentum.
- **The dashboard is the most valuable screen.** Everything else supports it.
- **Reduce cognitive load.** Completed work leaves the active view so the
  workload visibly shrinks. Empty white space and passive cards are avoided.
- **Mobile-first, Arabic-first.** The product is designed for an Arabic RTL
  audience on a phone, then scaled up to an intentional desktop layout.
- **Calm, focused, blue.** A single primary blue palette, clean minimal UI.

The product is intentionally narrow today (tasks + dashboard) with a clear path
to goals, ideas, achievements, reports and analytics — see
[ROADMAP.md](ROADMAP.md).

---

## 2. Technology Stack

| Concern        | Choice                                                        |
| -------------- | ------------------------------------------------------------- |
| Framework      | Next.js 15 (App Router, React Server Components)              |
| Language       | TypeScript (strict)                                           |
| UI             | React 19                                                      |
| Styling        | Tailwind CSS v3 + custom blue `primary` palette               |
| Fonts          | Cairo (Arabic) via `next/font/google`                         |
| Icons          | lucide-react                                                  |
| Dates          | `Intl.DateTimeFormat` (Arabic) via `lib/format-date.ts`       |
| Auth + DB      | Supabase (Auth + PostgreSQL) via `@supabase/ssr`              |
| Class helpers  | clsx + tailwind-merge (`cn`)                                  |

Tooling: ESLint (`next/core-web-vitals`, `next/typescript`), `npm run build`,
`npm run lint`. The app lives in `anjez-app/`.

---

## 3. Architecture Overview

Anjez follows a **feature-based architecture** on top of the App Router. See
[ARCHITECTURE.md](ARCHITECTURE.md) for the folder-by-folder reference; the rules
below are the load-bearing ones.

```
anjez-app/
├── app/                     # Routes only — compose feature components, no logic
│   ├── (auth)/login         # Email + Google sign-in
│   ├── auth/callback        # OAuth / email-link callback route handler
│   └── (dashboard)/         # Authenticated shell (AppShell): sidebar + drawer + FAB
│       ├── dashboard        # The command center
│       ├── tasks            # Active / Completed / Overdue task views
│       └── goals · ideas · achievements · reports · calendar · settings  (placeholders)
│
├── features/                # One folder per product module
│   ├── auth/                # Login form, Google sign-in, sign-out
│   ├── tasks/               # Core module (components, hooks, lib, types)
│   ├── dashboard/           # Dashboard sections + greeting/display-name libs
│   ├── goals/ · ideas/ · achievements/   # Placeholder READMEs, ready to build
│
├── components/ui/           # Generic primitives (Button, Input, Card, Badge, …)
├── components/layout/       # AppShell, SidebarNav, nav-items
├── lib/supabase/            # Browser/server client factories + middleware refresh
├── services/                # ALL Supabase queries (the only data-access layer)
├── types/                   # Shared types (Task, Database)
├── styles/                  # Tailwind entrypoint (globals.css)
├── docs/                    # Governance + setup docs (this folder)
└── supabase/                # schema.sql + migrations + RLS policies
```

### Non-negotiable rules

1. **Supabase access only in `services/`.** UI and hooks call
   `services/task.service.ts` / `services/auth.service.ts`, passing a client from
   `lib/supabase/{client,server}.ts`. No `.from(...)` calls in components.
2. **Business logic lives outside components.** Sorting / filtering rules are in
   `features/tasks/lib/priority.ts`; state orchestration is in
   `features/tasks/hooks/useTasks.ts`; components render.
3. **Pages are thin.** Each `page.tsx` fetches the user/data via the server
   client and renders feature components.
4. **Mobile-first & RTL.** Root `<html lang="ar" dir="rtl">`; the `lg:`
   breakpoint switches from the mobile stack to the desktop sidebar layout.

### App shell & global providers

`components/layout/AppShell.tsx` wraps every authenticated page and provides:

- Desktop **right** sidebar (RTL) with active-route highlighting; mobile
  hamburger → slide-out drawer + overlay.
- A persistent **Floating Action Button** ("مهمة جديدة").
- Two React context providers used app-wide:
  - **`TaskQuickAddProvider`** — owns the single "new task" modal opened by the FAB.
  - **`TaskInteractionProvider`** — owns the task **details** modal + edit modal,
    so *any* task (dashboard card or list row) opens the same experience.
    Mutations run through the service then `router.refresh()`.

### Navigation performance

- **Single auth validation per navigation.** `middleware.ts` validates the
  session with `auth.getUser()` once, then forwards the validated identity to
  Server Components via request headers (`x-user-id` / `x-user-email` /
  `x-user-name`, stripped from inbound requests so they can't be spoofed).
  **`lib/supabase/current-user.ts`** `getCurrentUser()` reads those headers
  instead of making a second `getUser()` network round-trip.
- Data pages run auth + `fetchTasks` (+ search params) **concurrently** via
  `Promise.all`.
- **Route `loading.tsx` skeletons** (`/dashboard`, `/tasks`) render instantly on
  navigation while the server payload streams, using the `Skeleton` UI
  primitive — so transitions feel immediate.
- **Client date formatting uses `Intl`** via `lib/format-date.ts`, not the
  `date-fns` Arabic locale — keeping that locale payload out of the client
  bundle (~8 kB lighter per authenticated route).

---

## 4. Data Model

Single table `public.tasks` (Row Level Security: each user sees only their rows).

| Column         | Type                              | Notes                                   |
| -------------- | --------------------------------- | --------------------------------------- |
| `id`           | uuid (pk)                         | `gen_random_uuid()`                     |
| `user_id`      | uuid → `auth.users`               | cascade delete                          |
| `title`        | text (not blank)                  |                                         |
| `description`  | text · nullable                   |                                         |
| `impact_level` | enum `impact_level`               | `high` · `medium` · `low`               |
| `start_date`   | date · nullable                   |                                         |
| `due_date`     | date · nullable                   |                                         |
| `status`       | enum `task_status`                | `todo` · `in_progress` · `done`         |
| `recurrence`   | enum `task_recurrence`            | `none`·`daily`·`weekly`·`monthly`·`yearly` |
| `is_pinned`    | boolean                           |                                         |
| `completed_at` | timestamptz · nullable            | auto-stamped by trigger                 |
| `created_at`   | timestamptz                       |                                         |
| `updated_at`   | timestamptz                       | auto-stamped by trigger                 |

Triggers: `set_updated_at` (any update) and `set_completed_at` (stamps/clears
`completed_at` as status enters/leaves `done`).

SQL lives in `supabase/schema.sql` (fresh installs) and `supabase/migrations/`:

- `0002_task_fields.sql` — adds `start_date`, `recurrence` + enum.
- `0003_completed_at.sql` — adds `completed_at`, the stamping trigger, backfill.

> ⚠️ **Migration status:** the live Supabase project must have migrations
> `0002` and `0003` applied. Until then, task creation fails (missing column)
> and recurrence/completion fields degrade. See [HANDOFF.md](HANDOFF.md).

---

## 5. Implemented Features

### Authentication
- Email/password + Google OAuth via Supabase Auth.
- Middleware session refresh; `auth/callback` route handler; route protection in
  the `(dashboard)` layout (redirect to `/login` when signed out).

### Tasks
- **Full CRUD** through `task.service.ts`; optimistic state in `useTasks`.
- **Fields:** title, description, impact level, start date, due date, status,
  recurrence, pin. Form validation (due date ≥ start date).
- **3-state status workflow** via `StatusSelector` (○ لم تبدأ · ◐ قيد التنفيذ ·
  ✓ مكتملة) with distinct visuals; inline on rows and inside details.
- **Task details modal** — all fields + Edit / Delete / Change Status; opened by
  clicking any task anywhere.
- **Views (tabs + filter):** Active (`todo`+`in_progress`), Completed archive
  (done, newest first, with completion date), Overdue (`?filter=overdue`).
- **Recurrence** stored as an enum; architecture ready for future custom rules.

### Dashboard (command center)
Sections, all interactive:
- **Hero** — time-based Arabic greeting + user name.
- **Top Priorities** — top 3 active tasks (never completed); click → details.
- **Daily Summary** — total / completed / remaining / % (counts completed);
  click → `/tasks`.
- **Overdue** — appears only if overdue exists; click → `/tasks?filter=overdue`.
- **Goals** *(mock data)* → `/goals`.
- **Ideas** *(mock data)* → `/ideas`.
- **Productivity Insight** — static tip → `/reports`.

### Priority engine (`features/tasks/lib/priority.ts`)
Sort order: `impact_level` (high→low) → nearest `due_date` → `is_pinned` tie-break.
Selectors: `topPriorityTasks`, `activeTasks`, `completedTasks`, `overdueTasks`,
`isOverdue`, `completionDate`.

### Navigation & layout
- Responsive RTL sidebar (desktop) / drawer (mobile) with 8 destinations and
  active-state highlighting; placeholder routes show "قيد التطوير".

---

## 6. Placeholders & Known Gaps

- **Modules not yet built:** Goals, Ideas, Achievements, Reports, Calendar,
  Settings (routed, render "قيد التطوير").
- **Mock data:** the dashboard Goals and Ideas sections.
- **Custom recurrence rules:** only fixed intervals today.
- See [ROADMAP.md](ROADMAP.md) for sequencing and [HANDOFF.md](HANDOFF.md) for
  the live operational state.

---

## Maintenance

**Update this file when architecture or features change** — e.g. a new feature
module ships, the data model changes, a global provider/rule is added, or the
tech stack is upgraded. Keep section 4 (Data Model) and section 5 (Implemented
Features) in lockstep with the code. For sprint history use
[ROADMAP.md](ROADMAP.md); for the current operational state use
[HANDOFF.md](HANDOFF.md).
