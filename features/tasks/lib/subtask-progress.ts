import type { Subtask } from "@/types/subtask";
import type { ChecklistItem } from "@/types/checklist";

export interface Progress {
  total: number;
  completed: number;
  /** 0–100, rounded. */
  percent: number;
  /** True only when there is at least one item and every one is complete. */
  allDone: boolean;
}

function summarize(total: number, completed: number): Progress {
  const percent = total === 0 ? 0 : Math.round((completed / total) * 100);
  return { total, completed, percent, allDone: total > 0 && completed === total };
}

/** Subtask progress — a subtask counts as complete when its status is `done`. */
export function subtaskProgress(subtasks: Subtask[]): Progress {
  return summarize(
    subtasks.length,
    subtasks.filter((s) => s.status === "done").length
  );
}

/** Checklist progress — an item counts as complete when it is checked. */
export function checklistProgress(items: ChecklistItem[]): Progress {
  return summarize(
    items.length,
    items.filter((i) => i.is_checked).length
  );
}

/**
 * Parent task progress combines checklist completion and subtask completion
 * into a single roll-up (the parent is still never auto-completed).
 */
export function combinedProgress(
  items: ChecklistItem[],
  subtasks: Subtask[]
): Progress {
  const total = items.length + subtasks.length;
  const completed =
    items.filter((i) => i.is_checked).length +
    subtasks.filter((s) => s.status === "done").length;
  return summarize(total, completed);
}
