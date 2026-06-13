-- Sprint 2.8 — Subtasks MVP
-- One level only: a task has many subtasks; subtasks are never nested.
-- Run this in the Supabase SQL editor.

create table if not exists public.subtasks (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null check (char_length(trim(title)) > 0),
  is_done boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists subtasks_task_id_idx on public.subtasks (task_id);
create index if not exists subtasks_user_id_idx on public.subtasks (user_id);

-- Keep updated_at current (reuses the shared trigger function from schema.sql).
drop trigger if exists subtasks_set_updated_at on public.subtasks;
create trigger subtasks_set_updated_at
  before update on public.subtasks
  for each row
  execute function public.set_updated_at();

-- Row Level Security: every user can only see and modify their own subtasks.
alter table public.subtasks enable row level security;

drop policy if exists "Users can view their own subtasks" on public.subtasks;
create policy "Users can view their own subtasks"
  on public.subtasks for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert their own subtasks" on public.subtasks;
create policy "Users can insert their own subtasks"
  on public.subtasks for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update their own subtasks" on public.subtasks;
create policy "Users can update their own subtasks"
  on public.subtasks for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own subtasks" on public.subtasks;
create policy "Users can delete their own subtasks"
  on public.subtasks for delete
  using (auth.uid() = user_id);
