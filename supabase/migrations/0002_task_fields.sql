-- Sprint 2.2 — Task model upgrade
-- Adds start_date and recurrence to existing tasks tables.
-- Run this in the Supabase SQL editor on projects created before this sprint.

-- Recurrence options. Kept as a dedicated enum so future custom rules can be
-- layered on (e.g. a separate recurrence_rule jsonb column) without a breaking
-- migration.
do $$
begin
  if not exists (select 1 from pg_type where typname = 'task_recurrence') then
    create type task_recurrence as enum ('none', 'daily', 'weekly', 'monthly', 'yearly');
  end if;
end$$;

alter table public.tasks
  add column if not exists start_date date,
  add column if not exists recurrence task_recurrence not null default 'none';
