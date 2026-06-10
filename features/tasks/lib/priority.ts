import type { Task } from "@/types/task";

const IMPACT_WEIGHT: Record<Task["impact_level"], number> = {
  high: 0,
  medium: 1,
  low: 2,
};

function compareDueDates(a: string | null, b: string | null): number {
  if (a && b) return new Date(a).getTime() - new Date(b).getTime();
  if (a) return -1;
  if (b) return 1;
  return 0;
}

/**
 * MVP priority order, exactly as specified by product:
 * 1) impact level (high → low), 2) nearest due date, 3) pinned as tie-breaker.
 */
export function compareTasksByPriority(a: Task, b: Task): number {
  const impactDiff = IMPACT_WEIGHT[a.impact_level] - IMPACT_WEIGHT[b.impact_level];
  if (impactDiff !== 0) return impactDiff;

  const dueDiff = compareDueDates(a.due_date, b.due_date);
  if (dueDiff !== 0) return dueDiff;

  if (a.is_pinned !== b.is_pinned) return a.is_pinned ? -1 : 1;

  return 0;
}

export function sortTasksByPriority(tasks: Task[]): Task[] {
  return [...tasks].sort(compareTasksByPriority);
}

/** The tasks the dashboard surfaces as "what should I do next". */
export function topPriorityTasks(tasks: Task[], count = 3): Task[] {
  return sortTasksByPriority(tasks.filter((task) => task.status !== "done")).slice(
    0,
    count
  );
}

/** A task is overdue when it has a past due date and isn't done yet. */
export function isOverdue(task: Task, now: Date = new Date()): boolean {
  if (!task.due_date || task.status === "done") return false;
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  return new Date(task.due_date) < today;
}

/** Overdue tasks, sorted by priority. */
export function overdueTasks(tasks: Task[], now: Date = new Date()): Task[] {
  return sortTasksByPriority(tasks.filter((task) => isOverdue(task, now)));
}

/** Active tasks — everything still in play (todo + in_progress), priority sorted. */
export function activeTasks(tasks: Task[]): Task[] {
  return sortTasksByPriority(tasks.filter((task) => task.status !== "done"));
}

/** When a task was completed, falling back to its last update timestamp. */
export function completionDate(task: Task): string | null {
  return task.completed_at ?? (task.status === "done" ? task.updated_at : null);
}

/**
 * The completed archive — done tasks, most recently completed first.
 * Structured as a standalone selector so future weekly/monthly analytics can
 * reuse it without touching the active-list logic.
 */
export function completedTasks(tasks: Task[]): Task[] {
  return tasks
    .filter((task) => task.status === "done")
    .sort((a, b) => {
      const da = completionDate(a);
      const db = completionDate(b);
      if (da && db) return new Date(db).getTime() - new Date(da).getTime();
      if (da) return -1;
      if (db) return 1;
      return 0;
    });
}
