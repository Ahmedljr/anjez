-- Sprint 2.8B — Checklist items + richer subtasks
-- 1) Add a lightweight checklist_items table (checked / unchecked only).
-- 2) Upgrade subtasks from a boolean `is_done` to a `status` enum so they read
--    as real mini-tasks (todo / in_progress / done), reusing task_status.
-- Requires migration 0004 (the subtasks table) to have been applied first.

-- 1) Checklist items -------------------------------------------------------
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

-- 2) Subtasks: boolean is_done -> status enum (idempotent) -----------------
alter table public.subtasks
  add column if not exists status task_status not null default 'todo';

do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'subtasks'
      and column_name = 'is_done'
  ) then
    update public.subtasks set status = 'done' where is_done = true;
    alter table public.subtasks drop column is_done;
  end if;
end$$;
