/**
 * A lightweight execution step — checked / unchecked only, no status. Meant to
 * feel as fast as a Notes/Notion checkbox; intentionally NOT a real task.
 */
export interface ChecklistItem {
  id: string;
  task_id: string;
  user_id: string;
  title: string;
  is_checked: boolean;
  created_at: string;
  updated_at: string;
}

export interface ChecklistItemInput {
  title: string;
  is_checked?: boolean;
}

export interface ChecklistItemUpdateInput {
  title?: string;
  is_checked?: boolean;
}
