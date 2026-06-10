# Architecture

Anjez follows a feature-based architecture on top of the Next.js App Router.

```
anjez-app/
├── app/                  # Routes only — composes feature components, no business logic
│   ├── (auth)/           # /login
│   ├── (dashboard)/      # /dashboard, /tasks (shared shell: header + bottom nav)
│   ├── auth/callback/    # OAuth / email-link callback route handler
│   └── layout.tsx        # Root layout: Arabic font, lang="ar" dir="rtl"
│
├── features/             # One folder per product module
│   ├── auth/             # Login form, Google sign-in, sign-out
│   ├── dashboard/        # Greeting, task count, top-priority preview
│   ├── tasks/            # MVP core: list, quick add, form modal, priority logic
│   ├── goals/            # Placeholder — same shape as tasks, ready to build
│   ├── ideas/            # Placeholder
│   └── achievements/     # Placeholder
│
├── components/ui/        # Generic, app-wide UI primitives (Button, Input, Card, …)
├── components/layout/    # App shell pieces shared across feature pages
├── lib/                  # Supabase client/server factories, generic helpers (cn)
├── hooks/                # Cross-feature React hooks (currently empty)
├── services/             # ALL Supabase queries live here — the only data-access layer
├── types/                # Shared TypeScript types (Task, Database)
├── styles/               # Tailwind entrypoint (globals.css)
├── docs/                 # Setup guides
└── supabase/             # SQL schema & RLS policies
```

## Rules this codebase follows

1. **Supabase access only happens in `services/`.** Components and hooks call
   `services/task.service.ts` / `services/auth.service.ts`, passing in a
   Supabase client created via `lib/supabase/client.ts` (browser) or
   `lib/supabase/server.ts` (server). This keeps query logic testable and
   swappable without touching UI.
2. **UI is separated from business logic.** `features/tasks/lib/priority.ts`
   contains the sorting rules; `features/tasks/hooks/useTasks.ts` orchestrates
   state and service calls; components only render.
3. **Pages are thin.** Each `page.tsx` fetches the user/data it needs via the
   server Supabase client and renders feature components — no inline logic.
4. **Mobile-first & RTL.** The root `<html>` is `lang="ar" dir="rtl"`; layouts
   use a centered `max-w-lg` column with a sticky header and bottom tab bar,
   the natural pattern for a mobile productivity app.

## Priority logic (MVP)

`features/tasks/lib/priority.ts` sorts tasks by:

1. `impact_level` — high → medium → low
2. `due_date` — nearest first (tasks without a due date sort last)
3. `is_pinned` — pinned tasks win ties

The dashboard's "top priorities" simply takes the first 3 non-`done` tasks from
this sorted list.
