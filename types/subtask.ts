export interface Subtask {
  id: string;
  task_id: string;
  user_id: string;
  title: string;
  is_done: boolean;
  created_at: string;
  updated_at: string;
}

export interface SubtaskInput {
  title: string;
  is_done?: boolean;
}

export interface SubtaskUpdateInput {
  title?: string;
  is_done?: boolean;
}
