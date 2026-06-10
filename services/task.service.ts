import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";
import type { Task, TaskInput, TaskUpdateInput } from "@/types/task";

type TypedSupabaseClient = SupabaseClient<Database>;

/**
 * All Supabase access for the Tasks module lives here so UI and
 * business logic never talk to the database directly.
 */

export async function fetchTasks(client: TypedSupabaseClient): Promise<Task[]> {
  const { data, error } = await client
    .from("tasks")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function createTask(
  client: TypedSupabaseClient,
  userId: string,
  input: TaskInput
): Promise<Task> {
  const { data, error } = await client
    .from("tasks")
    .insert({
      user_id: userId,
      title: input.title,
      description: input.description ?? null,
      impact_level: input.impact_level,
      start_date: input.start_date ?? null,
      due_date: input.due_date ?? null,
      status: input.status ?? "todo",
      recurrence: input.recurrence ?? "none",
      is_pinned: input.is_pinned ?? false,
    })
    .select("*")
    .single();

  if (error) throw error;
  return data;
}

export async function updateTask(
  client: TypedSupabaseClient,
  taskId: string,
  input: TaskUpdateInput
): Promise<Task> {
  const { data, error } = await client
    .from("tasks")
    .update(input)
    .eq("id", taskId)
    .select("*")
    .single();

  if (error) throw error;
  return data;
}

export async function deleteTask(
  client: TypedSupabaseClient,
  taskId: string
): Promise<void> {
  const { error } = await client.from("tasks").delete().eq("id", taskId);
  if (error) throw error;
}

export async function toggleTaskCompletion(
  client: TypedSupabaseClient,
  taskId: string,
  completed: boolean
): Promise<Task> {
  return updateTask(client, taskId, { status: completed ? "done" : "todo" });
}
