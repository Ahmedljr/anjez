import type { RequestUser } from "@/lib/supabase/current-user";

/** Best-effort human-friendly name from the validated identity or email. */
export function getDisplayName(user: RequestUser | null): string {
  if (!user) return "صديقي";

  return (
    user.name?.trim() ||
    user.email?.split("@")[0] ||
    "صديقي"
  );
}
