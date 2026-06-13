import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/supabase/current-user";
import { fetchTasks } from "@/services/task.service";
import { fetchSubtasks } from "@/services/subtask.service";
import { AppShell } from "@/components/layout/AppShell";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const supabase = await createClient();
  // Fetch user + tasks + subtasks ONCE here, in the persistent shell. This
  // layout does not re-render when navigating between dashboard ↔ tasks, so the
  // data is seeded into the client store a single time and reused across
  // navigation instead of being re-fetched on every route.
  // Subtasks are fetched defensively so a not-yet-migrated DB doesn't break the
  // rest of the app — it simply renders with no subtasks until 0004 is applied.
  const [user, initialTasks, initialSubtasks] = await Promise.all([
    getCurrentUser(),
    fetchTasks(supabase),
    fetchSubtasks(supabase).catch(() => []),
  ]);

  if (!user) redirect("/login");

  return (
    <AppShell
      userId={user.id}
      initialTasks={initialTasks}
      initialSubtasks={initialSubtasks}
    >
      {children}
    </AppShell>
  );
}
