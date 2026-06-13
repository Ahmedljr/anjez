import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";
import type { ChecklistItem, ChecklistItemUpdateInput } from "@/types/checklist";

type TypedSupabaseClient = SupabaseClient<Database>;

/**
 * All Supabase access for checklist items. RLS-scoped to the current user.
 */

/** All of the current user's checklist items (grouped by task in the store). */
export async function fetchChecklistItems(
  client: TypedSupabaseClient
): Promise<ChecklistItem[]> {
  const { data, error } = await client
    .from("checklist_items")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function createChecklistItem(
  client: TypedSupabaseClient,
  userId: string,
  taskId: string,
  title: string
): Promise<ChecklistItem> {
  const { data, error } = await client
    .from("checklist_items")
    .insert({ user_id: userId, task_id: taskId, title })
    .select("*")
    .single();

  if (error) throw error;
  return data;
}

export async function updateChecklistItem(
  client: TypedSupabaseClient,
  itemId: string,
  input: ChecklistItemUpdateInput
): Promise<ChecklistItem> {
  const { data, error } = await client
    .from("checklist_items")
    .update(input)
    .eq("id", itemId)
    .select("*")
    .single();

  if (error) throw error;
  return data;
}

export async function deleteChecklistItem(
  client: TypedSupabaseClient,
  itemId: string
): Promise<void> {
  const { error } = await client
    .from("checklist_items")
    .delete()
    .eq("id", itemId);
  if (error) throw error;
}
