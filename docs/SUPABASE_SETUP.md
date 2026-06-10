# Supabase Setup

## 1. Create a project

1. Go to [supabase.com](https://supabase.com) and create a new project.
2. In **Project Settings → API**, copy the **Project URL** and **anon public key**.

## 2. Configure environment variables

Copy `.env.example` to `.env.local` and fill in the values from step 1:

```bash
cp .env.example .env.local
```

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## 3. Run the database schema

Open the **SQL Editor** in your Supabase dashboard and run the contents of
[`supabase/schema.sql`](../supabase/schema.sql). It creates:

- the `tasks` table with the fields required by the MVP (`title`, `description`,
  `impact_level`, `due_date`, `status`, `is_pinned`, …)
- a trigger that keeps `updated_at` current
- Row Level Security policies so each user can only read/write their own tasks

## 4. Enable Auth providers

In **Authentication → Providers**:

- **Email** is enabled by default. For local development you can disable
  "Confirm email" under **Authentication → Settings** to skip the verification step.
- **Google**: enable the provider and supply the OAuth **Client ID** and
  **Client secret** from the [Google Cloud Console](https://console.cloud.google.com/apis/credentials).
  - Authorized redirect URI: `https://<your-project-ref>.supabase.co/auth/v1/callback`

## 5. Configure redirect URLs

In **Authentication → URL Configuration**, add your app's callback route to the
allow list (both for local dev and production):

```
http://localhost:3000/auth/callback
https://your-production-domain.com/auth/callback
```

The app exchanges the `code` it receives at `/auth/callback` for a session and
then redirects the user to `/dashboard` (see `app/auth/callback/route.ts`).

## 6. Run the app

```bash
npm install
npm run dev
```

Visit `http://localhost:3000` — you should be redirected to `/login`. After
signing in (email or Google) you land on `/dashboard`.
