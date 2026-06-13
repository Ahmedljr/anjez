import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";
import type { Subtask, SubtaskUpdateInput } from "@/types/subtask";

type TypedSupabaseClient = SupabaseClient<Database>;

/**
 * All Supabase access for subtasks lives here. UI and the shared store call
 * these; they never touch the database directly. Every query is RLS-scoped to
 * the current user.
 */

/** All of the current user's subtasks (grouped by task in the client store). */
export async function fetchSubtasks(
  client: TypedSupabaseClient
): Promise<Subtask[]> {
  const { data, error } = await client
    .from("subtasks")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function createSubtask(
  client: TypedSupabaseClient,
  userId: string,
  taskId: string,
  title: string
): Promise<Subtask> {
  const { data, error } = await client
    .from("subtasks")
    .insert({ user_id: userId, task_id: taskId, title })
    .select("*")
    .single();

  if (error) throw error;
  return data;
}

export async function updateSubtask(
  client: TypedSupabaseClient,
  subtaskId: string,
  input: SubtaskUpdateInput
): Promise<Subtask> {
  const { data, error } = await client
    .from("subtasks")
    .update(input)
    .eq("id", subtaskId)
    .select("*")
    .single();

  if (error) throw error;
  return data;
}

export async function deleteSubtask(
  client: TypedSupabaseClient,
  subtaskId: string
): Promise<void> {
  const { error } = await client.from("subtasks").delete().eq("id", subtaskId);
  if (error) throw error;
}
