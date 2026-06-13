import type { Subtask } from "@/types/subtask";

export interface SubtaskProgress {
  total: number;
  completed: number;
  /** 0–100, rounded. */
  percent: number;
  /** True only when there are subtasks and every one is done. */
  allDone: boolean;
}

/** Pure progress summary for a task's subtasks (e.g. "2 / 5", 40%). */
export function subtaskProgress(subtasks: Subtask[]): SubtaskProgress {
  const total = subtasks.length;
  const completed = subtasks.filter((s) => s.is_done).length;
  const percent = total === 0 ? 0 : Math.round((completed / total) * 100);
  return { total, completed, percent, allDone: total > 0 && completed === total };
}
