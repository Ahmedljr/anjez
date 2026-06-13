import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/supabase/current-user";
import { fetchTasks } from "@/services/task.service";
import { AppShell } from "@/components/layout/AppShell";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const supabase = await createClient();
  // Fetch the user + tasks ONCE here, in the persistent shell. This layout does
  // not re-render when navigating between dashboard ↔ tasks, so the task list is
  // seeded into the client store a single time and reused across navigation
  // instead of being re-fetched on every route.
  const [user, initialTasks] = await Promise.all([
    getCurrentUser(),
    fetchTasks(supabase),
  ]);

  if (!user) redirect("/login");

  return (
    <AppShell userId={user.id} initialTasks={initialTasks}>
      {children}
    </AppShell>
  );
}
