# أنجز (Anjez)

> ما الذي يجب أن تفعله الآن؟

A mobile-first, Arabic-RTL productivity app built with Next.js 15 (App Router),
TypeScript, Tailwind CSS and Supabase (Auth + PostgreSQL).

## Getting started

```bash
npm install
cp .env.example .env.local   # then fill in your Supabase credentials
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Setup guides

- [docs/SUPABASE_SETUP.md](docs/SUPABASE_SETUP.md) — create the project, run the
  schema, configure Auth providers and redirect URLs
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) — folder structure and the rules
  the codebase follows

## MVP scope

- **Auth** — Email + Google sign-in via Supabase Auth
- **Tasks** — create, edit, delete, complete; impact level, due date, status, pinning
- **Dashboard** — Arabic greeting, total task count, top 3 priority tasks
- **Goals / Ideas / Achievements** — scaffolded placeholders for future modules
