import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/supabase/current-user";
import { formatDayMonth } from "@/lib/format-date";
import { fetchTasks } from "@/services/task.service";
import { getDisplayName } from "@/features/dashboard/lib/display-name";
import { topPriorityTasks, overdueTasks } from "@/features/tasks/lib/priority";
import { HeroSection } from "@/features/dashboard/components/HeroSection";
import { TopPrioritiesSection } from "@/features/dashboard/components/TopPrioritiesSection";
import { DailySummarySection } from "@/features/dashboard/components/DailySummarySection";
import { OverdueSection } from "@/features/dashboard/components/OverdueSection";
import { GoalsSection } from "@/features/dashboard/components/GoalsSection";
import { IdeasSection } from "@/features/dashboard/components/IdeasSection";
import { ProductivityInsightSection } from "@/features/dashboard/components/ProductivityInsightSection";

export default async function DashboardPage() {
  const supabase = await createClient();
  // Auth check and the task query run concurrently — fetchTasks is RLS-scoped,
  // so it returns nothing for an unauthenticated request we then redirect away.
  const [user, tasks] = await Promise.all([
    getCurrentUser(),
    fetchTasks(supabase),
  ]);
  if (!user) redirect("/login");

  const completedTasks = tasks.filter((t) => t.status === "done");
  const overdue = overdueTasks(tasks);
  // Format due labels here (server) so TopPrioritiesSection stays free of the
  // date-fns Arabic locale on the client.
  const priorityItems = topPriorityTasks(tasks, 3).map((task) => ({
    task,
    dueLabel: task.due_date ? formatDayMonth(task.due_date) : null,
  }));

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-5">
      <HeroSection name={getDisplayName(user)} />

      {/* On desktop: two intentional columns. On mobile: a single stack. */}
      <div className="flex flex-col gap-5 lg:grid lg:grid-cols-12 lg:items-start lg:gap-6">
        {/* Primary column — what to do now */}
        <div className="flex flex-col gap-5 lg:col-span-7">
          <TopPrioritiesSection items={priorityItems} />
          <OverdueSection tasks={overdue} />
        </div>

        {/* Secondary column — context & momentum */}
        <div className="flex flex-col gap-5 lg:col-span-5">
          <DailySummarySection
            total={tasks.length}
            completed={completedTasks.length}
            remaining={tasks.length - completedTasks.length}
          />
          <GoalsSection />
          <IdeasSection />
          <ProductivityInsightSection />
        </div>
      </div>
    </div>
  );
}
