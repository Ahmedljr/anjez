import type { ImpactLevel, TaskStatus, TaskRecurrence } from "./task";

/**
 * Hand-written subset of the generated Supabase database types.
 * Regenerate with `supabase gen types typescript` once the schema stabilizes.
 */
export interface Database {
  public: {
    Tables: {
      tasks: {
        Row: {
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
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          description?: string | null;
          impact_level?: ImpactLevel;
          start_date?: string | null;
          due_date?: string | null;
          status?: TaskStatus;
          recurrence?: TaskRecurrence;
          is_pinned?: boolean;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          description?: string | null;
          impact_level?: ImpactLevel;
          start_date?: string | null;
          due_date?: string | null;
          status?: TaskStatus;
          recurrence?: TaskRecurrence;
          is_pinned?: boolean;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
