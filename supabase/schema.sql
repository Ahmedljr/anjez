-- Anjez — core schema for the Tasks MVP
-- Run this in the Supabase SQL editor (or via `supabase db push`).

create extension if not exists "pgcrypto";

create type impact_level as enum ('high', 'medium', 'low');
create type task_status as enum ('todo', 'in_progress', 'done');
create type task_recurrence as enum ('none', 'daily', 'weekly', 'monthly', 'yearly');

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null check (char_length(trim(title)) > 0),
  description text,
  impact_level impact_level not null default 'medium',
  start_date date,
  due_date date,
  status task_status not null default 'todo',
  recurrence task_recurrence not null default 'none',
  is_pinned boolean not null default false,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists tasks_user_id_idx on public.tasks (user_id);
create index if not exists tasks_user_status_idx on public.tasks (user_id, status);

-- Keep `updated_at` current on every change.
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists tasks_set_updated_at on public.tasks;
create trigger tasks_set_updated_at
  before update on public.tasks
  for each row
  execute function public.set_updated_at();

-- Stamp completed_at whenever a task moves into / out of "done".
create or replace function public.set_completed_at()
returns trigger as $$
begin
  if new.status = 'done'
     and (tg_op = 'INSERT' or old.status is distinct from 'done') then
    new.completed_at = now();
  elsif new.status <> 'done' then
    new.completed_at = null;
  end if;
  return new;
end;
$$ language plpgsql;

drop trigger if exists tasks_set_completed_at on public.tasks;
create trigger tasks_set_completed_at
  before insert or update on public.tasks
  for each row
  execute function public.set_completed_at();

-- Row Level Security: every user can only see and modify their own tasks.
alter table public.tasks enable row level security;

drop policy if exists "Users can view their own tasks" on public.tasks;
create policy "Users can view their own tasks"
  on public.tasks for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert their own tasks" on public.tasks;
create policy "Users can insert their own tasks"
  on public.tasks for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update their own tasks" on public.tasks;
create policy "Users can update their own tasks"
  on public.tasks for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own tasks" on public.tasks;
create policy "Users can delete their own tasks"
  on public.tasks for delete
  using (auth.uid() = user_id);

-- Subtasks — one level only (a task has many subtasks; never nested).
-- Real mini-tasks: status (todo/in_progress/done), reusing task_status. Kept as
-- its own table so they stay future-expandable (estimates, dependencies, …).
create table if not exists public.subtasks (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null check (char_length(trim(title)) > 0),
  status task_status not null default 'todo',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists subtasks_task_id_idx on public.subtasks (task_id);
create index if not exists subtasks_user_id_idx on public.subtasks (user_id);

drop trigger if exists subtasks_set_updated_at on public.subtasks;
create trigger subtasks_set_updated_at
  before update on public.subtasks
  for each row
  execute function public.set_updated_at();

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

-- Checklist items — lightweight execution steps (checked / unchecked only).
create table if not exists public.checklist_items (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null check (char_length(trim(title)) > 0),
  is_checked boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists checklist_items_task_id_idx on public.checklist_items (task_id);
create index if not exists checklist_items_user_id_idx on public.checklist_items (user_id);

drop trigger if exists checklist_items_set_updated_at on public.checklist_items;
create trigger checklist_items_set_updated_at
  before update on public.checklist_items
  for each row
  execute function public.set_updated_at();

alter table public.checklist_items enable row level security;

drop policy if exists "Users can view their own checklist items" on public.checklist_items;
create policy "Users can view their own checklist items"
  on public.checklist_items for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert their own checklist items" on public.checklist_items;
create policy "Users can insert their own checklist items"
  on public.checklist_items for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update their own checklist items" on public.checklist_items;
create policy "Users can update their own checklist items"
  on public.checklist_items for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own checklist items" on public.checklist_items;
create policy "Users can delete their own checklist items"
  on public.checklist_items for delete
  using (auth.uid() = user_id);
