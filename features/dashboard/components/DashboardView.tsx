"use client";

import { useTasksStore } from "@/features/tasks/components/TasksProvider";
import { topPriorityTasks, overdueTasks } from "@/features/tasks/lib/priority";
import { formatDayMonth } from "@/lib/format-date";
import { HeroSection } from "./HeroSection";
import { TopPrioritiesSection } from "./TopPrioritiesSection";
import { DailySummarySection } from "./DailySummarySection";
import { OverdueSection } from "./OverdueSection";
import { GoalsSection } from "./GoalsSection";
import { IdeasSection } from "./IdeasSection";
import { ProductivityInsightSection } from "./ProductivityInsightSection";

/**
 * The dashboard, rendered entirely from the shared client task store. Switching
 * to/from this view does not re-fetch — it derives everything from the cached
 * tasks, so navigation is instant after the first load.
 */
export function DashboardView({ name }: { name: string }) {
  const { tasks } = useTasksStore();

  const completedTasks = tasks.filter((t) => t.status === "done");
  const overdue = overdueTasks(tasks);
  const priorityItems = topPriorityTasks(tasks, 3).map((task) => ({
    task,
    dueLabel: task.due_date ? formatDayMonth(task.due_date) : null,
  }));

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-5">
      <HeroSection name={name} />

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
