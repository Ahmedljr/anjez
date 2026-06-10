"use client";

import Link from "next/link";
import { ListChecks, CheckCircle2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { EmptyState } from "@/components/ui";
import { useTasks } from "@/features/tasks/hooks/useTasks";
import { useTaskInteraction } from "@/features/tasks/components/TaskInteractionProvider";
import {
  activeTasks,
  completedTasks,
  overdueTasks,
} from "@/features/tasks/lib/priority";
import { QuickAddTask } from "./QuickAddTask";
import { TaskItem } from "./TaskItem";
import type { Task } from "@/types/task";

export type TaskListFilter = "active" | "completed" | "overdue";

interface TaskListProps {
  userId: string;
  initialTasks: Task[];
  filter?: TaskListFilter;
}

export function TaskList({
  userId,
  initialTasks,
  filter = "active",
}: TaskListProps) {
  const { tasks, error, addTask, setStatus, togglePin } = useTasks({
    userId,
    initialTasks,
  });
  const { openDetails } = useTaskInteraction();

  const active = activeTasks(tasks);
  const completed = completedTasks(tasks);
  const visible =
    filter === "completed"
      ? completed
      : filter === "overdue"
        ? overdueTasks(tasks)
        : active;

  return (
    <div className="flex flex-col gap-4">
      {filter === "overdue" ? (
        <div className="flex items-center justify-between rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5">
          <span className="text-sm font-medium text-amber-700">
            ⚠️ المهام المتأخرة ({visible.length})
          </span>
          <Link
            href="/tasks"
            className="flex items-center gap-1 text-sm text-amber-700 hover:underline"
          >
            <X className="h-4 w-4" />
            إلغاء التصفية
          </Link>
        </div>
      ) : (
        <>
          {/* Active / Completed tabs — switch archives without losing context */}
          <div className="flex gap-1 rounded-xl bg-slate-100 p-1">
            <TabLink
              href="/tasks"
              label="المهام الحالية"
              count={active.length}
              activeTab={filter === "active"}
            />
            <TabLink
              href="/tasks?filter=completed"
              label="المهام المكتملة"
              count={completed.length}
              activeTab={filter === "completed"}
            />
          </div>

          {filter === "active" && <QuickAddTask onAdd={addTask} />}
        </>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}

      {visible.length === 0 ? (
        <EmptyState
          icon={
            filter === "completed" ? (
              <CheckCircle2 className="h-10 w-10" />
            ) : (
              <ListChecks className="h-10 w-10" />
            )
          }
          title={EMPTY_TITLE[filter]}
          description={EMPTY_DESCRIPTION[filter]}
        />
      ) : (
        <div className="flex flex-col gap-3">
          {visible.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onChangeStatus={setStatus}
              onTogglePin={togglePin}
              onOpenDetails={openDetails}
            />
          ))}
        </div>
      )}
    </div>
  );
}

const EMPTY_TITLE: Record<TaskListFilter, string> = {
  active: "لا توجد مهام نشطة",
  completed: "لا توجد مهام مكتملة بعد",
  overdue: "لا توجد مهام متأخرة",
};

const EMPTY_DESCRIPTION: Record<TaskListFilter, string> = {
  active: "ابدأ بإضافة أول مهمة لك من الحقل أعلاه",
  completed: "أنجز مهامك وستظهر هنا في أرشيفك",
  overdue: "أنت على المسار الصحيح — لا شيء متأخر",
};

interface TabLinkProps {
  href: string;
  label: string;
  count: number;
  activeTab: boolean;
}

function TabLink({ href, label, count, activeTab }: TabLinkProps) {
  return (
    <Link
      href={href}
      className={cn(
        "flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
        activeTab
          ? "bg-white text-primary-700 shadow-sm"
          : "text-slate-500 hover:text-slate-700"
      )}
    >
      {label}
      <span
        className={cn(
          "rounded-full px-2 py-0.5 text-xs",
          activeTab ? "bg-primary-50 text-primary-600" : "bg-slate-200 text-slate-500"
        )}
      >
        {count}
      </span>
    </Link>
  );
}
