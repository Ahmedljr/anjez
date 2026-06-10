import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";

type TypedSupabaseClient = SupabaseClient<Database>;

/** All Supabase Auth calls live here so UI components stay framework-agnostic. */

export async function signInWithEmail(
  client: TypedSupabaseClient,
  email: string,
  password: string
) {
  const { error } = await client.auth.signInWithPassword({ email, password });
  if (error) throw error;
}

export async function signUpWithEmail(
  client: TypedSupabaseClient,
  email: string,
  password: string
) {
  const { error } = await client.auth.signUp({ email, password });
  if (error) throw error;
}

export async function signInWithGoogle(
  client: TypedSupabaseClient,
  redirectTo: string
) {
  const { data, error } = await client.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo },
  });
  if (error) throw error;
  return data;
}

export async function signOut(client: TypedSupabaseClient) {
  const { error } = await client.auth.signOut();
  if (error) throw error;
}

export async function exchangeCodeForSession(
  client: TypedSupabaseClient,
  code: string
) {
  const { error } = await client.auth.exchangeCodeForSession(code);
  if (error) throw error;
}

export async function getCurrentUser(client: TypedSupabaseClient) {
  const {
    data: { user },
  } = await client.auth.getUser();
  return user;
}
