export type ImpactLevel = "high" | "medium" | "low";

export type TaskStatus = "todo" | "in_progress" | "done";

export type TaskRecurrence = "none" | "daily" | "weekly" | "monthly" | "yearly";

export interface Task {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  impact_level: ImpactLevel;
  start_date: string | null;
  due_date: string | null;
  status: TaskStatus;
  recurrence: TaskRecurrence;
  is_pinned: boolean;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface TaskInput {
  title: string;
  description?: string | null;
  impact_level: ImpactLevel;
  start_date?: string | null;
  due_date?: string | null;
  status?: TaskStatus;
  recurrence?: TaskRecurrence;
  is_pinned?: boolean;
}

export interface TaskUpdateInput {
  title?: string;
  description?: string | null;
  impact_level?: ImpactLevel;
  start_date?: string | null;
  due_date?: string | null;
  status?: TaskStatus;
  recurrence?: TaskRecurrence;
  is_pinned?: boolean;
}
