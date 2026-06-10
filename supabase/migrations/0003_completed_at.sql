-- Sprint 2.3 — Completed tasks archive
-- Adds a completion timestamp so the archive can later power weekly
-- achievements, monthly reports and productivity analytics.

alter table public.tasks
  add column if not exists completed_at timestamptz;

-- Stamp completed_at automatically whenever a task moves into / out of "done",
-- so the archive timestamp is reliable regardless of how status changes.
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

-- Backfill existing completed rows so they appear in the archive with a date.
update public.tasks
  set completed_at = updated_at
  where status = 'done' and completed_at is null;
