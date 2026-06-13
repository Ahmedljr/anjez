import type { TaskStatus } from "./task";

/**
 * A real, actionable mini-task. Status-driven (not a checkbox) so it can grow
 * into a richer entity later (estimates, dependencies, scheduling, …).
 */
export interface Subtask {
  id: string;
  task_id: string;
  user_id: string;
  title: string;
  status: TaskStatus;
  created_at: string;
  updated_at: string;
}

export interface SubtaskInput {
  title: string;
  status?: TaskStatus;
}

export interface SubtaskUpdateInput {
  title?: string;
  status?: TaskStatus;
}
